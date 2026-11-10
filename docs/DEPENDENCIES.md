# DEPENDENCIES — NeuroGrowth Labs

Review of `package.json`. Findings verified by grepping `src` for each package and inspecting `package-lock.json` and installed `node_modules`.

## Summary

| Category | Count | Items |
|---|---|---|
| Used, direct | 11 | react, react-dom, react-router-dom, @supabase/supabase-js, firebase, three, @react-three/fiber, @react-three/drei, @types/three, lucide-react, motion |
| Used, but not declared (transitive) | 1 | **framer-motion** (via `motion`) — BUG-006 |
| Declared, unused | 6 | @google/genai, express, dotenv, clsx, tailwind-merge, gsap — BUG-013 |
| Version drift | 1 | @types/three vs three — BUG-014 |
| Build tooling (used) | many | vite, @vitejs/plugin-react, tailwindcss, @tailwindcss/vite, autoprefixer, typescript, tsx, @types/* |

## Dependencies

| Package | Declared | Used in src? | Verdict |
|---|---|---|---|
| `react` | ^19.0.0 | yes | Keep |
| `react-dom` | ^19.0.0 | yes | Keep |
| `react-router-dom` | ^7.13.1 | yes (15 files) | Keep |
| `@supabase/supabase-js` | ^2.110.2 | yes | Keep |
| `firebase` | ^12.10.0 | yes (7 files) | Keep (or drop if standardizing on Supabase, see SUPABASE_AUDIT §7) |
| `three` | 0.170.0 (pinned) | yes (4 three files) | Keep; align types (BUG-014) |
| `@react-three/fiber` | ^9.5.0 | yes | Keep |
| `@react-three/drei` | ^10.7.7 | yes (3 files) | Keep |
| `@types/three` | ^0.183.1 | types only | **Align to `three@0.170`** (BUG-014) |
| `lucide-react` | ^0.546.0 | yes (26 files) | Keep |
| `motion` | ^12.23.24 | indirect | Keep, but see below |
| `@google/genai` | ^1.29.0 | **no** | **Remove** (BUG-013) — no LLM integration exists |
| `express` | ^4.21.2 | **no** | **Remove** (BUG-013) — no server in this SPA |
| `dotenv` | ^17.2.3 | **no** | **Remove** (BUG-013) — Vite handles env |
| `clsx` | ^2.1.1 | **no** | **Remove** (BUG-013) |
| `tailwind-merge` | ^3.5.0 | **no** | **Remove** (BUG-013) |
| `gsap` | ^3.14.2 | **no** | **Remove** (BUG-013) — animation is all Framer Motion |

## The framer-motion / motion situation (BUG-006)

- Every animated file imports from `framer-motion` (26 files, including `src/App.tsx:7`).
- `package.json` declares `motion@^12.23.24`, NOT `framer-motion`.
- It works only because `motion` depends on `framer-motion@^12.36.0`, which npm hoists to top-level `node_modules` (installed version 12.36.0).
- **Risk:** a strict installer (pnpm), a hoisting change, or a `motion` release that stops re-exporting `framer-motion` breaks every page at build time.
- **Fix options:**
  - (Low risk, recommended) Add `"framer-motion": "^12.36.0"` to `dependencies`. No code changes.
  - (Cleaner, more work) Migrate all imports from `framer-motion` to `motion/react` and keep only `motion`.

## devDependencies

| Package | Declared | Used? | Verdict |
|---|---|---|---|
| `@types/express` | ^4.17.21 | no | Remove with `express` (BUG-013) |
| `@types/node` | ^22.14.0 | yes (vite.config path/process) | Keep |
| `@types/react` | ^19.2.14 | yes | Keep |
| `@types/react-dom` | ^19.2.3 | yes | Keep |
| `autoprefixer` | ^10.4.21 | yes (postcss) | Keep |
| `tailwindcss` | ^4.1.14 | yes | Keep |
| `tsx` | ^4.21.0 | not referenced by scripts | Review; likely removable |
| `typescript` | ~5.8.2 | yes | Keep |
| `vite` | ^6.2.0 | yes | Keep (also duplicated in dependencies at line 33; remove the dependencies copy, keep it in devDependencies) |

## Duplicate declaration

`vite` is listed in both `dependencies` (`package.json:33`) and `devDependencies` (`package.json:44`). Keep it in `devDependencies` only.

## Outdated / pinning notes

- `three` is pinned exactly to `0.170.0` while `@types/three` floats to `^0.183`. Pin both or float both to a matching range.
- No other package shows a security-relevant major lag at audit time. Re-run `npm outdated` before any dependency bump and verify @react-three/fiber peer compatibility with any `three` change.

## Recommended actions (no architecture change)

1. Add `framer-motion` as a direct dependency (BUG-006).
2. Remove the 6 unused runtime deps + `@types/express` (BUG-013).
3. Align `@types/three` with `three` (BUG-014).
4. Remove the duplicate `vite` entry from `dependencies`.
5. Re-run `npm install` and `npm run build` to confirm green after each change.
