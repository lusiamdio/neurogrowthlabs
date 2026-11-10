# BUGS — NeuroGrowth Labs

Every discovered defect, with a stable ID, evidence, root cause, and a suggested fix. IDs are referenced from `docs/AUDIT_REPORT.md`, `docs/FIX_ORDER.md`, and `docs/AI_STUDIO_PROMPTS.md`.

Severity scale: **Critical** (security / data loss), **High** (broken function), **Medium** (degraded UX), **Low** (cleanup / polish).

---

## BUG-001 — Hardcoded super-admin password shipped to the browser

- **Severity:** Critical
- **Files:** `src/components/AuthContext.tsx:157`, `:171`
- **Description:** `loginWithEmail` contains a literal fallback: if Supabase auth fails and the email is `simao@neurogrowthlabs.co.za` with password `NeuroGrowth2@`, it sets `localStorage.local_admin_session = 'true'` and grants `super_admin`. This string is bundled into the public JS (verified: `grep NeuroGrowth2@ dist/assets/*.js` returns a match after `npm run build`).
- **Root cause:** A local dev bypass was left in production code.
- **Impact:** Anyone can read the password in dev tools and log into the Portal command center as super admin.
- **Suggested fix:** Remove the entire fallback block (both the `if (error)` branch and the outer `catch` branch). Rely only on Supabase auth. If a break-glass admin is needed, do it server-side (a Supabase role/claim), never a client string. Rotate this password immediately since it is already public in git history.

---

## BUG-002 — Supabase URL and anon key hardcoded as fallback

- **Severity:** Critical
- **Files:** `src/supabase.ts:4-5`
- **Description:** `SUPABASE_URL` and `SUPABASE_ANON_KEY` fall back to hardcoded literals when env vars are absent. The anon JWT is shipped in the bundle (verified: the project ref `jyvwrdibocdiicaurfrj` appears in `dist/assets/*.js`).
- **Root cause:** Convenience fallback so the app runs without `.env`.
- **Impact:** The anon key is a public client key by design, but committing it removes the ability to rotate cleanly and, combined with BUG-004, exposes all table data. It also pins the app to one specific Supabase project in source.
- **Suggested fix:** Require `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from env. Throw a clear error at startup if they are missing. Remove the literals. Keep the anon key out of source even though it is "public," so it can be rotated. The real protection is RLS (BUG-004), not secrecy of the anon key.

---

## BUG-003 — Live Firebase web config committed to the repo

- **Severity:** Critical
- **Files:** `firebase-applet-config.json` (imported by `src/firebase.ts:3`)
- **Description:** A real Firebase `apiKey`, `projectId`, `appId`, and `storageBucket` are committed and imported directly.
- **Root cause:** AI Studio applet scaffolding commits this config by default.
- **Impact:** Firebase web API keys are not secrets in the same way as server keys, but committing them ties security entirely to Firestore rules and App Check. With the storage bucket exposed and no App Check configured, the project is open to quota abuse. See BUG-009 for the rules coverage gap.
- **Suggested fix:** Move config to env vars injected at build (as AI Studio intends per `.env.example`), enable Firebase App Check, and confirm Firestore/Storage rules deny by default. Since keys are already in git history, rotate the Firebase app and restrict the API key by HTTP referrer in the Google Cloud console.

---

## BUG-004 — Recommended RLS grants public read/write to every table (PII exposure)

- **Severity:** Critical
- **Files:** `src/pages/Portal.tsx:1301-1307` (and the duplicated display copy `:1405-1411`)
- **Description:** The SQL the Portal instructs operators to paste into Supabase creates `CREATE POLICY "Public full access" ON <table> FOR ALL USING (true) WITH CHECK (true)` for `subscriptions`, `chat_messages`, `partner_applications`, `contact_submissions`, `webinars`, and `webinar_registrations`. `contact_submissions` and `partner_applications` hold names, emails, and free-text messages.
- **Root cause:** "Demo integrity" shortcut to make the app work without designing auth policies.
- **Impact:** Anyone with the anon key (which is public, BUG-002) can `SELECT *` from every table, including all contact and partnership PII, and can also insert/delete arbitrarily.
- **Suggested fix:** Replace with least-privilege policies. Allow anonymous `INSERT` only on the public intake tables (contact, partner, webinar registration, subscription), and restrict `SELECT`/`UPDATE`/`DELETE` to an authenticated admin role (a Postgres role or a JWT claim check via `auth.jwt()`). Never expose `SELECT` on PII tables to `anon`.

---

## BUG-005 — `/platforms` links 404 to a blank page; no catch-all route

- **Severity:** High
- **Files:** `src/App.tsx:42-64` (routes), `src/pages/About.tsx:167`, `:485`, `src/components/sections/CTA.tsx:36`, `src/components/SEO.tsx:101`
- **Description:** Three CTA buttons call `navigate('/platforms')` and SEO has a dedicated `/platforms` case, but `App.tsx` defines no `/platforms` route and no `<Route path="*">`. React Router matches nothing and `AnimatedRoutes` renders empty, so the user sees a blank page with only the chatbot.
- **Root cause:** A Platforms page was planned (SEO case exists) but never built or wired, and no 404 fallback was added.
- **Impact:** The primary "Explore Platforms / Explore Our Ecosystem" conversion path dead-ends. This is the "redirect links produce 404" symptom in the brief.
- **Suggested fix:** Two parts. (1) Add a `<Route path="*">` that renders a real 404 page with a link home. (2) Either build a `/platforms` page or repoint those three buttons to an existing destination (for example `/#infrastructure` or `/partner`). Do not silently drop the buttons.

---

## BUG-006 — `framer-motion` used everywhere but is not a declared dependency

- **Severity:** High
- **Files:** `package.json:27` (declares `motion`, not `framer-motion`); imported in 26 files including `src/App.tsx:7`
- **Description:** Every animated component imports from `framer-motion`, but `package.json` lists `motion` (`^12.23.24`), not `framer-motion`. It builds today only because `motion` depends on `framer-motion@^12.36.0` and npm hoists it to top-level `node_modules` (verified: `framer-motion` is not in `dependencies`, `motion` depends on it).
- **Root cause:** The `motion` package is the new name; the code was written against the old `framer-motion` import path but the dependency was updated to `motion` without adding a direct `framer-motion` entry.
- **Impact:** Relying on a transitive dependency for a core UI library is fragile. A strict installer (pnpm), a hoisting change, or a future `motion` that stops re-exporting `framer-motion` breaks every page at build time.
- **Suggested fix:** Add `"framer-motion": "^12.36.0"` to `dependencies` so the import path is backed by a direct dependency. Alternatively, migrate all imports to `motion/react` (the `motion` package entry) and drop reliance on the old name. Adding the direct dependency is the lower-risk fix and keeps existing code untouched.

---

## BUG-007 — `/admin/recruitment` has no authentication guard

- **Severity:** High
- **Files:** `src/App.tsx:54`, `src/pages/AdminDashboard.tsx:16`
- **Description:** The AdminDashboard route renders with no `useAuth`, no role check, and no redirect. Anyone who knows or guesses the URL sees the "Recruitment Intelligence" dashboard.
- **Root cause:** The page was built with static mock data (`candidates` array) and never wired to auth.
- **Impact:** Currently the data is hardcoded mock candidates, so no live PII leaks, but the route presents an internal-looking admin surface publicly and sets a bad precedent if real data is added. It is also orphaned: nothing links to it.
- **Suggested fix:** Wrap the route in the same `super_admin` gate used by `Portal.tsx:630` (redirect to `/portal` or `/` when `userRole !== 'super_admin'`). If the page is not meant to ship, remove the route.

---

## BUG-008 — Duplicate `id="infrastructure"` on the Landing page

- **Severity:** Medium
- **Files:** `src/components/sections/Products.tsx:135`, `src/components/sections/AILab.tsx:8`
- **Description:** Both sections render `id="infrastructure"` and both are on the Landing page. `document.getElementById('infrastructure')` (used by the Navbar "Infrastructure" link, `Navbar.tsx:66`) returns only the first match (Products), so the AILab section is unreachable by that anchor and the HTML is invalid (duplicate id).
- **Root cause:** Copy/paste of the section id.
- **Impact:** "Infrastructure" nav scrolls to Products, never AILab. Minor but real and an accessibility/validity issue.
- **Suggested fix:** Give AILab a distinct id (for example `id="compute"`) or remove its id if it is not a nav target. Keep a single canonical `infrastructure` anchor.

---

## BUG-009 — Firestore denies all writes to 5 of 6 collections (dual-write is dead)

- **Severity:** High
- **Files:** `firestore.rules` (match blocks only for `users`, `analyses`, `chat_sessions`), writers: `src/components/sections/Footer.tsx:28`, `src/pages/Contact.tsx:86`, `src/pages/Partner.tsx:209`, `src/pages/Webinar.tsx:230`, `src/pages/Portal.tsx:308,359`
- **Description:** `firestore.rules` (rules_version 2) has no match block for `subscriptions`, `webinars`, `webinar_registrations`, `partner_applications`, or `contact_submissions`. Under rules_version 2, an unmatched path is denied by default. Every `addDoc`/`deleteDoc` to these collections fails, and each call is wrapped in `try/catch` that only `console.warn`s.
- **Root cause:** The app writes to more collections than the rules were written for.
- **Impact:** The "dual-write to Firebase" is dead for 5 of 6 collections. Only the Tebogo chatbot (`chat_sessions/messages`, which does have a rule) actually persists to Firestore. Everything else relies on Supabase + localStorage. The silent warnings hide the failure.
- **Suggested fix:** Decide on one backend. Either (a) add validated match blocks for the five collections in `firestore.rules` and deploy them to the named database (`firestoreDatabaseId` in `firebase-applet-config.json`), or (b) remove the Firebase dual-write path entirely and standardize on Supabase. Option (b) is simpler and removes an entire failing code path. Do not leave silent-failing writes in place.

---

## BUG-010 — `.from('users')` queried but no `users` table in the shipped schema

- **Severity:** High
- **Files:** `src/components/AuthContext.tsx:66`, `:76`, `:121`, `:195`; schema in `src/pages/Portal.tsx:1222-1291`
- **Description:** AuthContext reads and writes a Supabase `users` table for role management, but the SQL schema the Portal ships (the only setup instructions in the repo) creates six tables and none of them is `users` (verified: no `CREATE TABLE ... users` in `Portal.tsx`).
- **Root cause:** The role-management table was assumed but never included in the setup SQL.
- **Impact:** Every `.from('users')` call errors, is caught, and role falls back to the hardcoded email check (`AuthContext.tsx:61`). Server-side role management does not function; roles are effectively client-side only.
- **Suggested fix:** Add a `users` table (`id uuid primary key references auth.users`, `email text`, `role text default 'user'`, `created_at timestamptz`) with RLS allowing a user to read their own row and an admin to manage roles. Or, if roles should live in Supabase auth claims, remove the `users` table queries and read the role from the JWT. Pick one and make the code and schema agree.

---

## BUG-011 — Dead `href="#"` links in the Footer ecosystem list

- **Severity:** Low
- **Files:** `src/components/sections/Footer.tsx:132`, `:133`, `:134`, `:135`
- **Description:** "RescueBot AI", "IBOS", "NGX AfriQuant", and "Health AI" use `href="#"`, which jumps to the top of the page instead of navigating anywhere.
- **Root cause:** Placeholder links never filled in.
- **Impact:** Confusing dead links in the footer. Minor UX and SEO cost.
- **Suggested fix:** Point each to its real URL (the other ecosystem items use full `https://` links), or remove the anchor and render as plain text until a destination exists.

---

## BUG-012 — Hash anchors (`#services`, `#infrastructure`) only resolve on the home route

- **Severity:** Low
- **Files:** `src/components/sections/Footer.tsx:144`, `:145`
- **Description:** The Footer renders on every page and links to `#services` and `#infrastructure`, which are section ids that exist only on the Landing page. On any other route these anchors resolve to nothing.
- **Root cause:** Footer is global but its anchor links are Landing-specific.
- **Impact:** Clicking "Services"/"Infrastructure" in the footer from `/about` or `/contact` does nothing.
- **Suggested fix:** Use route-aware links that navigate to `/` then scroll (the Navbar already does this pattern at `Navbar.tsx:66`), or convert to `Link to="/#services"` and handle the hash on Landing mount.

---

## BUG-013 — Six unused dependencies

- **Severity:** Low
- **Files:** `package.json:14,21,23,24,26,31`
- **Description:** `@google/genai`, `express`, `dotenv`, `clsx`, `tailwind-merge`, and `gsap` are declared but imported nowhere in `src` (verified by grep, 0 files each). `@types/express` (devDep) is likewise unused.
- **Root cause:** Scaffolding and abandoned approaches left their deps behind.
- **Impact:** Larger install, slower CI, misleading signal about what the app uses (for example `@google/genai` implies a real Gemini integration that does not exist).
- **Suggested fix:** Remove all six from `package.json` plus `@types/express`, reinstall, and confirm `npm run build` still passes. Keep `dotenv` only if a Node-side script is added later.

---

## BUG-014 — `@types/three` is ~13 minor versions ahead of `three`

- **Severity:** Low
- **Files:** `package.json:19` (`@types/three@^0.183.1`) vs `package.json:32` (`three@0.170.0`)
- **Description:** The installed runtime is `three@0.170.0` (pinned exactly) while the types are `0.183`. `tsc` passes because `skipLibCheck` is on and only basic three APIs are used, but the types no longer describe the runtime.
- **Root cause:** Types updated independently of the pinned runtime.
- **Impact:** Latent type mismatch risk; autocompletion may suggest APIs not present in 0.170.
- **Suggested fix:** Align them, for example `@types/three@~0.170` to match, or bump `three` to a version matching the types after checking @react-three/fiber peer support.

---

## BUG-015 — Dead 3D components never imported

- **Severity:** Low
- **Files:** `src/components/three/NeuralNetwork.tsx`, `src/components/three/RobotScene.tsx`
- **Description:** Both export default components but are imported nowhere (verified by grep).
- **Root cause:** Built for sections that were later cut.
- **Impact:** Dead code carried in the repo (though tree-shaken from the bundle).
- **Suggested fix:** Remove both files, or wire them into a section if intended. Do not leave them dangling.

---

## BUG-016 — `GEMINI_API_KEY` build-injected but never read

- **Severity:** Low
- **Files:** `vite.config.ts:11`
- **Description:** `define` injects `process.env.GEMINI_API_KEY`, but nothing in `src` references it (verified by grep). All "AI" is simulated with `setTimeout`.
- **Root cause:** AI Studio template wiring for an integration that was never built.
- **Impact:** Misleading configuration; suggests a live LLM call that does not exist.
- **Suggested fix:** Remove the `define` block, or implement the real Gemini call it implies. Per `CLAUDE.md`, LLM calls should route through local Claude Code, not a hosted API, so revisit the approach before adding a key.

---

## BUG-017 — App requests camera and geolocation permissions it never uses

- **Severity:** Low
- **Files:** `metadata.json:4-7`
- **Description:** `requestFramePermissions` lists `camera` and `geolocation`, but no code uses either.
- **Root cause:** Template defaults.
- **Impact:** Over-permissioned iframe; unnecessary trust prompt in AI Studio hosting.
- **Suggested fix:** Remove both entries unless a feature needs them.

---

## BUG-018 — Auth role is fetched twice on every load

- **Severity:** Low
- **Files:** `src/components/AuthContext.tsx:38` (getInitialSession) and `:103` (onAuthStateChange)
- **Description:** Both run on mount. In supabase-js v2, `onAuthStateChange` fires immediately with the existing session, so the `users` role query and the potential profile insert run twice.
- **Root cause:** Overlapping initialization paths.
- **Impact:** Duplicate network calls and a possible duplicate insert attempt on first load. Minor.
- **Suggested fix:** Consolidate. Let `onAuthStateChange` be the single source of truth, or guard the initial fetch so it does not double-run.

---

## BUG-019 — Clickable `<div>`s without keyboard or role semantics (accessibility)

- **Severity:** Low
- **Files:** `src/pages/Contact.tsx:251` (contact cards), `src/components/sections/Products.tsx` (holographic cards), `src/components/sections/LeadershipSection.tsx:156` (leadership cards), `src/pages/Careers.tsx:311` (upload cards)
- **Description:** Interactive elements use `<div onClick>` without `role="button"`, `tabIndex`, or keyboard handlers, so they are unreachable by keyboard and screen readers.
- **Root cause:** Styling convenience over semantic elements.
- **Impact:** Keyboard and assistive-tech users cannot activate these controls.
- **Suggested fix:** Use `<button>` where possible, or add `role="button"`, `tabIndex={0}`, and an `onKeyDown` (Enter/Space) handler. Add `aria-label` to icon-only buttons.

---

## BUG-020 — Artificial 2-second skeleton delay on the leadership carousel

- **Severity:** Low
- **Files:** `src/components/sections/LeadershipSection.tsx:325`
- **Description:** A `setTimeout(..., 2000)` fakes a loading state before showing static, in-file data. There is no network call to wait for.
- **Root cause:** "Perceived performance" theater on data that is already present.
- **Impact:** Real users wait 2s to see content that could render instantly.
- **Suggested fix:** Remove the timer and render immediately, or replace with a real data fetch if leadership data is meant to be dynamic.
