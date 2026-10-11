"""
Weekly vacancy ingestion.

Pulls new government job postings, extracts each one's advertisement PDF, asks an LLM to
structure it into our Vacancy schema, and writes new entries into data/vacancies.json.
Never overwrites an existing entry (matched by sourceUrl) and never invents a field it
can't find real text for — an empty/missing field is left for a human to fill in during
PR review, not guessed.

Runs from GitHub Actions on a schedule (see .github/workflows/ingest.yml). Nothing here
publishes anything by itself: the workflow opens a pull request with whatever this script
adds, and a human merging that PR is the verification gate job.md requires before a
closing date is ever shown to a real user.

Structuring uses a free-tier model via OpenRouter (see OPENROUTER_MODEL below), not a
paid API — deliberately, so this pipeline costs nothing to run beyond GitHub Actions'
free compute minutes. Needs an OPENROUTER_API_KEY repo secret (a free OpenRouter account,
no card required for :free models).

Source strategy (see job.md §11.2): starting narrow and honest rather than pretending
this is comprehensive. gazette.lk's own listing page is used only as a *discovery* index
(it already aggregates many institutions and cites where each notice really came from) —
we follow through to the real source PDF rather than treating gazette.lk itself as the
authority. Expand DISCOVERY_PAGES over time with individual ministry/department sites as
those get confirmed to work (see job.md §11.1/§11.2 for what's been verified so far).
"""

import hashlib
import io
import json
import os
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

import requests
from bs4 import BeautifulSoup
from pypdf import PdfReader, PdfWriter

try:
    import pdfplumber
except ImportError:
    pdfplumber = None

# Free-tier model on OpenRouter (openrouter.ai) — no self-hosting, no per-token cost.
# Free models get rotated out occasionally; if this ID stops working, check
# https://openrouter.ai/models?max_price=0 for a current replacement and either edit
# the default below or set OPENROUTER_MODEL as a repo variable/secret.
OPENROUTER_MODEL = os.environ.get("OPENROUTER_MODEL", "nvidia/nemotron-3-ultra-550b-a55b:free")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT / "data" / "vacancies.json"
# Notices get mirrored here (served by Next.js as static files) instead of only
# ever linking to the source — see job.md: reading a notice should never depend
# on gazette.lk or documents.gov.lk staying up or keeping the file at that path.
PDF_HOST_DIR = ROOT / "web" / "public" / "gazette-pdfs"


def _hosted_stem(source_url):
    """The original file name (useful when skimming the folder) plus a short hash of
    the source URL (so two different notices never collide). documents.gov.lk serves
    files through a proxy (…/content-file-proxy?file=gazette-content/<name>.pdf), so
    there the real name is in the query string, not the path."""
    parsed = urlparse(source_url)
    file_param = parse_qs(parsed.query).get("file", [None])[0]
    raw_name = unquote((file_param or parsed.path).rsplit("/", 1)[-1]) or "notice"
    stem = re.sub(r"[^A-Za-z0-9.-]+", "-", raw_name).strip("-") or "notice"
    stem = re.sub(r"\.pdf$", "", stem, flags=re.IGNORECASE)[:50]
    digest = hashlib.sha1(source_url.encode("utf-8")).hexdigest()[:8]
    return f"{digest}-{stem}"


def save_pdf_locally(content, source_url):
    """Mirrors a downloaded PDF under web/public/gazette-pdfs and returns the
    root-relative URL to use as pdfUrl. Idempotent — re-ingesting the same
    source_url reuses the same file. Call only once the vacancy it backs is
    actually being kept, so skipped notices don't leave unreferenced files."""
    filename = f"{_hosted_stem(source_url)}.pdf"
    PDF_HOST_DIR.mkdir(parents=True, exist_ok=True)
    path = PDF_HOST_DIR / filename
    if not path.exists():
        path.write_bytes(content)
    return f"/gazette-pdfs/{filename}"


def save_pdf_excerpt(content, source_url, first_page, last_page):
    """Hosts just pages first..last (1-based, inclusive) of a PDF as their own small
    file, so a reader lands on the one notice instead of a 50-page Gazette issue."""
    filename = f"{_hosted_stem(source_url)}-p{first_page}-{last_page}.pdf"
    PDF_HOST_DIR.mkdir(parents=True, exist_ok=True)
    path = PDF_HOST_DIR / filename
    if not path.exists():
        reader = PdfReader(io.BytesIO(content))
        writer = PdfWriter()
        for i in range(first_page - 1, last_page):
            writer.add_page(reader.pages[i])
        with open(path, "wb") as f:
            writer.write(f)
    return f"/gazette-pdfs/{filename}"

# OpenRouter's free tier allows 50 requests a day per key. One run spends at most
# this many, shared by both passes, leaving headroom for a manual re-run or retries.
# The Gazette pass takes what it needs first (it's the authoritative source and its
# issues expire from the lookback window); gazette.lk gets whatever is left.
MAX_LLM_CALLS_PER_RUN = 45


class LLMBudget:
    def __init__(self, calls):
        self.left = calls

    def take(self):
        """Spend one call. False when the budget is used up."""
        if self.left <= 0:
            return False
        self.left -= 1
        return True


# Discovery index only — see module docstring. Add more as they're confirmed working.
DISCOVERY_PAGES = [
    "https://www.gazette.lk/government-jobs",
]

# documents.gov.lk — the official source (Dept. of Government Printing). Despite
# rendering as a JS app in a browser, its raw HTML lists real gazette-content filenames
# as plain matchable text, and its file-proxy endpoint is reachable with a plain HTTP GET
# — no headless browser needed. Verified directly 2026-09-17 (job.md §11.3) by curling
# both the listing page and a real PDF straight from documents.gov.lk with no auth/cookies.
GAZETTE_FILE_REGEX = re.compile(r"gazette-content/[^\"'\\]+?\.(?:pdf|epub)", re.IGNORECASE)
# "I-II(A)" and "I-II A" both appear in real listings for the same section — bracket
# style around the "A" isn't consistent. Anchoring on "II" immediately followed by "A"
# (bracketed or not) naturally excludes IIB/IV(A)/other sections.
IIA_PATTERN = re.compile(r"I\s*-?\s*II\s*\(?A\)?\b", re.IGNORECASE)

CATEGORIES = [
    "Administrative & Management",
    "Security Services",
    "Engineering & Technical",
    "ICT & Technology",
    "Agriculture & Extension",
    "Education & Language Services",
    "Health & Scientific",
]

STRUCTURING_PROMPT = """You are extracting structured data from a real Sri Lankan \
government job vacancy advertisement. Read the text below and return ONLY a JSON object \
(no markdown fences, no commentary) with these exact keys:

titleEn        - the post title, English
instEn         - recruiting institution/ministry, English
descEn         - 1-3 sentence plain-English summary of the role, based only on the text given
age            - age limit as stated (e.g. "22-30 yrs" or "Below 60 (Govt) / 64 (Others)"), or null if not stated
quota          - number of vacancies as stated (e.g. "1 post"), or null
salary         - salary/scale as stated, or null
qualEn         - qualifications required, English, as close to verbatim as reasonable
citation       - the gazette number OR circular number this notice cites, or null if neither is stated
citationType   - "gazette" if it cites a gazette number, "circular" if it cites a circular/other reference, or null
closingDateISO - closing date in YYYY-MM-DD format, or null if not stated
publishedDateISO - the date the notice itself says it was published or advertised (e.g. "Advertised on 13/09/2026"), in YYYY-MM-DD format, or null. Not a circular's issue date.
gazetteNumber  - the Gazette issue number if the text says this notice appeared in the Gazette (e.g. "2,506"), or null
qualificationLevel - highest qualification the post requires, one of: "ol", "al", "nvq", "diploma", "degree", "masters", "professional"; or null if not stated
locations      - list of places of work as printed (e.g. ["Colombo"], ["Island-wide"]), or []
employmentTerm - "permanent", "contract" or "temporary" if stated, else null
examType       - "open" for an open competitive examination, "limited" for a limited competitive examination, "none" if selection is by interview only, else null
selectionMethod - how candidates are selected, as stated (e.g. "Written test and interview"), or null
howToApply     - list of short, plain-English steps taken only from the notice's own instructions (format, where to send, by when, how to mark the envelope), or []
requiredDocuments - list of documents the notice says to enclose, or []
category       - pick exactly one from this list, whichever fits best: {categories}
confidence     - your own confidence 0.0-1.0 that this extraction is accurate and complete

If a field genuinely isn't in the text, use null. Do not guess or invent values.

--- ADVERTISEMENT TEXT ---
{text}
--- END ---
"""

# NOT CURRENTLY CALLED — kept as a tested, ready-to-use building block for when OCR
# replaces pdfplumber for Sinhala PDFs. Tested live 2026-10-01 against a real notice: the
# model correctly honoured "copy verbatim or return null" (returned null for descSi and
# qualSiText rather than guessing), so the prompt itself works. What it was fed didn't:
# pdfplumber's text layer for the Sinhala PDF came back as real Sinhala Unicode
# characters in scrambled order (a known limitation of generic PDF-text extractors with
# complex/reordrant scripts, not a bad font or a scan — confirmed by checking the
# extracted characters are valid Sinhala codepoints, just in the wrong sequence). Until
# that's replaced with real OCR (e.g. Tesseract + a Sinhala language pack running against
# a rendered page image, not the PDF's internal text stream), main() mirrors and links
# the Sinhala PDF as-is (pdfUrlSi) instead of extracting text from it — see job.md's
# "never invent a field it can't find real text for" applied to language, not just
# content: showing a believable-looking but scrambled/invented Sinhala string would be
# worse than showing nothing.
STRUCTURING_PROMPT_BILINGUAL = """You are extracting structured data from a real Sri Lankan \
government job vacancy advertisement, published in both English and Sinhala below. Return \
ONLY a JSON object (no markdown fences, no commentary) with these exact keys:

titleEn        - the post title, English
titleSi        - the post title, COPIED VERBATIM from the Sinhala text — never translated or paraphrased. Null if no confident matching passage exists.
instEn         - recruiting institution/ministry, English
descEn         - 1-3 sentence plain-English summary of the role, based only on the text given
descSi         - a short excerpt describing the role, COPIED VERBATIM from the Sinhala text — never translated or paraphrased. Null if no confident matching passage exists.
age            - age limit as stated (e.g. "22-30 yrs" or "Below 60 (Govt) / 64 (Others)"), or null if not stated
quota          - number of vacancies as stated (e.g. "1 post"), or null
salary         - salary/scale as stated, or null
qualEn         - qualifications required, English, as close to verbatim as reasonable
qualSiText     - qualifications required, COPIED VERBATIM from the Sinhala text — never translated or paraphrased. Null if no confident matching passage exists.
citation       - the gazette number OR circular number this notice cites, or null if neither is stated
citationType   - "gazette" if it cites a gazette number, "circular" if it cites a circular/other reference, or null
closingDateISO - closing date in YYYY-MM-DD format, or null if not stated
publishedDateISO - the date the notice itself says it was published or advertised (e.g. "Advertised on 13/09/2026"), in YYYY-MM-DD format, or null. Not a circular's issue date.
gazetteNumber  - the Gazette issue number if the text says this notice appeared in the Gazette (e.g. "2,506"), or null
qualificationLevel - highest qualification the post requires, one of: "ol", "al", "nvq", "diploma", "degree", "masters", "professional"; or null if not stated
locations      - list of places of work as printed (e.g. ["Colombo"], ["Island-wide"]), or []
employmentTerm - "permanent", "contract" or "temporary" if stated, else null
examType       - "open" for an open competitive examination, "limited" for a limited competitive examination, "none" if selection is by interview only, else null
selectionMethod - how candidates are selected, as stated (e.g. "Written test and interview"), or null
howToApply     - list of short, plain-English steps taken only from the notice's own instructions (format, where to send, by when, how to mark the envelope), or []
requiredDocuments - list of documents the notice says to enclose, or []
category       - pick exactly one from this list, whichever fits best: {categories}
confidence     - your own confidence 0.0-1.0 that this extraction is accurate and complete

Every *Si field must be text copied directly from the Sinhala document below. If you cannot \
find a confident matching passage in it, use null for that field — do not translate the \
English text into Sinhala yourself, and do not guess.

--- ENGLISH TEXT ---
{text}
--- END ENGLISH TEXT ---

--- SINHALA TEXT ---
{sinhala_text}
--- END SINHALA TEXT ---
"""

# One Part I : Sec (IIA) PDF holds many notices, often several posts each (the Merchant
# Shipping Secretariat notice we verified against had three posts in one notice) — so
# structuring has to work on a batch of text and return an array, not one object per call.
BATCH_STRUCTURING_PROMPT = """You are extracting structured data from a chunk of pages \
from a real Sri Lankan government Gazette, Part I : Section (IIA) — Advertising (job \
vacancies and exam notices). This chunk may contain multiple separate notices, and a \
single notice may list multiple posts (e.g. "Post 1", "Post 2" under one recruiting \
institution) — treat each POST as its own entry, repeating the shared institution/\
gazette/closing-date fields for each.

Page breaks in the text are marked like [[PAGE 17]]; the number is the page that follows. \
Pages marked [[PAGE n - CONTINUATION ONLY]] are included only so you can read a notice that \
started earlier in this chunk through to its end. Only create entries for notices whose \
beginning (heading) is on a page NOT marked continuation-only. If the chunk opens partway \
through a notice that began on an earlier page (no heading visible for it), skip that notice \
— another chunk covers it. A specimen application form, schedule, appendix or syllabus that \
follows a notice is part of that notice, not a new one: never start an entry from it, and \
include its pages in that notice's page range.

Return ONLY a JSON array (no markdown fences, no commentary). Each element is an object \
with these exact keys: titleEn, instEn, descEn, age, quota, salary, qualEn, citation, \
citationType ("gazette" if a gazette number is cited, else "circular", else null), \
closingDateISO (YYYY-MM-DD or null), category (one of: {categories}), confidence (0.0-1.0), qualificationLevel, locations, employmentTerm, examType, selectionMethod, howToApply, requiredDocuments, pages — defined as follows:
pages          - [first, last] page numbers, from the [[PAGE n]] markers, that the whole notice this post belongs to is printed on (e.g. [17, 18]; [17, 17] if it fits on one page), or null if unsure
qualificationLevel - highest qualification the post requires, one of: "ol", "al", "nvq", "diploma", "degree", "masters", "professional"; or null if not stated
locations      - list of places of work as printed (e.g. ["Colombo"], ["Island-wide"]), or []
employmentTerm - "permanent", "contract" or "temporary" if stated, else null
examType       - "open" for an open competitive examination, "limited" for a limited competitive examination, "none" if selection is by interview only, else null
selectionMethod - how candidates are selected, as stated (e.g. "Written test and interview"), or null
howToApply     - list of short, plain-English steps taken only from the notice's own instructions (format, where to send, by when, how to mark the envelope), or []
requiredDocuments - list of documents the notice says to enclose, or []


Only include notices that recruit people into a post (job vacancies, and open or limited \
competitive examinations) or announce an examination for public servants. Do NOT include \
course, diploma, training or apprenticeship intakes — anything a person enrols in or pays a \
course fee for is not a job, even if the notice says "recruiting" (e.g. "recruiting \
apprentices for full-time courses"). Skip results, tenders, and rules-only notices too.

If a field isn't in the text, use null — never guess. If this chunk contains no qualifying \
notices (e.g. it's front matter, rules-and-instructions boilerplate, or an index), return \
an empty array [].

--- GAZETTE TEXT CHUNK ---
{text}
--- END ---
"""


def is_valid_title(title):
    """Rejects missing/empty titles and also the literal string "none"/"null" -- the LLM
    sometimes emits these as text instead of a real JSON null on pages that aren't
    actually a vacancy notice (e.g. an exam timetable page), and a plain truthiness
    check doesn't catch that since a non-empty string is still truthy."""
    if not title or not str(title).strip():
        return False
    return str(title).strip().lower() not in ("none", "null", "n/a")


# The masthead printed on every Gazette issue: "No. 2,506 – FRIDAY, SEPTEMBER 19, 2026".
GAZETTE_NUMBER_REGEX = re.compile(
    r"No\.\s*([\d,]{3,7})\s*[-–—]\s*(?:MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)",
    re.IGNORECASE,
)


def gazette_number_from_text(text):
    """The issue number from the Gazette's own masthead, or None if it isn't printed."""
    m = GAZETTE_NUMBER_REGEX.search(text or "")
    return m.group(1) if m else None


def next_serial(data, added, prefix):
    """Next free serial for a prefix. Computed from the highest existing number, not the
    list length: the list can shrink (entries removed or moved to fixtures), and a
    length-based serial would then reissue numbers already in use — and serials feed
    the vacancy's URL slug."""
    highest = 0
    for v in data["vacancies"] + added:
        m = re.fullmatch(rf"{re.escape(prefix)}-(\d+)", str(v.get("serial", "")))
        if m:
            highest = max(highest, int(m.group(1)))
    return f"{prefix}-{highest + 1}"


QUALIFICATION_LEVELS = {"ol", "al", "nvq", "diploma", "degree", "masters", "professional"}


def detail_fields(structured):
    """The eligibility and how-to-apply fields, normalised. Anything outside the
    allowed values becomes null rather than being guessed into a bucket."""
    def as_list(v):
        return [str(x).strip() for x in v if str(x).strip()] if isinstance(v, list) else []

    def one_of(v, allowed):
        v = str(v).strip().lower() if v else None
        return v if v in allowed else None

    return {
        "qualificationLevel": one_of(structured.get("qualificationLevel"), QUALIFICATION_LEVELS),
        "locations": as_list(structured.get("locations")),
        "employmentTerm": one_of(structured.get("employmentTerm"), {"permanent", "contract", "temporary"}),
        "examType": one_of(structured.get("examType"), {"open", "limited", "none"}),
        "selectionMethod": structured.get("selectionMethod") or None,
        "howToApply": as_list(structured.get("howToApply")),
        "requiredDocuments": as_list(structured.get("requiredDocuments")),
    }


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def most_recent_friday():
    today = datetime.now(timezone.utc).date()
    offset = (today.weekday() - 4) % 7  # weekday(): Mon=0 ... Fri=4
    return today - timedelta(days=offset)


def fetch_gazette_iia_pdf_urls(date_str):
    """date_str: 'YYYY-MM-DD'. Returns {'english': url|None, 'sinhala': ..., 'tamil': ...}
    pointing at real documents.gov.lk file-proxy URLs, or all-None if the page has no
    matching files (e.g. that Friday's issue isn't published yet)."""
    listing_url = f"https://documents.gov.lk/web/Gazette?date={date_str}"
    try:
        resp = requests.get(listing_url, timeout=20, headers={"User-Agent": "Mozilla/5.0"})
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"  ! could not fetch {listing_url}: {e}", file=sys.stderr)
        return {"english": None, "sinhala": None, "tamil": None}

    matches = sorted(set(GAZETTE_FILE_REGEX.findall(resp.text)))
    candidates = [m for m in matches if m.lower().endswith(".pdf") and IIA_PATTERN.search(m)]
    # Prefer filenames without "tem" (looks like a draft/temp marker in real listings)
    candidates.sort(key=lambda f: ("tem" in f.lower(), f))

    def pick(lang_marker):
        for f in candidates:
            if re.search(rf"\({lang_marker}\)", f, re.IGNORECASE):
                return "https://documents.gov.lk/api/content-file-proxy?file=" + requests.utils.quote(f)
        return None

    return {"english": pick("E"), "sinhala": pick("S"), "tamil": pick("T")}


def structure_batch_with_llm(text_chunk):
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        raise RuntimeError("OPENROUTER_API_KEY not set")

    # Room for page_chunks' ~8,000 chars of own pages plus ~5,000 of continuation pages.
    prompt = BATCH_STRUCTURING_PROMPT.format(categories=", ".join(CATEGORIES), text=text_chunk[:18000])
    resp = requests.post(
        OPENROUTER_URL,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/",
            "X-Title": "The Living Gazette - ingest",
        },
        # See structure_with_llm()'s comment -- same reasoning-model token-budget issue.
        # A real 3-post chunk (2026-10-03) needed 4,983 completion tokens, 3,098 of them
        # reasoning, and took ~70s: 4096 truncated it every time, hence 16000 / 300s.
        json={"model": OPENROUTER_MODEL, "messages": [{"role": "user", "content": prompt}], "max_tokens": 16000, "temperature": 0},
        timeout=300,
    )
    if resp.status_code != 200:
        raise RuntimeError(f"OpenRouter {resp.status_code}: {resp.text[:300]}")
    raw = resp.json()["choices"][0]["message"]["content"].strip()
    raw = re.sub(r"^```(json)?|```$", "", raw, flags=re.MULTILINE).strip()
    parsed = json.loads(raw)
    return parsed if isinstance(parsed, list) else []


def page_chunks(pages, max_chars=8000, lookahead_chars=5000):
    """Groups whole pages into chunks of roughly max_chars, each page prefixed with a
    [[PAGE n]] marker (n = the PDF's own 1-based page index) so the LLM can say which
    pages a notice is on. Each chunk also carries the next page or two marked as
    continuation-only, so a notice that runs past the chunk can be read to its end;
    the prompt says to start entries only on the chunk's own pages, so the notice is
    extracted once, by the chunk it begins in.
    Returns [(text, first_page, last_page, last_visible_page)]."""
    spans, start, size = [], 1, 0
    for n, page in enumerate(pages, start=1):
        if size and size + len(page) > max_chars:
            spans.append((start, n - 1))
            start, size = n, 0
        size += len(page)
    if pages:
        spans.append((start, len(pages)))

    chunks = []
    for first, last in spans:
        text = "".join(f"[[PAGE {n}]]\n{pages[n - 1]}\n" for n in range(first, last + 1))
        visible, extra = last, 0
        while visible < len(pages) and extra < lookahead_chars:
            visible += 1
            text += f"[[PAGE {visible} - CONTINUATION ONLY]]\n{pages[visible - 1]}\n"
            extra += len(pages[visible - 1])
        chunks.append((text, first, last, visible))
    return chunks


# A notice plus its specimen application form and syllabus runs to 8 pages in the
# 18/09/2026 issue (Assistant Director of Agriculture, pages 18-25).
MAX_NOTICE_PAGES = 10


def _norm_title(title):
    return re.sub(r"[^a-z0-9]+", "", (title or "").lower())


def find_same_notice(title, source_url, pages, others):
    """The entry for the same post already extracted from this issue, or None: titles
    match once case and punctuation are ignored, and the page ranges overlap or touch
    (or either has none). Neighbouring chunks can both see a notice that spans their
    boundary and word its institution differently each time, so an exact _sourceKey
    match lets these through — seen live 2026-10-03: one 13-post notice extracted three
    times, and a notice's specimen application form taken for a second notice."""
    t = _norm_title(title)
    for o in others:
        if o.get("sourceUrl") != source_url or _norm_title(o.get("titleEn")) != t:
            continue
        q = o.get("pdfPages")
        if not pages or not q or (pages[0] <= q[1] + 1 and q[0] <= pages[1] + 1):
            return o
    return None


def notice_page_range(raw, chunk_first, last_visible):
    """Checks the LLM's [first, last] page range for a notice. None means "don't trust
    it" and the reader gets the whole issue instead — the model only saw pages
    chunk_first..last_visible, so a range outside them is invented."""
    if isinstance(raw, int):
        raw = [raw, raw]
    if not isinstance(raw, list) or not 1 <= len(raw) <= 2:
        return None
    try:
        first, last = int(raw[0]), int(raw[-1])
    except (TypeError, ValueError):
        return None
    if not chunk_first <= first <= last <= last_visible or last - first >= MAX_NOTICE_PAGES:
        return None
    return first, last


def attach_gazette_pdfs(entries, content, urls):
    """Hosts the issue (and its Sinhala edition, when published) and points each entry
    at an excerpt of just its own pages (entry["pdfPages"]). The Sinhala edition is
    whole-issue only: each language edition has its own page numbering, and its text
    layer can't be searched (see STRUCTURING_PROMPT_BILINGUAL), so the notice can't be
    located in it."""
    full_url = save_pdf_locally(content, urls["english"])
    si_full_url = None
    if urls.get("sinhala"):
        si_content = download_pdf(urls["sinhala"])
        if si_content:
            si_full_url = save_pdf_locally(si_content, urls["sinhala"])
    for entry in entries:
        pages = entry.get("pdfPages")
        entry["pdfUrl"] = save_pdf_excerpt(content, urls["english"], *pages) if pages else full_url
        entry["pdfFullUrl"] = full_url
        entry["pdfFullUrlSi"] = si_full_url


def remove_unreferenced_pdfs(data):
    """Deletes hosted PDFs no vacancy points at any more — e.g. an excerpt superseded
    when a notice's page range was extended."""
    used = {Path(v[f]).name for v in data["vacancies"]
            for f in ("pdfUrl", "pdfUrlSi", "pdfFullUrl", "pdfFullUrlSi") if v.get(f)}
    for path in PDF_HOST_DIR.glob("*.pdf"):
        if path.name not in used:
            path.unlink()


def ingest_from_documents_gov_lk(data, budget, lookback_weeks=4):
    """The authoritative source. Chunked (not one LLM call per notice), and drawing on
    the run's shared LLMBudget to stay within OpenRouter's free tier (50 requests a
    day). A 28-page issue is ~16 chunks and a 52-page one ~30, so chunks that don't
    fit in this run's budget are left pending and the next run carries on — oldest
    issue first, since it's nearest to leaving the window. The workflow runs daily, so
    a backlog of two or three issues clears within a few days.

    documents.gov.lk usually doesn't publish a given Friday's English translation
    until several days later (confirmed live 2026-10-02: the 25/09 issue's English
    PDF only appeared a full week after that Friday) — so checking only "this week"
    means a late PDF is permanently missed the moment the next run moves on. This
    instead checks the last `lookback_weeks` Fridays every run, skipping any already
    recorded in data["processedGazetteDates"]. A date is only marked processed once
    every chunk of its issue was extracted: chunks that failed (the free model is
    often overloaded; a network drop fails them all) or weren't reached are kept in
    data["gazettePendingChunks"], keyed by their first page, and only those are
    sent next run — re-sending a chunk that already worked would re-extract its
    notices under slightly different titles and create near-duplicates."""
    processed = set(data.get("processedGazetteDates", []))
    pending = dict(data.get("gazettePendingChunks", {}))
    added = []
    friday = most_recent_friday()
    window = {(friday - timedelta(weeks=w)).isoformat() for w in range(lookback_weeks)}

    for stale in sorted(set(pending) - window):
        print(f"  ! {stale} issue fell out of the {lookback_weeks}-week window with chunks still failing"
              f" (first pages {pending[stale]}) — those notices won't be picked up.")
        del pending[stale]

    for weeks_back in reversed(range(lookback_weeks)):
        date_str = (friday - timedelta(weeks=weeks_back)).isoformat()
        if date_str in processed:
            continue
        if budget.left <= 0:
            print(f"  (LLM budget for this run used up — the {date_str} issue waits for the next run)")
            break

        print(f"Checking documents.gov.lk for the {date_str} issue...")
        urls = fetch_gazette_iia_pdf_urls(date_str)
        if not urls["english"]:
            print(f"  ! no Part I : Sec (IIA) English PDF found for {date_str} yet — will retry next run.")
            continue

        content = download_pdf(urls["english"])
        if content is None:
            continue  # transient — left unmarked so the next run retries it
        pages = pdf_page_texts(content)
        if looks_scanned(pages):
            print(f"  ! {date_str} issue looks scanned or empty — skipping"
                  " (see job.md §7.1 step 2 for the OCR fallback this needs).")
            processed.add(date_str)
            continue

        gazette_number = gazette_number_from_text("\n".join(pages)[:4000])
        print(f"  Gazette No. {gazette_number or '(not found on masthead)'}, published {date_str}")

        chunks = page_chunks(pages)
        todo = set(pending.get(date_str, [])) & {first for _, first, _, _ in chunks}
        if not todo:  # first visit (or the PDF was replaced and pages moved)
            todo = {first for _, first, _, _ in chunks}

        issue_entries = []
        extended = []  # earlier entries whose page range grew; their excerpt is re-cut
        done, failed = set(), 0
        for chunk, chunk_first, chunk_last, last_visible in chunks:
            if chunk_first not in todo or not budget.take():
                continue
            try:
                entries = structure_batch_with_llm(chunk)
            except Exception as e:
                print(f"  ! LLM batch structuring failed on {date_str} pages {chunk_first}-{chunk_last}: {e}",
                      file=sys.stderr)
                failed += 1
                continue
            done.add(chunk_first)
            for structured in entries:
                if not is_valid_title(structured.get("titleEn")):
                    continue
                page_range = notice_page_range(structured.get("pages"), chunk_first, last_visible)
                if page_range and page_range[0] > chunk_last:
                    continue  # starts on a continuation page — the next chunk owns it
                source_key = f"govlk-{date_str}-{structured['titleEn']}-{structured.get('instEn')}"
                source_url = f"https://documents.gov.lk/web/Gazette?date={date_str}"
                so_far = added + issue_entries
                if any(v.get("_sourceKey") == source_key for v in data["vacancies"] + so_far):
                    continue
                same = find_same_notice(structured["titleEn"], source_url, page_range, data["vacancies"] + so_far)
                if same:
                    q = same.get("pdfPages")
                    if page_range and q:
                        union = (min(q[0], page_range[0]), max(q[1], page_range[1]))
                        if union != tuple(q) and union[1] - union[0] < MAX_NOTICE_PAGES:
                            same["pdfPages"] = list(union)
                            if same not in issue_entries and same not in extended:
                                extended.append(same)
                    continue
                status, days = compute_status(structured.get("closingDateISO"))
                entry = {
                    "serial": next_serial(data, so_far, "GOVLK"),
                    "real": True,
                    "titleEn": structured.get("titleEn"),
                    "instEn": structured.get("instEn"),
                    "dateEn": structured.get("closingDateISO"),
                    "status": status,
                    "days": days,
                    "elig": "check",
                    "match": None,
                    "category": structured.get("category") if structured.get("category") in CATEGORIES else "Administrative & Management",
                    "citation": structured.get("citation") or f"Gazette {date_str}",
                    "citationType": structured.get("citationType") or "gazette",
                    "sourceKind": "gazette",
                    "gazetteNumber": gazette_number,
                    "publishedDate": date_str,
                    "firstSeenAt": now_iso(),
                    "sourceUrl": f"https://documents.gov.lk/web/Gazette?date={date_str}",
                    "pdfPages": list(page_range) if page_range else None,
                    "descEn": structured.get("descEn"),
                    "age": structured.get("age"),
                    "quota": structured.get("quota"),
                    "salary": structured.get("salary"),
                    "qualEn": structured.get("qualEn"),
                    "confidence": structured.get("confidence"),
                    **detail_fields(structured),
                    "verifiedAt": None,
                    "_needsReview": True,
                    "_sourceKey": source_key,
                }
                issue_entries.append(entry)

        if issue_entries or extended:
            attach_gazette_pdfs(issue_entries + extended, content, urls)
        for entry in issue_entries:
            added.append(entry)
            print(f"  + {entry['titleEn']} @ {entry['instEn']} (pages {entry['pdfPages']}, confidence {entry['confidence']})")
        for entry in extended:
            print(f"  ~ {entry['serial']} {entry['titleEn']}: page range extended to {entry['pdfPages']}")

        remaining = sorted(todo - done)
        if remaining:
            pending[date_str] = remaining
            print(f"  ! {len(remaining)} of {len(chunks)} chunks of the {date_str} issue still to do"
                  f" ({failed} failed, {len(remaining) - failed} not reached) — continuing next run.")
        else:
            pending.pop(date_str, None)
            processed.add(date_str)

    data["processedGazetteDates"] = sorted(processed)
    data["gazettePendingChunks"] = pending
    return added


def load_data():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_data(data):
    data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def discover_candidate_posts(existing_source_urls):
    """Return a list of (post_url,) tuples not already in our data."""
    candidates = []
    for page_url in DISCOVERY_PAGES:
        try:
            resp = requests.get(page_url, timeout=20, headers={"User-Agent": "TheLivingGazette/0.1 (+ingest bot)"})
            resp.raise_for_status()
        except requests.RequestException as e:
            print(f"  ! could not fetch discovery page {page_url}: {e}", file=sys.stderr)
            continue

        soup = BeautifulSoup(resp.text, "html.parser")
        for link in soup.select("article a[href*='.html'], h2 a[href*='.html'], h3 a[href*='.html']"):
            href = link.get("href")
            if not href or href in existing_source_urls:
                continue
            if href not in [c[0] for c in candidates]:
                candidates.append((href,))
    return candidates


def extract_pdf_url_and_source(post_url):
    """Returns (pdf_url, source_label, sinhala_pdf_url). gazette.lk posts a Sinhala
    sibling PDF (e.g. "...-S.pdf") alongside most English notices (confirmed directly
    2026-10-01); it's linked for readers, never machine-translated into."""
    try:
        resp = requests.get(post_url, timeout=20, headers={"User-Agent": "TheLivingGazette/0.1 (+ingest bot)"})
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"  ! could not fetch post {post_url}: {e}", file=sys.stderr)
        return None, None, None

    soup = BeautifulSoup(resp.text, "html.parser")
    pdf_links = [a["href"] for a in soup.find_all("a", href=True) if a["href"].lower().endswith(".pdf")]

    pdf_url = next((h for h in pdf_links if re.search(r"-E\.pdf$|english", h, re.I)), None)
    if not pdf_url and pdf_links:
        pdf_url = pdf_links[0]

    sinhala_pdf_url = next(
        (h for h in pdf_links if h != pdf_url and re.search(r"-S\.pdf$|sinhala", h, re.I)), None
    )

    source_label = None
    text = soup.get_text(" ", strip=True)
    m = re.search(r"Source:\s*([^\|\n]+)", text)
    if m:
        source_label = m.group(1).strip()

    return pdf_url, source_label, sinhala_pdf_url


def download_pdf(pdf_url):
    """The PDF's bytes, or None if it couldn't be fetched."""
    try:
        resp = requests.get(pdf_url, timeout=30, headers={"User-Agent": "TheLivingGazette/0.1 (+ingest bot)"})
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"  ! could not download PDF {pdf_url}: {e}", file=sys.stderr)
        return None
    return resp.content


def pdf_page_texts(content):
    if pdfplumber is None:
        raise RuntimeError("pdfplumber not installed")
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        return [p.extract_text() or "" for p in pdf.pages]


def looks_scanned(pages):
    # Near-zero extractable text means a scan, not a text-layer PDF.
    return len("".join(pages).strip()) < 200


def structure_with_llm(raw_text, sinhala_text=None):
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        raise RuntimeError("OPENROUTER_API_KEY not set")

    if sinhala_text:
        prompt = STRUCTURING_PROMPT_BILINGUAL.format(
            categories=", ".join(CATEGORIES), text=raw_text[:12000], sinhala_text=sinhala_text[:6000]
        )
    else:
        prompt = STRUCTURING_PROMPT.format(categories=", ".join(CATEGORIES), text=raw_text[:12000])

    resp = requests.post(
        OPENROUTER_URL,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            # Optional but recommended by OpenRouter for attribution on free-tier usage.
            "HTTP-Referer": "https://github.com/",
            "X-Title": "The Living Gazette - ingest",
        },
        json={
            "model": OPENROUTER_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            # nvidia/nemotron-3-ultra is a reasoning model -- it spends part of max_tokens
            # on internal reasoning before writing the actual JSON, so a too-low budget
            # here produces truncated/empty content (confirmed live 2026-09-19/20: real
            # GitHub Actions runs failed with "Expecting value: line 1 column 1" and
            # "Unterminated string" on several candidates with the previous 1024 limit,
            # and again at 4096 on 2026-10-02 — see structure_batch_with_llm()).
            "max_tokens": 16000,
            "temperature": 0,
        },
        timeout=300,
    )
    if resp.status_code != 200:
        raise RuntimeError(f"OpenRouter {resp.status_code}: {resp.text[:300]}")

    body = resp.json()
    raw = body["choices"][0]["message"]["content"].strip()
    raw = re.sub(r"^```(json)?|```$", "", raw, flags=re.MULTILINE).strip()
    return json.loads(raw)


def compute_status(closing_date_iso):
    if not closing_date_iso:
        return "open", "—"
    try:
        closing = datetime.strptime(closing_date_iso, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except ValueError:
        return "open", "—"
    delta = closing - datetime.now(timezone.utc)
    hours = delta.total_seconds() / 3600
    if hours < 0:
        return "closed", "—"
    if hours < 48:
        return "urgent", f"{int(hours)}h"
    days = int(hours / 24)
    if days <= 14:
        return "soon", f"{days} days"
    return "open", f"{days} days"


def skip_post(data, post_url, reason):
    """Remembers a gazette.lk post that will never become a vacancy (no PDF, a scan, or
    the model found no real post in it), so later runs don't spend an LLM call on it
    again. Transient failures (a download or LLM error) are NOT recorded: those retry."""
    data.setdefault("skippedSourceUrls", {})[post_url] = {"reason": reason, "at": now_iso()}


def main():
    data = load_data()
    budget = LLMBudget(MAX_LLM_CALLS_PER_RUN)
    existing_urls = {v.get("sourceUrl") for v in data["vacancies"] if v.get("sourceUrl")}
    existing_urls |= set(data.get("skippedSourceUrls", {}))
    existing_keys = {v.get("_sourceKey") for v in data["vacancies"] if v.get("_sourceKey")}
    snapshot = json.dumps(data, sort_keys=True)

    added = []

    # Pass 1 — the authoritative source. Verified working 2026-09-17 (job.md §11.3):
    # plain HTTP, no headless browser needed.
    print("=== documents.gov.lk (authoritative) ===")
    try:
        govlk_added = ingest_from_documents_gov_lk(data, budget)
        for e in govlk_added:
            if e.get("_sourceKey") in existing_keys:
                continue
            data["vacancies"].append(e)
            added.append(e)
    except Exception as e:
        print(f"  ! documents.gov.lk pass failed entirely: {e}", file=sys.stderr)

    # Pass 2 — discovery index for notices that never reach the Gazette (job.md §11.2).
    print("\n=== gazette.lk (discovery index, not authority) ===")
    candidates = discover_candidate_posts(existing_urls)
    print(f"Found {len(candidates)} candidate post(s) not already in data/vacancies.json"
          f" ({budget.left} LLM call(s) left this run)")

    for (post_url,) in candidates:
        print(f"- {post_url}")
        pdf_url, source_label, sinhala_pdf_url = extract_pdf_url_and_source(post_url)
        if not pdf_url:
            # A page that loaded but links no PDF; a failed fetch returns None too, but
            # extract_pdf_url_and_source already printed that and it's worth a retry.
            print("  ! no PDF link found, skipping")
            continue

        content = download_pdf(pdf_url)
        if content is None:
            continue
        pages = pdf_page_texts(content)
        if looks_scanned(pages):
            print("  ! looks like a scanned PDF (no OCR configured in this script yet) — skipping."
                  " See job.md §7.1 step 2 for the Tesseract fallback this needs.")
            skip_post(data, post_url, "scanned PDF, no text layer")
            continue

        if not budget.take():
            print("  (LLM budget for this run used up — remaining posts wait for the next run)")
            break
        try:
            structured = structure_with_llm("\n".join(pages).strip())
        except Exception as e:
            print(f"  ! LLM structuring failed: {e}", file=sys.stderr)
            continue

        if not is_valid_title(structured.get("titleEn")):
            print("  ! no real title extracted (likely not an actual vacancy notice) — skipping")
            skip_post(data, post_url, "no vacancy found in the notice")
            continue

        # Kept — only now host the PDFs. The Sinhala sibling, when one exists, is linked
        # as-is rather than text-extracted: pdfplumber returns real Sinhala characters in
        # scrambled order for these files (a known limitation of generic PDF extractors
        # with complex scripts, confirmed live 2026-10-01) — readable in the PDF, garbage
        # as text. See STRUCTURING_PROMPT_BILINGUAL for what real OCR would unblock.
        local_pdf_url = save_pdf_locally(content, pdf_url)
        local_si_pdf_url = None
        if sinhala_pdf_url:
            si_content = download_pdf(sinhala_pdf_url)
            if si_content:
                local_si_pdf_url = save_pdf_locally(si_content, sinhala_pdf_url)

        status, days = compute_status(structured.get("closingDateISO"))

        entry = {
            "serial": next_serial(data, added, "ING"),
            "titleEn": structured.get("titleEn"),
            "instEn": structured.get("instEn"),
            "dateEn": structured.get("closingDateISO"),
            "status": status,
            "days": days,
            "elig": "check",
            "match": None,
            "category": structured.get("category") if structured.get("category") in CATEGORIES else "Administrative & Management",
            "citation": structured.get("citation"),
            "citationType": structured.get("citationType"),
            # gazette.lk mostly reposts institutions' own adverts. Only call it a Gazette
            # notice when the notice itself cites a Gazette issue.
            "sourceKind": "gazette" if structured.get("gazetteNumber") else "institution-notice",
            "gazetteNumber": structured.get("gazetteNumber"),
            "publishedDate": structured.get("publishedDateISO"),
            "firstSeenAt": now_iso(),
            "sourceUrl": post_url,
            "pdfUrl": local_pdf_url,
            "pdfUrlSi": local_si_pdf_url,
            "sourceLabel": source_label,
            "descEn": structured.get("descEn"),
            "age": structured.get("age"),
            "quota": structured.get("quota"),
            "salary": structured.get("salary"),
            "qualEn": structured.get("qualEn"),
            "confidence": structured.get("confidence"),
            **detail_fields(structured),
            "verifiedAt": None,
            "_needsReview": True,
        }
        data["vacancies"].append(entry)
        added.append(entry)
        print(f"  + added: {entry['titleEn']} @ {entry['instEn']} (confidence {entry['confidence']})")

    if json.dumps(data, sort_keys=True) == snapshot:
        print("\nNothing new this run.")
        return
    # Saved even with no new vacancies: settled Gazette issues/chunks must be recorded so
    # the next run doesn't re-fetch and re-bill the LLM for them, and extended page
    # ranges re-point existing entries at new excerpts.
    remove_unreferenced_pdfs(data)
    save_data(data)
    if added:
        print(f"\n{len(added)} new vacancy(ies) written to data/vacancies.json — review before merging.")
    else:
        print("\nNo new vacancies, but Gazette tracking or page ranges updated.")


if __name__ == "__main__":
    main()
