# ROUTES — NeuroGrowth Labs

Client-side routing only, via `react-router-dom` `BrowserRouter` in `src/App.tsx`. All routes render inside `AnimatedRoutes` (`src/App.tsx:42-64`) wrapped in a `PageTransition` motion div.

## Defined routes

| Path | Component | Purpose | Status | Notes |
|---|---|---|---|---|
| `/` | `Landing` | Marketing home (Hero, SocialProof, About, Products, AILab, DashboardPreview, Services, FAQ, CTA) | OK | Duplicate `id="infrastructure"` on this page (BUG-008) |
| `/portal` | `Portal` | Super-admin command center (webinars, partners, contacts, subscriptions) | OK, gated | Gate is client-side `super_admin` check; hardcoded bypass exists (BUG-001) |
| `/about` | `About` | Company story + LeadershipSection | OK | Buttons here link to `/platforms` (broken, BUG-005) |
| `/partner` | `Partner` | 4-step partnership application form | OK | Writes to Firebase (denied, BUG-009) + Supabase + localStorage |
| `/careers` | `Careers` | Simulated AI recruitment assessment flow | OK | No real submission; ends at a canned success screen |
| `/contact` | `Contact` | Contact form + simulated routing chat | OK | Reads `location.state?.inquiryType`; scrolls on `location.hash` |
| `/webinar` | `Webinar` | Program calendar + registration | OK | In-page anchors `#registration-portal`, `#program-overview` resolve here |
| `/admin/recruitment` | `AdminDashboard` | Recruitment analytics dashboard (mock data) | Reachable, UNGUARDED | No auth check (BUG-007); orphaned, nothing links to it |
| `/privacy-policy` | `PrivacyPolicy` | Legal | OK | Static; own inline "Back to Home" nav, not the shared Navbar |
| `/terms-of-service` | `TermsOfService` | Legal | OK | Static |
| `/ai-ethics` | `AIEthics` | Legal | OK | Static |
| `/cookie-policy` | `CookiePolicy` | Legal | OK | Static |
| `/dpa` | `DPA` | Legal (data processing addendum) | OK | Static |
| `/security-policy` | `SecurityPolicy` | Legal | OK | Static |

## Broken / missing routes

| Path | Referenced from | Problem |
|---|---|---|
| `/platforms` | `src/components/sections/CTA.tsx:36`, `src/pages/About.tsx:167`, `src/pages/About.tsx:485`, and a dedicated SEO case at `src/components/SEO.tsx:101` | **No route defined.** Navigating here renders a blank page (BUG-005). This is the primary "404" symptom in the audit brief. |
| `*` (catch-all) | — | **No 404 route exists.** Any unknown URL (typo, stale link, `/platforms`) renders an empty `AnimatedRoutes` with only the global chatbot visible. |

## In-page hash anchors

| Anchor | Section id defined at | Works from |
|---|---|---|
| `#infrastructure` | `Products.tsx:135` AND `AILab.tsx:8` (duplicate) | Landing only; resolves to Products (first match) |
| `#services` | `Services.tsx:34` | Landing only |
| `#about` | `About.tsx (section):19` | Landing only |
| `#registration-portal` | `Webinar.tsx:895` | Webinar page |
| `#program-overview` | `Webinar.tsx:451` | Webinar page |
| `#ai-form`, `#contact-options` | `Contact.tsx:279,241` | Contact page |
| `#services`, `#infrastructure` from Footer | Footer is global (`Footer.tsx:144-145`) | Broken off `/` (BUG-012) |
| `#` (empty) | Footer ecosystem links (`Footer.tsx:132-135`) | Dead links, jump to top (BUG-011) |

## Navigation entry points

- **Navbar** (`src/components/sections/Navbar.tsx`): About, Infrastructure (scroll), Partner, Webinar, Contact, Portal. Uses `navigate()` + `window.scrollTo` / `getElementById().scrollIntoView`. Present on most pages; NOT on the six legal pages (they use an inline back-link).
- **Footer** (`src/components/sections/Footer.tsx`): full sitemap including all legal pages, `/portal` ("Super Admin Portal"), external ecosystem links, and the dead `#` links noted above. Present on Landing, About, Partner, Contact, Webinar, Portal, AdminDashboard, and legal pages.
- **Hero / CTA / About buttons:** drive the main funnel; the "Explore Platforms / Explore Our Ecosystem" buttons are the broken ones (BUG-005).

## Recommendations (do not change architecture, just close gaps)

1. Add `<Route path="*" element={<NotFound />} />` with a real 404 page and a link home.
2. Add a `/platforms` route (build the page) or repoint the three `/platforms` buttons to `/#infrastructure` or `/partner`.
3. De-duplicate the `infrastructure` id so the Navbar anchor is deterministic.
4. Make Footer `#services` / `#infrastructure` route-aware so they work off the home page.
5. Guard or remove `/admin/recruitment`.
