# NeuroGrowth Labs — Engineering Audit Report

**Audit date:** 2026-07-10
**Auditor scope:** Full repository, read-only. No application code was modified.
**Repository:** neurogrowth-labs/neurogrowtlabs
**Branch audited:** claude/new-session-3olbpx (from main @ 6869d81)

> This is a documentation-only audit. Every finding below is backed by a `file:line` reference so it can be verified and fixed in isolation inside Google AI Studio. Fix prompts are in `docs/AI_STUDIO_PROMPTS.md`; ordering is in `docs/FIX_ORDER.md`.

---

## 1. Executive Summary

NeuroGrowth Labs is a single-page marketing and lead-capture site for an AI infrastructure company. It is a React 19 + Vite 6 + Tailwind v4 SPA that originated from a Google AI Studio applet. The build is green and the TypeScript typecheck passes clean, so the project is not "broken" in the compile sense. The problems are at runtime, in security, and in data integrity.

**Overall state:** Ships and renders, but carries three classes of real defect.

1. **Security exposure (critical).** A hardcoded super-admin password (`NeuroGrowth2@`) and a client-side admin bypass live in `src/components/AuthContext.tsx` and are compiled into the public JavaScript bundle. The Supabase URL + anon key and a live Firebase web API key are committed to the repo and shipped to the browser. The recommended Supabase RLS policy the app tells operators to run (`src/pages/Portal.tsx:1301`) grants public read/write to every table, so contact submissions and partner applications (names, emails, messages) are world-readable by anyone holding the anon key.

2. **Routing 404s (high).** Three prominent call-to-action buttons ("Explore Our Platforms", "Explore Platforms", "Explore Our Ecosystem") navigate to `/platforms`, but no `/platforms` route exists and there is no catch-all `*` route. The result is a blank page. This is the "redirect links produce 404" symptom described in the audit brief.

3. **Silent data-integrity failures (high).** The app "dual-writes" every form to Firebase Firestore and Supabase. The committed `firestore.rules` only defines rules for `users`, `analyses`, and `chat_sessions`. The five collections the forms actually write to (`subscriptions`, `webinars`, `webinar_registrations`, `partner_applications`, `contact_submissions`) have no match block, so Firestore denies every write by default. The failures are swallowed by `try/catch` and logged as warnings, so the app looks like it works while half its persistence layer is dead. Supabase is the only backend that actually stores this data, and only if the operator ran the SQL.

None of these stop the site from loading. All of them matter for a production launch.

**Headline metric:** single JS chunk of 2.17 MB (574 KB gzip) with no code splitting. Three.js, Firebase, and Framer Motion are all in the initial download on every route.

---

## 2. Architecture Overview

### 2.1 Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | React 19.2 | StrictMode on |
| Build | Vite 6.4 | `@vitejs/plugin-react`, `@tailwindcss/vite` |
| Styling | Tailwind CSS v4 | CSS-first config in `src/index.css` via `@theme` |
| Routing | react-router-dom 7 | `BrowserRouter`, client-side only |
| Animation | Framer Motion 12 | Imported as `framer-motion` (see BUG-006) |
| 3D | three 0.170 + @react-three/fiber 9 + drei 10 | Three separate WebGL canvases |
| Auth + DB | Supabase JS 2 | Primary backend |
| DB (secondary) | Firebase Firestore 12 | Dual-write target, mostly denied (see BUG-009) |
| Icons | lucide-react | Used in 26 files |

### 2.2 Application shape

```
index.html → src/main.tsx → src/App.tsx
                                  ├─ ErrorBoundary
                                  ├─ ThemeProvider          (src/components/ThemeContext.tsx)
                                  ├─ AuthProvider           (src/components/AuthContext.tsx)
                                  └─ Router
                                       ├─ SEO               (document.head side effects, per route)
                                       ├─ AnimatedRoutes    (14 <Route>s, no catch-all)
                                       └─ TebogoChatbot     (global floating widget)
```

- **Pages** (`src/pages/`, 14 files): Landing, Portal, About, Partner, Careers, Contact, Webinar, AdminDashboard, plus six legal pages.
- **Sections** (`src/components/sections/`, 12 files): composed into Landing and About.
- **3D** (`src/components/three/`, 4 files): WorldMap3D, DataCenter used; NeuralNetwork and RobotScene are dead code (never imported).
- **UI** (`src/components/ui/`, 2 files): MagneticButton, TebogoChatbot.
- **Backends:** `src/supabase.ts` (Supabase client), `src/firebase.ts` (Firestore client).

### 2.3 Data flow for a form submission (Contact / Partner / Webinar / Footer)

1. Write to Firebase Firestore (`addDoc`). **Denied by rules for 5 of 6 collections → fails silently.**
2. Write to Supabase (`insert`). Works only if the table exists and the SQL from `Portal.tsx` was run.
3. Write to `localStorage` as a fallback cache so the admin Portal can display it in-browser.

The Portal admin dashboard reads Supabase first, then Firestore, then `localStorage`, then falls back to hardcoded demo rows. When any read fails it enters "sandbox mode" and works entirely from `localStorage`.

### 2.4 Auth model

- Supabase email/password is the real auth path.
- `super_admin` is granted client-side by matching one of two hardcoded emails (`AuthContext.tsx:61`, `:117`, `:192`).
- A hardcoded fallback (`simao@neurogrowthlabs.co.za` / `NeuroGrowth2@`) sets `localStorage.local_admin_session = 'true'` and grants `super_admin` with no server involved (`AuthContext.tsx:157-166`).
- Firestore rules recognize a different admin email (`lusimadio12@gmail.com`, `firestore.rules:57`) than the app's hardcoded pair, so the two systems disagree on who is an admin.

---

## 3. Major Problems

| ID | Problem | File(s) | Severity |
|---|---|---|---|
| BUG-001 | Hardcoded super-admin password shipped in client bundle | `src/components/AuthContext.tsx:157,171` | Critical |
| BUG-002 | Supabase URL + anon key hardcoded as fallback, shipped in bundle | `src/supabase.ts:4-5` | Critical |
| BUG-003 | Live Firebase web API key + project config committed | `firebase-applet-config.json` | Critical |
| BUG-004 | Recommended RLS policy is public read/write on all tables (PII exposure) | `src/pages/Portal.tsx:1301-1307` | Critical |
| BUG-005 | `/platforms` links have no route and there is no 404 catch-all → blank page | `src/App.tsx:42-64`, `src/pages/About.tsx:167,485`, `src/components/sections/CTA.tsx:36` | High |
| BUG-006 | `framer-motion` imported in 26 files but not a direct dependency (only transitive via `motion`) | `package.json:27`, all `src/**/*.tsx` | High |
| BUG-007 | `/admin/recruitment` (AdminDashboard) has no auth guard; publicly reachable | `src/App.tsx:54`, `src/pages/AdminDashboard.tsx:16` | High |
| BUG-009 | Firestore denies all writes to 5 of 6 collections (no rules); dual-write is dead | `firestore.rules`, `src/pages/Contact.tsx:86`, `Partner.tsx:209`, `Webinar.tsx:230`, `Footer.tsx:28` | High |
| BUG-010 | `.from('users')` queried but no `users` table in the shipped SQL schema | `src/components/AuthContext.tsx:66,76`, `src/pages/Portal.tsx:1222-1291` | High |

Full detail, root cause, and fix for each is in `docs/BUGS.md`.

---

## 4. Minor Problems

| ID | Problem | File(s) | Severity |
|---|---|---|---|
| BUG-008 | Duplicate `id="infrastructure"` on Landing (Products + AILab) | `src/components/sections/Products.tsx:135`, `AILab.tsx:8` | Medium |
| BUG-011 | Dead `href="#"` links in Footer ecosystem list | `src/components/sections/Footer.tsx:132-135` | Low |
| BUG-012 | `#services` / `#infrastructure` anchors only resolve on `/`, but Footer is on every page | `src/components/sections/Footer.tsx:144-145` | Low |
| BUG-013 | 6 unused dependencies (`@google/genai`, `express`, `dotenv`, `clsx`, `tailwind-merge`, `gsap`) | `package.json` | Low |
| BUG-014 | `@types/three@0.183` vs `three@0.170` version drift | `package.json:19,32` | Low |
| BUG-015 | Dead code: `NeuralNetwork.tsx`, `RobotScene.tsx` never imported | `src/components/three/` | Low |
| BUG-016 | `GEMINI_API_KEY` wired in `vite.config.ts` but never read anywhere | `vite.config.ts:11` | Low |
| BUG-017 | `metadata.json` requests camera + geolocation, unused by app | `metadata.json:4-7` | Low |
| BUG-018 | Auth role fetched twice on load (getInitialSession + onAuthStateChange) | `src/components/AuthContext.tsx:38,103` | Low |
| BUG-019 | Clickable `<div>`s without keyboard/role (a11y) | `Contact.tsx:251`, `Partner Products.tsx`, `LeadershipSection.tsx:156` | Low |
| BUG-020 | Artificial 2s skeleton delay on leadership section | `src/components/sections/LeadershipSection.tsx:325` | Low |

---

## 5. Risks

1. **Reputational / legal:** contact and partnership forms collect names, emails, and free-text messages. Under the current recommended RLS (BUG-004) that data is readable by anyone with the anon key, which is in the public bundle. This is a data-protection problem for a company that advertises GDPR/DPA compliance on its own legal pages.
2. **Account takeover:** the super-admin password is in the bundle (BUG-001). Anyone who opens dev tools can read it and log into the Portal command center.
3. **Silent data loss:** because Firestore writes fail silently (BUG-009) and Supabase writes require manual SQL setup (BUG-010, BUG-004), a form can appear to succeed to the user while nothing is durably stored server-side. Only `localStorage` on that one browser holds it.
4. **Install fragility:** the app depends on `framer-motion` resolving as a transitive of `motion` (BUG-006). A stricter installer (pnpm, npm with `--strict-peer-deps` behaviors, or a future `motion` release that drops the re-export) breaks the entire UI at build time.
5. **Broken primary CTAs:** the main "Explore Platforms" buttons dead-end on a blank page (BUG-005), which kills the top-of-funnel conversion path.

---

## 6. Technical Debt

- **No tests, no evals.** `package.json` has no test runner. `CLAUDE.md` mandates gate tests + evals per change; the repo has none. `npm run lint` is aliased to `tsc --noEmit` only.
- **Loose typing.** `CustomUser` uses `[key: string]: any` (`AuthContext.tsx:8`); most component state is `any[]`; `MagneticButton` props are `any`.
- **Simulated AI.** Every "AI" surface (Tebogo chatbot, Careers assessor, Contact router) is `setTimeout` with canned strings. There is no real model call anywhere, yet `@google/genai` is a dependency and `GEMINI_API_KEY` is wired into the build. The product markets AI features it does not implement.
- **Triple persistence.** Firebase + Supabase + localStorage for the same records, with per-field key aliasing (`Partner.tsx:220-239` writes `orgName`, `org_name`, `domainStack`, `domain_stack`, etc. to hedge against unknown schema). This is defensive coding around an undefined contract.
- **Inline SVG icon shims.** `About.tsx:498-499` and `Partner.tsx:186` redefine `Server`/`Hexagon`/`Device` by hand instead of importing from `lucide-react`.
- **Duplicated SQL.** The schema string in `Portal.tsx` is duplicated (once for the clipboard copy, once for display) and can drift.

---

## 7. Suggested Fix Order (summary)

Full ordering with rationale is in `docs/FIX_ORDER.md`. Short version:

1. **Critical first (security):** rotate and move all secrets out of the repo/bundle (BUG-001, 002, 003), replace the public RLS policy with per-table auth policies (BUG-004).
2. **High next (function):** add the `/platforms` route + a `*` 404 route (BUG-005), make `framer-motion` a direct dependency (BUG-006), guard `/admin/recruitment` (BUG-007), add Firestore rules for the 5 missing collections or drop the Firebase dual-write (BUG-009), create the `users` table or remove the query (BUG-010).
3. **Medium:** resolve the duplicate `infrastructure` id (BUG-008).
4. **Low:** prune unused deps and dead code, align `@types/three`, fix dead footer links, add a11y affordances.

---

## 8. What is actually healthy

To keep this honest, the following are in good shape and should not be touched:

- The build pipeline works (`npm run build` succeeds, `tsc --noEmit` clean).
- `firestore.rules` for `users`, `analyses`, and `chat_sessions` are well-written with field validation and ownership checks. The problem is coverage, not quality.
- `ErrorBoundary` is a proper class boundary with a usable fallback UI.
- `ThemeContext` and the Tailwind v4 CSS-variable theming are clean.
- The SEO component correctly injects per-route JSON-LD and cleans up prior tags on navigation.
- Component structure is consistent and readable across all 12 sections and 14 pages.
