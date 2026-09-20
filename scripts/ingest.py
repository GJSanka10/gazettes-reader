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

import json
import os
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import requests
from bs4 import BeautifulSoup

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
category       - pick exactly one from this list, whichever fits best: {categories}
confidence     - your own confidence 0.0-1.0 that this extraction is accurate and complete

If a field genuinely isn't in the text, use null. Do not guess or invent values.

--- ADVERTISEMENT TEXT ---
{text}
--- END ---
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

Return ONLY a JSON array (no markdown fences, no commentary). Each element is an object \
with these exact keys: titleEn, instEn, descEn, age, quota, salary, qualEn, citation, \
citationType ("gazette" if a gazette number is cited, else "circular", else null), \
closingDateISO (YYYY-MM-DD or null), category (one of: {categories}), confidence (0.0-1.0).

If a field isn't in the text, use null — never guess. If this chunk contains no actual \
vacancy/post notices (e.g. it's front matter, rules-and-instructions boilerplate, or an \
index), return an empty array [].

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

    prompt = BATCH_STRUCTURING_PROMPT.format(categories=", ".join(CATEGORIES), text=text_chunk[:12000])
    resp = requests.post(
        OPENROUTER_URL,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/",
            "X-Title": "The Living Gazette - ingest",
        },
        # See structure_with_llm()'s comment -- same reasoning-model token-budget issue,
        # confirmed live via real GitHub Actions runs, not just the single-notice path.
        json={"model": OPENROUTER_MODEL, "messages": [{"role": "user", "content": prompt}], "max_tokens": 4096, "temperature": 0},
        timeout=90,
    )
    if resp.status_code != 200:
        raise RuntimeError(f"OpenRouter {resp.status_code}: {resp.text[:300]}")
    raw = resp.json()["choices"][0]["message"]["content"].strip()
    raw = re.sub(r"^```(json)?|```$", "", raw, flags=re.MULTILINE).strip()
    parsed = json.loads(raw)
    return parsed if isinstance(parsed, list) else []


def ingest_from_documents_gov_lk(data, pages_per_chunk=4, max_chunks=8):
    """The authoritative source. Chunked (not one LLM call per notice) to stay well
    within OpenRouter's free-tier daily request cap — see job.md §7.1."""
    date_str = most_recent_friday().isoformat()
    print(f"Checking documents.gov.lk for the {date_str} issue...")
    urls = fetch_gazette_iia_pdf_urls(date_str)
    if not urls["english"]:
        print("  ! no Part I : Sec (IIA) English PDF found for that date yet — skipping this source this run.")
        return []

    text, needs_ocr = extract_pdf_text(urls["english"])
    if needs_ocr or not text:
        print("  ! looks scanned or empty — skipping (see job.md §7.1 step 2 for the OCR fallback this needs).")
        return []

    # Rough page splitting: pdfplumber gave us one blob, so split back into pages via
    # the page-number headers this Gazette prints, and batch a handful per LLM call.
    added = []
    chunks = [text[i:i + 9000] for i in range(0, len(text), 9000)][:max_chunks]
    for idx, chunk in enumerate(chunks):
        try:
            entries = structure_batch_with_llm(chunk)
        except Exception as e:
            print(f"  ! LLM batch structuring failed on chunk {idx}: {e}", file=sys.stderr)
            continue
        for structured in entries:
            if not is_valid_title(structured.get("titleEn")):
                continue
            source_key = f"govlk-{date_str}-{structured['titleEn']}-{structured.get('instEn')}"
            if any(v.get("_sourceKey") == source_key for v in data["vacancies"] + added):
                continue
            status, days = compute_status(structured.get("closingDateISO"))
            entry = {
                "serial": f"GOVLK-{len(data['vacancies']) + len(added) + 1}",
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
                "sourceUrl": f"https://documents.gov.lk/web/Gazette?date={date_str}",
                "pdfUrl": urls["english"],
                "descEn": structured.get("descEn"),
                "age": structured.get("age"),
                "quota": structured.get("quota"),
                "salary": structured.get("salary"),
                "qualEn": structured.get("qualEn"),
                "confidence": structured.get("confidence"),
                "verifiedAt": None,
                "_needsReview": True,
                "_sourceKey": source_key,
            }
            added.append(entry)
            print(f"  + {entry['titleEn']} @ {entry['instEn']} (confidence {entry['confidence']})")
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
    try:
        resp = requests.get(post_url, timeout=20, headers={"User-Agent": "TheLivingGazette/0.1 (+ingest bot)"})
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"  ! could not fetch post {post_url}: {e}", file=sys.stderr)
        return None, None

    soup = BeautifulSoup(resp.text, "html.parser")

    pdf_url = None
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.lower().endswith(".pdf") and re.search(r"-E\.pdf$|english", href, re.I):
            pdf_url = href
            break
    if not pdf_url:
        for a in soup.find_all("a", href=True):
            if a["href"].lower().endswith(".pdf"):
                pdf_url = a["href"]
                break

    source_label = None
    text = soup.get_text(" ", strip=True)
    m = re.search(r"Source:\s*([^\|\n]+)", text)
    if m:
        source_label = m.group(1).strip()

    return pdf_url, source_label


def extract_pdf_text(pdf_url):
    """Returns (text, needs_ocr: bool)."""
    if pdfplumber is None:
        raise RuntimeError("pdfplumber not installed")
    try:
        resp = requests.get(pdf_url, timeout=30, headers={"User-Agent": "TheLivingGazette/0.1 (+ingest bot)"})
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"  ! could not download PDF {pdf_url}: {e}", file=sys.stderr)
        return None, True

    tmp_path = ROOT / "_tmp_ingest.pdf"
    tmp_path.write_bytes(resp.content)
    try:
        with pdfplumber.open(tmp_path) as pdf:
            pages_text = [p.extract_text() or "" for p in pdf.pages]
        text = "\n".join(pages_text).strip()
    finally:
        tmp_path.unlink(missing_ok=True)

    # Heuristic: near-zero extractable text density means it's a scan, not a text-layer PDF.
    needs_ocr = len(text) < 200
    return text, needs_ocr


def structure_with_llm(raw_text):
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        raise RuntimeError("OPENROUTER_API_KEY not set")

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
            # "Unterminated string" on several candidates with the previous 1024 limit).
            "max_tokens": 4096,
            "temperature": 0,
        },
        timeout=60,
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


def main():
    data = load_data()
    existing_urls = {v.get("sourceUrl") for v in data["vacancies"] if v.get("sourceUrl")}
    existing_keys = {v.get("_sourceKey") for v in data["vacancies"] if v.get("_sourceKey")}

    added = []

    # Pass 1 — the authoritative source. Verified working 2026-09-17 (job.md §11.3):
    # plain HTTP, no headless browser needed.
    print("=== documents.gov.lk (authoritative) ===")
    try:
        govlk_added = ingest_from_documents_gov_lk(data)
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
    print(f"Found {len(candidates)} candidate post(s) not already in data/vacancies.json")

    for (post_url,) in candidates:
        print(f"- {post_url}")
        pdf_url, source_label = extract_pdf_url_and_source(post_url)
        if not pdf_url:
            print("  ! no PDF link found, skipping")
            continue

        text, needs_ocr = extract_pdf_text(pdf_url)
        if needs_ocr or not text:
            print("  ! looks like a scanned PDF (no OCR configured in this script yet) — skipping."
                  " See job.md §7.1 step 2 for the Tesseract fallback this needs.")
            continue

        try:
            structured = structure_with_llm(text)
        except Exception as e:
            print(f"  ! LLM structuring failed: {e}", file=sys.stderr)
            continue

        if not is_valid_title(structured.get("titleEn")):
            print("  ! no real title extracted (likely not an actual vacancy notice) — skipping")
            continue

        status, days = compute_status(structured.get("closingDateISO"))

        entry = {
            "serial": f"ING-{len(data['vacancies']) + len(added) + 1}",
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
            "sourceUrl": post_url,
            "pdfUrl": pdf_url,
            "sourceLabel": source_label,
            "descEn": structured.get("descEn"),
            "age": structured.get("age"),
            "quota": structured.get("quota"),
            "salary": structured.get("salary"),
            "qualEn": structured.get("qualEn"),
            "confidence": structured.get("confidence"),
            "verifiedAt": None,
            "_needsReview": True,
        }
        data["vacancies"].append(entry)
        added.append(entry)
        print(f"  + added: {entry['titleEn']} @ {entry['instEn']} (confidence {entry['confidence']})")

    if added:
        save_data(data)
        print(f"\n{len(added)} new vacancy(ies) written to data/vacancies.json — review before merging.")
    else:
        print("\nNothing new this run.")


if __name__ == "__main__":
    main()
