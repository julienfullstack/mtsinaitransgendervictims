/**
 * Every published item states what kind of material it is, so readers can
 * distinguish patient allegations from documents, hospital responses and
 * independently verifiable facts.
 */
export type EvidenceKind =
  | 'allegation'
  | 'documentary_evidence'
  | 'hospital_response'
  | 'verified_fact'

export const EVIDENCE_KIND_LABELS: Record<EvidenceKind, string> = {
  allegation: 'Patient allegation',
  documentary_evidence: 'Documentary evidence',
  hospital_response: 'Hospital response',
  verified_fact: 'Verifiable fact',
}

export type ReportCategory =
  | 'misgendering'
  | 'discrimination'
  | 'patient_advocacy_failure'
  | 'inadequate_complaint_response'
  | 'informed_consent'
  | 'surgical_outcome'
  | 'records_access'
  | 'other'

export const CATEGORY_LABELS: Record<ReportCategory, string> = {
  misgendering: 'Misgendering',
  discrimination: 'Discrimination',
  patient_advocacy_failure: 'Patient advocacy failure',
  inadequate_complaint_response: 'Inadequate complaint response',
  informed_consent: 'Informed consent',
  surgical_outcome: 'Surgical outcome',
  records_access: 'Records access',
  other: 'Other',
}

export interface Attachment {
  name: string
  /** Path under /public when the attachment is published, otherwise omitted. */
  href?: string
}

export interface Email {
  id: string
  /** ISO 8601 timestamp. */
  date: string
  direction: 'sent' | 'received'
  from: string
  to: string[]
  cc?: string[]
  subject: string
  body: string
  threadId?: string
  attachments?: Attachment[]
  /** Set by review: whether a received reply addressed the substance. */
  substantive?: boolean
  kind: EvidenceKind
  hospital?: string
  department?: string
  /** Original mailbox, export file or message identifier. */
  source: string
}

export interface MedicalRecord {
  id: string
  /** ISO 8601 date of the encounter or document. */
  date: string
  recordType: string
  title: string
  author?: string
  hospital?: string
  department?: string
  body: string
  kind: EvidenceKind
  /** Emails that discuss this record. */
  linkedEmailIds?: string[]
  source: string
}

export interface Report {
  id: string
  hospital: string
  department?: string
  /**
   * Individual staff names are shown only when publication has been reviewed
   * as legally appropriate and adequately supported.
   */
  staff?: { name: string; role?: string; publishable: boolean }[]
  categories: ReportCategory[]
  kind: EvidenceKind
  title: string
  summary: string
  incidentDate?: string
  complaintSubmitted?: string
  acknowledged?: string
  firstResponse?: string
  correctiveActionCommunicated?: boolean
  hospitalStatement?: string
  linkedEmailIds?: string[]
  linkedRecordIds?: string[]
  submittedBy: 'site_owner' | 'anonymous_patient' | 'named_patient'
}
