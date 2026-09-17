-- Core record store. Every row carries the kind of material it is and a
-- published flag, so raw imported material stays private until it is reviewed.

create type evidence_kind as enum (
  'allegation',
  'documentary_evidence',
  'hospital_response',
  'verified_fact'
);

create type email_direction as enum ('sent', 'received');

create type submitter_kind as enum ('site_owner', 'anonymous_patient', 'named_patient');

create table if not exists emails (
  id text primary key,
  sent_at timestamptz not null,
  direction email_direction not null,
  sender text not null,
  recipients text[] not null default '{}',
  cc text[] not null default '{}',
  subject text not null default '',
  body text not null default '',
  thread_id text,
  hospital text,
  department text,
  kind evidence_kind not null default 'documentary_evidence',
  substantive boolean,
  source text not null,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  -- Maintained by emails_search_update below: array_to_string is only stable,
  -- so this cannot be a generated column.
  search tsvector
);

create or replace function emails_search_refresh() returns trigger as $$
begin
  new.search :=
    setweight(to_tsvector('english', coalesce(new.subject, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.body, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.sender, '') || ' ' ||
      array_to_string(coalesce(new.recipients, '{}'), ' ') || ' ' ||
      array_to_string(coalesce(new.cc, '{}'), ' ')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.department, '')), 'C');
  return new;
end;
$$ language plpgsql;

create trigger emails_search_update
  before insert or update of subject, body, sender, recipients, cc, department on emails
  for each row execute function emails_search_refresh();

create index if not exists emails_search_idx on emails using gin (search);
create index if not exists emails_sent_at_idx on emails (sent_at);
create index if not exists emails_published_idx on emails (published);

create table if not exists email_attachments (
  id bigserial primary key,
  email_id text not null references emails (id) on delete cascade,
  name text not null,
  href text
);

create index if not exists email_attachments_email_idx on email_attachments (email_id);

create table if not exists medical_records (
  id text primary key,
  recorded_at timestamptz not null,
  record_type text not null,
  title text not null,
  author text,
  hospital text,
  department text,
  body text not null default '',
  kind evidence_kind not null default 'documentary_evidence',
  source text not null,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  search tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(body, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(record_type, '') || ' ' || coalesce(author, '') || ' ' || coalesce(department, '')), 'C')
  ) stored
);

create index if not exists medical_records_search_idx on medical_records using gin (search);
create index if not exists medical_records_recorded_at_idx on medical_records (recorded_at);
create index if not exists medical_records_published_idx on medical_records (published);

-- Emails that discuss a given record.
create table if not exists record_emails (
  record_id text not null references medical_records (id) on delete cascade,
  email_id text not null references emails (id) on delete cascade,
  primary key (record_id, email_id)
);

create table if not exists reports (
  id text primary key,
  hospital text not null,
  department text,
  title text not null,
  summary text not null default '',
  kind evidence_kind not null default 'allegation',
  incident_date date,
  complaint_submitted date,
  acknowledged date,
  first_response date,
  corrective_action_communicated boolean,
  hospital_statement text,
  submitted_by submitter_kind not null default 'site_owner',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  search tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(hospital, '') || ' ' || coalesce(department, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(hospital_statement, '')), 'C')
  ) stored
);

create index if not exists reports_search_idx on reports using gin (search);
create index if not exists reports_hospital_idx on reports (hospital);
create index if not exists reports_department_idx on reports (department);
create index if not exists reports_published_idx on reports (published);

create table if not exists report_categories (
  report_id text not null references reports (id) on delete cascade,
  category text not null,
  primary key (report_id, category)
);

-- A staff name is served only when publishable is true.
create table if not exists report_staff (
  id bigserial primary key,
  report_id text not null references reports (id) on delete cascade,
  name text not null,
  role text,
  publishable boolean not null default false
);

create index if not exists report_staff_report_idx on report_staff (report_id);
create index if not exists report_staff_name_idx on report_staff (name) where publishable;

create table if not exists report_emails (
  report_id text not null references reports (id) on delete cascade,
  email_id text not null references emails (id) on delete cascade,
  primary key (report_id, email_id)
);

create table if not exists report_records (
  report_id text not null references reports (id) on delete cascade,
  record_id text not null references medical_records (id) on delete cascade,
  primary key (report_id, record_id)
);
