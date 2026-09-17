# The Living Gazette

**A Sri Lankan Government Gazette job-discovery website.**

Build plan · v1.0 · 2026-09-16

---

## 0. The one-line thesis

Government job seekers in Sri Lanka lose opportunities not because vacancies are secret,
but because the *Gazette* is an unsearchable weekly PDF and the closing date is buried on
page 1,842. This product treats every weekly issue as a **published edition** — with a
masthead, an index, and verifiable provenance — and reorganises it around the one thing
that actually matters to an applicant: **the deadline, and whether they qualify.**

We are not building a job board. We are building a *reading room* for the Gazette.

---

## 1. Why the usual job-board layout is the wrong answer

The generic pattern — full-bleed hero, centred search bar, three-column card grid,
checkbox sidebar — fails this domain specifically:

| Generic pattern | Why it breaks here |
|---|---|
| Cards in a grid | A gazette is a *ledger*. Cards waste horizontal space, hide the deadline, and make 200 vacancies unscannable. |
| "Newest first" | Newest is irrelevant. A vacancy posted 3 weeks ago closing tomorrow outranks today's posting closing in 40 days. |
| Blue / purple SaaS palette | Carries zero institutional authority. Users must trust this is faithful to an official document. |
| Latin-only type scale | Sinhala and Tamil break a Latin-tuned scale — ascender/descender depth and required leading are different. |
| Free-text search as the primary verb | Users don't know the post names. They know *"I have A/Ls and I'm 24 in Kurunegala."* |

**The distinctive move:** borrow the visual grammar of the printed Gazette — masthead,
hairline double rules, serial numbers, dotted leaders, the embossed seal, the overprinted
stamp — and execute it with modern digital craft. Familiar to the audience, unlike
anything else on the web.

### 1.1 Checked against the incumbent — gazette.lk (2026-09-16)

`gazette.lk/government-jobs` is what Sri Lankan job-seekers actually use today: a
WordPress blog aggregator with a huge archive (pagination runs to **1,108 pages**).
Fetched and analysed it directly rather than assuming. Findings:

**Confirms our bets, unchanged:**
- Listing cards show only a title, a *publish* date and a thumbnail — never a *closing*
  date. Users click into every post to find out if it's too late. Deadline-first isn't a
  theoretical differentiator here, it's a real, checkable gap in the market leader.
- English only, despite the audience. No eligibility tooling, no PDF-linked provenance,
  byline is a generic "Editor." Our trilingual commitment, Eligibility Matcher, and
  seal/provenance motifs are real advantages against a weak incumbent, not gold-plating.

**Real gap this exposed — fixed 2026-09-16:**
- Their primary nav is literally organised by **job category** — "Teaching Jobs,"
  "Police Jobs," "Management Assistant Jobs," "SriLankan Airlines Jobs." That's evidently
  how real users think about this space, and we had no equivalent facet — only
  Qualification and District. Our `VacancyPostCard.tag` field was also conflating
  institution-division ("Distribution Division") with category, which isn't the same
  axis. Added a proper `category` facet to the search station and split it from the
  existing division/scope tag on each post.
- No visible alert CTA anywhere in the spike, despite Phase 5 (§8) already concluding
  WhatsApp beats email in this market — confirmed by the incumbent pushing a WhatsApp
  channel prominently. Added a visible CTA; still needs a real integration in Phase 5.

**Architecture reminder, not a UI change:** 1,108 pages of archive is the real scale this
product competes at. Phase 3's Typesense search and the Issue Archive aren't nice-to-haves
— treat them as load-bearing from the start, not backfilled later.

**Noted, not committed:** the incumbent bundles ~14 utility calculators (age, BMI, loan,
tax, salary) alongside listings — plausibly a return-traffic driver. An age-eligibility
calculator overlaps what the Eligibility Matcher already does; the rest are out of scope
per §10 ("no scope creep into a full ATS/portal"). Revisit only if retention data says so.

---

## 2. Design language: Material 3, editorially reskinned

*Superseded 2026-09-16.* The original "Official Paper" palette below (§2.1, struck
through in spirit if not in markdown) was hand-invented for the Phase 0 spike before any
reference existed. The user then supplied a reference build (`example.html`) using a real
Material 3 token export and asked to adopt its actual UI design, not just its content
shape. Decision: **the M3 token set from that reference is now the system of record** —
we stopped inventing colours and started reading them off the export. The gazette-native
motifs (seal ring, dotted leader, closed ribbon, serial numbers, trilingual type) survive
as an accent layer on top, remapped onto M3 roles rather than a separate palette. See the
"Two pivots" note at the end of §2.6 for the full decision trail.

Every token below goes into Tailwind v4's CSS-first `@theme` as CSS custom properties
(kept as `var()` references, not literals, so light/dark is a single attribute flip).
shadcn/ui components are installed then **re-skinned against these tokens** — we never
ship default shadcn styling.

### 2.1 Colour

Material 3 roles, values taken directly from the reference export. Semantic reuse instead
of inventing new colours: `error` = closing within 48h, `secondary` = closing this week,
`primary` = everything with real runway, `on-surface-variant` = closed/expired. This is
the *only* functional colour in the system — everything else is neutral surface/on-surface.

```css
:root {
  --surface-container-low: #f5f3f0;  --surface-bright: #fbf9f6;
  --background: #fbf9f6;              --surface: #fbf9f6;
  --on-surface: #1b1c1a;              --on-background: #1b1c1a;
  --surface-container-highest: #e4e2df; --surface-container-high: #eae8e5;
  --surface-variant: #e4e2df;         --outline: #707977; --outline-variant: #bfc8c6;
  --on-surface-variant: #3f4947;

  --secondary: #9f4112;               --on-secondary: #ffffff;      /* closing this week */
  --secondary-container: #fe8855;     --on-secondary-container: #6f2600;

  --primary: #003733;                 --on-primary: #ffffff;        /* open, verified, CTA */
  --primary-container: #0b4f4a;       --on-primary-container: #84bfb8;

  --tertiary: #1e3147;                --on-tertiary: #ffffff;       /* category/institution tags */
  --tertiary-container: #35475f;

  --error: #ba1a1a;                   --on-error: #ffffff;          /* closing <48h */
  --error-container: #ffdad6;         --on-error-container: #93000a;

  --surface-container-lowest: #ffffff; --surface-container: #efeeeb; --surface-dim: #dbdad7;
}

/* Dark — built from the export's own fixed/inverse roles (inverse-primary,
   secondary-fixed-dim, etc.), not invented from scratch */
[data-theme="dark"] {
  --surface-container-low: #202220; --background: #1b1c1a; --surface: #1b1c1a;
  --on-surface: #e4e2df;            --outline: #8b948f; --on-surface-variant: #bfc8c6;
  --secondary: #ffb598;             --on-secondary: #7e2c00;
  --primary: #96d2cb;               --on-primary: #00201d; --primary-container: #0c4f4a;
  --tertiary: #b5c8e4;              --on-tertiary: #081c32;
  --error: #ffb4ab;                 --on-error: #690005;
}
```

**Rules of use**
- No custom hex outside this token set. If a new UI need arises, map it to an existing
  M3 role before reaching for a new colour.
- Deadline colour (`error` / `secondary` / `primary` / neutral) is the only colour that
  carries meaning; institution tags use `tertiary` as pure categorisation, not urgency.
- Contrast floor: 4.5:1 for body, 3:1 for large display and non-text UI boundaries.

### 2.2 Typography

Three scripts, one voice. Latin pairing (Newsreader/Public Sans) is inherited from the
reference; the Sinhala/Tamil pairing and the monospace role for tabular data are additions
— the reference didn't address either, and both are load-bearing for this product.

| Role | Latin | සිංහල | தமிழ் |
|---|---|---|---|
| Display / masthead | Newsreader (variable, optical size) | Noto Serif Sinhala | Noto Serif Tamil |
| UI / body | Public Sans | Noto Sans Sinhala | Noto Sans Tamil |
| Codes, gazette refs, dates | JetBrains Mono (tabular figures) — *addition, not in the reference* | — (numerals stay Latin) | — |

**Scale** — editorial, not app-generic:

| Token | Size / leading / tracking |
|---|---|
| `masthead` | `clamp(2.5rem, 6vw, 4.5rem)` / 0.95 / −0.02em |
| `h1` | 2.75rem / 1.1 / −0.015em |
| `h2` | 2rem / 1.2 / −0.01em |
| `h3` | 1.5rem / 1.3 |
| `body` | 1rem / **1.6** |
| `body-indic` | 1.0625rem / **1.8** |
| `meta` | 0.875rem / 1.5 |
| `eyebrow` | 0.75rem / 1 / **+0.09em**, uppercase |

**Non-negotiables**
- Indic body leading is 1.8, not 1.6. Set via `:lang(si), :lang(ta)`.
- `font-variant-numeric: tabular-nums` on every date, countdown, salary and gazette number.
- Measure capped at `68ch` for prose, `52ch` for Sinhala (denser glyphs).
- **Load one script's fonts per locale.** Shipping all three is ~700 KB. Subset per route.

### 2.3 Space & grid

4 px base; editorial rhythm on 8. Section rhythm `96 / 64 / 40`. Generous is the point —
the printed Gazette is cramped, and relief from that *is* the value proposition.

- Ledger page: 12-col, `max-w-[1320px]`, 32 px gutters. `280px` index rail + fluid ledger.
- Detail page: asymmetric `2fr / 1fr` — reading column + sticky application rail.
- Mobile: single column, index rail collapses into a bottom sheet (not a hamburger drawer).

### 2.4 Motifs — the signature layer

1. **Double rule** — 1 px / 3 px gap / 2 px under mastheads. Straight from official print.
2. **Dotted leader** — `border-bottom: 1px dotted` filler connecting post title → closing
   date, exactly like a table of contents. This is the single most recognisable element.
3. **Embossed seal** — inline SVG circular seal, subtle inner shadow, marks
   *"Verified against Gazette"*.
4. **CLOSED overprint** — expired listings get a rotated, slightly distressed stamp at
   ~8% opacity across the row. Content stays legible and selectable.
5. **Serial numbering** — every ledger row carries a mono gold serial (`№ 0147`).
6. **Perforated edge** — a 4 px repeating-radial-gradient tear line separating issues.

### 2.5 Interaction

Paper physics, not app bounce. `180ms`/`--ease-paper` default; `prefers-reduced-motion`
respected globally.

- **Ledger row hover** — row lifts 1 px, rule darkens to `rule-strong`, leader dots fade in.
- **Clip to file** — the save action animates a paper clip onto the row's top-left corner.
- **Countdown** — a thin arc, not a ticking number. Calm. Re-renders once a minute, not 1 Hz.
- **Command palette** (`⌘K` / `Ctrl+K`) — jump to institution, district, issue number.
- **Focus ring** — 2 px seal-coloured, 2 px offset. Visible on paper *and* in dark mode.

---

## 2.6 Two densities, one system

*Update 2026-09-16, after reviewing a reference build with richer per-listing content.*

The Phase 0 spike originally rendered every vacancy as a thin ledger row everywhere. That
undersold the actual content — a gazette notice has a description, an age/quota/salary fact
grid, a qualification clause, sometimes an exam syllabus. Reducing all of that to one line
made the product read as an index, not a place to actually read job posts. Fixed by running
**two densities of the same design language**, not two designs:

- **`VacancyLedgerRow`** (compact) — serial, title, dotted leader, closing date, arc, chip.
  Used where the job is scanning many at once with deadline as the only variable that
  matters: the Deadline Board, the Issue Archive, search-result overflow.
- **`VacancyPostCard`** (full) — the default unit on `/vacancies`. Metadata stamp row →
  title/institution → description → fact grid (age · quota · salary · gazette page) →
  qualification callout → action strip (view detail, view PDF, clip, eligibility chip).
  This is the actual job post. It gets the reading treatment: measure, leading, hairline
  dividers — same tokens as the row, just given room to hold real content.

Both stay off the generic SaaS card: warm paper surfaces, hairline `--rule` borders (not
drop shadows), mono/tabular figures for every number, gold accents never used as a fill.
No stock photography on posts — an illustrative "office" photo on a government notice reads
as decoration, not information, and it's the first thing that would make this look like
every other listings site. If we want a visual anchor per post later, it should be
information-bearing (a page thumbnail from the actual Gazette PDF), not stock imagery.

**`InspectorRail`** — a right-hand column on `/vacancies` (desktop only; stacks below the
feed under `xl`), four cards: `PhysicalDocumentCard` (mini masthead + trilingual PDF
downloads), `EligibilityCompassCard` (the user's live match against the current feed),
`DeadlineTimelineCard` (next 3 closings), `SourceTrustCard` (provenance + integrity note).
Sits beside `IndexRail` on the left — filters index the collection, the inspector orients
the reader within it.

**Two pivots, 2026-09-16.** In order: (1) the Phase 0 spike started as pure ledger rows;
a reference build showed richer per-listing content (description, fact grid, qualification
clause) was needed for this to read as actual job posts, not just an index — resolved by
keeping the row for the Deadline Board/archive and introducing `VacancyPostCard` as the
default on `/vacancies`. (2) That same reference turned out to carry a real Material 3
token export, and the user asked to adopt its actual UI design rather than just its
content shape — resolved by retiring the invented "Official Paper" palette (§2.1) in
favour of the reference's tokens, remapping our gazette motifs (seal, dotted leader,
closed ribbon, serial numbers) onto M3 roles instead of a separate colour system. The
content-density decision from pivot 1 still holds; only the visual token layer changed.
IndexRail as a left vertical rail was also dropped in favour of a horizontal facet bar
above the feed, matching the reference's actual filter layout — filters and the discovery
grid are now one unit rather than a persistent sidebar.

---

## 3. Product: what makes it worth using

Ranked by leverage. Items 1–3 are the reason someone returns.

1. **Deadline-first architecture.** The default sort, the default view, the primary colour
   semantic. `/deadlines` is a board: *Closing in 48h · This week · This month · Open*.
2. **Eligibility Matcher.** The user sets a profile once — highest qualification (O/L, A/L,
   NVQ 3–6, Diploma, Degree), date of birth, district, exam language, service history.
   Every listing then carries a verdict chip: **Qualifies** / **Check** / **Not eligible —
   age limit 18–30**. Pure deterministic rules over structured fields. No ML. No guessing.
3. **Provenance on every field.** A mono line on every listing:
   `Gazette No. 2,412 · 12 Sep 2026 · Part I : Sec (IIa) · p. 1842 ↗`
   deep-linked to the page anchor in the original PDF. Job-scam misinformation is endemic;
   verifiability is the trust moat.
4. **True trilingual parity.** `/si`, `/ta`, `/en` as first-class routes with `hreflang`.
   Where the official text exists in only one language, say so explicitly rather than
   machine-translating a legal notice.
5. **Application Kit.** Per vacancy: document checklist, whether *Registered Post* is
   required, the exact postal address, the application fee and bank account for the deposit
   slip, and the downloadable form — all as a printable one-pager.
6. **Salary Decoder.** Translate the salary code (e.g. `MN-1-2016`) into an actual rupee
   scale with initial step and annual increment.
7. **Alerts that fit the market.** Weekly *New Issue* digest every Friday, plus a T-3-day
   deadline nudge. WhatsApp and SMS before email — that's the local reality.
8. **Low-bandwidth by default.** PWA, offline-readable clipped vacancies, < 120 KB initial
   JS. Must be usable on a mid-range Android on 3G.
9. **Issue Archive.** Browse by issue like a bound newspaper volume, not an infinite feed.

---

## 4. Signature component inventory

Built on shadcn/ui primitives (Dialog, Popover, Command, Sheet, Select, Tabs, Sonner) but
re-skinned. Components marked ★ are custom and carry the design language.

| Component | Notes |
|---|---|
| ★ `GazetteMasthead` | Issue no., trilingual date, vacancy count, double rule. |
| ★ `VacancyPostCard` | **The default unit on `/vacancies`.** Full job post: stamp row · title/institution · description · fact grid · qualification callout · action strip. See §2.6. |
| ★ `VacancyLedgerRow` | Compact variant — serial · title · dotted leader · closing date · arc · chip. Deadline Board and archive contexts only. |
| ★ `DeadlineArc` | Thin SVG arc + tabular days-remaining. Colour from deadline semantics. |
| ★ `EligibilityChip` | Verdict + reason on hover/press. Three states only. |
| ★ `SealBadge` | Embossed verification seal, inline SVG, textPath ring. |
| ★ `ClosedStamp` / `ClosedRibbon` | Overprint for an expired row; corner ribbon for a post card. `aria-hidden`, real text elsewhere. |
| ★ `ProvenanceLine` | Mono source reference → PDF page anchor. |
| ★ `LanguageTrio` | `සි │ த │ EN` segmented control, native scripts, persists to cookie. |
| ★ `IndexRail` | Filters typeset as a document index: label · dotted leader · count. |
| ★ `InspectorRail` | Right column on `/vacancies`: `PhysicalDocumentCard`, `EligibilityCompassCard`, `DeadlineTimelineCard`, `SourceTrustCard`. See §2.6. |
| ★ `ApplicationKit` | Checklist with paper-clip motif; print stylesheet included. |
| ★ `SalaryScaleTable` | Decoded salary steps. |
| ★ `IssueSpine` | Horizontal archive of issues rendered as bound volume spines. |
| `FilterSheet` | shadcn Sheet, bottom-anchored on mobile. |
| `CommandPalette` | shadcn Command, trilingual index. |
| `EmptyState` | "No vacancies match" — with the filter that's excluding everything called out. |

**Component discipline:** every one ships with (a) all states — default/hover/focus/
disabled/loading/empty/error, (b) light + dark, (c) all three scripts, (d) a Storybook
story. A component is not done until it has been seen in Sinhala.

---

## 5. Routes

```
/[lang]                     This Week's Issue — masthead, deadline board, new-this-week ledger
/[lang]/vacancies           Full ledger · IndexRail filters · URL-driven state
/[lang]/vacancies/[slug]    Detail — provenance, eligibility, kit, salary, timeline
/[lang]/deadlines           Deadline board
/[lang]/issues              Archive spine index
/[lang]/issues/[number]     A single issue, reproduced as an edition
/[lang]/institutions/[slug] All vacancies from one ministry/department
/[lang]/exams               Exam & admission-card tracker
/[lang]/me                  Profile, eligibility settings, clipped file, alerts
/[lang]/about               Sources, methodology, disclaimer
```

All filter state lives in the URL (`?closing=7d&qual=al&district=kurunegala`) so results
are shareable — people forward these on WhatsApp.

---

## 6. Data model (sketch)

```ts
Issue        { id, number, publishedOn, part, section, pdfUrl, language[] }
Institution  { id, slug, nameEn, nameSi, nameTa, type, parentId }
Vacancy      { id, slug, issueId?, institutionId, serial,
               titleEn|Si|Ta, postCount, salaryCode, salaryMin, salaryMax,
               closingDate, closingTime, ageMin, ageMax, ageAsOfDate,
               qualifications: Qualification[], districts: string[],
               examType: 'open'|'limited'|'departmental'|'none',
               applicationMode: 'post'|'online'|'both', registeredPostRequired,
               applicationFee, feeAccount, formUrl, employmentTerm: 'permanent'|'contract',
               citationType: 'gazette'|'circular', citationRef, citationUrl,
               languagePrecedence?: 'si'|'ta'|'en',
               sourcePage, verifiedBy, verifiedAt, confidence }
/* issueId is now optional — §11.1 found a real posting (a foreign-aided project
   appointment) that cites a Ministry circular, not a gazette issue, at all. citationType/
   citationRef/citationUrl generalise ProvenanceLine to both cases. */
Qualification { kind: 'ol'|'al'|'nvq'|'diploma'|'degree'|'professional',
                detail, subjects[], minGrade, required: boolean }
UserProfile  { highestQualification, dob, district, examLanguage, serviceStatus }
Clip         { userId, vacancyId, clippedAt, note }
```

`closingDate` is safety-critical. It is **never** published without human verification.

---

## 7. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15, App Router, RSC | Ledger pages are read-heavy and cacheable; ship near-zero JS. |
| Language | TypeScript, strict | — |
| Styling | Tailwind CSS v4 (`@theme`) | CSS-first tokens, no JS config drift. |
| Components | shadcn/ui, re-skinned | Own the code, accessible primitives, no theme lock-in. |
| i18n | `next-intl` | Locale-segmented routes, ICU plurals. |
| Data | Postgres + Drizzle | Relational by nature; clean migrations. |
| Search | Typesense | Postgres FTS handles Sinhala/Tamil tokenisation poorly. |
| Ingestion | Python — `pdfplumber` → Tesseract (`sin`, `tam`) → LLM structuring → **review queue** | Scanned PDFs; OCR alone is not trustworthy. |
| Hosting | Vercel + managed Postgres | Friday traffic spikes need elastic edge caching. |
| Testing | Vitest · Playwright · axe-core · Storybook | — |

### 7.1 Ingestion pipeline — the actual plan

*Written 2026-09-16, after pulling one real vacancy end-to-end (§11.1).* The ingestion
worker is a **separate Python service, not part of the Next.js app** — it runs on a
schedule (Friday), and OCR/LLM calls are too slow for a serverless request/response cycle.
It's a background job, not an API route.

1. **Fetch** — `documents.gov.lk` is a confirmed JS-rendered SPA (plain fetches return
   placeholder markup, verified directly, not assumed). The fetcher needs a headless
   browser (Playwright), not an HTTP client. `gazette.lk`'s mirror is easier to scrape and
   republished the same real PDF we pulled — usable as a discovery aid, but the gazette
   itself should still be cited as the source wherever it carries the notice.
2. **Classify text-layer vs. scanned, per PDF.** Try `pdfplumber` extraction first; near-
   zero character density per page means it's a scan → Tesseract (`sin`+`tam`) fallback.
   One real PDF extracted clean with no OCR needed (§11.1) — one data point, not a
   guarantee across institutions; needs checking across a spread before sizing the OCR
   workload for real.
3. **Structure with an LLM, not regex/templates.** Two real postings pulled from the same
   fetch (Management Assistant, Driver) already used a structure nothing like a standard
   cadre notice — free-form prose and an ad-hoc table, institution-specific. A
   template-per-institution approach breaks on the second institution. Prompt built from
   the exact `Vacancy` schema (§6); model returns structured JSON with a **confidence
   score per field** (the schema's `confidence` field exists for exactly this).
   **Runs on a free-tier model via OpenRouter** (`nvidia/nemotron-3-ultra-550b-a55b:free`
   as of 2026-09-17 — verified real, 1M context, 50 req/day unfunded / 20 req/min, well
   above what a weekly batch of a few dozen postings needs), not a paid API — chosen
   specifically because there's no budget for one. Free-tier models get rotated out by
   providers with little notice, so the model ID is a one-line env var
   (`scripts/ingest.py`), not hardcoded into the prompting logic.
4. **Human review — the non-negotiable gate.** Every record lands in an admin queue next
   to an embedded view of the source PDF. Nothing gets a public `verifiedAt` until a human
   sets it. Same rule §9 already states for `closingDate`: a wrong date costs someone a
   real application.
5. **Publish** → sync to Typesense → fire the Friday digest / T-3-day alerts for anything
   newly live or closing soon.
6. **De-dupe on re-fetch.** Hash the source PDF per `Vacancy`; re-running the weekly job
   updates an existing record (visible revision history) instead of creating a duplicate
   when an institution issues a genuine amendment (deadline extension, correction).

**Two real gates before any of this gets built, not busywork:**
- Nobody has opened `documents.gov.lk` in an actual browser session and mapped its real
  PDF link structure — everything known about it so far comes from failed automated
  fetches. Enough to know it's a SPA, not enough to build a scraper against.
- The reuse/licensing question (§11, item 6) is still open. Building a scraper before
  knowing if that's permitted is backwards.

---

## 8. Phases

**Phase 0 — Design language spike** *(current: `main.html`)*
Single static page, Tailwind CDN. Three screens at full fidelity: This Week's Issue, the
ledger with IndexRail, one vacancy detail. Rendered in all three scripts, light and dark.
*Exit:* the ledger row, masthead and seal look unmistakably like a gazette. Nothing else
starts until this is signed off.

**Phase 1 — Foundation**
Next.js scaffold · `@theme` tokens · font subsetting per locale · `next-intl` routing ·
shadcn installed and re-skinned · Storybook · dark mode.

**Phase 2 — Data**
Schema + migrations · seed 3 real issues **by hand** (this teaches the domain faster than
any spec) · admin review queue · only then the OCR pipeline.

**Phase 3 — Discovery**
Ledger + IndexRail + URL state · Typesense trilingual search · detail page with
`ProvenanceLine` · deadline board · issue archive.

**Phase 4 — Personal**
Profile · Eligibility Matcher rules engine + rule unit tests · clip-to-file · `/me`.

**Phase 5 — Reach**
Friday digest + T-3 deadline alerts · WhatsApp/SMS channel · PWA + offline clips ·
Application Kit print stylesheet.

**Phase 6 — Depth**
Salary Decoder · exam tracker · institution pages · command palette.

**Phase 7 — Hardening**
Trilingual copy QA by native readers · a11y audit · perf budget enforcement in CI ·
load test a Friday spike · legal/disclaimer review.

---

## 9. Quality bars (enforced in CI, not aspirational)

**Performance** — LCP < 2.0 s on mid-tier Android / 4G · initial JS < 120 KB gzip ·
CLS < 0.05 · INP < 200 ms · per-locale font payload < 180 KB.

**Accessibility** — WCAG 2.2 AA. Plus, specific to this audience: 44 px touch targets ·
usable at 200 % zoom · correct `lang` on every localised block · visible focus everywhere ·
zero axe violations · full keyboard path through filter → ledger → detail → apply.

**Correctness** — no vacancy renders a closing date that hasn't been human-verified.
Unverified records show a visible "pending verification" state or don't render at all.

---

## 10. Risks & mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| OCR accuracy on scanned Sinhala/Tamil | **High** | Human-in-the-loop review queue; confidence score per field; never auto-publish. |
| A wrong closing date causes real harm | **High** | Verification gate + provenance link + "verify against the official Gazette" notice on every detail page. |
| Perceived as impersonating a government site | **High** | Distinct name and identity; persistent unofficial-aggregator disclaimer; no `.gov.lk` styling, no national emblem. |
| Gazette source URL/format changes | Medium | Ingestion adapter layer; monitoring alert if Friday's fetch returns nothing. |
| Friday traffic spike | Medium | Static-render issue pages, ISR, edge cache; load test before launch. |
| Trilingual copy drifting out of sync | Medium | Translation keys in one file per locale; CI fails on missing keys. |
| Scope creep into a full ATS | Medium | Out of scope for v1: applying through the site, employer accounts, private-sector jobs, CV builder. |

---

## 11. Where the data actually comes from

*Researched 2026-09-16 — replaces the "assumed" placeholders from the original draft.*

**The canonical source is `documents.gov.lk`**, run by the Department of Government
Printing (same body that's printed the Gazette continuously since 1802). It hosts
Gazettes from 2004–present, Extra-Gazettes from 2010–present, plus Acts and Bills, in
English/Sinhala/Tamil. `gazette.lk` (the incumbent analysed in §1.1) is almost certainly
re-publishing from this source, not an independent one — there is no other credible
origin for this content.

Fetched `documents.gov.lk` directly rather than guessing. Findings against the seven
original assumptions:

1. **Cadence/host — confirmed.** Weekly, Friday. Host is `documents.gov.lk`.
2. **Part/Section for vacancies — confirmed.** The gazette has 6 numbered Parts; Part I
   splits into sub-sections I / IIA / IIB / III, and IIA is labelled **"Advertising,"**
   matching our Part I : Sec (IIA) assumption exactly.
3. **Trilingual simultaneity — still open.** Not resolved by this pass.
4. **Text-layer vs. scanned PDFs — partially confirmed, real evidence not just a page
   fetch.** Pulled one real institutional vacancy PDF (Ministry of Transport, Highways
   and Urban Development, via `gazette.lk`'s mirror) and it extracted as clean, structured
   text — no OCR needed for this document. That's one data point, not a guarantee every
   ministry's PDFs are text-layer, but it's real evidence the problem may be smaller than
   assumed for at least some sources. Still needs checking across a spread of institutions
   before betting the ingestion pipeline design on it.
5. **Salary-code scheme — still open**, though the real PDF showed a format we hadn't
   modelled: `48,750-2x540` (initial step, then step increments) cited against a
   **circular number** (MSD Circular 02/2026), not always the `MN-x-2016`-style code our
   sample data used. The scheme isn't one fixed table — it's whatever the applicable
   service/management circular says, and circulars get superseded. The `SalaryScaleTable`
   component needs to resolve "which circular applies," not just decode a fixed code.
6. **Licensing/reuse — a real concern, not just a checklist item.** The site's footer
   reads only `© 2025 All Right Reserved.` No stated reuse license, no API, no RSS, no
   documented structured-data access. Government gazettes are usually treated as public
   record content and republished by aggregators like gazette.lk in practice, but there's
   no explicit permission on the source itself. **Flag this to whoever owns the legal call
   before ingestion is built** — it's a real decision, not something to default past.
7. **Stable page anchors — still open**, and lower priority than #4 and #6.

**Immediate next step, revised:** before Phase 2 (Data) starts, do one manual pass —
download a single real gazette issue from `documents.gov.lk`, confirm the vacancy section,
check whether it has a text layer, and get a plain answer on reuse terms. That closes
#3, #5 and #7 in under a day and de-risks the entire ingestion pipeline design.

### 11.1 What one real vacancy proved — schema gaps

*2026-09-16.* Pulled two real posts (Management Assistant, Driver — Ministry of
Transport, Highways and Urban Development, `MSD Circular 02/2026`, closing 24.09.2026)
into `main.html`, clearly marked with a "Real listing" badge so they're not confused with
the fabricated samples. Three things the schema in §6 didn't anticipate, found by trying
to actually map real text onto it rather than by inspection:

- **Not every notice cites a gazette number.** This one cites a Management Services
  Circular instead. `Vacancy.sourcePage` / the `ProvenanceLine` component need to handle
  "cites a circular" as a first-class alternative to "cites a gazette page," not a
  fallback edge case.
- **Appointment terms vary** (contract vs. permanent-and-pensionable) and **age bands
  vary far more than the young-cadre assumption baked into the sample data** — this post
  allows up to 64 for non-government applicants, because it's a foreign-aided project
  contract role, not a standard cadre appointment. `Vacancy.ageMin/ageMax` needs to stay
  genuinely per-post, not deviate-from-a-default.
- **A real, specific trilingual-precedence clause exists**, verbatim: *"If there is any
  incompliance between the language phrases of this advertisement published in the
  Sinhala, Tamil & English medium, facts in the Sinhala medium advertisement shall
  prevail."* This is more specific than what §2.2 currently says about missing
  translations. Worth surfacing on the detail page itself (near `ProvenanceLine`), not
  just handling silently in the data layer — it's a real legal fact the applicant should
  see, not an implementation detail.

### 11.2 How gazette.lk actually sources content — a bigger finding than expected

*2026-09-16.* Checked this directly rather than assuming "they probably scrape the
gazette too." They don't. gazette.lk runs on WordPress (`Magazine Plus by WEN Themes`
theme, confirmed via footer credit and `wp-content` URLs), and every post carries an
explicit `Source:` line. Checked two: the MFAP posting says **"Source: transport.gov.lk"**
(the ministry's own site); the Institute of Allergology posting says **"Source: Official
Website"** (the institute's own site). Neither cites `documents.gov.lk` or a gazette
number. Author on both: generic **"Editor."**

**Reading this correctly:** gazette.lk is a human manually visiting individual
ministry/department/institution websites and hand-posting whatever recruitment notices
they find, PDF re-upload included — not an automated Gazette-PDF pipeline despite the
name. That explains the thin listing cards (no time to hand-transcribe every field), the
1,108-page archive (years of one-by-one manual posts), and why the MFAP notice cited a
circular instead of a gazette page — **it plausibly was never gazetted at all.** Contract
and project-based roles often get posted only on the hiring body's own site; only certain
categories (permanent, PSC-governed cadre appointments, mainly) reliably go through Part I
Section IIA.

**This changes §7.1's ingestion plan, not just the source list.** `documents.gov.lk` alone
is not sufficient — it's the authoritative record *when* a notice is gazetted, but a real
share of what people search for as "government jobs" never reaches the Gazette at all.
The pipeline needs two source classes, not one:
1. **The Gazette itself** (`documents.gov.lk`) — authoritative provenance, cite as
   `citationType: 'gazette'`, use for the trust/verification story.
2. **Institution websites** — no fixed list; this is a discovery problem (crawl/monitor a
   growing registry of ministry/department/statutory-board sites), not a single scraper.
   Cite as `citationType: 'circular'` or a new `'institution'` type, with the source URL
   always shown — same honesty gazette.lk already practises with its `Source:` line, worth
   keeping regardless of what we build.

**Also worth naming as a decision, not resolving unilaterally here:** the product is
branded "The Living Gazette," built around the *gazette-as-published-edition* concept
(§0–§2). If a meaningful share of real content never goes through the Gazette, that's a
positioning question for whoever owns this project — either the name/framing narrows to
match what's actually gazetted (a smaller, cleaner, more defensible trust claim), or the
product knowingly broadens past its own name (more coverage, weaker claim to "this is the
Gazette, digitised"). Worth a deliberate call before Phase 2 ingestion scope is locked,
not something to drift into.

### 11.3 documents.gov.lk cracked — gate #1 from §7.1 is resolved

*2026-09-17.* A separate, independently-built implementation of this same product idea
(a Google AI Studio app, found sitting in a sibling folder — see the project memory for
how it was discovered) included an Express server that fetched `documents.gov.lk`
server-side. Rather than trust the code, it was run and tested directly:

- `curl https://documents.gov.lk/web/Gazette?date=2026-09-11` returns raw HTML that
  **does** contain plain, regex-matchable `gazette-content/....pdf` filenames — 21 of
  them for that date, across every Part/Section, in all three languages. No headless
  browser, no cookies, no auth. The earlier "confirmed JS SPA" finding (§7.1) was correct
  about what a *browser* renders, but irrelevant to what a plain HTTP GET returns — the
  raw payload already carries the file list before any client-side rendering happens.
- `https://documents.gov.lk/api/content-file-proxy?file=<path>` serves the actual PDF
  bytes directly, publicly, no auth. Downloaded the real Part I : Sec (IIA) English PDF
  for 11.09.2026 this way — 872KB, 79 pages, genuine current Gazette No. 2,506.
- **Confirmed genuinely real**, not a mockup: extracted 237,206 characters of clean text
  via `pdfplumber` with `pdfplumber` alone (no OCR). Real notices inside — e.g. Merchant
  Shipping Secretariat, Ministry of Ports and Civil Aviation: Port State Controller,
  Examiner (Engineering), Legal Officer, full salary scale (`SL 1-2025`), age limits,
  structured-interview marking scheme, submission address, closing date 12.10.2026.
- **New nuance: "text vs. scanned" isn't the real distinction — it's per-language even
  within one text-layer PDF.** English extracted perfectly. The Sinhala running text on
  the same pages came out as mojibake (`Y %S ,xld mc% d;dk;a...`) — a legacy non-Unicode
  Sinhala font (common in older Sri Lankan print/typesetting workflows), not a scan.
  Extracting Sinhala content from these PDFs will need either OCR specifically for the
  Sinhala-language edition PDFs, or a glyph-remap table for the specific legacy font(s)
  in use — a different problem than #4 in §7.1, not solved by this finding.
- **Confirmed the "one notice, several posts" pattern is common**, not a one-off — the
  Merchant Shipping Secretariat notice alone had three posts bundled together, same
  pattern as the MFAP notice in §11.1.

**This is now implemented for real in `scripts/ingest.py`**, not just documented:
`fetch_gazette_iia_pdf_urls()` (the proven regex, generalised to compute "most recent
Friday" rather than depending on a fragile date-discovery endpoint — the AI Studio app's
own attempt at that specific endpoint failed and silently fell back to hardcoded dates,
which is itself worth knowing) and `ingest_from_documents_gov_lk()`, which chunks a full
edition's text and asks the LLM to return an *array* of posts per chunk (not one call per
notice — a 79-page issue would blow through OpenRouter's free daily request cap
otherwise). This now runs as **Pass 1 (authoritative)** in the ingestion script, with the
existing gazette.lk discovery index demoted to Pass 2, exactly matching the two-source-
class design from §11.2.

---

## 12. Definition of done for v1

A job seeker on a mid-range Android phone, on mobile data, reading Sinhala, can — within
60 seconds of landing — see every vacancy closing this week that they personally qualify
for, understand exactly what to post and where, and verify it against the original Gazette
page. And the page looks like it was typeset, not assembled.

---

### Immediate next step

Build the Phase 0 spike in `main.html`: masthead, ledger with dotted leaders and serials,
one detail view. Sinhala and English side by side. Sign off the design language before a
single Next.js file exists.
