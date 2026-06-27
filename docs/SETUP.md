# IRMS — Setup & Deployment Guide

Yeh guide app ko **bilkul free** chalane ke liye hai. 3 free accounts banao, env bharo,
SQL chalao, aur deploy karo. (English steps + Urdu hints.)

---

## 0. Local run (abhi, bina deploy ke)

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # 51 unit tests
```

Landing page (`/`) aur verify page (`/verify`) bina accounts ke bhi chalte hain. Login/requests
ke liye neeche Supabase setup zaroori hai.

---

## 1. Supabase (database + auth + storage) — free

1. https://supabase.com par account banao → **New project**.
   - Region: Singapore/Mumbai (paas wala). Database password note kar lo.
2. Project ban-ne ke baad **Project Settings → API** se ye copy karo:
   - `Project URL`  → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public`  → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (secret) → `SUPABASE_SERVICE_ROLE_KEY`
3. Local mein `.env.local` banao (`.env.example` copy karke) aur ye teen bharo + site URL:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

### 1a. SQL chalao (is order mein)
Supabase Dashboard → **SQL Editor** → New query → har file ka content paste karke **Run**:
1. `supabase/schema.sql`
2. `supabase/functions.sql`
3. `supabase/policies.sql`
4. `supabase/seed.sql`

### 1b. Storage bucket banao
Dashboard → **Storage** → **New bucket**:
- Name: `letters`
- **Private** (public mat karna — letters service-role se serve hote hain)

### 1c. Email confirmations + OTP
Dashboard → **Authentication → Providers → Email**:
- **Enable Email provider** = on
- **Confirm email** = on (taake signup par OTP/verification chale)

Dashboard → **Authentication → Email Templates → Confirm signup**:
- Template mein 6-digit code dikhane ke liye `{{ .Token }}` use karo (magic link ki jagah),
  e.g. body mein: `Your IRMS verification code is: {{ .Token }}`

---

## 2. Brevo (OTP/email bhejna) — free 300/din

Supabase ka built-in email rate-limit bohot kam hai (chand emails/ghanta). Free mein theek
chalane ke liye Brevo SMTP laga do:

1. https://www.brevo.com par free account banao → **SMTP & API → SMTP**.
2. SMTP details lo: host `smtp-relay.brevo.com`, port `587`, login, aur SMTP **key**.
3. Supabase → **Project Settings → Authentication → SMTP Settings** → **Enable Custom SMTP**:
   - Host: `smtp-relay.brevo.com`, Port: `587`
   - Username/Password: Brevo wale
   - Sender email: apni verified email (Brevo mein sender verify karna parta hai)
4. Save. Ab OTP/reset emails Brevo se jaayenge.

---

## 3. First staff accounts (coordinator / hod / admin)

Staff self-signup nahi karte. Tareeqa:
1. Us shakhs ko app par ek dafa sign in karwao (ya Supabase **Authentication → Users → Add user**
   se user banao, phir woh login kare taake `profiles` row ban jaye).
2. Supabase **SQL Editor** mein role promote karo:
   ```sql
   update profiles set role = 'admin'       where email = 'admin@cuisahiwal.edu.pk';
   update profiles set role = 'coordinator' where email = 'coord@cuisahiwal.edu.pk';
   update profiles set role = 'hod'         where email = 'hod@cuisahiwal.edu.pk';
   ```
   (Staff koi bhi university email use kar sakta hai — student-domain restriction sirf student
   self-signup par lagti hai.)

---

## 4. Happy-path test (E2E)

1. Student: `/signup` → `fa24-bse-011@students.cuisahiwal.edu.pk` + password → email se 6-digit
   code → `/verify-otp` → `/dashboard`.
2. `/profile` complete karo (naam, semester, section, phone).
3. `/requests/new` → company + internship bhar kar submit.
4. Coordinator account se `/staff/requests` → request **Approve** → serial + PDF auto ban-na chahiye.
5. Student `/letters` → **Download** → PDF mein QR + serial.
6. PDF ka QR scan karo (ya `/verify` par serial daalo) → **Valid reference letter** dikhe.

Sab chal gaya to ✅.

---

## 5. Real letter + logos lagana

`supabase/seed.sql` ka `letter_templates` row placeholder wording rakhta hai. Asli letter set
karne ke liye Supabase mein active template row update karo (`body_html`, `signatory_name`,
`signatory_designation`, `footer_text`). Logo image baad mein PDF layout (`lib/letters/pdf.ts`)
mein add ki ja sakti hai jab tum logo file do (Phase 2: editable-template UI).

> Note (Phase 1): PDF body template ke **text** se banta hai; rich HTML/logo rendering Phase 2 mein
> aayega. Stamp + physical signature ki jagah PDF mein already reserved hai.

---

## 6. Deploy to Vercel — free

1. Code GitHub par push karo (private repo theek hai).
2. https://vercel.com → **Add New → Project** → repo import karo.
3. **Environment Variables** mein wahi 4 keys daalo, lekin:
   - `NEXT_PUBLIC_SITE_URL` = tumhara Vercel URL (e.g. `https://irms.vercel.app`)
4. Deploy. Phir Supabase → **Authentication → URL Configuration** mein Site URL = Vercel URL set karo.
5. Live URL par happy-path dobara test karo.

---

## 7. Free-tier ko zinda rakhna

Supabase free DB ~1 hafta inactivity par pause hoti hai. Internship season mein roz use hoga to
masla nahi. Off-season ke liye baad mein ek free cron (e.g. GitHub Actions) laga kar `/verify`
ko hafte mein ek dafa ping kar sakte ho. Kharcha $0.
