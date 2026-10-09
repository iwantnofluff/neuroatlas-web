# Keyword-to-page map

Status: draft, awaiting India search volumes
Date: 9 October 2026
Data: [keyword-map.csv](keyword-map.csv) (opens in Excel or Google Sheets)

## What this is

Every live page on neuroatlas.in (all 15 in the sitemap) has exactly one primary keyword and one search intent. Each page targets a different keyword, so no two pages compete for the same search.

The keywords are proposals based on what each page actually says. **None has been checked against real search data yet.** The volume, difficulty and cost-per-click columns are empty on purpose. Nothing has been guessed.

## Before sign-off: fill in the volumes

1. In Ahrefs Keywords Explorer or Semrush Keyword Overview, set the country to **India**.
2. Paste in every keyword from the `primary_keyword` and `secondary_keywords` columns (secondary keywords are separated by semicolons).
3. Copy volume, difficulty and CPC (in rupees) into the CSV.
4. For any primary keyword with very low volume in India, swap in the strongest secondary keyword or a better variant the tool suggests, keeping one primary keyword per page.
5. Change `status` from Draft to Approved for each row.

Things to check while doing this:

- **UK or US spelling.** The site uses UK spelling ("organisations", "programme"), but Indian searchers often type US spelling ("organization", "program"). Check both versions of the `/for-organisations` keywords and use whichever has the higher volume.
- **"Stress management band" against "stress tracker".** The homepage and `/band` are split between these two terms. If one has far more searches, give that one to the homepage.

## Intent types used

| Intent | Meaning | Pages |
|---|---|---|
| Commercial investigation | Comparing products before buying | `/`, `/band`, `/inside-the-app`, `/for-organisations` |
| Informational | Wants to learn something | `/how-it-works`, `/the-science`, `/journal`, `/privacy` |
| Transactional | Ready to act | `/pricing`, `/waitlist` |
| Navigational | Looking for NeuroAtlas specifically | `/about`, `/faq`, `/contact`, both legal pages |

## Found while mapping (no copy changed)

All site copy is client-approved, so these are reported, not changed.

1. **Most page titles don't contain their keyword.** Only the homepage title and H1 already include it. Titles like "How it works - NeuroAtlas" and "The science - NeuroAtlas" describe the page but contain no searchable term. Once the keywords are approved, the titles and meta descriptions are the main place to add them. That is a copy decision for the client.
2. **The two legal pages are placeholders.** `/legal/privacy-policy` and `/legal/terms-of-use` have under 30 words each. They need their real text before launch, both for search engines and legally.
3. **The journal is empty.** The test article was removed, so `/journal` has 53 words and no articles. It can't rank for anything until articles go up.
4. **Spelling is mixed on one page.** The `/pricing` description says "organizations" (US spelling), while the rest of the site uses "organisations".

## Sign-off

- [ ] India volumes, difficulty and CPC filled in from Ahrefs or Semrush
- [ ] Low-volume primary keywords replaced
- [ ] UK or US spelling chosen for the organisations page keywords
- [ ] Every row marked Approved
