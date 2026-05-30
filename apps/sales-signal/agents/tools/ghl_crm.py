"""GoHighLevel direct API client.

Gotchas:
  * Base URL is services.leadconnectorhq.com, NOT rest.gohighlevel.com.
  * `Version: 2021-07-28` header is mandatory — requests 400 without it.
  * Private Integration Tokens (Settings → Integrations → Private) — NOT the
    old API key (that endpoint 410s).
  * Pipeline IDs and stage IDs are per-location and must be looked up once.
"""

from __future__ import annotations

import os
from typing import Any, Optional

import requests

BASE_URL = "https://services.leadconnectorhq.com"
API_VERSION = "2021-07-28"


def _headers() -> dict[str, str]:
    token = os.environ.get("GHL_API_TOKEN", "")
    if not token:
        raise RuntimeError("GHL_API_TOKEN is not set")
    return {
        "Authorization": f"Bearer {token}",
        "Version": API_VERSION,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


def upsert_contact(
    name: str,
    phone: Optional[str] = None,
    email: Optional[str] = None,
    address: Optional[str] = None,
    tags: Optional[list[str]] = None,
    custom_fields: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    """Create or update a contact. Returns {id, …}."""
    location_id = os.environ.get("GHL_LOCATION_ID", "")
    if not location_id:
        raise RuntimeError("GHL_LOCATION_ID is not set")

    # Split name into first/last — GHL stores them separately.
    first, _, last = name.partition(" ")
    payload: dict[str, Any] = {
        "locationId": location_id,
        "firstName": first or name,
        "lastName": last or "",
        "tags": tags or [],
    }
    if phone:   payload["phone"] = phone
    if email:   payload["email"] = email
    if address: payload["address1"] = address
    if custom_fields:
        payload["customFields"] = [
            {"id": k, "value": v} for k, v in custom_fields.items()
        ]

    r = requests.post(
        f"{BASE_URL}/contacts/upsert",
        headers=_headers(),
        json=payload,
        timeout=20,
    )
    r.raise_for_status()
    return r.json().get("contact", r.json())


def add_note(contact_id: str, body: str) -> dict[str, Any]:
    r = requests.post(
        f"{BASE_URL}/contacts/{contact_id}/notes",
        headers=_headers(),
        json={"body": body},
        timeout=20,
    )
    r.raise_for_status()
    return r.json()


def create_opportunity(
    contact_id: str,
    name: str,
    monetary_value: float = 0.0,
    pipeline_id: Optional[str] = None,
    stage_id: Optional[str] = None,
    status: str = "open",
) -> Optional[dict[str, Any]]:
    """Create an opportunity. Requires pipeline_id + stage_id from your GHL
    account. Returns None if pipeline_id is missing (non-fatal)."""
    pipeline_id = pipeline_id or os.environ.get("GHL_PIPELINE_ID")
    stage_id    = stage_id    or os.environ.get("GHL_DEFAULT_STAGE_ID")
    if not pipeline_id or not stage_id:
        return None

    location_id = os.environ.get("GHL_LOCATION_ID", "")
    r = requests.post(
        f"{BASE_URL}/opportunities/",
        headers=_headers(),
        json={
            "locationId": location_id,
            "contactId": contact_id,
            "name": name,
            "monetaryValue": monetary_value,
            "pipelineId": pipeline_id,
            "pipelineStageId": stage_id,
            "status": status,
        },
        timeout=20,
    )
    r.raise_for_status()
    return r.json()


def push_lead(
    name: str,
    phone: Optional[str],
    email: Optional[str],
    address: Optional[str],
    score: int,
    summary: str,
    tags: Optional[list[str]] = None,
) -> dict[str, Any]:
    """High-level helper the CRM Writer agent calls."""
    contact = upsert_contact(
        name=name,
        phone=phone,
        email=email,
        address=address,
        tags=(tags or []) + [f"salessignal-score-{score}"],
    )
    contact_id = contact.get("id")
    if contact_id:
        add_note(contact_id, f"[SalesSignal lead score {score}/10]\n\n{summary}")
        create_opportunity(
            contact_id=contact_id,
            name=f"{name} (score {score})",
            monetary_value=0.0,
        )
    return {"contact_id": contact_id, "raw": contact}
