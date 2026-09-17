import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { z } from 'zod'
import type { AppConfig } from './config.js'
import { createPool, type DbClient } from './db.js'

/** Turns a user query into a Postgres websearch_to_tsquery argument. */
const querySchema = z.object({
  q: z.string().trim().max(200).optional(),
  hospital: z.string().trim().max(200).optional(),
  department: z.string().trim().max(200).optional(),
  staff: z.string().trim().max(200).optional(),
  category: z.string().trim().max(60).optional(),
  kind: z.string().trim().max(40).optional(),
  direction: z.enum(['sent', 'received']).optional(),
  limit: z.coerce.number().int().min(1).max(500).default(200),
  offset: z.coerce.number().int().min(0).default(0),
})

export function buildServer(config: AppConfig, db: DbClient = createPool(config)) {
  const app = Fastify({
    logger: true,
    trustProxy: true,
    // The API answers JSON only, so cap request size and URL length.
    bodyLimit: 16 * 1024,
    maxParamLength: 200,
  })

  // The API serves no HTML, so the strict defaults cost nothing.
  app.register(helmet, {
    contentSecurityPolicy: { directives: { 'default-src': ["'none'"], 'frame-ancestors': ["'none'"] } },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: { maxAge: 31_536_000, includeSubDomains: true },
  })

  app.register(rateLimit, { max: 120, timeWindow: '1 minute' })

  app.register(cors, {
    origin: config.corsOrigins.length ? config.corsOrigins : false,
    methods: ['GET'],
  })

  app.addHook('onClose', async () => {
    await db.end()
  })

  app.get('/api/health', async () => {
    const result = await db.query<{ now: string }>('select now()::text as now')
    return { ok: true, now: result.rows[0]?.now ?? null }
  })

  app.get('/api/emails', async (request) => {
    const { q, direction, limit, offset } = querySchema.parse(request.query)
    const params: unknown[] = []
    const where = ['e.published']
    if (q) {
      params.push(q)
      where.push(`e.search @@ websearch_to_tsquery('english', $${params.length})`)
    }
    if (direction) {
      params.push(direction)
      where.push(`e.direction = $${params.length}::email_direction`)
    }
    params.push(limit, offset)
    const result = await db.query(
      `select e.id, e.sent_at, e.direction, e.sender, e.recipients, e.cc, e.subject, e.body,
              e.thread_id, e.hospital, e.department, e.kind, e.substantive, e.source,
              coalesce(
                (select json_agg(json_build_object('name', a.name, 'href', a.href) order by a.id)
                   from email_attachments a where a.email_id = e.id),
                '[]'::json
              ) as attachments
         from emails e
        where ${where.join(' and ')}
        order by e.sent_at asc
        limit $${params.length - 1} offset $${params.length}`,
      params,
    )
    return { emails: result.rows }
  })

  app.get('/api/records', async (request) => {
    const { q, limit, offset } = querySchema.parse(request.query)
    const params: unknown[] = []
    const where = ['r.published']
    if (q) {
      params.push(q)
      where.push(`r.search @@ websearch_to_tsquery('english', $${params.length})`)
    }
    params.push(limit, offset)
    const result = await db.query(
      `select r.id, r.recorded_at, r.record_type, r.title, r.author, r.hospital, r.department,
              r.body, r.kind, r.source,
              coalesce(
                (select json_agg(re.email_id order by re.email_id)
                   from record_emails re
                   join emails e on e.id = re.email_id and e.published
                  where re.record_id = r.id),
                '[]'::json
              ) as linked_email_ids
         from medical_records r
        where ${where.join(' and ')}
        order by r.recorded_at asc
        limit $${params.length - 1} offset $${params.length}`,
      params,
    )
    return { records: result.rows }
  })

  app.get('/api/reports', async (request) => {
    const { q, hospital, department, staff, category, kind, limit, offset } = querySchema.parse(
      request.query,
    )
    const params: unknown[] = []
    const where = ['r.published']
    if (q) {
      params.push(q)
      where.push(`r.search @@ websearch_to_tsquery('english', $${params.length})`)
    }
    if (hospital) {
      params.push(hospital)
      where.push(`r.hospital = $${params.length}`)
    }
    if (department) {
      params.push(department)
      where.push(`r.department = $${params.length}`)
    }
    if (kind) {
      params.push(kind)
      where.push(`r.kind = $${params.length}::evidence_kind`)
    }
    if (category) {
      params.push(category)
      where.push(
        `exists (select 1 from report_categories c where c.report_id = r.id and c.category = $${params.length})`,
      )
    }
    if (staff) {
      params.push(staff)
      where.push(
        `exists (select 1 from report_staff s where s.report_id = r.id and s.publishable and s.name = $${params.length})`,
      )
    }
    params.push(limit, offset)
    const result = await db.query(
      `select r.id, r.hospital, r.department, r.title, r.summary, r.kind, r.incident_date,
              r.complaint_submitted, r.acknowledged, r.first_response,
              r.corrective_action_communicated, r.hospital_statement, r.submitted_by,
              coalesce(
                (select json_agg(c.category order by c.category)
                   from report_categories c where c.report_id = r.id),
                '[]'::json
              ) as categories,
              coalesce(
                (select json_agg(json_build_object('name', s.name, 'role', s.role) order by s.name)
                   from report_staff s where s.report_id = r.id and s.publishable),
                '[]'::json
              ) as staff,
              coalesce(
                (select json_agg(re.email_id order by re.email_id)
                   from report_emails re
                   join emails e on e.id = re.email_id and e.published
                  where re.report_id = r.id),
                '[]'::json
              ) as linked_email_ids,
              coalesce(
                (select json_agg(rr.record_id order by rr.record_id)
                   from report_records rr
                   join medical_records m on m.id = rr.record_id and m.published
                  where rr.report_id = r.id),
                '[]'::json
              ) as linked_record_ids
         from reports r
        where ${where.join(' and ')}
        order by coalesce(r.incident_date, r.complaint_submitted) desc nulls last, r.title asc
        limit $${params.length - 1} offset $${params.length}`,
      params,
    )
    return { reports: result.rows }
  })

  /** Values for the Wall of Shame filter menus. */
  app.get('/api/filters', async () => {
    const [hospitals, departments, staff, categories] = await Promise.all([
      db.query<{ value: string }>(
        'select distinct hospital as value from reports where published order by 1',
      ),
      db.query<{ value: string }>(
        'select distinct department as value from reports where published and department is not null order by 1',
      ),
      db.query<{ value: string }>(
        `select distinct s.name as value
           from report_staff s join reports r on r.id = s.report_id
          where s.publishable and r.published order by 1`,
      ),
      db.query<{ value: string }>(
        `select distinct c.category as value
           from report_categories c join reports r on r.id = c.report_id
          where r.published order by 1`,
      ),
    ])
    return {
      hospitals: hospitals.rows.map((r) => r.value),
      departments: departments.rows.map((r) => r.value),
      staff: staff.rows.map((r) => r.value),
      categories: categories.rows.map((r) => r.value),
    }
  })

  return app
}
