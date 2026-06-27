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
