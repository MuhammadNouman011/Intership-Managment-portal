-- ============ IRMS combined setup (run once) ============

-- ===== 1. SCHEMA =====
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

-- ===== 2. FUNCTIONS =====
-- Atomic serial-number allocator.
--
-- Returns the next counter value for the given year. Using INSERT ... ON
-- CONFLICT DO UPDATE makes the increment atomic, so two concurrent approvals
-- can never receive the same serial number.
create or replace function next_serial(p_year int)
returns int
language plpgsql
as $$
declare
  v int;
begin
  insert into app_settings(key, value)
  values ('serial_counter_' || p_year, '1')
  on conflict (key) do update
    set value = (app_settings.value::int + 1)::text
  returning value::int into v;
  return v;
end;
$$;

-- ===== 3. POLICIES =====
-- Row-Level Security policies for IRMS.
-- Run after schema.sql + functions.sql.

-- Helper: is the current user staff (coordinator / hod / admin)?
create or replace function is_staff()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
      and role in ('coordinator', 'hod', 'admin')
  );
$$;

-- Enable RLS everywhere
alter table profiles         enable row level security;
alter table companies        enable row level security;
alter table requests         enable row level security;
alter table letters          enable row level security;
alter table download_history enable row level security;
alter table notifications    enable row level security;
alter table announcements    enable row level security;
alter table calendar_events  enable row level security;
alter table letter_templates enable row level security;
alter table audit_logs       enable row level security;
alter table app_settings     enable row level security;

-- ---- profiles ----
drop policy if exists profiles_self_select on profiles;
create policy profiles_self_select on profiles
  for select using (id = auth.uid() or is_staff());

drop policy if exists profiles_self_update on profiles;
create policy profiles_self_update on profiles
  for update using (id = auth.uid() or is_staff());

drop policy if exists profiles_self_insert on profiles;
create policy profiles_self_insert on profiles
  for insert with check (id = auth.uid());

-- ---- companies ---- (any authenticated user reads; staff writes; students
-- create indirectly through the server, which uses the service role)
drop policy if exists companies_read on companies;
create policy companies_read on companies for select using (auth.role() = 'authenticated');

drop policy if exists companies_staff_write on companies;
create policy companies_staff_write on companies for all using (is_staff()) with check (is_staff());

-- ---- requests ----
drop policy if exists requests_owner_select on requests;
create policy requests_owner_select on requests
  for select using (student_id = auth.uid() or is_staff());

drop policy if exists requests_owner_insert on requests;
create policy requests_owner_insert on requests
  for insert with check (student_id = auth.uid());

-- Students may update only their own non-decided requests; staff may update any.
drop policy if exists requests_update on requests;
create policy requests_update on requests
  for update using (
    is_staff()
    or (student_id = auth.uid() and status in ('draft', 'pending'))
  );

-- ---- letters ---- (students read their own; only staff create)
drop policy if exists letters_owner_select on letters;
create policy letters_owner_select on letters
  for select using (student_id = auth.uid() or is_staff());

drop policy if exists letters_staff_write on letters;
create policy letters_staff_write on letters
  for all using (is_staff()) with check (is_staff());

-- ---- download_history ----
drop policy if exists dl_owner_select on download_history;
create policy dl_owner_select on download_history
  for select using (downloaded_by = auth.uid() or is_staff());

drop policy if exists dl_owner_insert on download_history;
create policy dl_owner_insert on download_history
  for insert with check (downloaded_by = auth.uid() or is_staff());

-- ---- notifications ----
drop policy if exists notif_owner on notifications;
create policy notif_owner on notifications
  for select using (user_id = auth.uid());

drop policy if exists notif_update on notifications;
create policy notif_update on notifications
  for update using (user_id = auth.uid());

-- ---- announcements / calendar (read all authenticated, staff write) ----
drop policy if exists ann_read on announcements;
create policy ann_read on announcements for select using (auth.role() = 'authenticated');
drop policy if exists ann_write on announcements;
create policy ann_write on announcements for all using (is_staff()) with check (is_staff());

drop policy if exists cal_read on calendar_events;
create policy cal_read on calendar_events for select using (auth.role() = 'authenticated');
drop policy if exists cal_write on calendar_events;
create policy cal_write on calendar_events for all using (is_staff()) with check (is_staff());

-- ---- letter_templates (read all authenticated, staff write) ----
drop policy if exists tpl_read on letter_templates;
create policy tpl_read on letter_templates for select using (auth.role() = 'authenticated');
drop policy if exists tpl_write on letter_templates;
create policy tpl_write on letter_templates for all using (is_staff()) with check (is_staff());

-- ---- audit_logs (staff read; inserts done via service role on the server) ----
drop policy if exists audit_read on audit_logs;
create policy audit_read on audit_logs for select using (is_staff());

-- ---- app_settings (staff read; writes via service role) ----
drop policy if exists settings_read on app_settings;
create policy settings_read on app_settings for select using (is_staff());

-- NOTE: server actions that must bypass RLS (issuing letters, allocating
-- serials, upserting companies, writing audit logs/notifications) use the
-- Supabase service-role key, which is exempt from RLS.

-- ===== 4. SEED =====
-- Seed data for IRMS. Run after schema.sql + functions.sql + policies.sql.

-- Program-code -> full-name map and university details.
insert into app_settings(key, value) values
  ('program_map', '{"BCS":"BS Computer Science","BSE":"BS Software Engineering"}'),
  ('university_name', 'COMSATS University Islamabad, Sahiwal Campus'),
  ('department', 'Department of Computer Science')
on conflict (key) do nothing;

-- Default (placeholder) active letter template. Replace body/logo with the
-- real letter and logos once the user provides them.
-- Placeholders {{like_this}} are filled in at issue time.
insert into letter_templates
  (name, body_html, footer_text, signatory_name, signatory_designation, is_active)
values (
  'Default Internship Reference',
  $tpl$
  <h2 style="text-align:center;margin:0 0 16px">TO WHOM IT MAY CONCERN</h2>
  <p>This is to certify that <strong>{{full_name}}</strong>, bearing Registration No.
  <strong>{{reg_number}}</strong>, is a bona fide student of <strong>{{program_full}}
  (Semester {{semester}})</strong> at COMSATS University Islamabad, Sahiwal Campus.</p>
  <p>As part of the degree requirement, the student is required to complete a mandatory
  internship during the summer break. We recommend the student for an internship at
  <strong>{{company}}</strong> for the position of <strong>{{position}}</strong>.
  Your support in providing this opportunity is highly appreciated.</p>
  <p>For verification, scan the QR code or visit our verification portal with the
  reference number <strong>{{serial}}</strong>.</p>
  $tpl$,
  'COMSATS University Islamabad, Sahiwal Campus — Department of Computer Science',
  'Internship Coordinator',
  'Internship Coordinator, Department of Computer Science',
  true
)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Promoting staff accounts
-- ---------------------------------------------------------------------------
-- Staff (coordinator/hod/admin) accounts are NOT created via student signup.
-- After a person signs in once (so an auth user + profile row exists), promote
-- them by running, e.g.:
--
--   update profiles set role = 'admin'       where email = 'admin@cuisahiwal.edu.pk';
--   update profiles set role = 'coordinator' where email = 'coord@cuisahiwal.edu.pk';
--   update profiles set role = 'hod'         where email = 'hod@cuisahiwal.edu.pk';
--
-- (Staff may use any university email; the student-domain restriction only
-- applies to self-service student signup in the app.)
