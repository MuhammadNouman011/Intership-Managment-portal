# Internship Reference Letter Management System (IRMS) — Design Document

**Project:** COMSATS University Islamabad, Sahiwal Campus — Computer Science Department
**Date:** 2026-06-27
**Status:** Approved design (pending user spec review)

---

## 1. Problem & Goal

CS students at COMSATS Sahiwal must complete a mandatory summer internship (semesters 4, 5, 6).
Companies ask applicants for a **reference letter** from the university. Today the process is fully
manual:

1. Student fills a Google Form (company, location, semester, degree, registration number).
2. A teacher reads the form and **manually** writes each reference letter.
3. The teacher **manually** assigns a serial number.

This is slow and painful — especially when a single student needs letters for **multiple companies**,
requiring the teacher to repeat the whole process each time.

**Goal:** A free web application where a student requests a reference letter, an approver (coordinator)
approves it, and a professional PDF (with an auto serial number and QR verification) is generated for
the student to download, print, and get physically signed + stamped.

**Hard constraints:**
- **Zero cost** — must run entirely on free tiers. Not a single rupee.
- Free user accounts.
- Signup only with the official university student email + OTP verification.
- Frontend must be **distinctive, professional, high quality** — NOT a generic/templated "AI-generated"
  look. (See §11 Design Language.)

---

## 2. Scope

- **Department:** Computer Science only (single HOD, single coordinator initially). Data model keeps a
  `department` field so other departments can be added later without rework.
- **Programs:** `BCS → BS Computer Science`, `BSE → BS Software Engineering`.
- **Roles:** Student, Coordinator, HOD, Admin (all four designed in from the start).
- Everything the user listed is included in the design. Build happens in a sensible **order** (phases in
  §12) — phasing is build sequence, not feature removal.

---

## 3. Architecture & Tech Stack (all free tier)

One web app, one codebase, four roles. After login the UI branches by role.

```
Browser (Student / Coordinator / HOD / Admin)
        Next.js web app (PWA — installable)
                    |
        Next.js Server / API  (Vercel, free)
          - auth & role checks
          - PDF generation
          - serial-number assignment
                    |
            Supabase (free)
          - Postgres DB (records)
          - Auth (email + OTP)
          - Storage (logos, signatures, PDFs)
                    |
              Brevo (email/OTP, 300/day free)
```

| Concern            | Tool                              | Why |
|--------------------|-----------------------------------|-----|
| Frontend + backend | **Next.js** (App Router)          | UI + API in one; built-in PWA support |
| Hosting            | **Vercel** (free)                 | Auto-deploy, $0 |
| Database           | **Supabase Postgres** (free)      | Relational records, 500 MB |
| Auth + OTP         | **Supabase Auth + Brevo SMTP**    | Email-only signup, OTP, password |
| File storage       | **Supabase Storage** (free)       | Logos, signatures, generated PDFs |
| PDF generation     | **pdf-lib** or **Puppeteer**      | Professional A4 PDF on the server |
| QR codes           | **qrcode** library                | QR on each letter |
| Styling            | **Tailwind CSS**                  | Dark mode + responsive |

**Known free-tier caveat:** Supabase free DB pauses after ~1 week of inactivity. During internship
season it is used daily (no issue); for off-season a small free keep-alive ping keeps it awake. Cost
remains $0.

---

## 4. Data Model

Auth is handled by Supabase Auth; `profiles` extends it. Table names are in English (used in code).

**`profiles`** — one row per user
```
id, email, role (student/coordinator/hod/admin),
full_name, reg_number (auto: CIIT/FA24-BSE-011/SWL),
session (FA24), program (BSE/BCS), roll (011),
semester, section, phone, cnic?, linkedin?, photo_url?,
department (CS), is_active, created_at
```

**`companies`** — auto-saved from requests; powers suggestions + duplicate detection
```
id, name, address, city, country, website?,
hr_name?, hr_email?, internship_count, created_at
```

**`requests`** — the reference-letter request (core)
```
id, student_id -> profiles, company_id -> companies,
position, internship_type (remote/hybrid/onsite),
duration, expected_joining_date, remarks?,
status (draft/pending/hold/returned/rejected/approved/cancelled),
reject_reason?, admin_notes? (internal, hidden from student),
created_at, updated_at, decided_by -> profiles, decided_at
```

**`letters`** — created when a request is approved
```
id, request_id -> requests, serial_number (IRMS-2026-000001),
pdf_url, qr_token (unique, unguessable), issue_date,
issued_by -> profiles, is_revoked, created_at
```

**`download_history`**
```
id, letter_id -> letters, downloaded_by, downloaded_at, ip?
```

**`notifications`**
```
id, user_id, type (submitted/approved/rejected/announcement),
title, message, is_read, link?, created_at
```

**`announcements`** — announcements + notice board
```
id, title, body, type (announcement/notice), posted_by,
visible_to (all/students/role), expires_at?, created_at
```

**`calendar_events`** — holiday calendar + internship deadlines
```
id, title, date, type (holiday/deadline), description?, created_at
```

**`letter_templates`** — editable template
```
id, name, body_html, logo_url, footer_text,
signatory_name, signatory_designation, is_active, updated_by, updated_at
```

**`audit_logs`**
```
id, actor_id, action, entity_type, entity_id, details(json), created_at
```

**`app_settings`** — settings + serial counter
```
key, value
  e.g. serial_counter = 123, current_year = 2026,
       program_map = { BSE: "BS Software Engineering", BCS: "BS Computer Science" }
```

**Key rules:**
- **Auto serial number:** atomic increment on `app_settings.serial_counter` → no two letters ever share
  a number (kills the manual-serial problem).
- **Multiple letters per email:** `requests`/`letters` link by `student_id` → all of a student's
  requests/letters appear together.
- **Duplicate detection:** on new request, warn if same `student_id` + `company_id` already exists.
- **Row-Level Security (RLS):** enforced at the database — students see only their own data;
  coordinator/HOD/admin see all CS data.

---

## 5. Roles & Permissions

```
Student      -> only their own data
Coordinator  -> all CS requests/students + issue letters
HOD          -> CS oversight + override approve/reject
Admin        -> everything + system settings + role management
```
Approval is **flexible**: the Coordinator is the primary worker; HOD and Admin can override
approve/reject so a letter is never blocked if the coordinator is unavailable. Senior roles inherit
junior approval capabilities (Admin ⊇ HOD ⊇ Coordinator).

---

## 6. Screens by Role

### 6.1 Student
1. Signup / Login / Forgot Password (university email + OTP)
2. Dashboard — cards (Total / Approved / Pending / Rejected / Downloads), Recent Activity,
   Notifications, Quick Actions
3. Profile (fill once; reg# auto-derived from email)
4. New Request — Company info + Internship info
5. My Requests — table (Company, Position, Date, Status, Action) + search + filter
6. Request Detail — status, reject reason, edit/cancel while pending
7. Drafts — save and submit later
8. Download Letter + Download History
9. Notifications

### 6.2 Coordinator (primary operator)
1. Dashboard — cards (Total / Pending / Approved / Rejected / Today) + charts
   (monthly, semester-wise, company-wise)
2. Requests — list + search (name/reg/company/sem/date) + filters + **bulk approve**
3. Request Detail — approve / reject (with reason) / hold / return-for-correction / internal notes →
   approving auto-generates the PDF
4. Students — view / search / edit / disable
5. Companies — auto-saved database + duplicate warnings
6. Letter Template — wording / logo / footer / signature
7. Reports — export Excel / PDF / CSV
8. Notifications

### 6.3 HOD
1. Dashboard — department-wide stats: total requests, approval ratio, coordinator performance,
   monthly graph, top companies, most active semester
2. Requests (read + override approve/reject)
3. Reports & Analytics
4. Notifications

### 6.4 Admin (super-admin)
1. Dashboard — system-wide overview
2. User Management — all users, assign/change roles, enable/disable
3. Requests (full control + override)
4. Letter Template management
5. Announcements / Notice Board / Calendar management
6. Audit Logs
7. App Settings — serial counter, program mapping, university details
8. Reports & Analytics

---

## 7. Reference Letter

The actual letter wording and logos are owned by the user and provided at build time. Until then the
template uses placeholders. The template is **editable** (wording, logo, footer, signatory) by
Coordinator/Admin.

Working draft (to be replaced with the user's real letter):

> **Ref #:** IRMS-2026-000001  **Date:** 27 June 2026
>
> **TO WHOM IT MAY CONCERN**
>
> This is to certify that **Mr./Ms. [Full Name]**, Registration No. **CIIT/FA24-BSE-011/SWL**, is a
> bona fide student of **BS Software Engineering (Semester [X])** at COMSATS University Islamabad,
> Sahiwal Campus.
>
> As part of the degree requirement, the student must complete a mandatory summer internship. We
> recommend the student for an internship at **[Company Name]** for the position of **[Position]**.
> Your support in providing this opportunity is highly appreciated.
>
> For verification, scan the QR code or visit the verification portal with the reference number above.
>
> _______________________
> **[Coordinator Name]** — Internship Coordinator, Department of CS
> COMSATS University Islamabad, Sahiwal Campus
> *(University logo top; departmental stamp space bottom)*

PDF layout: A4, university logo top, ref# + date, body, signature line + signatory, QR code, stamp
space at the bottom. The student prints it and obtains a physical signature + departmental stamp.

---

## 8. Letter Generation Flow (on approval)

```
Coordinator clicks "Approve"
  1. Atomic increment serial counter -> IRMS-2026-000001
  2. Generate unique qr_token (unguessable)
  3. Load active template (wording + logo + footer + signatory)
  4. Fill student + company + internship data
  5. Build QR -> https://<site>/verify/<qr_token>
  6. Generate professional A4 PDF
  7. Save PDF to Supabase Storage; insert letters row
  8. Notify student (in-app + email): "Your letter is ready"
Student dashboard -> Download PDF (with download history)
```

---

## 9. QR / Verification Portal (public, no login)

Two ways for an employer to verify:
1. **QR scan** → opens `/verify/<token>` directly.
2. **Manual** → employer visits `/verify` and types the Reference Number.

The verify page shows **minimal** info only (no phone/CNIC):

```
Valid Reference Letter
Student:  [Name] (CIIT/FA24-BSE-011/SWL)
Program:  BS Software Engineering, Semester 5
Company:  [Company]
Issued:   27 June 2026 by COMSATS Sahiwal
Status:   Valid   (or  Revoked if admin cancelled)
```

- Revoked letter → "This letter has been revoked".
- Unknown/fake token → "No such letter found".

This makes letters fraud-resistant — a photoshopped letter cannot point to a real record in the system.

---

## 10. Cross-Cutting Features

### Security
- Email-only student signup restricted to `@students.cuisahiwal.edu.pk`.
- Coordinator/HOD/Admin accounts are created by Admin (first Admin seeded manually).
- 6-digit OTP on signup (via Brevo), expiring.
- Password hashing + session/JWT (Supabase).
- Role-based access on every screen and API.
- Row-Level Security at the database.
- Rate limiting (OTP/login), account lock after repeated failures, session timeout.

### PWA + Responsive
- Works on mobile/tablet/desktop.
- Installable ("Add to Home Screen"). Can later be wrapped into an APK from the same PWA.

### Notifications
- In-app (bell): submitted/approved/rejected/announcement.
- Email (Brevo): approve/reject/reminder.

### UX / Smart Features
- Dark / Light mode.
- English / Urdu (multi-language).
- Global search.
- Auto-save drafts, Recently viewed, Favorites (frequent companies).
- Smart company suggestions (from `companies`).
- Duplicate detection (same student + company → warning).

### Reports & Analytics
- Export Excel / PDF / CSV.
- Charts: monthly requests, semester-wise, company-wise, approval ratio, top companies,
  average approval time.

---

## 11. Design Language (frontend — high priority)

The frontend must feel like a **real, intentionally designed university product**, not a generic
template. Concretely:

- A genuine visual identity (considered color system, ideally anchored to COMSATS branding, with a
  proper neutral/accent palette — not default blue-purple gradients).
- Intentional typography (a real type scale; a distinctive but readable typeface pairing).
- Custom, polished components and layout — avoid the stock "AI dashboard" look (no cookie-cutter card
  grid with default shadcn styling and gradient blobs).
- Thoughtful micro-interactions, empty states, loading states, and transitions.
- Consistent spacing, strong hierarchy, accessible contrast, fully responsive.
- Dark + light themes both first-class.

The `frontend-design` skill will be used during implementation to drive these choices.

---

## 12. Build Order (phases = sequence, not scope reduction)

All features above are in scope. Build proceeds in this order so the core pain is solved first and the
foundation supports everything else:

**Phase 1 — Core (solves the real problem):**
Auth (email + OTP, 4 roles), Profile (reg# auto-derive), New Request, My Requests, Coordinator
approve/reject/hold + auto serial number + PDF generation (with editable template placeholder), letter
download, records per student, QR verification page, RBAC + RLS, PWA shell, base design system.

**Phase 2 — Enhancements:**
Dashboards + charts, in-app + email notifications, search + filters, drafts/edit/cancel, download
history, company database + suggestions + duplicate detection, editable template UI, reports export,
dark mode, English/Urdu.

**Phase 3 — Extended:**
Coordinator/HOD/Admin advanced panels, announcements + notice board + calendar, audit logs + activity
timeline + analytics, AI features (paid — last), SMS (paid — future).

---

## 13. Out of Scope (cost-driven, explicitly deferred)

- **SMS** notifications — not free; Phase 3 / future.
- **AI features** (CV checklist, internship tips) — not free; Phase 3, only if budget allows.

These are the only items not guaranteed by the $0 constraint; everything else runs on free tiers.
