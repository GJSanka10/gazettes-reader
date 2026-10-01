# Design brief — Sri Lankan Government Gazette job discovery

Provided by the project owner on 2026-09-24 as the standing background brief for all UI work.
Where this brief and `job.md` disagree on design, this brief wins.

## 1. Product idea

A web application for discovering, searching, and reading newly published Sri Lankan Government
Gazette job vacancies.

Core experience: **"Open the latest Gazette → instantly see what's relevant to me → understand the
vacancy → save/apply."**

Not a generic job board. A combination of a modern digital newspaper, an official government
document reader, a smart job discovery platform, and a personal job tracker. Newly published
opportunities should feel important and easy to discover.

## 2. Design direction

Not a generic AI-generated SaaS website. Avoid: purple/blue gradients, excessive glassmorphism,
glowing backgrounds, huge generic hero sections, excessive rounded cards, repetitive 3-column
feature cards, meaningless gradient blobs, excessive shadows, generic "Find your dream job" copy,
fake testimonials, unnecessary dashboard statistics, generic AI illustrations, excessive
animations, every element inside a rounded rectangle.

Strong visual identity: **Sri Lankan Gazette × modern editorial publication × intelligent search.**
It should look like a product that could realistically become the main place Sri Lankan graduates
check government vacancies.

## 3. Visual personality

Trustworthy, editorial, intelligent, modern, calm, official without feeling old-fashioned,
slightly premium, highly readable, information-dense but not cluttered. Not a 2010 government
department website; not an AI startup landing page.

## 4. Primary users

University students (first government job), graduates (positions matching their degree), working
professionals, exam candidates (qualifications, age limits, closing dates, salary scales, exam
details), general users (what was published today).

## 5. Most important UX principle

Users should not have to read the whole Gazette PDF to know whether a vacancy is relevant.
Transform Gazette information into a clear, structured vacancy preview:

```
Government Gazette
NEW
ICT Service — Grade III
Ministry of Public Administration
Closing date: 25 September 2026
Salary: Rs. 52,000 – 72,000
Required qualification: Bachelor's degree in ICT / Computer Science...
Age: 18–30
Vacancies: 12
[View Full Gazette] [Save Job]
```

The actual Gazette document must remain available.

## 6. Homepage

No giant generic hero. Immediately communicate **"What's new in the Gazette?"**

- Top navigation: brand, Latest, Jobs, Exams, Saved, Search.
- Compact editorial intro — e.g. **"Government jobs, without the Gazette hunting."** /
  "Discover newly published vacancies from Sri Lankan Government Gazettes."
- **Today's Gazette**: a visually strong current-edition date block (e.g. `16 SEP 2026`,
  "Latest Gazette", "23 new opportunities").
- Then the newest vacancies.

## 7. Job feed

Editorial/news feed, not LinkedIn/Indeed. Each vacancy: NEW badge, title, institution,
service/category, published date, closing date, salary, number of vacancies, qualification
summary, location, job type, source Gazette number, saved state. Closing date especially easy to
notice — "Closing in 3 days" visually distinct from "Closing in 21 days" — without excessive
warning colours.

## 8. Search

One of the strongest features. Searchable: title, institution, ministry, qualification, degree,
field, service, location, Gazette number. Fast, polished, with useful autocomplete.

## 9. Filters

Sophisticated but simple. Qualification (O/L, A/L, Diploma, Higher Diploma, Bachelor's, Master's,
Professional), Field (ICT, Engineering, Management, Finance, Law, Education, Health, Science,
Other), Organization (Ministries, Departments, Universities, Provincial Councils, State
institutions), Location, Job type (Permanent, Contract, Temporary, Open competitive exam, Limited
exam), Closing date, Published date. Easy to remove; must not feel like an enterprise dashboard.

## 10. Job detail page

A beautiful reading experience: title, institution, published and closing dates; Quick facts
(qualification, age limit, vacancies, salary, location); Eligibility (clearly structured);
Important dates; How to apply (step by step, based on the Gazette); Official Gazette (embedded
viewer + Open original). The original source must always be clearly identifiable.

## 11. Gazette reader

A major feature, not a tiny iframe: page navigation, zoom, search within document, thumbnails,
highlighted relevant sections where possible, vacancy navigation, "Back to vacancy details".
Desktop: left = page navigation, centre = document, right = structured vacancy info. Mobile:
reorganised intelligently.

## 12. "Why this job matches me" (later)

Optional profile (education, degree, field, age, locations, experience, professional
qualifications) → informational match notes. Never make unsupported eligibility decisions; always
tell users to verify against the official Gazette.

## 13. Saved jobs

Saved / Closing soon / Recently viewed / Applied. Per job: title, institution, closing date,
status (Interested / Applied / Not interested). Keep it simple.

## 14. Notifications (design for later)

"New ICT government vacancies", "Jobs closing this week", "New vacancies matching your degree",
"New Gazette published". Never intrusive.

## 15. Language

Sinhala, English, Tamil. Components must not assume English text length.

## 16. Sri Lankan identity

Subtle, not flags or national symbols: typography, language switching, date formats, geographic
filters, institution structure, Gazette terminology, restrained motifs.

## 17. Typography

Readability first. A strong **display typeface for editorial headings** and a **highly readable
sans-serif for body/UI text**. Proper Sinhala/Tamil support. Clear hierarchy: Display, H1, H2, H3,
Body, Metadata, Labels, Document text.

## 18. Colour

Mostly neutral. **One strong brand accent** and a small number of semantic colours communicating
trust, information, urgency, freshness. No rainbow gradients, purple AI aesthetics, neon or glass.

## 19. Cards

Don't put everything in cards. Mix editorial rows, dividers, highlighted sections, compact
panels, document-style blocks; cards only where they improve grouping. The feed should feel
information-rich, not floating boxes.

## 20. Responsive

Mobile-first. Mobile priority: search, latest jobs, closing dates, filters, job details, Gazette
reader. Bottom navigation on mobile if appropriate. Don't just shrink desktop.

## 21. Microinteractions

Subtle and purposeful: search results appearing, bookmark animation, filter transitions, page
transitions, expanding eligibility, document navigation, hover. No floating, parallax, spinning,
animated gradients, or motion that slows reading.

## 22. Empty states

Specific and actionable ("No ICT vacancies found. Try removing one of your filters. [Clear
filters]"), never just "No results found."

## 23. Trust / source

Every vacancy shows: official source, Gazette number, published date, original document. Never
appear to be an official government website.

## 24. Accessibility

Contrast, keyboard navigation, visible focus, readable sizes, semantic HTML, accessible forms,
screen-reader labels, reduced motion.

## 25–26. Technical quality and SEO

Reusable components, clean architecture, loading/error/skeleton states, optimised images, semantic
HTML, metadata, Open Graph, structured data. Each job has its own indexable URL; canonical URLs,
sitemap, robots.txt; don't index filter URLs.

## 27. Data architecture

```
Gazette
├── Gazette number
├── publication date
├── PDF/document
└── vacancies
    ├── title, institution, category, qualifications, age requirement
    ├── salary, vacancies, location, closing date
    └── source
```

## 28. Admin (plan)

Upload Gazette, create/extract/edit vacancies, assign categories, set closing date, verify,
publish/unpublish, mark source, manage translations. **Never auto-publish extracted information
without a verification workflow.**

## 29. Process

First define: product analysis, visual concept, typography, colour, spacing, components,
responsive behaviour, AI patterns to avoid. Then build in order: homepage → job listing → job
detail → Gazette reader → saved jobs/profile. Establish visual consistency before generating
every page.

## 30. Quality bar

Recognisably a Gazette/job-discovery product? A real product, not an AI landing page? Today's new
jobs findable within seconds? Relevance decidable without the PDF? Easy to verify against the
original? Holds up with hundreds of vacancies? Works equally in Sinhala, Tamil and English?
If not, improve the design rather than adding decoration.

**Final principle:** information-first, editorial, trustworthy, distinctive. Users should think:
"Finally, I can understand government Gazette jobs without digging through PDFs."
