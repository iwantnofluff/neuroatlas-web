# URL structure

Status: locked for go-live, 9 October 2026

Changing an address after launch loses the links and rankings it has built up, so these rules are fixed. Any later change needs a permanent redirect from the old address.

## Rules

- One host: `https://neuroatlas.in`. Every other hostname redirects to it.
- Lowercase only. A capital letter in a typed or linked address redirects to the lowercase version.
- Words joined by single hyphens. No underscores, spaces or punctuation.
- No trailing slash. `/band/` redirects to `/band`.
- No dates in any address, including articles.
- Query strings such as `?utm_source=` are allowed for tracking, but every page's canonical tag points at the clean address without them.

## Pages

| Page | Address |
|---|---|
| Home | `/` |
| Product | `/band` |
| How it works | `/how-it-works` |
| The app | `/inside-the-app` |
| The science | `/the-science` |
| Organisations | `/for-organisations` |
| Privacy | `/privacy` |
| About | `/about` |
| Pricing | `/pricing` |
| FAQ | `/faq` |
| Contact | `/contact` |
| Waitlist | `/waitlist` |
| Legal | `/legal/privacy-policy`, `/legal/terms-of-use` |

## Articles: /journal, not /blog or /resources

- The journal is the one home for articles: `/journal` lists them, and each article lives at `/journal/<slug>`.
- `/blog`, `/blog/<slug>`, `/resources` and `/resources/<slug>` redirect to the matching journal address.
- Sanity generates the slug from the title, for example "What is NeuroAtlas?" becomes `what-is-neuroatlas`. It drops accents and apostrophes, turns "&" into "and", and keeps it under 80 characters.
- Sanity refuses to publish a slug with capitals, underscores, double hyphens, slashes or a year in it.
- Once an article is published, its slug should not change.

## Redirects in place

| From | To |
|---|---|
| `www.neuroatlas.in`, `neuroatlas.org.uk`, `www.neuroatlas.org.uk`, `neuroatlas-web.vercel.app` | `neuroatlas.in` (same path) |
| Any address with capitals | Its lowercase version |
| Any address with a trailing slash | The same address without it |
| `/blog`, `/resources` (and anything under them) | `/journal` (same slug) |
| `/request-access` | `/waitlist` |
| `/toolkits` | `/inside-the-app` |
| `/lander` | `/` |
