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
