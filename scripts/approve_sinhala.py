"""
Review the Sinhala titles the ingest suggested, and put the checked ones live.

ingest.py never shows Sinhala it found by itself: it stores a suggestion in each
vacancy's "_siPending" (title, institution, and an excerpt of the Sinhala edition).
Someone who reads Sinhala checks each against its excerpt PDF, then approves it here.

  python scripts/approve_sinhala.py                  list the pending suggestions
  python scripts/approve_sinhala.py GOVLK-3 GOVLK-7  put those live
  python scripts/approve_sinhala.py --reject GOVLK-9 drop that suggestion
  python scripts/approve_sinhala.py --no-inst GOVLK-3  put live without the institution

A rejected vacancy isn't retried by the same method (its _siChecked stays); bumping
SI_METHOD in ingest.py retries everything without a live Sinhala title.
"""

import json
import sys
from pathlib import Path

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "vacancies.json"


def main(argv):
    data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    pending = {v["serial"]: v for v in data["vacancies"] if v.get("_siPending")}

    if not argv:
        if not pending:
            print("No Sinhala suggestions waiting.")
        for serial, v in pending.items():
            p = v["_siPending"]
            print(f"{serial}  {v['titleEn']}\n    title: {p['titleSi']}\n    inst:  {p.get('instSi') or '—'}"
                  f"\n    check: web/public{p['pdfUrlSi']}  (Sinhala pages {p['pdfPagesSi'][0]}-{p['pdfPagesSi'][1]})\n")
        return

    reject = argv[0] == "--reject"
    no_inst = argv[0] == "--no-inst"
    serials = argv[1:] if reject or no_inst else argv
    unknown = [s for s in serials if s not in pending]
    if unknown:
        sys.exit(f"No pending Sinhala suggestion for: {', '.join(unknown)}")

    for serial in serials:
        v = pending[serial]
        p = v.pop("_siPending")
        if reject:
            print(f"rejected {serial}")
            continue
        v["titleSi"] = p["titleSi"]
        if p.get("instSi") and not no_inst:
            v["instSi"] = p["instSi"]
        v["pdfUrlSi"], v["pdfPagesSi"] = p["pdfUrlSi"], p["pdfPagesSi"]
        print(f"live: {serial}  {p['titleSi']}")

    DATA_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main(sys.argv[1:])
