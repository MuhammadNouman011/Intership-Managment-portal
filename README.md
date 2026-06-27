# IRMS — Internship Reference Letter Management System

Official internship reference letters for **COMSATS University Islamabad, Sahiwal Campus —
Department of Computer Science**. Students request a letter, a coordinator approves it, and a
sealed PDF with an auto serial number and a public QR-verification page is generated for download.

Built to run entirely on **free tiers** (Supabase + Vercel + Brevo).

## Stack

- **Next.js** (App Router, TypeScript) + **Tailwind CSS** — UI + API, installable PWA
- **Supabase** — Postgres, Auth (email + OTP), Storage, Row-Level Security
- **pdf-lib** + **qrcode** — sealed A4 letter generation
- **Brevo** — SMTP for OTP / notification emails
- **Vitest** — unit tests for all domain logic

## Roles

`student` · `coordinator` · `hod` · `admin` — flexible approval (coordinator is primary; HOD/admin
can override). See `docs/superpowers/specs/` for the full design.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # unit tests
```

Copy `.env.example` → `.env.local` and fill the Supabase keys.

## Set up & deploy

Full step-by-step (accounts, SQL, storage, SMTP, first admin, Vercel): **[`docs/SETUP.md`](docs/SETUP.md)**.

## Project docs

- Design spec — `docs/superpowers/specs/2026-06-27-internship-reference-letter-system-design.md`
- Implementation plan (Phase 1) — `docs/superpowers/plans/2026-06-27-phase1-core.md`
- Database — `supabase/` (`schema.sql`, `functions.sql`, `policies.sql`, `seed.sql`)

## Status

**Phase 1 (core) complete:** auth + OTP, profile, request flow, coordinator decisions, automatic
letter issuance (serial + QR + PDF), download + history, public verification, role dashboards, PWA.
Phase 2/3 (dashboard charts, notifications center, editable-template UI, reports, multi-language,
HOD/admin panels, announcements) are designed and queued.
