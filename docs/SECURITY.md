# SECURITY — NeuroGrowth Labs

Security review of the current branch. Read-only. Findings are ordered by severity. Cross-referenced to `docs/BUGS.md`.

> Note: several secrets below are already committed to git history. Removing them from `HEAD` is necessary but not sufficient. Anything listed as "in the bundle" or "committed" must be treated as compromised and rotated at the provider.

## Critical

### S-1 — Hardcoded super-admin password in the client bundle (BUG-001)

- `src/components/AuthContext.tsx:157` and `:171` embed `simao@neurogrowthlabs.co.za` / `NeuroGrowth2@`. On auth failure this grants `super_admin` via `localStorage.local_admin_session`.
- Verified present in `dist/assets/*.js` after build.
- **Exploit:** open dev tools, read the password, log into `/portal` as super admin.
- **Action:** delete the fallback, rely on Supabase auth, rotate the password (already public in git).

### S-2 — Overly permissive RLS exposes PII (BUG-004)

- `src/pages/Portal.tsx:1301-1307` ships `CREATE POLICY "Public full access" ... USING (true) WITH CHECK (true)` for all six tables.
- `contact_submissions` and `partner_applications` contain names, emails, and messages.
- Combined with the public anon key (S-3), anyone can `SELECT *` and also modify/delete rows.
- **Action:** replace with least-privilege policies (see `docs/SUPABASE_AUDIT.md` §4). Deny `anon` `SELECT` on PII tables; allow only `INSERT`.

### S-3 — Supabase anon key and Firebase config committed and shipped (BUG-002, BUG-003)

- `src/supabase.ts:4-5` hardcodes the Supabase URL and anon JWT.
- `firebase-applet-config.json` commits a live Firebase web `apiKey`, `projectId`, `storageBucket`, etc.
- The anon key and Firebase web key are "publishable" by design, but committing them prevents clean rotation and makes RLS (S-2) and Firestore rules the ONLY defense.
- **Action:** move to env injection; enable Firebase App Check; restrict the Firebase API key by HTTP referrer; rotate. The security boundary must be server-side policy, not key secrecy.

## High

### S-4 — Unauthenticated admin surface (BUG-007)

- `/admin/recruitment` (`src/App.tsx:54`, `src/pages/AdminDashboard.tsx`) has no auth guard. Publicly reachable.
- Today it renders mock data, so no live PII leaks, but it is an internal-looking admin page open to the world and a trap for future real data.
- **Action:** gate behind the `super_admin` check used by `Portal.tsx:630`, or remove the route.

### S-5 — Firestore writes fail open into localStorage, masking loss (BUG-009)

- Not a direct breach, but a security-relevant integrity gap: five collections have no Firestore rules and are denied, then errors are swallowed. A submitter believes their data was sent; it may exist only in their own browser.
- **Action:** add rules or drop the dead path; surface real errors instead of `console.warn`.

### S-6 — Client-side-only authorization (BUG-010)

- `super_admin` is decided by matching hardcoded emails in the client (`AuthContext.tsx:61,117,192`). The `users` table that would hold roles server-side does not exist in the shipped schema.
- Anyone who can set the client role (via S-1 bypass, or by tampering with client state) is "admin" as far as the UI is concerned. The real protection must be server-side RLS on the data, which is currently allow-all (S-2).
- **Action:** enforce authorization at the database (RLS keyed on a real role claim), not in React state.

## Medium / Low

### S-7 — No Content Security Policy

- `index.html` sets no CSP. The app injects JSON-LD `<script>` tags at runtime (`SEO.tsx`) and loads fonts from Google. A CSP would reduce XSS blast radius.
- **Action:** add a CSP meta/header appropriate to the hosting (allow self, Supabase, Firebase, fonts.googleapis/gstatic).

### S-8 — Over-requested iframe permissions (BUG-017)

- `metadata.json` requests `camera` and `geolocation`, unused by the app.
- **Action:** remove unused permissions to shrink attack surface.

### S-9 — Admin identity inconsistency

- `firestore.rules:57` trusts `lusimadio12@gmail.com`; the app trusts `simao@neurogrowthlabs.co.za` + `lusimadio12@gmail.com`; the password bypass only covers `simao@`. Divergent admin sets are a governance risk.
- **Action:** define one admin source of truth (server-side) and make both systems read it.

### S-10 — Simulated AI could invite trust misuse

- The chatbot and forms claim AI processing but only echo canned strings (`TebogoChatbot.tsx:86`, `Contact.tsx:178`, `Careers.tsx`). No data is sent to a model, which is safe, but the UI implies secure AI handling ("quantum-safe AES-256", `Careers.tsx:266`) that is not implemented. This is a truthfulness/compliance concern more than a breach.
- **Action:** align copy with reality, or implement the claimed processing (routing LLM calls through local Claude Code per `CLAUDE.md`).

## What is done right

- Firestore rules for `users`, `analyses`, and `chat_sessions/messages` are strong: ownership checks, field allow-lists (`hasOnlyAllowedFields`), email regex, immutable `createdAt`, and role-change protection (`firestore.rules:90-126`). The gap is coverage, not craftsmanship.
- External links use `rel="noopener noreferrer"` consistently (`Footer.tsx`, `LeadershipSection.tsx`).
- `referrerPolicy="no-referrer"` on external leadership images (`LeadershipSection.tsx:166`).
- No use of `dangerouslySetInnerHTML`; no obvious XSS sink in user-rendered content (form values render as text).
- `.gitignore` correctly excludes `.env*` except `.env.example`, so future secrets stay out if env is used.

## Remediation order

1. S-1, S-2, S-3 (remove + rotate secrets, fix RLS) — before any public launch.
2. S-4, S-5, S-6 (guard admin route, fix write integrity, move authz server-side).
3. S-7 through S-10 (CSP, permissions, admin identity, copy).
