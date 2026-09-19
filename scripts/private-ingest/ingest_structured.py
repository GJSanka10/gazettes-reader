"""
Private-sector vacancy ingestion via structured-data connectors (schema.org JSON-LD or
Microdata embedded on a company's own careers site). Separate pipeline from
scripts/ingest.py -- no shared code, no shared data file. See sources.json for the
source registry; only entries with active:true and method in
("schema-microdata", "json-ld") are processed here.

Global companies list jobs from every office on one careers page, so each candidate
posting is filtered down to ones whose visible location text mentions Sri Lanka.
"""

import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

from common import compute_status
from dedupe import fingerprint

ROOT = Path(__file__).resolve().parent.parent.parent
SOURCES_FILE = Path(__file__).resolve().parent / "sources.json"
DATA_FILE = ROOT / "data" / "private-vacancies.json"

HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; LivingGazettePrivateIngest/0.1)"}
REQUEST_DELAY_SECONDS = 0.5


def load_sources():
    with open(SOURCES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def load_data():
    if not DATA_FILE.exists():
        return {"updatedAt": None, "vacancies": []}
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_data(data):
    data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def find_job_links(listing_html, base_url):
    soup = BeautifulSoup(listing_html, "html.parser")
    links = set()
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if "jobs.smartrecruiters.com" in href:
            links.add(href if href.startswith("http") else urljoin(base_url, href))
    return sorted(links)


def get_prop(scope, name):
    el = scope.find(attrs={"itemprop": name})
    if not el:
        return None
    if el.has_attr("content"):
        return el["content"].strip() or None
    text = el.get_text(" ", strip=True)
    return text or None


def extract_job(detail_html, source, url):
    soup = BeautifulSoup(detail_html, "html.parser")
    scope = soup.find(attrs={"itemtype": "http://schema.org/JobPosting"}) or soup

    title = get_prop(scope, "title")
    if not title:
        return None

    # The visible location text is more reliable than the itemprop address fields --
    # observed stale/wrong on a real IFS posting (said Pune, India for a Colombo role).
    # See sources.json's ifs-smartrecruiters notes.
    loc_el = soup.find("spl-job-location")
    location = loc_el["formattedaddress"] if loc_el and loc_el.has_attr("formattedaddress") else get_prop(scope, "jobLocation")

    org_el = scope.find(attrs={"itemtype": "http://schema.org/Organization"})
    employer = None
    if org_el:
        name_el = org_el.find(attrs={"itemprop": "name"})
        if name_el and name_el.has_attr("content"):
            employer = name_el["content"].strip()
    employer = employer or source["name"]

    date_posted = get_prop(scope, "datePosted")
    valid_through = get_prop(scope, "validThrough")
    closing_date = valid_through[:10] if valid_through else None
    status, days = compute_status(closing_date)

    return {
        "sourceType": source["sourceType"],
        "sector": source["sector"],
        "employerName": employer,
        "titleEn": title,
        "descEn": get_prop(scope, "description"),
        "location": location,
        "employmentType": get_prop(scope, "employmentType"),
        "datePosted": date_posted[:10] if date_posted else None,
        "closingDate": closing_date,
        "status": status,
        "days": days,
        "applyUrl": url,
        "sourceUrl": url,
        "citationType": "microdata",
        "salary": None,
        "qualEn": get_prop(scope, "qualifications"),
        "confidence": 1.0,
        "verifiedAt": None,
        "_needsReview": True,
        "_sourceKey": fingerprint(employer, title, location or ""),
        "_legalRisk": source["legalRisk"],
    }


def ingest_source(source, existing_keys):
    print(f"=== {source['name']} ({source['id']}) ===")
    try:
        resp = requests.get(source["url"], headers=HEADERS, timeout=20)
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"  ! could not fetch listing: {e}", file=sys.stderr)
        return []

    links = find_job_links(resp.text, source["url"])
    print(f"  found {len(links)} job detail link(s)")

    added = []
    for url in links:
        time.sleep(REQUEST_DELAY_SECONDS)
        try:
            detail_resp = requests.get(url, headers=HEADERS, timeout=20)
            detail_resp.raise_for_status()
        except requests.RequestException as e:
            print(f"  ! could not fetch {url}: {e}", file=sys.stderr)
            continue

        entry = extract_job(detail_resp.text, source, url)
        if not entry:
            continue

        # These connectors target global-company career pages, which list jobs from
        # every office -- keep only postings actually located in Sri Lanka.
        if not entry["location"] or "sri lanka" not in entry["location"].lower():
            continue

        if entry["_sourceKey"] in existing_keys:
            print(f"  = skip (already have): {entry['titleEn']}")
            continue

        added.append(entry)
        existing_keys.add(entry["_sourceKey"])
        print(f"  + {entry['titleEn']} @ {entry['location']}")

    return added


def main():
    sources = load_sources()
    data = load_data()
    existing_keys = {v["_sourceKey"] for v in data["vacancies"] if v.get("_sourceKey")}

    total_added = []
    for source in sources:
        if not source.get("active"):
            continue
        if source.get("method") not in ("schema-microdata", "json-ld"):
            continue
        total_added.extend(ingest_source(source, existing_keys))

    if total_added:
        data["vacancies"].extend(total_added)
        save_data(data)
        print(f"\n{len(total_added)} new private-sector vacancy(ies) written to data/private-vacancies.json")
    else:
        print("\nNothing new this run.")


if __name__ == "__main__":
    main()
