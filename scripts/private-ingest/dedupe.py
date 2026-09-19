"""Fingerprint-based dedup for the private-sector pipeline.

Same 'flat scan, no DB' approach scripts/ingest.py already uses, reimplemented locally
per the approved plan (no shared code across the two pipelines).
"""

import re

_SUFFIXES = re.compile(r"\b(plc|pvt|ltd|limited|inc|corp|corporation)\b\.?", re.IGNORECASE)


def normalize(text):
    if not text:
        return ""
    text = text.lower()
    text = _SUFFIXES.sub("", text)
    text = re.sub(r"[^a-z0-9]+", "", text)
    return text


def fingerprint(employer_name, title, location):
    return normalize(employer_name) + "|" + normalize(title) + "|" + normalize(location)
