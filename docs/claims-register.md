# Claims register

Status: for client review
Date: 15 October 2026
Scope: every page on neuroatlas.in, including all FAQ answers and the text inside the app-screen mockups

No beta efficacy data has been confirmed. The rule for launch: **any claim about performance or health outcomes needs a source that exists, or it comes off the page.** The copy is client-approved, so nothing has been changed yet. Mark a decision against each row and the site will be updated to match.

Decision options: **Keep** (source exists or it's a feature description), **Source** (keep once a source is supplied), **Reword** (client supplies new copy), **Remove**.

## High risk: outcome or "first" claims with no source

| # | Page | Claim (exact copy) | Why it's a problem |
|---|---|---|---|
| 1 | `/` (H1, page title, share image, alt text) | "The First Stress Management Band" | "First" is a factual claim. Other wearables already market stress features. Indian advertising rules (ASCI) require proof for superlatives like "first". |
| 2 | `/band` (H1) | "The First Band For Stress" | Same as 1. |
| 3 | `/` | "Other Apps Notice. We Fix It, In Two Minutes." | A specific outcome ("fix it") with a time ("two minutes"). Needs data showing a two-minute session resolves stress. |
| 4 | `/` | "NeuroAtlas gives you something to do about it, and proves it worked, in two minutes." | "Proves it worked" is an efficacy claim. Same data needed as 3. |
| 5 | `/how-it-works` | "By the time you are back at your desk, the numbers show it worked." | Presented as what happens, not what is designed to happen. Implies proven efficacy. |
| 6 | `/inside-the-app` (hero and page description) | "The app reads your data, runs the right reset, and shows you it worked." | Same as 5. Also in the search-result description. |
| 7 | `/band` | "Every reading is checked against your own resting baseline, not a general average, then filtered to separate real stress from caffeine, a workout, or the cold." | A specific accuracy claim about the algorithm. Needs validation data showing it can tell these apart. |
| 8 | `/inside-the-app` (app mockup) | "Walk into your meeting with sharp, structured, evidence-clear thinking." and "This protocol sharpens thinking under time stress." | Performance outcome for one protocol, shown as fact. |

## Medium risk: benefit claims that need softening or a source

| # | Page | Claim (exact copy) | Note |
|---|---|---|---|
| 9 | `/the-science` (hero and page description) | "Every protocol maps to established neuroscience & psychology, not a wellness trend." | "Every" needs each protocol mapped to a source. Three are cited on the page. |
| 10 | `/the-science` | "Behind every NeuroAtlas tool is a body of research." | Same as 9. |
| 11 | `/` | "A screenless band designed to read your stress, quietly and precisely, throughout your day." | "Designed to" helps. "Precisely" implies measured accuracy. |
| 12 | `/how-it-works` | "From signal to action to visible change. NeuroAtlas shows you what works for your system." | Implies a visible change for everyone. |
| 13 | `/for-organisations` | "NeuroAtlas gives leadership measurable insight into how pressure is affecting the organization, helping teams move from reacting to burnout to managing stress earlier." | Organisational outcome. Pilot results would support it. |
| 14 | `/faq` | "…a review that shows the shift." (pilot stages) | Promises a shift before any pilot has reported. |
| 15 | `/how-it-works` (app mockup) | "Your HRV is 45 ms. Below average for a 32-year-old male is 67 to 90 ms." | Reads as a health fact. The range looks high for that age, and the sentence reads oddly ("Below average … is 67 to 90"). Needs a source, or clear labelling as example data. |

## Sourced: keep, with small fixes

| # | Page | Claim | Source on the page | Suggested fix |
|---|---|---|---|---|
| 16 | `/for-organisations` | 40% of employees worldwide experienced a lot of stress the previous day | Gallup, State of the Global Workplace | Add the report year and a link |
| 17 | `/for-organisations` | 22% of employees across 30 countries reported burnout symptoms | McKinsey Health Institute | Add year and link |
| 18 | `/for-organisations` | $1 trillion lost globally each year in productivity due to depression and anxiety | World Health Organization | Add link |
| 19 | `/the-science` | Slow, paced breathing can support parasympathetic activity and increase vagally mediated HRV | Laborde et al. (2022) | Keep. Accurately reflects the cited meta-analysis. |
| 20 | `/the-science` | Supports the brain systems that let you pause before reacting… | Buhle et al. (2014) | Keep. The study is about cognitive reappraisal in general, not NeuroAtlas; the wording respects that. |
| 21 | `/the-science` | Repeated practice helps the brain become more efficient… | Gotink et al. (2016) | Keep, same caveat as 20. |
| 22 | `/` | Stress Age disclaimer: "a wellness estimate, not a diagnosis…" | — | Good practice, keep. |
| 23 | `/inside-the-app` (app mockup) | "Normal for your age is 7 to 9 hours" (sleep) | — | Matches standard adult sleep guidance. Keep. |

## Facts the client must confirm

| # | Page | Statement | Confirm |
|---|---|---|---|
| 24 | `/` | "NeuroAtlas is now live in pilot with corporate teams across India." | How many teams, and whether "across India" is accurate. `/about` says "a corporate pilot programme in India". |
| 25 | `/about` | Founder studied psychology at Durham University | Accurate as written |
| 26 | `/`, `/privacy`, `/for-organisations`, `/faq` | "Organisations only ever see anonymous, group-level trends, never an individual's own results." | Matches how the product and dashboard actually work, and the privacy policy once written |
| 27 | `/faq` | Security details "are covered in our downloadable security overview on the For Organisations page." | **No overview document exists yet.** See the issue below. |

## Related issue: the overview download doesn't work

The "Download The Overview" form on `/for-organisations` doesn't send anything. On submit it shows "Thanks, that is on its way. Check your inbox for the overview." No email is sent, the details aren't saved anywhere, and no overview document exists on the site.

A business buyer who fills it in gets nothing, and their details are lost. This needs fixing before launch: either supply the overview PDF and connect the form to Klaviyo (like the contact form), or remove the form until the document is ready.
