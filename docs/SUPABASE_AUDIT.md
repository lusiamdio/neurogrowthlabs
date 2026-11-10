# SUPABASE & BACKEND AUDIT — NeuroGrowth Labs

Read-only review of the two backends the app talks to: Supabase (primary) and Firebase Firestore (secondary dual-write). No backend was modified. No Supabase project settings were touched.

## 1. Clients

- **Supabase:** `src/supabase.ts` creates a single `createClient(SUPABASE_URL, SUPABASE_ANON_KEY)`. URL and anon key have hardcoded fallbacks (BUG-002). No custom auth storage, no options passed.
- **Firebase:** `src/firebase.ts` initializes from committed `firebase-applet-config.json` (BUG-003) and connects to a NAMED Firestore database: `getFirestore(app, firebaseConfig.firestoreDatabaseId)` where the id is `ai-studio-9b4c93c8-...`. Rules must be deployed to that named database, not `(default)`.

## 2. Tables the app uses (Supabase)

Derived from `supabase.from('<table>')` calls across the codebase.

| Table | Read | Insert | Update | Delete | Writer files |
|---|---|---|---|---|---|
| `subscriptions` | Portal | Footer, Portal | — | Portal | `Footer.tsx:39`, `Portal.tsx:565` |
| `chat_messages` | — | TebogoChatbot | — | — | `TebogoChatbot.tsx:75,103` |
| `partner_applications` | Portal | Partner | Portal (status) | Portal | `Partner.tsx:220`, `Portal.tsx:405,447` |
| `contact_submissions` | Portal | Contact | Portal (status) | Portal | `Contact.tsx:98`, `Portal.tsx:486,528` |
| `webinars` | Portal, Webinar | Portal | — | Portal | `Portal.tsx:318`, `Webinar.tsx:159` |
| `webinar_registrations` | Portal | Webinar | — | — | `Webinar.tsx:242`, `Portal.tsx:110` |
| `users` | AuthContext | AuthContext | — | — | `AuthContext.tsx:66,76,121,195` |

## 3. Schema the app ships vs. schema the app expects

The only setup SQL in the repo is the string in `src/pages/Portal.tsx:1222-1291`. It creates six tables: `subscriptions`, `chat_messages`, `partner_applications`, `contact_submissions`, `webinars`, `webinar_registrations`.

### Problems

1. **Missing `users` table (BUG-010).** AuthContext queries `.from('users')` for role management, but the shipped SQL never creates it. Every such query errors and role falls back to a client-side email check. Server-side roles do not work.

2. **Column-name mismatch, hedged in code.** The Supabase inserts write BOTH camelCase and snake_case variants of the same field to survive an unknown schema:
   - `Partner.tsx:220-239` inserts `orgName`, `org_name`, `domainStack`, `domain_stack`, `collabGoal`, `collab_goal`, `repName`, `rep_name`, plus the base `company`/`type`/`country`/`interest`/`objectives`.
   - `Contact.tsx:98-112` inserts `fullName`, `full_name`, `fullName_custom`, `teamScale`, `team_scale`, `inquiryType`, `inquiry_type`.
   - `Webinar.tsx:242-255` inserts `fullName`, `full_name`, `interestSector`, `interest_sector`.

   The shipped SQL only has snake_case columns (`full_name`, `org_name` is not even present; the partner table uses `company`, `type`, `country`, `interest`, `objectives`). Postgres rejects an INSERT that names a nonexistent column, so **these inserts fail against the shipped schema** unless the operator added the extra columns. The Portal read path then maps many possible key spellings (`Portal.tsx:147-156`, `:188-196`) to paper over the same uncertainty.

   Root cause: the frontend and the SQL schema were never reconciled to one contract.

3. **`partner_applications` schema divergence.** Code inserts `orgName/orgType/domainStack/collabGoal/repName`; SQL defines `company/type/country/interest/objectives`. Reads in Portal try both. There is no single source of truth for this table's shape.

## 4. Row Level Security (RLS)

The shipped SQL (`Portal.tsx:1293-1307`) enables RLS on all six tables and then adds:

```sql
CREATE POLICY "Public full access" ON <table> FOR ALL USING (true) WITH CHECK (true);
```

for every table. This is **BUG-004 (Critical)**. Consequences:

- `anon` can `SELECT *` from `contact_submissions` and `partner_applications`, exposing every submitter's name, email, organization, and message.
- `anon` can `UPDATE` and `DELETE` any row in any table.
- The anon key needed to do this is public (in the bundle, BUG-002).

Enabling RLS with an allow-all policy is functionally equivalent to disabling RLS, with a false sense of security from the `ENABLE ROW LEVEL SECURITY` line.

### Recommended policy shape (documentation only, do not auto-apply)

- Intake tables (`contact_submissions`, `partner_applications`, `webinar_registrations`, `subscriptions`, `chat_messages`): allow `INSERT` to `anon`, deny `SELECT`/`UPDATE`/`DELETE` to `anon`.
- Admin reads/writes: restrict `SELECT`/`UPDATE`/`DELETE` to an authenticated admin (JWT claim or a dedicated Postgres role), checked via `auth.jwt()` or a `users.role` lookup.
- `webinars`: `SELECT` may be public (it is public catalog data), but `INSERT`/`UPDATE`/`DELETE` admin-only.

## 5. Firestore (secondary backend)

- **Rules coverage gap (BUG-009).** `firestore.rules` defines match blocks only for `users`, `analyses`, and `chat_sessions/{id}/messages`. The five collections the forms write to (`subscriptions`, `webinars`, `webinar_registrations`, `partner_applications`, `contact_submissions`) have no rule, so under `rules_version = '2'` they are denied by default. Every Firebase write to them fails and is swallowed by `try/catch`.
- **What actually works in Firestore:** only the Tebogo chatbot path (`chat_sessions` + `messages` subcollection), which is covered by rules and validated by `isValidChatMessage` (`firestore.rules:82-88`).
- **Rules quality where they exist:** good. `users` and `analyses` enforce ownership, field allow-lists, email format, immutable `createdAt`, and role-change protection. The `chat_sessions` rules are intentionally open (`allow read, create: if true`) which is acceptable for anonymous chat but means anyone can read any session's messages by id.
- **Admin email mismatch:** `firestore.rules:57` treats `lusimadio12@gmail.com` as admin; the app hardcodes `simao@neurogrowthlabs.co.za` and `lusimadio12@gmail.com` (`AuthContext.tsx:61`). The password bypass only recognizes `simao@`. The two systems do not agree on the admin set.

## 6. Backend failure modes (what can silently break)

1. Operator never runs the Portal SQL → all Supabase reads/writes fail → app runs in localStorage "sandbox mode" (`Portal.tsx:251`), data never leaves the browser.
2. Operator runs the SQL as-is → PII is world-readable (BUG-004), and the camelCase inserts still fail because those columns do not exist.
3. Firestore writes to the five uncovered collections always fail (BUG-009).
4. `users` table absent → roles degrade to client-side email match (BUG-010).

## 7. Recommendations (documentation only)

1. Choose one backend of record. Given the code leans on Supabase for reads, standardize on Supabase and remove the dead Firebase dual-write, OR add the missing Firestore rules and deploy them to the named database.
2. Define ONE column contract per table and make the SQL, the inserts, and the Portal read-mapping agree. Remove the multi-key hedging once the schema is fixed.
3. Add the `users` table (or move roles to JWT claims) so role management works server-side.
4. Replace the allow-all RLS with least-privilege policies (section 4).
5. Keep the anon key and Firebase config out of source; inject from env.
