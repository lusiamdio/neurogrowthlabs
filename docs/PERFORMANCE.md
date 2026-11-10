# PERFORMANCE — NeuroGrowth Labs

Observations from the production build (`npm run build`) and code review. Numbers below are from the actual build output.

## Build output (measured)

```
dist/assets/index-*.css     115.32 kB │ gzip:  14.75 kB
dist/assets/index-*.js    2,170.13 kB │ gzip: 574.15 kB
```

Vite warns: chunks larger than 500 kB. There is a single JS chunk of 2.17 MB (574 KB gzip).

## 1. No code splitting (highest impact)

- **What:** The entire app is one chunk. Three.js, Firebase, Supabase, Framer Motion, and every page load on first paint, even for a visitor who only reads a legal page.
- **Why it matters:** 574 KB gzip of JS before anything interactive. On mobile/3G this is multiple seconds of parse+execute.
- **Fix (no architecture change):** Lazy-load routes with `React.lazy` + `Suspense` in `src/App.tsx`, and split the heavy libraries. Three.js and Firebase are the biggest wins because they are only needed on specific pages (Three on Landing/About, Firebase only for the chatbot). Add `build.rollupOptions.output.manualChunks` to separate `three`, `firebase`, and `framer-motion` vendor chunks.
- **Expected effect:** Legal pages and Contact/Partner drop most of the payload; the 3D-heavy Landing keeps it.

## 2. Multiple WebGL contexts on one page

- **What:** The Landing page mounts `WorldMap3D` (Hero, `Hero.tsx:21`) and `DataCenter` (AILab, `AILab.tsx:12`), each its own `<Canvas>` (its own WebGL context). About mounts additional animated visuals.
- **Why it matters:** Each WebGL context has real GPU/memory cost; browsers cap active contexts. Two heavy canvases plus continuous `useFrame` loops run animation every frame while the section may be offscreen.
- **Fix:** Pause/unmount canvases when offscreen (IntersectionObserver, or drei `<Canvas frameloop="demand">` / `frameloop` gating). Consider a single shared canvas if the design allows. Do not run `autoRotate` + per-frame lerps for sections the user is not looking at.

## 3. Global per-frame and per-event work

- `WorldMap3D` adds a global `mousemove` listener (`WorldMap3D.tsx:15-22`) and runs `useFrame` lerps every frame. The listener uses a ref (good, no re-render), but the frame loop runs continuously.
- `DataCenter` calls `Math.random()` for blink state every frame across 5 racks × 8 lights (`DataCenter.tsx:24-35`).
- **Fix:** Gate these loops to when the canvas is visible; throttle blink updates to a timer rather than every frame.

## 4. Artificial delays that hurt perceived performance

- `LeadershipSection.tsx:325`: a hardcoded `setTimeout(..., 2000)` shows skeletons for 2s before rendering static, already-loaded data (BUG-020). This is pure added latency.
- `Careers.tsx` and `Contact.tsx` simulate AI with `setTimeout` (1.5s–4s). Intentional UX, but it is latency by design; keep only if the product wants it.
- **Fix:** Remove the leadership delay; render immediately.

## 5. Redundant backend work

- `AuthContext` fetches the role twice on load (getInitialSession + onAuthStateChange, BUG-018), duplicating a network round-trip and a possible insert.
- `Portal.fetchAllData` (`Portal.tsx:69`) runs five backend reads with nested try/catch fallback chains sequentially. Each has up to three attempts (Supabase → Firestore → localStorage/demo).
- Form submits do up to three writes each (Firebase + Supabase + localStorage), and the Firebase write is dead for five collections (BUG-009), so it is wasted latency on every submit.
- **Fix:** De-duplicate the auth role fetch; run Portal reads with `Promise.all` where independent; drop the dead Firebase writes.

## 6. Bundle composition notes

- `lucide-react` is imported in 26 files; it tree-shakes per-icon, so this is fine as long as named imports are used (they are).
- Six unused dependencies (`@google/genai`, `express`, `dotenv`, `clsx`, `tailwind-merge`, `gsap`) do not ship if unimported, but removing them speeds installs/CI (BUG-013).
- The Google Fonts `@import` in `src/index.css:1` blocks CSS parsing on a network request. Consider `<link rel="preconnect">` + `display=swap` (already has `display=swap`) or self-hosting the two fonts.

## 7. Rendering / React

- Heavy use of `whileInView` with `viewport={{ once: true }}` is good (animations fire once).
- `motion.div` wrappers are plentiful but individually cheap.
- No obvious memory leaks: `useEffect` listeners and intervals are cleaned up (Navbar scroll, DashboardPreview interval, SystemStatusWidget interval, chatbot onSnapshot). One to watch: `SEO` appends JSON-LD scripts and removes prior ones on each route change (`SEO.tsx:263`), which is correct.

## Priority order for performance work

1. Route-level code splitting + manual vendor chunks (biggest win).
2. Gate/limit the WebGL canvases (frameloop on demand, unmount offscreen).
3. Remove the artificial 2s leadership delay.
4. De-duplicate auth role fetch and drop dead Firebase writes.
5. Prune unused deps; optimize font loading.

None of these require an architecture change; they are configuration, lazy-loading, and dead-path removal.
