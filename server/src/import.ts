/**
 * Imports reviewed material from JSON seed files in server/seed into Postgres.
 * Usage: DATABASE_URL=... npm run import -- seed/reports.json
 * Rows are inserted as published; raw unreviewed material is not imported here.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import pg from 'pg'

const { Pool } = pg

type SeedReport = {
  id: string
  hospital: string
  department?: string
  title: string
  summary?: string
  kind?: string
  incidentDate?: string
  complaintSubmitted?: string
  acknowledged?: string
  firstResponse?: string
  correctiveActionCommunicated?: boolean
  hospitalStatement?: string
  submittedBy?: string
  categories?: string[]
  staff?: { name: string; role?: string; publishable: boolean }[]
}

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to import.')
}

const files = process.argv.slice(2)
if (!files.length) {
  throw new Error('Pass one or more seed JSON files, for example seed/reports.json')
}

const pool = new Pool({ connectionString: databaseUrl, max: 1 })

try {
  for (const file of files) {
    const reports = JSON.parse(await readFile(path.resolve(file), 'utf8')) as SeedReport[]
    for (const report of reports) {
      await pool.query(
        `insert into reports (id, hospital, department, title, summary, kind, incident_date,
                              complaint_submitted, acknowledged, first_response,
                              corrective_action_communicated, hospital_statement, submitted_by,
                              published)
         values ($1, $2, $3, $4, $5, coalesce($6, 'allegation')::evidence_kind, $7, $8, $9, $10,
                 $11, $12, coalesce($13, 'site_owner')::submitter_kind, true)
         on conflict (id) do update set
           hospital = excluded.hospital,
           department = excluded.department,
           title = excluded.title,
           summary = excluded.summary,
           kind = excluded.kind,
           incident_date = excluded.incident_date,
           complaint_submitted = excluded.complaint_submitted,
           acknowledged = excluded.acknowledged,
           first_response = excluded.first_response,
           corrective_action_communicated = excluded.corrective_action_communicated,
           hospital_statement = excluded.hospital_statement,
           submitted_by = excluded.submitted_by,
           published = true`,
        [
          report.id,
          report.hospital,
          report.department ?? null,
          report.title,
          report.summary ?? '',
          report.kind ?? null,
          report.incidentDate ?? null,
          report.complaintSubmitted ?? null,
          report.acknowledged ?? null,
          report.firstResponse ?? null,
          report.correctiveActionCommunicated ?? null,
          report.hospitalStatement ?? null,
          report.submittedBy ?? null,
        ],
      )
      await pool.query('delete from report_categories where report_id = $1', [report.id])
      for (const category of report.categories ?? []) {
        await pool.query(
          'insert into report_categories (report_id, category) values ($1, $2) on conflict do nothing',
          [report.id, category],
        )
      }
      await pool.query('delete from report_staff where report_id = $1', [report.id])
      for (const member of report.staff ?? []) {
        await pool.query(
          'insert into report_staff (report_id, name, role, publishable) values ($1, $2, $3, $4)',
          [report.id, member.name, member.role ?? null, member.publishable],
        )
      }
      console.log(`Imported report ${report.id}`)
    }
  }
  console.log('Import complete.')
} finally {
  await pool.end()
}
