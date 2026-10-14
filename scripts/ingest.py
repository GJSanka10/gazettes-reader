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
import math
import os
import re
import shutil
import subprocess
import sys
import time
from collections import Counter
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
# Update 2026-10-11: for the Gazette's own Sinhala editions the scrambling was
# pdfplumber's, not the PDF's — PyMuPDF plus clean_sinhala() reads them correctly, and
# Gazette vacancies now get their Sinhala title that way (add_sinhala_to_gazette_vacancies).
# Institutions' own Sinhala PDFs (gazette.lk) are still linked as-is: several use legacy
# font encodings or are scans. Showing Sinhala is scoped to Gazette vacancies only.
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
    at an excerpt of just its own pages (entry["pdfPages"]). The Sinhala edition starts
    as the whole issue: its notices are in a different order on different pages, and
    add_sinhala_to_gazette_vacancies() narrows it to the notice once it has found it."""
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
    # A Sinhala excerpt waiting for review is in use too.
    used |= {Path(v["_siPending"]["pdfUrlSi"]).name for v in data["vacancies"]
             if (v.get("_siPending") or {}).get("pdfUrlSi")}
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


# Many institutions post their advert as a scanned image in a PDF (Litro, Lake House,
# ITN, NERDC... 13 skipped in October 2026). Those are read with Tesseract, installed
# on the GitHub runner (see ingest.yml); without it, scans are skipped as before.
# English only: these are the English adverts, and the site only needs Sinhala for
# Gazette vacancies, which have a real text layer.
OCR_MAX_PAGES = 6
OCR_DPI = 300
SCANNED_SKIP_REASON = "scanned PDF, no text layer"
OCR_NOTE = (
    "[This text was read from a scanned image by OCR, so letters and digits can be "
    "misread. If a date, number or amount is unclear or implausible, use null for it.]\n\n"
)


def ocr_available():
    return shutil.which("tesseract") is not None


def ocr_page_texts(content):
    """A scanned PDF's text, page by page, read by Tesseract from 300 dpi greyscale
    renders of its first OCR_MAX_PAGES pages; [] if Tesseract isn't installed."""
    import pymupdf

    if not ocr_available():
        return []
    texts = []
    for page in list(pymupdf.open(stream=content, filetype="pdf"))[:OCR_MAX_PAGES]:
        png = page.get_pixmap(dpi=OCR_DPI, colorspace=pymupdf.csGRAY).tobytes("png")
        try:
            result = subprocess.run(["tesseract", "stdin", "stdout", "-l", "eng", "--psm", "3"],
                                    input=png, capture_output=True, timeout=180)
        except subprocess.TimeoutExpired:
            texts.append("")
            continue
        texts.append(result.stdout.decode("utf-8", "replace") if result.returncode == 0 else "")
    return texts


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


# ---------------------------------------------------------------------------
# Sinhala for Gazette vacancies: the post title and institution, COPIED from the
# Sinhala edition of the same issue, never translated.
#
# pdfplumber scrambles this text, but PyMuPDF reads the Gazette's Sinhala editions
# (IskoolaPota, Unicode) correctly apart from two mechanical faults in what it
# returns: each dependent vowel sign / al-lakuna / anusvara comes out doubled, and
# stray glyph codes (Latin Extended-B, IPA, U+FFFD, private use) are scattered in.
# Sinhala never has the same dependent sign twice in a row, so collapsing repeats
# and dropping the strays restores the printed text (checked word for word against
# the rendered pages of Gazettes 2,507, 2,508 and 2,509 on 2026-10-11).
#
# The two editions print notices in a DIFFERENT order with different page numbers,
# so each notice is located in the Sinhala edition first, by the numbers both editions
# print (salaries, dates, counts; see locate_notices). Then one LLM call per notice
# copies each post's Sinhala title, or null if the pages are a different notice; an
# earlier version asked the LLM to locate notices from page headings, and its replies
# came back empty on the first live run (2026-10-12). Any value that
# isn't found word for word in the Sinhala text is dropped, so a translation or a
# guess can't get through; a field we can't fill stays empty.
# ---------------------------------------------------------------------------

SI_SIGNS = "ඁංඃ්ාැෑිීුූෘෙේෛොෝෞෟෲෳ"
SI_JUNK = re.compile("[ƀ-˿�-]")
SI_DOUBLED = re.compile("([" + SI_SIGNS + "])\\1+")
# The repeat can land after a space or line break ("සහකා\nාර" for සහකාර, 18/09/2026
# issue). No word starts with a dependent sign, so one right after whitespace that
# repeats the sign before it is the duplicate, whitespace included.
SI_SPLIT_DOUBLE = re.compile("([" + SI_SIGNS + "])\\s+\\1")
# Spent on Sinhala per run at most, after the English Gazette pass and before
# gazette.lk, so a Sinhala backlog can't starve new vacancies.
MAX_SINHALA_CALLS_PER_RUN = 15
# Bump when the Sinhala method changes, so vacancies an older method gave up on are
# tried again. "lines-v1" (2026-10-12) answered with line numbers, which took whole
# lines with labels and counts in them; "text-v2" copies just the name, and only suggests.
SI_METHOD = "text-v2"


def clean_sinhala(text):
    text = SI_JUNK.sub("", text or "")
    text = SI_SPLIT_DOUBLE.sub(r"\1", text)
    text = SI_DOUBLED.sub(r"\1", text)
    return re.sub("‍{2,}", "‍", text)


def is_sinhala_text(text):
    """Mostly Sinhala letters, with no stray glyph codes left in."""
    letters = [c for c in text or "" if c.isalpha()]
    sinhala = sum(1 for c in letters if "඀" <= c <= "෿")
    return bool(letters) and sinhala / len(letters) >= 0.6 and not SI_JUNK.search(text)


def sinhala_pages(path):
    """A Sinhala edition's page texts, cleaned."""
    import pymupdf

    return [clean_sinhala(page.get_text()) for page in pymupdf.open(path)]


def english_pages(path):
    import pymupdf

    return [page.get_text() for page in pymupdf.open(path)]


def number_tokens(text):
    """Numbers both editions print identically: thousands separators joined, dates
    split so either order matches; 2+ digits only."""
    t = re.sub(r"(?<=\d),(?=\d{3}\b)", "", text or "")
    out = []
    for tok in re.findall(r"\d[\d./-]*\d", t):
        out += [p.lstrip("0") for p in re.split(r"[./-]", tok) if len(p.lstrip("0")) >= 2]
    return out


def numbers_agree(en_text, si_text):
    """Share of the English notice's distinctive numbers also printed in the Sinhala
    pages. Years are everywhere, so they don't count."""
    want = {t for t in number_tokens(en_text) if not re.fullmatch(r"20\d\d", t)}
    if len(want) < 3:
        return 1.0  # too few numbers to judge either way
    have = set(number_tokens(si_text))
    return len(want & have) / len(want)


def locate_notices(notices, en, si):
    """Finds each English notice's pages in the Sinhala edition by the numbers both
    print (salaries, dates, counts, reference numbers), weighted by how rare each is in
    the issue. Every candidate range gets an F1 score: recall is how much of the
    notice's numbers it holds, precision how much of the range's numbers belong to the
    notice, so a long range can't win just by being long. Most confident first, and
    two notices never claim the same pages (they may share a boundary page).
    notices: {(first, last): ...} in English pages. Returns {(first, last): (a, b)}.
    Not every guess is right; the copy step confirms it's the same notice."""
    pages_tok = [number_tokens(p) for p in si]
    df = Counter(t for toks in pages_tok for t in set(toks))
    idf = {t: math.log(len(si) / c) for t, c in df.items()}

    def weight(counter):
        return sum(idf.get(t, 0) * c for t, c in counter.items())

    candidates = {}
    for first, last in notices:
        want = Counter(number_tokens("\n".join(en[first - 1:last])))
        want_w = weight(want) or 1
        length, scored = last - first + 1, []
        for size in range(max(1, length - 3), length + 4):
            for start in range(0, len(si) - size + 1):
                have = Counter()
                for toks in pages_tok[start:start + size]:
                    have.update(toks)
                shared = weight(want & have)
                recall, precision = shared / want_w, shared / (weight(have) or 1)
                f1 = 2 * recall * precision / (recall + precision) if shared else 0
                scored.append((f1, start + 1, start + size))
        candidates[(first, last)] = sorted(scored, reverse=True)

    taken, found = [], {}
    for key in sorted(candidates, key=lambda k: -(candidates[k][0][0] if candidates[k] else 0)):
        for f1, a, b in candidates[key]:
            if f1 < 0.4:
                break
            if any(set(range(a + 1, b)) & set(range(x, y + 1)) or (a, b) == (x, y) for x, y in taken):
                continue
            found[key] = (a, b)
            taken.append((a, b))
            break
    return found


SI_COPY_PROMPT = """Below is the text of one notice from the SINHALA edition of a Sri Lankan \
Government Gazette, and the posts the ENGLISH edition of the same notice lists. For each post, \
copy from the Sinhala text:
title - just this post's name as printed (e.g. the table cell or the heading words that name the \
post), nothing before or after it: no "post name:" label, no number of vacancies, no duties
inst  - just the recruiting institution's name as printed

Copy characters exactly; never translate, paraphrase or correct. Keep it short. If the Sinhala \
text is not the same notice (for example a different post, or a 1st examination where the English \
says 2nd), or you are not sure which words are this post's name, use null. Return ONLY a JSON \
object mapping each post key to {{"title": ... or null, "inst": ... or null}}.

--- ENGLISH POSTS ---
{posts}
--- END ---

--- SINHALA NOTICE TEXT ---
{text}
--- END ---
"""

# All free OpenRouter models are reasoning models now (2026-10-12). The Sinhala
# lookup needs no reasoning; Gemma handles Sinhala well, lets reasoning be switched
# off and supports a JSON response format. The run's main model is the fallback.
OPENROUTER_SINHALA_MODEL = os.environ.get("OPENROUTER_SINHALA_MODEL", "google/gemma-4-31b-it:free")


def extract_json_object(raw, expect=()):
    """The JSON object in a reply, even when the model wrote prose around it (some
    write their working, with {...}-shaped examples, into the reply itself): the last
    object that parses, preferring one keyed by the expected post keys."""
    decoder, found = json.JSONDecoder(), []
    for i, ch in enumerate(raw):
        if ch != "{":
            continue
        try:
            obj, _ = decoder.raw_decode(raw, i)
        except ValueError:
            continue
        if isinstance(obj, dict):
            found.append(obj)
    keyed = [o for o in found if set(o) & set(expect)]
    return (keyed or found or [None])[-1]


def call_llm_json(prompt, model=None, expect=()):
    """One JSON object from the model, or an error that says why there wasn't one
    (finish_reason and token usage) so the log shows what went wrong."""
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        raise RuntimeError("OPENROUTER_API_KEY not set")
    resp = requests.post(
        OPENROUTER_URL,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/",
            "X-Title": "The Living Gazette - ingest",
        },
        json={
            "model": model or OPENROUTER_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 16000,
            "temperature": 0,
            "reasoning": {"enabled": False} if model else {"effort": "low"},
            **({"response_format": {"type": "json_object"}} if model else {}),
        },
        timeout=300,
    )
    if resp.status_code != 200:
        raise RuntimeError(f"OpenRouter {resp.status_code}: {resp.text[:300]}")
    body = resp.json()
    choice = (body.get("choices") or [{}])[0]
    raw = ((choice.get("message") or {}).get("content") or "").strip()
    obj = extract_json_object(raw, expect)
    if obj is None:
        raise RuntimeError(f"no JSON in reply (finish_reason={choice.get('finish_reason')},"
                           f" usage={(body.get('usage') or {}).get('completion_tokens')} completion tokens,"
                           f" content={raw[:120]!r})")
    return obj


def tidy_sinhala_name(value, notice_text):
    """A post or institution name the model copied, tidied and checked; None if it
    isn't fit to show. It must appear in the notice's Sinhala text word for word
    (whitespace aside), so it can't be a translation or a guess. Trailing vacancy
    counts ("පරිපාලන නිලධාරි 01") and edge punctuation are trimmed; labels ("…: "),
    fragments that start mid-word, and long passages are refused."""
    value = clean_sinhala(str(value or "")).strip()
    value = re.sub(r"\s+", " ", value)
    value = re.sub(r"\s+\(?\d{1,3}\)?\s*(?:ක්|කි)?\.?$", "", value)  # "… 01", "… (19)", "… 08කි."
    value = value.strip(" .;,:-–")
    if not 2 <= len(value) <= 160 or ":" in value or not is_sinhala_text(value):
        return None
    if value[0] in SI_SIGNS:  # starts on a vowel sign: cut mid-word
        return None
    if re.sub(r"\s+", "", value) not in re.sub(r"\s+", "", notice_text):
        return None
    return value


def save_local_excerpt(local_url, first_page, last_page):
    """An excerpt of a PDF already hosted under PDF_HOST_DIR."""
    src = PDF_HOST_DIR / Path(local_url).name
    filename = f"{src.stem}-p{first_page}-{last_page}.pdf"
    path = PDF_HOST_DIR / filename
    if not path.exists():
        reader = PdfReader(str(src))
        writer = PdfWriter()
        for i in range(first_page - 1, last_page):
            writer.add_page(reader.pages[i])
        with open(path, "wb") as f:
            writer.write(f)
    return f"/gazette-pdfs/{filename}"


def add_sinhala_to_gazette_vacancies(data, budget):
    """Suggests a Sinhala title and institution (and a Sinhala excerpt) for Gazette
    vacancies that don't have them, from the hosted Sinhala edition.

    Suggestions go into v["_siPending"], which the site never shows. They only go
    live once someone has checked them against the Sinhala PDF and run
    scripts/approve_sinhala.py: early runs put live a title from the wrong post, one
    from the wrong notice and some fragments (2026-10-12/13), and review PRs get
    merged without a Sinhala reader looking. Each vacancy is tried once per method
    (_siChecked = SI_METHOD); a failed LLM call leaves it untried so the next run
    retries."""
    spend = LLMBudget(min(MAX_SINHALA_CALLS_PER_RUN, budget.left))
    issues = {}
    for v in data["vacancies"]:
        if (v.get("sourceKind") == "gazette" and v.get("pdfPages") and v.get("pdfFullUrl")
                and v.get("pdfFullUrlSi") and not v.get("titleSi") and not v.get("_siPending")
                and v.get("_siChecked") != SI_METHOD):
            issues.setdefault((v["pdfFullUrl"], v["pdfFullUrlSi"]), []).append(v)

    for (en_url, si_url), vacancies in issues.items():
        en_path, si_path = PDF_HOST_DIR / Path(en_url).name, PDF_HOST_DIR / Path(si_url).name
        if not en_path.exists() or not si_path.exists() or spend.left <= 0:
            continue
        en, si = english_pages(en_path), sinhala_pages(si_path)
        if sum(is_sinhala_text(p) for p in si) < len(si) / 2:
            print(f"  ! {si_path.name}: Sinhala text layer unusable — skipping this issue")
            for v in vacancies:
                v["_siChecked"] = SI_METHOD
            continue

        notices = {}
        for v in vacancies:
            notices.setdefault(tuple(v["pdfPages"]), []).append(v)
        located = locate_notices(notices, en, si)

        for key, posts in notices.items():
            pages = located.get(key)
            si_text = "\n".join(si[pages[0] - 1:pages[1]]) if pages else ""
            if not pages or numbers_agree("\n".join(en[key[0] - 1:key[1]]), si_text) < 0.5:
                print(f"  ~ no confident Sinhala match for pages {key[0]}-{key[1]} ({posts[0]['titleEn']})")
                for v in posts:
                    v["_siChecked"] = SI_METHOD
                continue
            prompt = SI_COPY_PROMPT.format(
                posts="\n".join(f"{v['serial']}: {v['titleEn']} — {v.get('instEn')}" for v in posts),
                text=si_text[:10000])
            expect = [v["serial"] for v in posts]
            answer = None
            # Gemma's free tier is often briefly rate-limited upstream (429): wait and
            # retry it once before falling back to the main model.
            rate_limited = False
            for model, wait in ((OPENROUTER_SINHALA_MODEL, 0), (OPENROUTER_SINHALA_MODEL, 30), (None, 0)):
                if wait and not rate_limited:
                    continue  # only a rate limit is worth waiting out
                if not spend.take() or not budget.take():
                    break
                time.sleep(wait)
                try:
                    answer = call_llm_json(prompt, model=model, expect=expect)
                    break
                except Exception as e:
                    rate_limited = " 429" in str(e)
                    print(f"  ! Sinhala lookup for pages {key[0]}-{key[1]} failed"
                          f" ({model or OPENROUTER_MODEL}): {str(e)[:200]}", file=sys.stderr)
            if answer is None:
                continue  # left untried: the next run retries
            span = (max(1, pages[0] - 1), min(len(si), pages[1] + 1))
            excerpt = None
            for v in posts:
                got = answer.get(v["serial"]) if isinstance(answer, dict) else None
                got = got if isinstance(got, dict) else {}
                title = tidy_sinhala_name(got.get("title"), si_text)
                inst = tidy_sinhala_name(got.get("inst"), si_text)
                v["_siChecked"] = SI_METHOD
                if title:
                    # The numbers can sit a page inside the notice's real edges, so
                    # the excerpt takes one page either side.
                    excerpt = excerpt or save_local_excerpt(si_url, *span)
                    v["_siPending"] = {"titleSi": title, "instSi": inst, "pdfUrlSi": excerpt,
                                       "pdfPagesSi": list(span)}
                print(f"  ? {v['serial']} {v['titleEn']}: {title or '(no title found)'}"
                      f"{f' — {inst}' if title and inst else ''}  [Sinhala pages {span[0]}-{span[1]}]")


def skip_post(data, post_url, reason):
    """Remembers a gazette.lk post that will never become a vacancy (no PDF, a scan, or
    the model found no real post in it), so later runs don't spend an LLM call on it
    again. Transient failures (a download or LLM error) are NOT recorded: those retry."""
    data.setdefault("skippedSourceUrls", {})[post_url] = {"reason": reason, "at": now_iso()}


def main():
    data = load_data()
    budget = LLMBudget(MAX_LLM_CALLS_PER_RUN)
    # Scans skipped before OCR was available get one more go now that it is.
    skipped = data.get("skippedSourceUrls", {})
    if ocr_available():
        retry = [u for u, s in skipped.items() if s.get("reason") == SCANNED_SKIP_REASON]
        for u in retry:
            del skipped[u]
        if retry:
            print(f"OCR available: retrying {len(retry)} scanned notice(s) skipped earlier.")
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
    # Reads the Sinhala editions the pass above just hosted, as well as earlier ones.
    print("\n=== Sinhala titles for Gazette vacancies ===")
    try:
        add_sinhala_to_gazette_vacancies(data, budget)
    except Exception as e:
        print(f"  ! Sinhala pass failed: {e}", file=sys.stderr)

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
        via_ocr = False
        if looks_scanned(pages):
            if not ocr_available():
                print("  ! looks like a scanned PDF and Tesseract isn't installed — skipping.")
                skip_post(data, post_url, SCANNED_SKIP_REASON)
                continue
            pages = ocr_page_texts(content)
            if looks_scanned(pages):
                print("  ! scanned PDF, and OCR found no usable text — skipping.")
                skip_post(data, post_url, "scanned PDF, OCR found no usable text")
                continue
            via_ocr = True
            print(f"  (scanned PDF: read {len(''.join(pages))} characters by OCR)")

        if not budget.take():
            print("  (LLM budget for this run used up — remaining posts wait for the next run)")
            break
        try:
            structured = structure_with_llm((OCR_NOTE if via_ocr else "") + "\n".join(pages).strip())
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
            # Read from a scan: check every date and number against the PDF in review.
            **({"_ocr": True} if via_ocr else {}),
        }
        data["vacancies"].append(entry)
        added.append(entry)
        print(f"  + added{' (OCR — check dates and numbers)' if via_ocr else ''}: {entry['titleEn']}"
              f" @ {entry['instEn']} (confidence {entry['confidence']})")

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
