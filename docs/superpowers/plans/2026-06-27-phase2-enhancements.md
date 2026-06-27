# IRMS Phase 2 (Enhancements) Implementation Plan

> Builds on Phase 1. Commit + push each task. Author: Muhammad Nouman <mnoumanrafi@gmail.com>, no co-author.

**Goal:** Add the enhancement layer from the spec on top of the working core: notifications,
smart company suggestions, editable letter template, reports export, dashboard charts, and
English/Urdu language support.

**Tech:** Same stack (Next.js 16, Supabase, Tailwind v4). Custom SVG charts (no heavy chart dep).
CSV export (native) + PDF export (pdf-lib, already present). i18n via a lightweight dictionary +
React context, persisted like the theme.

## Tasks

1. **Notifications** — `notifications` actions (list / unread count / mark read / mark all),
   a bell dropdown in the app shell (both roles) with unread badge, and a `/notifications` page.
2. **Smart company suggestions** — `/api/companies/suggest` route; autocomplete on the company-name
   field in the request form (driven by the `companies` table).
3. **Editable letter template** — staff/admin UI at `/staff/template` to edit body, signatory,
   footer, and toggle active; live preview of the substituted letter.
4. **Reports export** — staff export of requests to CSV and PDF (`/api/reports/requests`), with the
   current filters; CSV opens in Excel.
5. **Dashboard charts** — custom on-brand SVG charts: monthly requests, status breakdown,
   semester-wise, top companies — on the staff dashboard; status mix on the student dashboard.
6. **English / Urdu** — i18n dictionary + `LanguageProvider` + toggle in the shell; translate the
   core user-facing surfaces (nav, landing, auth, dashboards, common actions). Incremental coverage.
7. **Email notifications (Brevo)** — a server email helper wired to decisions (approve/reject), used
   when SMTP env is configured; no-op otherwise so it never blocks.

Each task: build → `npm run build` + `npm test` green → commit → push.
