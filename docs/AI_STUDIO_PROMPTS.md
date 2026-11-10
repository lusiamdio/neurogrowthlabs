# AI STUDIO REPAIR PROMPTS — NeuroGrowth Labs

Standalone, copy-paste prompts for Google AI Studio. Each one fixes exactly one issue and nothing else. Apply them in the order given in `docs/FIX_ORDER.md` (Critical → High → Medium → Low). Every prompt repeats the same guardrails so it can be pasted in isolation.

Global constraints that apply to every prompt below:
- Do not refactor unrelated code.
- Do not change the architecture, the visual design, or the UI copy unless the prompt says to.
- Keep the build green (`npm run build`) and the typecheck clean (`tsc --noEmit`).
- Maintain backwards compatibility with existing routes and component APIs.
- Change only the files named in the prompt.

---

## Prompt 01 — Remove the hardcoded super-admin password (BUG-001)

Context:
This is a React 19 + Vite SPA. Auth runs through Supabase in `src/components/AuthContext.tsx`. A local dev bypass was left in production and is compiled into the public JS bundle.

Problem:
`loginWithEmail` in `src/components/AuthContext.tsx` (around lines 153-184) contains a hardcoded email `simao@neurogrowthlabs.co.za` and password `NeuroGrowth2@`. On Supabase auth failure it sets `localStorage.local_admin_session = 'true'` and grants `super_admin`. This password ships to every visitor.

Files:
- `src/components/AuthContext.tsx`

Task:
Remove the hardcoded credential bypass entirely. `loginWithEmail` should call `supabase.auth.signInWithPassword` and, on error, throw the error so the caller shows a normal auth failure. Also remove the matching `local_admin_session` special-casing in `getInitialSession` (around lines 40-49) and in the `onAuthStateChange` handler (around line 104) so there is no client-only admin path. Leave `logout` clearing `local_admin_session` for safety.

Constraints:
Do not modify unrelated files. Do not change the Supabase auth flow. Do not change the Portal UI. Keep the `AuthContextType` interface unchanged.

Acceptance Criteria:
- No literal password remains anywhere in `src`.
- `grep -r "NeuroGrowth2@" src` returns nothing.
- Build succeeds, typecheck clean.
- Logging in with valid Supabase credentials still works; invalid credentials show an error.

Follow-up (outside AI Studio): rotate the password `NeuroGrowth2@` at Supabase since it is already in git history.

---

## Prompt 02 — Move Supabase credentials to environment variables (BUG-002)

Context:
`src/supabase.ts` creates the Supabase client with hardcoded URL and anon key fallbacks that ship in the bundle.

Problem:
Lines 4-5 fall back to a literal Supabase URL (`https://jyvwrdibocdiicaurfrj.supabase.co`) and a literal anon JWT when env vars are missing. The project already documents `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.example`.

Files:
- `src/supabase.ts`
- `.env.example` (already lists the vars; confirm only)

Task:
Read `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from `import.meta.env`. Remove the hardcoded literals. If either is missing, throw a clear startup error (`throw new Error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')`).

Constraints:
Do not modify unrelated files. Do not change how other modules import `supabase`. Keep the exported `supabase` client name and shape identical.

Acceptance Criteria:
- No Supabase URL or key literal remains in `src`.
- App runs when the env vars are set; fails fast with a clear message when they are not.
- Build succeeds, typecheck clean.

Follow-up: rotate the Supabase anon key and set the env vars in the AI Studio Secrets panel.

---

## Prompt 03 — Move Firebase config to env and stop committing it (BUG-003)

Context:
`src/firebase.ts` imports `firebase-applet-config.json`, which commits a live Firebase web API key and project config.

Problem:
Secrets live in a committed JSON file and connect to a named Firestore database via `getFirestore(app, firebaseConfig.firestoreDatabaseId)`.

Files:
- `src/firebase.ts`
- `firebase-applet-config.json` (stop importing it from source)
- `.env.example` (add the Firebase vars)

Task:
Build the Firebase config object from `import.meta.env` values (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_DB_ID`). Keep the named-database call using the `VITE_FIREBASE_DB_ID` value. Add all vars to `.env.example` with placeholder values. Do not delete `firebase-applet-config.json` in this step (leave it for the operator to remove after confirming env works), but stop importing it.

Constraints:
Do not modify unrelated files. Keep the exported `db` name and behavior identical. Do not change Firestore usage in other files.

Acceptance Criteria:
- `src/firebase.ts` no longer imports the committed JSON.
- App connects to Firestore when env vars are set.
- Build succeeds, typecheck clean.

Follow-up: rotate the Firebase web API key, restrict it by HTTP referrer in Google Cloud, enable App Check.

---

## Prompt 04 — Replace public RLS with least-privilege policies (BUG-004)

Context:
The Portal page (`src/pages/Portal.tsx`) shows operators a SQL script to set up Supabase. That script grants public read/write to every table, exposing contact and partner PII.

Problem:
Around lines 1293-1307 (and the duplicated display copy around 1397-1411) the SQL runs `CREATE POLICY "Public full access" ON <table> FOR ALL USING (true) WITH CHECK (true)` for all six tables. This lets anyone with the anon key read every contact submission and partner application.

Files:
- `src/pages/Portal.tsx` (the SQL string only — both the clipboard copy and the displayed `<pre>` must match)

Task:
Replace the allow-all policy block with least-privilege policies:
- On `contact_submissions`, `partner_applications`, `webinar_registrations`, `subscriptions`, `chat_messages`: allow `INSERT` to `anon` (public intake), but DENY `SELECT`, `UPDATE`, `DELETE` to `anon`. Grant `SELECT`/`UPDATE`/`DELETE` only to authenticated admins (use a `USING (auth.role() = 'authenticated')` guard plus an admin check appropriate to the project, or a dedicated Postgres role — document the assumption in a SQL comment).
- On `webinars`: `SELECT` may be public; `INSERT`/`UPDATE`/`DELETE` admin-only.
Update BOTH copies of the SQL string so the copy button and the on-screen text stay identical.

Constraints:
Do not modify unrelated files. Do not change the Portal UI or layout. Only edit the SQL string content. Do not run the SQL (documentation only).

Acceptance Criteria:
- No `USING (true) WITH CHECK (true)` remains in the file.
- The clipboard SQL and the displayed SQL are identical.
- Build succeeds, typecheck clean.

---

## Prompt 05 — Add the missing `/platforms` route and a 404 catch-all (BUG-005)

Context:
Three CTA buttons navigate to `/platforms` and the SEO component has a `/platforms` case, but no route is defined and there is no catch-all, so those buttons land on a blank page.

Problem:
`src/App.tsx` (routes around lines 47-60) defines no `/platforms` route and no `<Route path="*">`. `src/pages/About.tsx:167`, `src/pages/About.tsx:485`, and `src/components/sections/CTA.tsx:36` all call `navigate('/platforms')`.

Files:
- `src/App.tsx`
- (new) `src/pages/NotFound.tsx`

Task:
Two changes. (1) Create `src/pages/NotFound.tsx`, a simple page matching the existing dark visual style, with a heading, short message, and a `Link to="/"` back home, plus the shared `Navbar` and `Footer`. Add `<Route path="*" element={<PageTransition><NotFound /></PageTransition>} />` as the last route in `AnimatedRoutes`. (2) Decide the `/platforms` target: since no Platforms page exists, repoint the three `navigate('/platforms')` calls to `/` followed by scrolling to the `infrastructure` section (mirror the existing Navbar pattern at `src/components/sections/Navbar.tsx:66`). Do NOT invent a new Platforms page in this prompt.

Constraints:
Do not modify unrelated files beyond the three that call `/platforms` and `App.tsx`. Keep existing routes and the `PageTransition` wrapper. Match the existing UI style for NotFound. Do not change SEO in this prompt.

Acceptance Criteria:
- Visiting any unknown URL renders the NotFound page, not a blank screen.
- The "Explore Platforms" / "Explore Our Ecosystem" buttons land on a real destination (home + infrastructure scroll), never a blank page.
- Build succeeds, typecheck clean.

---

## Prompt 06 — Make `framer-motion` a direct dependency (BUG-006)

Context:
Every animated component imports from `framer-motion`, but `package.json` declares `motion`, not `framer-motion`. It builds only because `motion` pulls in `framer-motion` transitively.

Problem:
`package.json` has `"motion": "^12.23.24"` but no `framer-motion` entry, while 26 files import `from 'framer-motion'`. A strict installer or a future `motion` change breaks the whole UI.

Files:
- `package.json`

Task:
Add `"framer-motion": "^12.36.0"` to `dependencies` so the import path is backed by a direct dependency. Do not change any import statements. Do not remove `motion`.

Constraints:
Do not modify source files. Do not migrate imports. Only edit `package.json`.

Acceptance Criteria:
- `framer-motion` appears in `dependencies`.
- `npm install` then `npm run build` succeeds.
- `tsc --noEmit` clean.

---

## Prompt 07 — Guard the `/admin/recruitment` route (BUG-007)

Context:
`/admin/recruitment` renders the AdminDashboard with no auth check. The Portal page already implements a `super_admin` gate that can be mirrored.

Problem:
`src/App.tsx:54` routes to `AdminDashboard` with no protection. `src/pages/AdminDashboard.tsx` never calls `useAuth`.

Files:
- `src/pages/AdminDashboard.tsx`

Task:
At the top of `AdminDashboard`, use `useAuth()` to read `user`, `userRole`, and `loading`. While `loading`, render the same spinner style used in `src/pages/Portal.tsx:618-627`. If not `super_admin`, redirect to `/portal` using `useNavigate` (or render an access-denied message consistent with `Portal.tsx:645-669`). Only render the dashboard for a `super_admin`.

Constraints:
Do not modify unrelated files. Do not change the dashboard's visual content for authorized users. Reuse the existing auth context; do not add a new auth mechanism.

Acceptance Criteria:
- Visiting `/admin/recruitment` while unauthenticated does not show the dashboard.
- A `super_admin` sees the dashboard unchanged.
- Build succeeds, typecheck clean.

---

## Prompt 08 — Fix Firestore rules coverage or remove the dead dual-write (BUG-009)

Context:
The app dual-writes forms to Firestore and Supabase. `firestore.rules` only covers `users`, `analyses`, and `chat_sessions`, so writes to five other collections are denied by default and the failures are swallowed.

Problem:
Collections `subscriptions`, `webinars`, `webinar_registrations`, `partner_applications`, `contact_submissions` have no match block in `firestore.rules` (rules_version 2 → default deny). Writers: `src/components/sections/Footer.tsx:28`, `src/pages/Contact.tsx:86`, `src/pages/Partner.tsx:209`, `src/pages/Webinar.tsx:230`, `src/pages/Portal.tsx:308`.

Choose ONE option and state which you applied.

Option A (keep Firebase): Add validated match blocks in `firestore.rules` for the five collections. Allow `create` for public intake with field validation (mirror the style of `isValidChatMessage` at lines 82-88), and restrict `read`/`update`/`delete` to admins (reuse `isAdmin()` at line 53). Deploy target is the named database in `firebase-applet-config.json`.

Option B (drop Firebase, recommended): Remove the Firebase `addDoc`/`deleteDoc`/`getDocs` calls for these five collections from the five writer files and from `Portal.tsx` read fallbacks, keeping Supabase + localStorage. Do not touch the chatbot's `chat_sessions` writes, which are covered by rules.

Files:
- Option A: `firestore.rules`
- Option B: `src/components/sections/Footer.tsx`, `src/pages/Contact.tsx`, `src/pages/Partner.tsx`, `src/pages/Webinar.tsx`, `src/pages/Portal.tsx`

Task:
Implement one option fully. Do not leave silent-failing writes in place.

Constraints:
Do not change the UI. Do not alter the Supabase path. If Option B, keep the exact same user-facing success behavior (Supabase + localStorage already provide it).

Acceptance Criteria:
- No write path fails silently for these five collections.
- Build succeeds, typecheck clean.
- If Option A, `firestore.rules` has match blocks for all five collections with validation. If Option B, no Firebase writes remain for them and the chatbot still works.

---

## Prompt 09 — Reconcile the `users` table with the code (BUG-010)

Context:
`AuthContext` reads/writes a Supabase `users` table for roles, but the Portal setup SQL never creates it, so those queries fail and roles fall back to a client-side email check.

Problem:
`src/components/AuthContext.tsx:66,76,121,195` query `.from('users')`. The SQL in `src/pages/Portal.tsx:1222-1291` creates six tables, none named `users`.

Files:
- `src/pages/Portal.tsx` (add the `users` table to BOTH SQL copies)

Task:
Add a `users` table to the setup SQL (both the clipboard string and the displayed `<pre>` so they match):
```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- user can read own row; admin manages roles (adjust to your admin model)
CREATE POLICY "read own user row" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "insert own user row" ON users FOR INSERT WITH CHECK (auth.uid() = id);
```
Keep the two SQL copies identical.

Constraints:
Do not modify unrelated files. Do not change AuthContext in this prompt. Only edit the SQL strings.

Acceptance Criteria:
- Both SQL copies include the `users` table and RLS.
- The clipboard SQL equals the displayed SQL.
- Build succeeds, typecheck clean.

---

## Prompt 10 — Resolve the duplicate `id="infrastructure"` (BUG-008)

Context:
Two Landing sections share `id="infrastructure"`, which is invalid HTML and makes the Navbar anchor non-deterministic.

Problem:
`src/components/sections/Products.tsx:135` and `src/components/sections/AILab.tsx:8` both use `id="infrastructure"`. The Navbar (`src/components/sections/Navbar.tsx:66`) scrolls to `getElementById('infrastructure')`, which returns only Products.

Files:
- `src/components/sections/AILab.tsx`

Task:
Change the AILab section id to a distinct value (for example `id="compute"`). Keep `Products` as the canonical `infrastructure` anchor so the Navbar behavior is unchanged. If nothing links to the new id, that is fine.

Constraints:
Do not modify the Navbar or Products. Do not change the visual layout. Only change the AILab id.

Acceptance Criteria:
- Only one element has `id="infrastructure"` on the Landing page.
- Navbar "Infrastructure" still scrolls to Products.
- Build succeeds, typecheck clean.

---

## Prompt 11 — Remove unused dependencies (BUG-013)

Context:
Six declared dependencies are never imported.

Problem:
`@google/genai`, `express`, `dotenv`, `clsx`, `tailwind-merge`, `gsap` (and devDep `@types/express`) are unused. `vite` is also duplicated in both `dependencies` and `devDependencies`.

Files:
- `package.json`

Task:
Remove `@google/genai`, `express`, `dotenv`, `clsx`, `tailwind-merge`, `gsap` from `dependencies`, remove `@types/express` from `devDependencies`, and remove the duplicate `vite` entry from `dependencies` (keep it in `devDependencies`). Do not remove anything imported by `src`.

Constraints:
Do not modify source files. Only edit `package.json`. Do not add framer-motion here (that is Prompt 06).

Acceptance Criteria:
- The six packages and `@types/express` are gone from `package.json`.
- `npm install` then `npm run build` succeeds; `tsc --noEmit` clean.

---

## Prompt 12 — Remove dead 3D components (BUG-015)

Context:
Two 3D components are never imported.

Problem:
`src/components/three/NeuralNetwork.tsx` and `src/components/three/RobotScene.tsx` are exported but imported nowhere.

Files:
- `src/components/three/NeuralNetwork.tsx`
- `src/components/three/RobotScene.tsx`

Task:
Delete both files. Confirm nothing imports them first (`grep -r "NeuralNetwork\|RobotScene" src`).

Constraints:
Do not modify other files. Do not remove `WorldMap3D` or `DataCenter`, which are used.

Acceptance Criteria:
- Both files are gone.
- Build succeeds, typecheck clean.

---

## Prompt 13 — Align `@types/three` with `three` (BUG-014)

Context:
Types are ~13 minor versions ahead of the pinned runtime.

Problem:
`package.json` has `three@0.170.0` but `@types/three@^0.183.1`.

Files:
- `package.json`

Task:
Set `@types/three` to a range matching the runtime (for example `~0.170`). Do not change the `three` version (a runtime bump risks @react-three/fiber peer breakage).

Constraints:
Only edit `package.json`. Do not touch three usage in source.

Acceptance Criteria:
- `@types/three` matches `three@0.170`.
- `npm install` then `tsc --noEmit` clean; build succeeds.

---

## Prompt 14 — Fix dead and page-scoped Footer links (BUG-011, BUG-012)

Context:
The global Footer has dead `href="#"` links and hash anchors that only work on the home page.

Problem:
`src/components/sections/Footer.tsx:132-135` use `href="#"` (RescueBot AI, IBOS, NGX AfriQuant, Health AI). Lines 144-145 link to `#services` / `#infrastructure`, which only exist on `/`, but the Footer is on every page.

Files:
- `src/components/sections/Footer.tsx`

Task:
For the four `href="#"` items, either point to their real external URLs (match the other ecosystem links) or render them as non-link text until a destination exists. For `#services` and `#infrastructure`, make them route-aware: navigate to `/` then scroll to the section (mirror the Navbar pattern at `src/components/sections/Navbar.tsx:66`), so they work from any page.

Constraints:
Do not change the Footer layout or styling. Do not modify other files.

Acceptance Criteria:
- No `href="#"` remains in the Footer.
- "Services" / "Infrastructure" footer links work from a non-home page.
- Build succeeds, typecheck clean.

---

## Prompt 15 — Remove the artificial leadership loading delay (BUG-020)

Context:
The leadership carousel fakes a 2-second load before showing static data.

Problem:
`src/components/sections/LeadershipSection.tsx:323-327` uses `setTimeout(() => setIsLoading(false), 2000)` on data that is already in the file.

Files:
- `src/components/sections/LeadershipSection.tsx`

Task:
Remove the artificial delay so the section renders immediately. Either drop the `isLoading` state and the skeleton branch, or initialize `isLoading` to `false`. Keep the skeleton component if you prefer, but do not gate real content behind a fake timer.

Constraints:
Do not change the card design or data. Only remove the delay.

Acceptance Criteria:
- Leadership cards render without a 2s wait.
- Build succeeds, typecheck clean.

---

## Prompt 16 — Remove unused build-time and metadata config (BUG-016, BUG-017)

Context:
`GEMINI_API_KEY` is injected at build but never used, and `metadata.json` requests camera/geolocation the app does not use.

Problem:
`vite.config.ts:11` defines `process.env.GEMINI_API_KEY` with no consumer in `src`. `metadata.json:4-7` requests `camera` and `geolocation`.

Files:
- `vite.config.ts`
- `metadata.json`

Task:
Remove the `define` block for `GEMINI_API_KEY` from `vite.config.ts` (there is no LLM integration; per project conventions any future LLM call routes through local Claude Code, not a hosted key). Remove `camera` and `geolocation` from `metadata.json` `requestFramePermissions`.

Constraints:
Do not change other Vite settings (keep the react plugin, tailwind plugin, alias, and HMR handling). Only remove the unused pieces.

Acceptance Criteria:
- No `GEMINI_API_KEY` reference remains in config.
- `metadata.json` requests no unused permissions.
- Build succeeds, typecheck clean.

---

## Prompt 17 — De-duplicate the auth role fetch on load (BUG-018)

Context:
Role is fetched twice on mount because both `getInitialSession` and `onAuthStateChange` run and both query the `users` table.

Problem:
`src/components/AuthContext.tsx:38` (getInitialSession) and `:103` (onAuthStateChange) both fetch role and may both insert a profile. In supabase-js v2, `onAuthStateChange` fires immediately with the current session, duplicating the work.

Files:
- `src/components/AuthContext.tsx`

Task:
Make `onAuthStateChange` the single source of truth for session-derived state, or guard the initial fetch so role resolution and any profile insert run once per load. Preserve current behavior (correct `user`, `userRole`, `loading`) and the exported context shape.

Constraints:
Do not change the `AuthContextType` interface or the login/logout APIs. Do not reintroduce the hardcoded bypass removed in Prompt 01.

Acceptance Criteria:
- Role/profile logic runs once on a normal load.
- Auth still resolves correctly (logged in, logged out, role set).
- Build succeeds, typecheck clean.

---

## Prompt 18 — Add basic accessibility to clickable cards (BUG-019)

Context:
Several interactive elements are `<div onClick>` without keyboard or role semantics.

Problem:
`src/pages/Contact.tsx:251` (contact cards), `src/components/sections/LeadershipSection.tsx:156` (leadership cards), `src/pages/Careers.tsx:311` (upload cards), and holographic cards in `src/components/sections/Products.tsx` are not keyboard-accessible.

Files:
- `src/pages/Contact.tsx`
- `src/components/sections/LeadershipSection.tsx`
- `src/pages/Careers.tsx`

Task:
For each clickable `<div>`, add `role="button"`, `tabIndex={0}`, and an `onKeyDown` handler that triggers the same action on Enter/Space. Add `aria-label` to icon-only buttons that lack visible text. Do not convert to `<button>` if it would break the existing layout; `role`/`tabIndex`/`onKeyDown` is sufficient.

Constraints:
Do not change the visual design. Do not alter the click behavior. Keep changes minimal and local.

Acceptance Criteria:
- The named cards are reachable and activatable by keyboard.
- No visual regression.
- Build succeeds, typecheck clean.

---

## Prompt 19 — Code-split routes and heavy vendors (performance, optional but recommended)

Context:
The app ships as one 2.17 MB JS chunk (574 KB gzip). Three.js and Firebase load on every route.

Problem:
`src/App.tsx` imports every page eagerly. `vite.config.ts` has no manual chunking. Three (`three`, `@react-three/*`) and `firebase` are large and route-specific.

Files:
- `src/App.tsx`
- `vite.config.ts`

Task:
Convert page imports in `src/App.tsx` to `React.lazy` and wrap `AnimatedRoutes` in `<Suspense fallback={...}>` using a spinner consistent with the app style. In `vite.config.ts`, add `build.rollupOptions.output.manualChunks` to split `three` + `@react-three/*`, `firebase`, and `framer-motion`/`motion` into separate vendor chunks.

Constraints:
Do not change routes, page behavior, or the design. Keep the `PageTransition` wrapper. Ensure the Suspense fallback matches the existing loading UI.

Acceptance Criteria:
- The main chunk shrinks; per-route chunks appear in the build output.
- All routes still load and animate correctly.
- Build succeeds, typecheck clean.

---

## Prompt 20 — Gate WebGL canvases to when visible (performance, optional)

Context:
The Landing page runs two continuous WebGL canvases (WorldMap3D, DataCenter) even when offscreen.

Problem:
`src/components/three/WorldMap3D.tsx` and `src/components/three/DataCenter.tsx` run `useFrame` loops (and `autoRotate`) continuously. `DataCenter` also calls `Math.random()` every frame across 40 meshes.

Files:
- `src/components/three/WorldMap3D.tsx`
- `src/components/three/DataCenter.tsx`

Task:
Use drei/fiber `frameloop="demand"` or an IntersectionObserver to pause each `<Canvas>` render loop when its section is offscreen, and resume when visible. Throttle the `DataCenter` blink update to a timer instead of per-frame randomness.

Constraints:
Do not change the visual result when the section is on screen. Do not remove the 3D scenes. Keep the mouse-interaction behavior on WorldMap3D when visible.

Acceptance Criteria:
- Canvases stop rendering when scrolled out of view.
- Visible behavior is unchanged.
- Build succeeds, typecheck clean.

---

## Prompt 21 — Align product copy with implemented behavior (truthfulness, optional)

Context:
The chatbot and forms claim AI processing and "quantum-safe AES-256" handling that is not implemented (all responses are canned `setTimeout` strings).

Problem:
`src/components/ui/TebogoChatbot.tsx:86-88`, `src/pages/Contact.tsx:178-183`, and `src/pages/Careers.tsx:266` describe AI/encryption features the code does not perform.

Files:
- `src/components/ui/TebogoChatbot.tsx`
- `src/pages/Contact.tsx`
- `src/pages/Careers.tsx`

Task:
Either soften the copy to match reality (for example describe the chatbot as a demo assistant, and remove the AES-256 claim), or implement the real behavior. If implementing AI, route the call through the project's intended LLM path (local Claude Code per `CLAUDE.md`), not a hosted API key. Prefer the copy fix unless real AI is in scope.

Constraints:
Do not change the visual design. Keep the interaction flow. Only adjust copy (or add a real, project-approved integration).

Acceptance Criteria:
- No user-facing claim describes an unimplemented security or AI capability.
- Build succeeds, typecheck clean.
