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

**Third pivot, 2026-09-20 — "Official Paper," properly this time.** Installed the
`frontend-design` skill (via `claude-code-templates`), which names the exact defaults our
Material 3 pass had drifted into: middle-dot meta strings, tracked-caps eyebrow labels, a
monospace-for-everything-small habit, `→`-suffixed links, the rounded-card-with-shadow
kit. Rebuilt the palette and layout grounded in what the real Gazette PDF actually looks
like (§11.3/§11.4 research): near-monochrome ink-on-paper, one serif family for display
and body alike, notices as continuous statute entries with real bordered `<table>`s and a
signature block per notice, rather than a card feed. Self-caught and fixed several of the
same flagged tells during implementation (had reintroduced dot-joins and an eyebrow
pattern out of habit) — worth remembering that naming a tell doesn't stop you reaching
for it reflexively; a review pass after building is still necessary.

Also installed `ui-ux-pro-max` (same tool). Its `--design-system` generator pulls from a
generic 97-palette/57-font-pairing database — running it would have undone the
source-grounded work above, so skipped deliberately. Its accessibility/interaction rule
set is genuinely stack-agnostic and complementary, not in tension with a visual identity;
ran it as an audit and fixed real findings: `--ink-faint` failed WCAG AA contrast in both
themes (3.4:1 / 4.4:1 against a 4.5:1 minimum — fixed to ~5.2:1 / ~5.5:1), a paperclip
emoji used as an icon (replaced with text, consistent with the icon-free typographic
system already in place), several buttons missing `cursor-pointer` and adequate touch
padding, body/qualification text under the 16px mobile-readability floor, and checkboxes
with no `<label for>` association for screen readers.

**Follow-up, same day.** Asked directly whether a better design was possible without
relying on installed skills — worth answering honestly: the actual creative content in
the redesign above was mine, grounded in the real PDF research, not generated by either
skill. Used the prompt to do something more useful than debate the question: audited the
current build for mobile responsiveness, which hadn't actually been checked and matters
specifically because job.md's own definition of done names a mid-range Android phone.
No screenshot tool available in this environment, so audited at the code level instead
and found two real risks: `.citation-box` had `white-space: nowrap`, and the fact-tables
crammed 4 cells (two label/value pairs) into one `<tr>` — both fine on desktop, both risky
at 375px. Fixed: citation box now wraps naturally, and every fact-table row is a single
label/value pair, never more, plus an `overflow-x-auto` wrapper on all four tables as a
safety net rather than the primary fix.

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
| Scope creep into a full ATS | Medium | Out of scope for v1: applying through the site, employer accounts, private-sector jobs, CV builder. **Addendum 2026-09-19: private-sector jobs are now being built, but as a genuinely separate pipeline/data file/schema (see §11.5), not folded into this product's scope — the "no scope creep" principle is preserved by keeping them apart, not by refusing to build them at all.** |

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

### 11.4 The AI Studio sample data itself is not trustworthy — verified, not assumed

*2026-09-17.* Having the real PDF already downloaded made it possible to check, not just
assume: cross-referenced the AI Studio app's flagship `isRealGovernmentData: true` sample
(Inspector of Customs, Grade II, `gazettesData.ts`) against PDF page 72 of the same
Gazette No. 2,506 it cites. Institution, ministry, title, gazette number/date, and even
the specific physical-fitness figures (5'5", 33" chest, 5'3") all matched the real text
exactly. But:

- **Closing date claimed `2026-10-02`; the real notice says `12.10.2026`.** Off by ten
  days, on the one field job.md §6 calls safety-critical.
- **Notice number claimed `09-648/1`; the real notice's is `09-99/1`.** Fabricated.
- **Salary claimed Rs. 31,490–67,610 under code `MN-4-2016`, "Circular 03/2016."** The
  real notice states Rs. 49,550–71,420, category "Rs.-1," under **Circular 10/2025** —
  not a rounding difference, a different scale under a different circular entirely.

**Conclusion, stated plainly: `isRealGovernmentData: true` is not a guarantee of
accuracy, and this dataset should never be used as a seed or reference without
re-verifying every field against the source PDF.** The fabricated fields are dangerous
precisely because the real ones (institution, ministry, gazette number) make the whole
record read as trustworthy — this is a sharper, concretely-evidenced version of the exact
risk §9's human-verification rule exists to catch, not a hypothetical anymore. Our own
`data/vacancies.json` entries (§11.1's MFAP posts) remain trustworthy because they were
extracted directly from a source PDF by us, not inherited from another system's output
without re-checking it.

### 11.5 Repo went live on GitHub, and a separate private-sector pipeline was built and proven

*2026-09-19.* Two structural changes, plus real operational findings from actually
running things on GitHub for the first time rather than just locally.

**The repo was pushed to GitHub for the first time**, at
`github.com/GJSanka10/gazettes-reader` — everything before this was local-only. One
consequence worth flagging: `scripts/ingest.py`'s own `.github/workflows/ingest.yml`
Friday cron has therefore **never actually run on GitHub Actions either**, only tested
locally (per §11.3). Verifying that it opens a real PR on this live repo is an open
item, not something to assume still works just because the script itself is proven.

**Removed the unused AI Studio reference prototype** (`new one/sri-lanka-gazette-job-discovery/`,
discovered §11.3–§11.4) — its sample data was already shown untrustworthy and nothing in
the working pipeline depended on it. Still recoverable from git history if ever needed.

**Built a separate private-sector job ingestion pipeline**, resolving the tension flagged
in §11.2 and the exclusion in §10: rather than fold private-sector jobs into this
product's scope, or refuse to build them, they live in a **fully independent pipeline** —
`scripts/private-ingest/` (own `sources.json` source registry, `dedupe.py`,
`ingest_structured.py`, own `data/private-vacancies.json` schema with `sourceType` /
`sector` / `_legalRisk` fields the government schema never needed) and its own
`.github/workflows/private-ingest.yml`. Zero shared code or data with `scripts/ingest.py`
/ `data/vacancies.json`; the two will only meet at final display, later, once there's
enough private-sector volume to justify it.

Real findings from actually building and running this end-to-end (useful for any future
ingestion work on this project, not just the private-sector one):

- **JSON-LD job markup is rare on Sri Lankan company sites.** Checked Seylan Bank
  (postings are scanned JPG images, not even parseable text), Commercial Bank of Ceylon
  (inline plain-text postings, no JSON-LD, Google Form applications), and WSO2 (clean
  detail pages, still no JSON-LD) directly — none had it.
- **What worked: checking by ATS platform, not by company.** IFS, found via its careers
  platform (SmartRecruiters), has real schema.org job data — just encoded as **Microdata**
  (`itemprop=` HTML attributes) rather than a JSON-LD `<script>` block. One parser covering
  a platform's markup format covers every company on that platform, which is a much
  better-leveraged search strategy than checking individual company sites one at a time.
- **A tool-specific trap worth naming: WebFetch cannot see `<script>` tag contents** — it
  converts HTML to markdown before analysis, which strips scripts entirely. A "no JSON-LD
  found" result from WebFetch is unreliable; confirmed this by getting a false negative on
  IFS's own job page via WebFetch, then finding real Microdata on the same page via plain
  `curl` + `grep`. Verify structured-data absence with raw HTML, not WebFetch's summary.
- **topjobs.lk** (Sri Lanka's dominant private job board) has no robots.txt and is
  technically easy to scrape, but it's a paid commercial product (companies pay to post
  vacancies), which is a materially different legal posture than scraping the free public
  Gazette. Not built yet (would be Phase 3 of the private-ingest plan); the source
  registry design carries an explicit `legalRisk` field so this stays a visible,
  deliberate call at review time rather than something silently treated as equivalent to
  a company's own site.
- **GitHub Actions on a brand-new repo defaults to blocking PR creation** — Settings →
  Actions → General → "Allow GitHub Actions to create and approve pull requests" is off
  by default. `peter-evans/create-pull-request` pushes its branch successfully but fails
  at the actual PR-open step (shown as an annotation, not a job failure — easy to miss).
  Also: if a run fails *after* pushing the branch but *before* opening the PR, the branch
  survives and silently blocks the next run's PR too, because the action only acts when
  there's a diff versus the existing branch — delete the stale branch to unblock. Both
  hit for real during this session's first-ever GitHub Actions run of any pipeline in
  this repo, private or government.

**Result: the full loop was proven end-to-end** — local script → GitHub Actions run →
PR opened → human review → merge — for the private-sector pipeline. 9 real, currently-open
IFS/Colombo postings are now live in `data/private-vacancies.json` on `main`.

Separately (not part of this repo): the Gazette pipeline's fetch→PDF→chunk→LLM-structure
logic was also rebuilt as a local n8n workflow (Docker, `localhost:5678`) purely as a
tool-learning exercise, not saved anywhere in this repo. Worth knowing if it ever comes up
again, but it has no bearing on `scripts/ingest.py`, which remains the real pipeline.

### 11.6 Two real bugs fixed, and `main.html` got a considered redesign + a real Private Sector view

*2026-09-20.* Continuing straight from §11.5's private-ingest work, this pass covered two
unrelated threads: fixing real correctness bugs found by actually running things on the
live GitHub repo, and a from-scratch visual redesign of `main.html` (which had already
churned through three directions today across two concurrent sessions — Material 3,
GOV.UK Design System, and a monochrome print palette — none settled).

**Two real `scripts/ingest.py` bugs found by triggering `ingest.yml` on GitHub Actions for
the first time ever (per §11.5's open item):**
- `max_tokens` (1024 for the single-notice path, 2048 for the batch path) was too low for
  `nvidia/nemotron-3-ultra`, a reasoning model that spends part of its token budget on
  internal reasoning before writing output — several real candidates failed with
  `Expecting value: line 1 column 1` / `Unterminated string` JSON-parse errors (truncated
  output). Raised both to 4096. (A first attempt at this fix was accidentally reverted by
  a concurrent session's unrelated commit sweeping up an uncommitted change via a broad
  `git add` — re-applied afterward. Running two sessions against the same working tree at
  once is real, not hypothetical, and cost a redo here.)
- The discovery-pass loop had **no title-validity check at all**, and the batch pass only
  checked truthiness — neither caught the LLM returning the literal string `"None"`
  instead of a real JSON `null` on a page that wasn't an actual vacancy notice (a GIT
  exam-timetable page got added as a fake listing, confidence 0.2, title `"None"`, which
  passed the truthiness check since a non-empty string is still truthy). Added
  `is_valid_title()`, used in both passes.
- Also found, separately, that GitHub's own PR-permission default
  ("Allow GitHub Actions to create and approve pull requests") is off on a fresh repo —
  affects any workflow using `peter-evans/create-pull-request`, not just the private one
  already documented in §11.5.

**`main.html` redesign, done properly this time with real design skills rather than
another ad-hoc pivot:** installed and used `frontend-design`, `ui-ux-pro-max`, and
`senior-frontend` (via `npx claude-code-templates@latest --skill <name>`, now in
`.claude/skills/`). Landed on **"The Register"** — modeled on the actual case-file/ledger
culture of Sri Lankan government offices (manila folders, fountain-pen ink, rubber
date-stamps), deliberately not another "old newspaper" or "civic blue portal" look, both
already tried and set aside today. Checked `ui-ux-pro-max`'s own database against this
brief and rejected its top match (a generic "Government/Public Service" trust-blue
palette, essentially the same genre as the already-rejected GOV.UK direction) — worth
noting for future design passes on this project: the tool's database leans SaaS/marketing
and doesn't have a strong "civic document register" pattern, so it's a useful cross-check,
not a source of truth, for a brief this specific. Palette (manila `#EDE6D6`, ink `#1C2B3A`,
stamp-red `#B23A2E` for urgency only, verified-green `#2F5D50` for confirmed-real only) —
contrast-checked by hand, all pairs clear WCAG AA. Type: Fraunces (display) + Atkinson
Hyperlegible (body, genuinely justified by the accessibility need for a broad
non-designer audience) + IBM Plex Mono (citations/dates only) + the existing Noto Serif
Sinhala. Layout: an index-tab rail (folder-tab metaphor) replacing the old flat facet
list.

**A real, severe bug was caught only because a screenshot was actually taken, not
assumed:** the redesign shipped once already with **most body text invisible** —
descriptions, qualifications, all of it — because the custom Tailwind color named `base`
collided with Tailwind's own built-in `text-base` utility (font-size: 1rem). Since color
and font-size are different CSS properties, both rules applied simultaneously: every
`text-base` class in the file (used purely for font-size, copied from the original file)
silently also recolored that text to match the page background — zero contrast, text
present in the DOM but camouflaged. This is exactly what the user meant by "lot of
details are missing." Root-caused by actually screenshotting via Playwright pointed at
the machine's existing installed Chrome (`executablePath` set directly to
`chrome.exe`) rather than downloading Playwright's own browser, which timed out
repeatedly on this network — worth remembering as the fast path if this comes up again.
Fixed by renaming the color key to `surface`. **Lesson for any future Tailwind CDN
config on this project: never name a custom color/spacing/etc. key the same as one of
Tailwind's own scale keywords (`base`, `sm`, `lg`, ...) — the collision is silent, applies
cleanly with no console error, and is invisible unless you actually look at a render.**

**New "Private Sector" view added to `main.html`** (a real step toward the private-ingest
plan's Phase 4 frontend merge, not the full merge yet): a second top-level nav tab,
separate from "Government Gazette," fetching `data/private-vacancies.json` independently.
Organised by **industry, not date** — a deliberate, user-specified distinction: a Gazette
notice has a real, meaningful closing date; most private postings have none at all (per
§11.5's Workday API findings), so forcing a date-sort there would be dishonest. Industry
tabs are built dynamically from whatever `sector` values are actually present in the data
(currently Technology, Other) rather than a hardcoded list, and actually filter the feed
client-side on click — not decorative. The Gazette feed was also fixed to explicitly sort
by urgency-then-closing-date in JS, rather than relying on whatever order the source JSON
happened to be in.

---

## 12. Definition of done for v1

A job seeker on a mid-range Android phone, on mobile data, reading Sinhala, can — within
60 seconds of landing — see every vacancy closing this week that they personally qualify
for, understand exactly what to post and where, and verify it against the original Gazette
page. And the page looks like it was typeset, not assembled.

---

### Immediate next step

*Updated 2026-09-20 — §11.5's list is mostly done; this section had gone stale again.*

In priority order, given §11.5 and §11.6's findings:

1. **`ingest.yml` verified working** ✅ (§11.5) — two real bugs found in the process and
   fixed (§11.6): `max_tokens` truncation, and a missing title-validity check.
2. **`main.html` redesign done** ✅ (§11.6) — "The Register" design system, a real
   Private-Sector view organised by industry, and the invisible-body-text bug fixed.
   Still open: the "professional/premium" bar is subjective and iterative — check with
   whoever's judging it before assuming this is the final visual pass.
3. **Private-ingest Phase 2** — still only 4 sources (IFS, LSEG, JLL, Zebra, all found via
   the ATS-platform-search strategy from §11.5). More sectors (banking/healthcare) have
   zero real sources yet — the Private Sector view's "All industries" default currently
   only ever shows Technology and Other because that's all that exists.
4. **The actual Next.js build (Phase 1, §8)** — 🟡 **started 2026-09-20, see §11.7.**
   Scaffolded in `web/` with routing, real per-vacancy detail pages wired to both data
   files, and URL-driven filter state. Still greenfield from Phase 1's list: i18n
   framework (`next-intl`), Storybook, shadcn, and dark mode.

### 11.7 Next.js app scaffolded — the two-page portal spec

*2026-09-20.* A detailed 75-section UI/UX spec arrived for a **two-category job portal**
(Government Gazette + Private Sector as genuinely separate pages, not one mixed feed),
and the call was made to build it as a real Next.js app rather than extend `main.html`
further — the spec's requirements for real URLs, shareable filtered searches, and
browser back/forward (§57–58) can't honestly be met by a single static file.

**Three conflicts between the new spec and decisions already recorded here, surfaced
rather than silently resolved:**
- The spec recommends **Inter** and a **"professional blue"** primary. §11.6 records both
  a GOV.UK-style and a "civic blue portal" direction already tried and set aside, and
  `ui-ux-pro-max`'s generic government trust-blue palette explicitly rejected. Resolved:
  **"The Register" wins** — the manila/ink/stamp-red palette and Fraunces + Atkinson
  Hyperlegible port over intact, while the spec's *structure* (two routes, states,
  pagination, a11y rules) is followed closely. Atkinson Hyperlegible in particular has a
  real accessibility rationale that Inter doesn't.
- The spec asks for a **"Closing Soon" sort on private jobs** (§37). Every one of the 37
  real private postings has `closingDate: null` — ATS platforms mostly don't publish
  them. Resolved by explicit decision: include the sort, **nulls last**, and state the
  ratio in the page's own intro text ("only N of 37 listings publish a closing date")
  rather than quietly presenting a sort that looks broken.
- Private-sector jobs were listed **out of scope in §10**. Already resolved by §11.5's
  separate-pipeline approach; the portal now surfaces that pipeline's real output.

**A real process failure worth recording:** this session started from stale context and
wrote a fabricated `data/private-jobs.json` full of invented companies, not knowing
`data/private-vacancies.json` already held 37 real postings from §11.5's pipeline. Caught
only by reading job.md's own §11.5 before building on it, and deleted. Two lessons: with
concurrent sessions on one working tree, **read the plan file before trusting in-context
state**, and the near-miss is exactly the failure mode §11.4 warned about — fabricated
data that looks plausible sitting next to real data.

**What's in `web/`:** Next 16 + React 19 + Tailwind v4 (CSS-first `@theme`, tokens ported
from `main.html`). Routes `/`, `/government-jobs`, `/government-jobs/[slug]`,
`/private-jobs`, `/private-jobs/[slug]`, `/about`. Both listing pages are server
components reading `searchParams`, so filter/search/sort/page state lives in the URL and
is shareable and back/forward-safe. Shared components: `SiteHeader`, `FilterBar` (client,
debounced search, removable chips, mobile drawer), `JobCards`, `Pagination`, `Breadcrumb`,
`EmptyState`, `ErrorState`, `JobListSkeleton`, `JobStatusLabel`. Data is read at the repo
root via `fs` so there's one source of truth shared with both ingest pipelines — noted in
`lib/jobs.ts` that a real deploy will need a copy step, rather than pre-solving it.

### 11.8 "The Register" swapped for a Material-3-inspired "Gazette Ledger" system

*2026-09-20.* A full HTML mockup arrived (Newsreader + Plus Jakarta Sans, Material Symbols
icons, an M3 token set: navy `primary` #0f2038, amber `secondary` #8c4f10/#fdad67, cream
`surface` #faf9f6, `error` #ba1a1a) styled as a newspaper-broadsheet gazette feed — masthead
ribbon, urgency ticker, a sidebar "filter ledger" with counted checkboxes/pills, and a
fact-grid inside each entry. First recommendation was a selective port (masthead bar, stat
box, fact-grid, urgency badges) onto the existing Register tokens rather than a fifth full
re-skin; overridden by explicit instruction: **full swap**.

**What actually changed vs. what stayed:** the token *names* in `globals.css` stayed
identical (`surface`, `ink`, `ink-soft`, `rule`, `stamp`, `verified`, plus a new `accent`
pair for the amber) — only their values and the two font variables changed (Fraunces →
Newsreader, Atkinson Hyperlegible → Plus Jakarta Sans; IBM Plex Mono and Noto Serif Sinhala
kept). Because every component already referenced tokens by name rather than hardcoded
colors, most of detail pages and `about/` needed zero structural edits — they picked up the
new palette and fonts automatically. The real work was structural: `FilterBar` rewritten
from a top bar into a sticky sidebar ledger with real per-option counts (`facetCounts` in
`lib/jobs.ts`), both listing pages restructured into a 12-col grid, `SiteHeader` rebuilt
with a state ribbon + a real urgency ticker, and `JobCards` gained a fact-grid box and a
"most urgent" lead treatment.

**Deliberately dropped from the mockup, and why** (all in tension with rules already
recorded in this file): stock/AI-look photography in every card — exactly what the pasted
75-section spec said to avoid; a "Gazette No. 2,403" edition number and ministry/stat
counts — no such field exists anywhere in the real data, confirmed by inspecting
`vacancies.json` before writing a single token, so the masthead surfaces the real
`updatedAt` timestamp instead; a "Candidate Sign In" button and avatar — no auth system
exists; an EN/SI/TA language switcher — i18n routing isn't wired, and a switcher that does
nothing is worse than none. The urgency ticker and every stat shown (total posts,
institutions, `<7d close`, employers) are computed from the real dataset at request time,
never hardcoded.

**Bug caught before it shipped:** `SiteHeader` (a `"use client"` component) originally
imported `daysUntil` directly from `lib/jobs.ts`. That module's top-level `fs`/`path`
imports made Turbopack try to bundle Node's `fs` for the browser and hard-panic production
builds ("the chunking context does not support external modules (request: node:fs)").
Fixed by computing the urgent-vacancy summary server-side in `layout.tsx` and passing only
a plain `{ slug, titleEn, days }` object as a prop — client components must never import
from `lib/jobs.ts` directly, only receive its output as serialized props. Verified clean
on both a fresh production build (`next build`, 56/56 pages) and a fully restarted dev
server (an orphaned dev process from before the fix was still answering port 3000 and had
to be killed to get a trustworthy check — stale processes had previously produced spurious
"missing key" React warnings that did not correspond to any actual missing key in source).

### 11.9 "Gazette Ledger" swapped again — "Lanka Broadsheet Editorial"

*2026-09-20.* A third design-system doc arrived: a full YAML-frontmattered spec ("Lanka
Broadsheet Editorial") — Imperial Navy / Antique Ceylon Gold / Urgent Terracotta Crimson,
Newsreader carrying both headlines *and* body prose, Hanken Grotesk reserved for
structural UI only, zero radius, zero shadow, hairline separation over card boxes. The
doc's own YAML color block (an unedited M3 tonal export) disagreed with its own prose —
e.g. `primary: '#000f22'` in YAML vs. "Imperial Navy `#0A2540`" in prose, same for
secondary and tertiary. The prose won every conflict; it names roles and gives rationale,
the YAML was only used to fill gaps (like a third neutral text tier) the prose left open.

**A stop worth recording:** mid-rewrite of `JobCards.tsx`, a permission denial arrived —
"the user doesn't want to take this action right now, stop and wait." Work stopped
immediately, nothing further was touched, and a background-task notification that arrived
seconds later (labelled, explicitly, as not-user-input) was correctly *not* treated as
permission to resume. Resumption only happened once the user typed a real "go".

**What changed:** same token names again (`ink`, `rule`, `stamp`, `accent`, `verified`,
...), new values and two real semantic corrections this swap exposed in the *previous*
one — under strict color-role discipline, crimson is deadlines/urgency only and gold is
prestige/official-marks only, never interchangeable. The §11.8 header ticker had used gold;
that was wrong under this system's rules and is now crimson. `--verified` now points at
the gold family rather than carrying its own invented green — "verified against source"
reads as an official seal, which gold already means, rather than adding a fourth chromatic
role the spec never asked for. Newsreader now carries body copy too (not just headlines) —
a real font-family flip via the `--font-body` token, not a per-element change, because
nothing in the app had ever applied an explicit sans class to body text. Government
vacancy cards became the spec's "Public Tender / Gazette Card" (filled `surface-sunken`,
bordered, spaced) while private-sector cards stayed on the plain hairline pattern — they
aren't gazette notices and don't earn that treatment, a deliberate divergence in how the
two sections read. The "most urgent" listing gets the spec's "Lead Story" treatment
(bigger headline, thin gold rule under it) instead of a navy box; the crimson Closing Date
Tag now does the actual urgency-signalling, so the old redundant "Most urgent" navy pill
was removed outright rather than kept alongside it. Added a `.masthead-rule` CSS pattern
(2px rule / 3px gap / 1px rule, one element) for the header's dual-line editorial border.

**A latent bug caught and fixed while re-touching fonts, unrelated to the redesign
itself:** `--font-siserif` had referenced `"Noto Serif Sinhala"` by name since §11.7, but
nothing in `layout.tsx` ever fetched that font — no `next/font` loader, no `<link>`. Real
Sinhala vacancy titles had been silently rendering in the Georgia fallback the entire time
this was live. Fixed by adding a `Noto_Serif_Sinhala` loader alongside the others. (Also
checked, empirically rather than assumed, whether the *other* font tokens had the same
problem — they didn't: next/font/google keeps the literal Google Fonts family name for the
self-hosted `@font-face`, confirmed by fetching the compiled CSS directly, so a plain
`"Newsreader", Georgia, serif` value does correctly pick up the optimized local font.)

Verified: `tsc` clean, `next build` 56/56 pages, and a fully restarted dev server (again —
a stray process from the *previous* restart was still squatting on port 3000) shows every
compiled `--ink`/`--stamp`/`--accent`/`--surface` value matching the spec exactly in both
themes, all four fonts actually being served, real facet/stat counts, and no console
warnings.

### 11.10 Structure caught up to the reference — density, not just tokens

*2026-09-20.* §11.8's tokens had been checked against the original "GazetteJobs.LK" HTML
mockup from the start of this session, but the user then shared a *rendered screenshot* of
that same mockup with "what I expected is this kind of UI" — making clear the gap wasn't
color/type, it was structure and density: a two-column masthead with a real stat box, a
sidebar with checkbox filters carrying real counts, active-filter chips and sort living
above the list rather than buried in the sidebar, and cards with a left-column visual
element instead of plain text rows. §11.8/§11.9 had matched the palette and largely
matched individual card contents, but not this layout shape.

**Rebuilt to match structure, still refusing to fabricate content:**
- `FilterBar` split into two components: `FilterBar` (sidebar: search + facets only) and a
  new `FeedControls` (chips + live result count + sort, sitting above the card list — the
  reference's "Feed Controls & Active Meta Ribbon").
- Facets with ≤6 real values now render as genuine multi-select checkboxes with real
  counts and OR-semantics (comma-joined URL param, `matchesAnyParam` in `lib/jobs.ts`) —
  not checkbox *styling* on single-select behavior, which would have been an accessibility
  lie (checkbox role implies independent toggling). Category (gov), sector/company/location
  /employment-type (private) all qualified on real distinct-value counts checked against
  the data first.
- Both listing pages gained a two-column masthead: heading + description on the left, a
  bordered "Register" stat box on the right — real counts only (total posts, institutions,
  `<7d close` for gov; listings, employers for private), plus a genuine link to
  `documents.gov.lk/web/gazettes`, since there is no real single "current edition" PDF to
  download the way the mockup's fake `24.8 MB` "Download Official PDF No. 2,403" implied.
- `JobCards` gained an `IconPanel` — a left-column block with a category/sector-derived
  Material icon (`iconForCategory`/`iconForSector`) — occupying the position a photo does
  in the reference, without pretending to show a real photograph of a real building.

**Deliberately not built, because nothing behind them is real:** stock photography,
"Candidate Sign In" / avatar (no auth), an EN/SI/TA language switcher (i18n unwired — see
§11.8, unchanged reasoning), a specific Gazette-edition PDF download with a file size and
"SHA-256 Verified" claim, a "Prior Gazette Editions Available for Retrieval" archive
browser (no structured historical-edition data model exists), a Telegram/email signup
(no backend), and a grid/list view toggle (would need real behavior behind it or it's a
dead control — skipped for scope, not principle; could come back as genuine functionality
later).

Verified: `tsc` clean, `next build` 56/56 pages, a freshly restarted dev server, and
end-to-end multi-select filtering confirmed over curl — a single category returns 3
results, that category OR a second returns 4 (correct OR union), each generates its own
removable chip, and search/sort continue to work unchanged.

### 11.11 Colors and type reverted to the original mockup's exact values

*2026-09-20.* After §11.10 fixed structure/density, the user asked directly: "can we use
same colours as well and design also?" — pointing at the *original* GazetteJobs.LK mockup
from the very start of this session, not the "Lanka Broadsheet Editorial" doc from §11.9.
§11.8 had already approximated that mockup's palette once, but through its own
interpretation (e.g. `ink` was set to `primary-container` #0f2038, a background role in the
mockup, when the mockup actually uses `primary` #000818 as its literal *text* color almost
everywhere — `text-primary` on headings, labels, the logo). This pass pulled hex values
directly from the mockup's own Tailwind config instead of re-deriving them:

`ink` → `#000818` (M3 `primary` — both text and solid-fill chrome, matching how the mockup
itself reuses `primary` for both), `ink-soft` → `#44474d` (`on-surface-variant`), `ink-faint`
→ `#75777e` (`outline`), `rule` → `#e3e2e0` (`surface-container-highest`, the mockup's actual
dominant hairline — used for borders far more than `outline-variant`), `stamp`/`stamp-wash`
→ `#ba1a1a`/`#ffdad6` (`error`/`error-container`, exact), `accent` → `#8c4f10` (`secondary`,
already exact in §11.8), `accent-wash` → `#fdad67` (`secondary-container` — a **solid badge
fill** in the mockup's own markup, not a pale wash as §11.8/§11.9 both treated it).

Fonts reverted to the mockup's actual split: Newsreader for headline-tier classes only,
Plus Jakarta Sans for everything else (body, labels, captions, nav) — not §11.9's
"Newsreader carries body copy too." Hanken Grotesk dropped entirely; `--font-ui` now points
at the same Plus Jakarta Sans font object as `--font-body` rather than loading a second
family, since the mockup doesn't distinguish a separate "structural UI" typeface from body
text the way the Broadsheet Editorial doc did.

Badge treatment followed the same correction: the urgent "Closes in Nd" badge is now a
solid crimson fill with white text (`bg-stamp text-white`), matching the mockup's literal
`bg-error text-on-primary` badges, replacing the hairline-border style from §11.9. The
3–14-day tier now renders in gold monospace (`text-accent`), matching the mockup's
`text-secondary` treatment for moderately-urgent closing dates — previously plain gray.
`CategoryBadge` became a solid gold-fill tag instead of a hairline-border label, for the
same reason.

Border radius was checked and left alone: the mockup's Tailwind config defines a `DEFAULT`
radius of `0.25rem`, but that's identical to Tailwind's own built-in default, and the
mockup's actual markup barely uses non-zero rounding anywhere except `rounded-full` on true
circles (the live-status dot, the avatar) — so the already-sharp existing markup already
matches its real usage; no theme change was needed there.

Verified: `tsc` clean, `next build` 56/56 pages, a fully restarted dev server, exact hex
values (`--ink: #000818`, `--stamp: #ba1a1a`, `--accent: #8c4f10`, `--accent-wash:
#fdad67`, `--rule: #e3e2e0`, in both themes) confirmed directly in the compiled CSS output
rather than assumed from the source, Plus Jakarta Sans confirmed as the actually-served
font family, and all routes 200 with no console warnings.

### 11.12 The real blocker: no way to see the rendered page

*2026-09-21.* After §11.11 the user asked, reasonably, why the UI still didn't look close
to the reference after three passes that each checked out on paper. Answer, checked rather
than assumed: this environment has no screenshot/browser-automation tool at all —
`WebFetch` explicitly refuses `localhost`, and nothing else renders a page. Every previous
pass verified hex values and class names existed in the HTML/CSS output via `curl`/`grep`;
none of that catches "the composition doesn't read the same," which is exactly the kind of
gap that was happening. Tried `ui-ux-pro-max`'s `--design-system` search as the user asked
("why don't we use ui skills") — its own output for "government" is a minimal
high-contrast-blue/Atkinson-Hyperlegible system, the same generic gov-blue direction §11.6
already rejected, and a direct style-domain search returned nothing closer than "Data-Dense
Dashboard" (useful only as a generic "tighten spacing" signal). Concluded, and told the
user directly: this skill originates a design from a style keyword, it doesn't clone a
specific reference image, and running it further would move away from the target, not
toward it.

**Real unblock:** asked the user to paste a screenshot of the actual running page instead
of guessing blind a fourth time. They did. Direct comparison against the reference surfaced
two concrete, fixable gaps neither prior pass had caught:
1. The `IconPanel` (small pale-gray box, faint icon) carried nowhere near the visual weight
   of the reference's full-color photography in the same position — it read as empty space,
   not a design choice.
2. Every layer of spacing — page padding, masthead gaps, card padding, sidebar padding,
   fact-grid gaps — was measurably looser than the reference's dense, newspaper-column feel.
   The reference fits a masthead + filter panel + 5 full entries above the fold; this build
   fit one card.

**Fixes:** `IconPanel` → a bold solid-`ink`-fill emblem tile (140px, up from 104px) with a
large light icon, instead of a pale placeholder — still an honest icon, not a fake photo,
but with real visual weight. Tightened spacing throughout `JobCards.tsx`, `FilterBar.tsx`,
and both listing pages (card padding `p-5`→`p-4`, page padding `py-8`→`py-5`, masthead
gaps, sidebar padding, fact-grid gaps, stat-box padding) — while explicitly leaving every
*interactive* touch target (checkboxes, buttons, the search input) at its accessible
minimum size, since density has to come from margins and padding, never from shrinking
anything a person has to click (the skill's own checklist flags 44×44px as CRITICAL, and
that rule doesn't bend for this).

Verified: `tsc` clean, `next build` 56/56 pages, fresh dev server, all routes 200, no
console warnings. Visual confirmation is still pending a fresh screenshot from the user —
unlike every other change in this file, this one cannot be closed out from this end alone.

<details>
<summary>Original Phase 0 instruction (superseded, kept for history)</summary>

Build the Phase 0 spike in `main.html`: masthead, ledger with dotted leaders and serials,
one detail view. Sinhala and English side by side. Sign off the design language before a
single Next.js file exists.

</details>
