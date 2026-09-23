# NeuroAtlas Web — Handover & Sync Meeting Prep

**Prepared for:** the mobile app team, ahead of the web ↔ app sync meeting.

Covers the current state of `neuroatlas-web` (the marketing site + waitlist, not yet a
logged-in product) and a point-by-point response to the sync checklist. Every fact below
is read directly from the repository and its lockfile — where something isn't built yet,
it says so plainly rather than guessing.

---

## 1. Current tech stack

Exact versions, read from the lockfile (not the loose `^` ranges in `package.json`):

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.3.2 |
| UI runtime | React | 19.2.8 |
| Language | TypeScript | 5.9.3 |
| Styling | Tailwind CSS v4 | 4.3.3 |
| Motion | Framer Motion, Lenis (smooth scroll) | 13.4.0 / 1.3.26 |
| 3D | three.js + React Three Fiber + drei | 0.185.1 / 9.7.0 / 10.7.8 |
| CMS | Sanity (content only — see below) | 6.15.0 |
| Repo host | GitHub, private | — |
| Hosting / deploy target | **ask them** — no Vercel project file or CI config committed to the repo | — |

**Worth flagging directly:** `stripe` and `@stripe/stripe-js` are installed in
`package.json` but **not referenced anywhere in the codebase** — dead scaffolding from an
earlier direction, not a decision that Stripe is the payment processor. Likewise `zustand`
and `@tanstack/react-query` are installed but unused. If the app team has seen
`package.json` and assumed Stripe is already wired up, that's worth correcting before the
meeting — the actual payment processor decision (Razorpay, per our own plan) hasn't been
implemented on the web side at all yet.

---

## 2. What actually exists today (the honest baseline)

This is currently a **marketing site with a waitlist form**, not an authenticated product
with user accounts. Almost none of the sync machinery below exists yet — that's not an
oversight, it's the actual current scope.

### Routes
All server-rendered marketing pages — no authenticated area exists:
`/` `/about` `/band` `/contact` `/faq` `/for-organisations` `/how-it-works`
`/inside-the-app` `/journal` `/journal/[slug]` `/legal/privacy-policy`
`/legal/terms-of-use` `/pricing` `/privacy` `/request-access` `/the-science`
`/studio` (Sanity CMS admin)

### API routes — what they actually do

| Route | Behavior today |
|---|---|
| `/api/waitlist` | Accepts a POST, waits 1s, returns `{success:true}`. **No database write, no persistence at all.** This is the pilot-program lead capture on `/pricing`. |
| `/api/newsletter` | Same shape — simulated success only. |
| `/api/contact` | Same shape — simulated success only. |
| `/api/draft-mode/enable` | Real — enables Next.js Draft Mode for Sanity content preview. Unrelated to users/auth. |

### Database
**None.** There is no database of any kind connected to this app — no Postgres, no
Supabase, no Firestore. The three "lead capture" routes above don't persist anything
anywhere yet.

### Authentication
**None.** No auth provider, no login/signup flow, no session/cookie handling, no user
table. Searched the entire codebase to confirm — there is nothing to map to a schema yet.

### CMS (Sanity) — for context, not user data
Sanity powers the `/journal` blog and its `/studio` editor — article content only (title,
slug, body, images). It has no concept of user accounts, pilot status, or subscriptions,
and isn't a candidate for that role.

### Payments
**None.** No payment processor is integrated. The `/pricing` page's "Foundation Pilot"
card is a waitlist form only, deliberately structured so it can become a real subscription
grid later — the checkout/Razorpay work hasn't started.

### Mobile app / deep linking
**None.** Nothing in this repository references a mobile app, Universal Links, App Links,
or a magic-link redirect target. If a mobile app codebase already exists elsewhere, it's
not something we have visibility into from this side.

---

## 3. Your checklist, answered

### 1. Authentication & Identity

**Primary Auth Provider — which service for cross-platform identity?**
*Decide together.* Not chosen yet. No auth provider is wired into the web app at all. This
is a joint decision — whatever you're already using or planning for the mobile app
(Supabase, Clerk, Firebase) is the strongest input here, since the web side is starting
from zero and can adopt whichever SDK the app team already has working.

**Environment Keys — dev/prod API keys, Client IDs, API URLs**
*N/A yet.* Nothing to provide until the provider above is chosen. Once it is, we'll need
dev and prod keys from whoever owns that account.

**Database Schema Matching — exact unique user ID field name**
*Need this from you.* There is no user table on the web side yet, so there's no existing
field name to conflict with — we can match whatever convention (`id`, `user_id`, `uid`)
the app/database side already uses.

### 2. Database & State Management

**Hosting & Access — where's the central database, connection strings/endpoints?**
*Need this from you.* No database exists on the web side. If the mobile app already has
one provisioned, that's almost certainly the "single source of truth" this checklist is
asking about — we'd connect to it rather than stand up a second one.

**Pilot User Flagging — exact field name for the /api/waitlist route to set**
*Not built.* `/api/waitlist` currently only simulates success and writes nothing anywhere.
Once we know the database and the field name/convention, wiring up a real write here is a
small, contained change.

**Offline State — mobile behavior if web changes subscription/pilot status**
*App-side question.* This is really a question for the mobile app's own sync/caching
layer rather than something the web side controls — flagging it here so it's on the
agenda, not answering on your behalf.

### 3. Subscription Routing & Payments (Razorpay)

**App Store Compliance Strategy — Reader App vs. native billing alongside web**
*Decide together.* Not decided. This materially changes what the web checkout flow needs
to do post-payment (e.g. whether it needs an "Open in App" handoff at all), so it's worth
settling early in the meeting.

**Entitlement Engine — RevenueCat or similar to sync Razorpay → mobile?**
*Need this from you.* Not integrated on the web side. If the app team is already using
RevenueCat (or an equivalent) for App Store/Play billing, we'd want to fit Razorpay web
purchases into that same entitlement layer rather than inventing a parallel one.

**Razorpay Credentials — who generates Sandbox/Test keys?**
*Need this from you.* No Razorpay account or keys exist in this project yet (confirmed —
no Razorpay SDK, no key references anywhere in the codebase). We'll need the account owner
to generate Sandbox keys and share `RAZORPAY_KEY_ID` — the secret should go directly into
our deploy environment's secret store, not passed over chat/email.

**Webhook Handling — who builds the listener that unlocks mobile features on payment success?**
*Decide together.* Not built. This is a natural fit for a new `/api/razorpay/webhook`
route on the web side (same pattern as the existing API routes) *if* the shared database
lives somewhere the web deployment can reach — depends on the hosting/access answer above.

### 4. Deep Linking & App Handoff

**Universal Links (iOS) / App Links (Android)**
*Need this from you.* Not configured on the web side — no
`apple-app-site-association` or `assetlinks.json` exists in this repo. We'll need the
exact configured link values from whoever owns the mobile app's build config.

**Magic Link Redirects — exact redirect URL for passwordless login handback**
*Depends on auth choice.* Depends entirely on the auth provider decision above — most
providers (Clerk, Supabase, Firebase) generate this redirect URL as part of their own setup
rather than it being something we invent independently.

---

## 4. Questions we'd add for the meeting

Gaps the checklist doesn't cover, based on what's actually in this repo today:

- **Does a mobile app codebase already exist?** Nothing in this repo references one —
  worth confirming its current state (shipped, in TestFlight, still in design) so we scope
  the sync work against reality.
- **Hosting for the web app.** No Vercel project or CI config is committed here — where is
  this actually meant to deploy, and who owns that account?
- **Data residency / compliance for the India pilot.** Given the pilot program targets
  India specifically, is there a DPDP Act (India's data protection law) consideration for
  where user data physically lives, separate from the general "which database" question?
- **Sequencing.** Given almost nothing above is built yet, what's the minimum slice that
  has to exist before the pilot can actually launch — auth + payments, or is a simpler
  manual/CSV-export flow acceptable for a first cohort?
- **Analytics/crash reporting parity.** Not part of the sync checklist, but worth
  confirming whether events need to be attributed to the same user across web and app from
  day one, since that also depends on the identity provider chosen above.

---

*Prepared from the `neuroatlas-web` repository as of the current commit — every "not
built" claim above was verified by searching the actual source, not assumed.*
