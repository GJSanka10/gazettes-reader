"""Shared helpers for the private-sector ingestion pipeline.

Deliberately independent of scripts/ingest.py -- no imports across pipelines, so this
stays a genuinely separate feature per the approved plan.
"""

from datetime import datetime, timezone


def compute_status(closing_date_iso):
    """Returns (status, days). Unlike the Gazette pipeline, a missing closing date is
    common and legitimate for private postings -- that's 'unspecified', not an error."""
    if not closing_date_iso:
        return "unspecified", "-"
    try:
        closing = datetime.strptime(closing_date_iso, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except ValueError:
        return "unspecified", "-"
    delta = closing - datetime.now(timezone.utc)
    hours = delta.total_seconds() / 3600
    if hours < 0:
        return "closed", "-"
    if hours < 48:
        return "urgent", f"{int(hours)}h"
    days = int(hours / 24)
    if days <= 14:
        return "soon", f"{days} days"
    return "open", f"{days} days"
