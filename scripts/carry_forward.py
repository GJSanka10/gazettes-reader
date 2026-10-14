"""
Carry an open review PR's work forward into this run.

The ingest workflow runs daily and every run starts from main. When the previous
run's pull request hasn't been merged yet, starting from main alone would throw that
work away: the same Gazette chunks would be re-sent to the LLM (spending the free
tier's 50-a-day quota again) and a multi-day catch-up would never get past day one.

So, before ingest.py runs, this merges the open PR's data/vacancies.json into main's:

  - vacancies the PR found that main doesn't have are added; main's own copy wins
    whenever both have the same vacancy (a reviewer may have corrected it on main),
    except that a Sinhala suggestion the PR made for a vacancy main has no Sinhala
    for is kept (as a suggestion: Sinhala goes live only via approve_sinhala.py);
  - a serial that main has since given to a different vacancy is renumbered, so two
    jobs never share one (this happened once, by hand: ING-20, 2026-10-11);
  - Gazette progress (processed issues, chunks still pending, posts already rejected)
    is combined, keeping whichever side got further.

The workflow then rebuilds the PR on top of main, so it never conflicts with main.

Usage: python scripts/carry_forward.py <path to the PR branch's vacancies.json>
"""

import json
import re
import sys
from pathlib import Path

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "vacancies.json"


def identity(v):
    """Two records are the same vacancy if they share a Gazette source key, or the
    same title (ignoring case and punctuation) from the same source page."""
    if v.get("_sourceKey"):
        return ("key", v["_sourceKey"])
    title = re.sub(r"[^a-z0-9]+", "", (v.get("titleEn") or "").lower())
    return ("url", title, v.get("sourceUrl") or "")


def next_free(prefix, used):
    n = max((int(m.group(1)) for s in used if (m := re.fullmatch(rf"{re.escape(prefix)}-(\d+)", s))), default=0)
    return f"{prefix}-{n + 1}"


# Only the ingest's own Sinhala bookkeeping: a suggestion waiting for review and the
# "tried by method X" mark. Live Sinhala is never carried from a review branch; it
# only goes live through scripts/approve_sinhala.py.
SINHALA_FIELDS = ("_siPending", "_siChecked")


def carry_forward(main, review):
    by_identity = {identity(v): v for v in main["vacancies"]}
    have = set(by_identity)
    used = {v.get("serial") for v in main["vacancies"] if v.get("serial")}
    carried, renumbered = [], []

    for v in review.get("vacancies", []):
        if identity(v) in have:
            # The Sinhala pass works on existing vacancies; keep its suggestion and
            # its "tried" mark unless main has Sinhala, or a suggestion, of its own.
            mine = by_identity.get(identity(v))
            if (mine is not None and not mine.get("titleSi") and not mine.get("_siPending")
                    and v.get("_siChecked") and v.get("_siChecked") != mine.get("_siChecked")):
                for field in SINHALA_FIELDS:
                    if field in v:
                        mine[field] = v[field]
            continue
        v = dict(v)
        serial = v.get("serial") or ""
        if serial in used:
            prefix = serial.rsplit("-", 1)[0] if "-" in serial else "ING"
            v["serial"] = next_free(prefix, used)
            renumbered.append((serial, v["serial"]))
        used.add(v["serial"])
        have.add(identity(v))
        main["vacancies"].append(v)
        carried.append(v)

    processed = set(main.get("processedGazetteDates", [])) | set(review.get("processedGazetteDates", []))
    pending = {}
    for date in set(main.get("gazettePendingChunks", {})) | set(review.get("gazettePendingChunks", {})):
        if date in processed:
            continue
        # The review branch ran after main's copy was made, so its list is the newer one.
        pending[date] = review.get("gazettePendingChunks", {}).get(date, main.get("gazettePendingChunks", {}).get(date))
    main["processedGazetteDates"] = sorted(processed)
    main["gazettePendingChunks"] = pending
    main["skippedSourceUrls"] = {**review.get("skippedSourceUrls", {}), **main.get("skippedSourceUrls", {})}
    return carried, renumbered


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    review = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    carried, renumbered = carry_forward(data, review)
    DATA_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Carried forward {len(carried)} vacancy(ies) from the open review PR.")
    for old, new in renumbered:
        print(f"  renumbered {old} -> {new} (main had given {old} to another vacancy)")
    print(f"Gazette issues done: {data['processedGazetteDates']}; pending: "
          f"{ {d: len(c) for d, c in data['gazettePendingChunks'].items()} }")


if __name__ == "__main__":
    main()
