import type { Email, MedicalRecord, Report } from './types'

declare global {
  interface Window {
    __API_BASE__?: string
  }
}

/**
 * The API base URL comes from /config.js, which nginx writes at container
 * start. Empty means the API is on this origin, which is how the dev server
 * runs it through the Vite proxy.
 */
const BASE = (window.__API_BASE__ || import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

async function get<T>(path: string, params: Record<string, string | undefined>): Promise<T> {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value)
  }
  const query = search.toString()
  const response = await fetch(`${BASE}${path}${query ? `?${query}` : ''}`)
  if (!response.ok) throw new Error(`${path} failed with ${response.status}`)
  return (await response.json()) as T
}

type EmailRow = {
  id: string
  sent_at: string
  direction: 'sent' | 'received'
  sender: string
  recipients: string[]
  cc: string[]
  subject: string
  body: string
  thread_id: string | null
  hospital: string | null
  department: string | null
  kind: Email['kind']
  substantive: boolean | null
  source: string
  attachments: { name: string; href: string | null }[]
}

type RecordRow = {
  id: string
  recorded_at: string
  record_type: string
  title: string
  author: string | null
  hospital: string | null
  department: string | null
  body: string
  kind: MedicalRecord['kind']
  source: string
  linked_email_ids: string[]
}

type ReportRow = {
  id: string
  hospital: string
  department: string | null
  title: string
  summary: string
  kind: Report['kind']
  incident_date: string | null
  complaint_submitted: string | null
  acknowledged: string | null
  first_response: string | null
  corrective_action_communicated: boolean | null
  hospital_statement: string | null
  submitted_by: Report['submittedBy']
  categories: Report['categories']
  staff: { name: string; role: string | null }[]
  linked_email_ids: string[]
  linked_record_ids: string[]
}

export interface Filters {
  hospitals: string[]
  departments: string[]
  staff: string[]
  categories: string[]
}

const toEmail = (row: EmailRow): Email => ({
  id: row.id,
  date: row.sent_at,
  direction: row.direction,
  from: row.sender,
  to: row.recipients,
  cc: row.cc,
  subject: row.subject,
  body: row.body,
  threadId: row.thread_id ?? undefined,
  hospital: row.hospital ?? undefined,
  department: row.department ?? undefined,
  kind: row.kind,
  substantive: row.substantive ?? undefined,
  source: row.source,
  attachments: row.attachments.map((a) => ({ name: a.name, href: a.href ?? undefined })),
})

const toRecord = (row: RecordRow): MedicalRecord => ({
  id: row.id,
  date: row.recorded_at,
  recordType: row.record_type,
  title: row.title,
  author: row.author ?? undefined,
  hospital: row.hospital ?? undefined,
  department: row.department ?? undefined,
  body: row.body,
  kind: row.kind,
  source: row.source,
  linkedEmailIds: row.linked_email_ids,
})

const toReport = (row: ReportRow): Report => ({
  id: row.id,
  hospital: row.hospital,
  department: row.department ?? undefined,
  title: row.title,
  summary: row.summary,
  kind: row.kind,
  incidentDate: row.incident_date ?? undefined,
  complaintSubmitted: row.complaint_submitted ?? undefined,
  acknowledged: row.acknowledged ?? undefined,
  firstResponse: row.first_response ?? undefined,
  correctiveActionCommunicated: row.corrective_action_communicated ?? undefined,
  hospitalStatement: row.hospital_statement ?? undefined,
  submittedBy: row.submitted_by,
  categories: row.categories,
  staff: row.staff.map((s) => ({ name: s.name, role: s.role ?? undefined, publishable: true })),
  linkedEmailIds: row.linked_email_ids,
  linkedRecordIds: row.linked_record_ids,
})

export async function fetchEmails(q?: string, direction?: 'sent' | 'received') {
  const data = await get<{ emails: EmailRow[] }>('/api/emails', { q, direction })
  return data.emails.map(toEmail)
}

export async function fetchRecords(q?: string) {
  const data = await get<{ records: RecordRow[] }>('/api/records', { q })
  return data.records.map(toRecord)
}

export async function fetchReports(params: {
  q?: string
  hospital?: string
  department?: string
  staff?: string
  category?: string
  kind?: string
}) {
  const data = await get<{ reports: ReportRow[] }>('/api/reports', params)
  return data.reports.map(toReport)
}

export function fetchFilters() {
  return get<Filters>('/api/filters', {})
}

export function formatDate(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function daysBetween(a?: string, b?: string) {
  if (!a || !b) return null
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000)
}
