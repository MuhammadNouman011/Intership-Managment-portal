-- IRMS database schema (Supabase / Postgres)
-- Run order: schema.sql -> functions.sql -> policies.sql -> seed.sql
-- Safe to re-run: uses "if not exists" / "create or replace" where possible.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('student', 'coordinator', 'hod', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type request_status as enum
    ('draft', 'pending', 'hold', 'returned', 'rejected', 'approved', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type internship_type as enum ('remote', 'hybrid', 'onsite');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type as enum
    ('submitted', 'approved', 'rejected', 'returned', 'announcement');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- profiles  (extends auth.users)
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text unique not null,
  role         user_role not null default 'student',
  full_name    text,
  reg_number   text,
  session      text,
  program      text,            -- BCS | BSE
  roll         text,
  semester     int check (semester between 1 and 8),
  section      text,
  phone        text,
  cnic         text,
  linkedin     text,
  photo_url    text,
  department   text not null default 'CS',
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- companies
-- ---------------------------------------------------------------------------
create table if not exists companies (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  address          text,
  city             text,
  country          text,
  website          text,
  hr_name          text,
  hr_email         text,
  internship_count int not null default 0,
  created_at       timestamptz not null default now()
);
-- de-dupe companies by normalized name + city
create unique index if not exists companies_name_city_uk
  on companies (lower(name), lower(coalesce(city, '')));

-- ---------------------------------------------------------------------------
-- requests
-- ---------------------------------------------------------------------------
create table if not exists requests (
  id                    uuid primary key default gen_random_uuid(),
  student_id            uuid not null references profiles(id) on delete cascade,
  company_id            uuid references companies(id),
  position              text not null,
  type                  internship_type not null,
  duration              text,
  expected_joining_date date,
  remarks               text,
  status                request_status not null default 'pending',
  reject_reason         text,
  admin_notes           text,                 -- internal, hidden from student
  decided_by            uuid references profiles(id),
  decided_at            timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index if not exists requests_student_idx on requests(student_id);
create index if not exists requests_status_idx  on requests(status);

-- ---------------------------------------------------------------------------
-- letters
-- ---------------------------------------------------------------------------
create table if not exists letters (
  id            uuid primary key default gen_random_uuid(),
  request_id    uuid not null unique references requests(id) on delete cascade,
  student_id    uuid not null references profiles(id) on delete cascade,
  serial_number text not null unique,
  pdf_path      text,                 -- path within the 'letters' storage bucket
  qr_token      text not null unique,
  issue_date    date not null default current_date,
  issued_by     uuid references profiles(id),
  is_revoked    boolean not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists letters_student_idx on letters(student_id);

-- ---------------------------------------------------------------------------
-- download_history
-- ---------------------------------------------------------------------------
create table if not exists download_history (
  id            uuid primary key default gen_random_uuid(),
  letter_id     uuid not null references letters(id) on delete cascade,
  downloaded_by uuid references profiles(id),
  downloaded_at timestamptz not null default now(),
  ip            text
);

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------
create table if not exists notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  type       notification_type not null,
  title      text not null,
  message    text,
  link       text,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on notifications(user_id, is_read);

-- ---------------------------------------------------------------------------
-- announcements (announcements + notice board)
-- ---------------------------------------------------------------------------
create table if not exists announcements (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  body       text,
  type       text not null default 'announcement',  -- announcement | notice
  visible_to text not null default 'all',            -- all | students | <role>
  posted_by  uuid references profiles(id),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- calendar_events (holidays + internship deadlines)
-- ---------------------------------------------------------------------------
create table if not exists calendar_events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  date        date not null,
  type        text not null default 'holiday',       -- holiday | deadline
  description text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- letter_templates (editable template)
-- ---------------------------------------------------------------------------
create table if not exists letter_templates (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  body_html            text not null,
  logo_url             text,
  footer_text          text,
  signatory_name       text,
  signatory_designation text,
  is_active            boolean not null default false,
  updated_by           uuid references profiles(id),
  updated_at           timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- audit_logs
-- ---------------------------------------------------------------------------
create table if not exists audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references profiles(id),
  action      text not null,
  entity_type text,
  entity_id   uuid,
  details     jsonb,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- app_settings (key/value: serial counters, program map, university details)
-- ---------------------------------------------------------------------------
create table if not exists app_settings (
  key   text primary key,
  value text not null
);
