# FIX ORDER — NeuroGrowth Labs

Prioritized remediation plan. Each item maps to a bug in `docs/BUGS.md` and a standalone prompt in `docs/AI_STUDIO_PROMPTS.md`. Apply top to bottom. Nothing here changes the architecture; every fix is scoped to named files.

Legend: **Critical** = fix before any public launch. **High** = fix before real users depend on it. **Medium** = fix soon. **Low** = cleanup.

---

## Critical — do these first (security and data exposure)

| Order | Bug | Prompt | What it fixes | Risk if skipped |
|---|---|---|---|---|
| 1 | BUG-001 | Prompt 01 | Remove hardcoded super-admin password | Anyone logs in as super admin from the bundle |
| 2 | BUG-004 | Prompt 04 | Replace allow-all RLS with least-privilege | All contact/partner PII is world-readable |
| 3 | BUG-002 | Prompt 02 | Supabase creds to env, remove literals | Key pinned in source, cannot rotate cleanly |
| 4 | BUG-003 | Prompt 03 | Firebase config to env | Live web key committed; quota/abuse risk |

Out-of-band follow-ups after 1-4 (not code, do in the provider consoles): rotate the Supabase anon key, rotate/restrict the Firebase API key, enable Firebase App Check, and set all secrets in the AI Studio Secrets panel. These matter because the secrets are already in git history.

---

## High — fix before real users rely on it (broken function)

| Order | Bug | Prompt | What it fixes | Risk if skipped |
|---|---|---|---|---|
| 5 | BUG-005 | Prompt 05 | Add `/platforms` target + `*` 404 route | Main CTAs dead-end on a blank page |
| 6 | BUG-006 | Prompt 06 | Make `framer-motion` a direct dependency | Whole UI breaks under a strict install |
| 7 | BUG-007 | Prompt 07 | Guard `/admin/recruitment` | Public admin surface |
| 8 | BUG-009 | Prompt 08 | Fix Firestore rules or drop dead dual-write | Silent write failures / lost data |
| 9 | BUG-010 | Prompt 09 | Add `users` table to setup SQL | Server-side roles do not work |

Note on sequencing: do Prompt 06 (framer-motion) early in this block. It is a one-line `package.json` change with no code risk, and it de-risks every other edit by guaranteeing the app still builds under any installer.

---

## Medium — fix soon (degraded UX / validity)

| Order | Bug | Prompt | What it fixes | Risk if skipped |
|---|---|---|---|---|
| 10 | BUG-008 | Prompt 10 | De-duplicate `id="infrastructure"` | Nav anchor non-deterministic; invalid HTML |
| 11 | BUG-012 | Prompt 14 | Route-aware Footer section links | Footer Services/Infrastructure dead off home |

---

## Low — cleanup and polish

| Order | Bug | Prompt | What it fixes |
|---|---|---|---|
| 12 | BUG-013 | Prompt 11 | Remove 6 unused deps + dup `vite` |
| 13 | BUG-015 | Prompt 12 | Delete dead 3D components |
| 14 | BUG-014 | Prompt 13 | Align `@types/three` with `three` |
| 15 | BUG-011 | Prompt 14 | Fix dead `href="#"` footer links (same prompt as 11) |
| 16 | BUG-020 | Prompt 15 | Remove fake 2s leadership delay |
| 17 | BUG-016, BUG-017 | Prompt 16 | Remove unused Gemini build define + iframe permissions |
| 18 | BUG-018 | Prompt 17 | De-duplicate auth role fetch |
| 19 | BUG-019 | Prompt 18 | Accessibility on clickable cards |

---

## Performance track (parallel, optional but recommended)

These do not block launch but give the biggest UX wins. Run after Critical/High are green.

| Order | Prompt | What it does |
|---|---|---|
| P1 | Prompt 19 | Route-level code splitting + manual vendor chunks (2.17 MB → smaller per-route) |
| P2 | Prompt 20 | Gate WebGL canvases to when visible |

---

## Truthfulness track (optional)

| Order | Prompt | What it does |
|---|---|---|
| T1 | Prompt 21 | Align chatbot/forms copy with what is actually implemented (or build the real integration) |

---

## Suggested working method

1. Fix one bug per prompt, in the order above.
2. After each fix, run `npm run build` and `npx tsc --noEmit`. Both must stay green.
3. Where the project conventions in `CLAUDE.md` apply (they do), add a regression test with the fix. The repo currently has no test runner; the first fix that adds tests should also add a minimal test setup (Vitest fits Vite). That is a scope decision for Linford, so it is called out rather than assumed.
4. Do not batch unrelated fixes into one commit; keep each bug isolated so a regression is easy to bisect.
5. Re-verify the security items (1-4) in a fresh build and confirm no secret strings remain: `npm run build && grep -rE "NeuroGrowth2@|jyvwrdibocdiicaurfrj|AIzaSy" dist` should return nothing after Prompts 01-03.
