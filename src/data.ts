import MiniSearch from 'minisearch'
import emailsJson from './data/emails.json'
import recordsJson from './data/records.json'
import reportsJson from './data/reports.json'
import type { Email, MedicalRecord, Report } from './types'

export const emails = (emailsJson as Email[])
  .slice()
  .sort((a, b) => a.date.localeCompare(b.date))
export const records = (recordsJson as MedicalRecord[])
  .slice()
  .sort((a, b) => a.date.localeCompare(b.date))
export const reports = reportsJson as Report[]

const options = { prefix: true, fuzzy: 0.15, combineWith: 'AND' as const }

function index<T extends { id: string }>(items: T[], fields: string[], extract?: (item: T, field: string) => string) {
  const search = new MiniSearch<T>({
    fields,
    storeFields: ['id'],
    searchOptions: { ...options, boost: { subject: 2, title: 2 } },
    extractField: extract
      ? (doc, field) => (field === 'id' ? doc.id : extract(doc, field))
      : undefined,
  })
  search.addAll(items)
  return search
}

const emailIndex = index(emails, ['subject', 'body', 'from', 'to', 'department'], (e, f) => {
  const v = (e as unknown as Record<string, unknown>)[f]
  return Array.isArray(v) ? v.join(' ') : String(v ?? '')
})
const recordIndex = index(records, ['title', 'body', 'recordType', 'author', 'department'])
const reportIndex = index(reports, ['title', 'summary', 'hospital', 'department', 'staffNames', 'hospitalStatement'], (r, f) =>
  f === 'staffNames'
    ? (r.staff ?? []).filter((s) => s.publishable).map((s) => s.name).join(' ')
    : String((r as unknown as Record<string, unknown>)[f] ?? ''),
)

function matchIds(search: MiniSearch, query: string): Set<string> | null {
  const q = query.trim()
  if (!q) return null
  return new Set(search.search(q).map((r) => String(r.id)))
}

export const searchEmails = (q: string) => matchIds(emailIndex, q)
export const searchRecords = (q: string) => matchIds(recordIndex, q)
export const searchReports = (q: string) => matchIds(reportIndex, q)

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
