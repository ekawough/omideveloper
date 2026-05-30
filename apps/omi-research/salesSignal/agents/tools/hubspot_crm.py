"""HubSpot direct API client.

Gotchas:
  * Association type IDs are numeric and HubSpot does not document them
    prominently. Deal→Contact = 3, Note→Contact = 202. These are stable.
  * Use a Private App access token (not the old HAPI key — deprecated 2022).
  * The contacts search endpoint returns at most 100 per page.
"""

from __future__ import annotations

import os
from typing import Any, Optional

import requests

BASE_URL = "https://api.hubapi.com"
ASSOC_DEAL_TO_CONTACT = 3
ASSOC_NOTE_TO_CONTACT = 202


def _headers() -> dict[str, str]:
    token = os.environ.get("HUBSPOT_ACCESS_TOKEN", "")
    if not token:
        raise RuntimeError("HUBSPOT_ACCESS_TOKEN is not set")
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }


def find_contact_by_email(email: str) -> Optional[dict[str, Any]]:
    r = requests.post(
        f"{BASE_URL}/crm/v3/objects/contacts/search",
        headers=_headers(),
        json={
            "filterGroups": [{"filters": [
                {"propertyName": "email", "operator": "EQ", "value": email},
            ]}],
            "limit": 1,
        },
        timeout=15,
    )
    r.raise_for_status()
    results = r.json().get("results", [])
    return results[0] if results else None


def upsert_contact(
    name: str,
    phone: Optional[str] = None,
    email: Optional[str] = None,
    address: Optional[str] = None,
    extra_props: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    first, _, last = name.partition(" ")
    props: dict[str, Any] = {
        "firstname": first or name,
        "lastname": last or "",
    }
    if phone:   props["phone"] = phone
    if email:   props["email"] = email
    if address: props["address"] = address
    if extra_props:
        props.update(extra_props)

    existing = find_contact_by_email(email) if email else None
    if existing:
        cid = existing["id"]
        r = requests.patch(
            f"{BASE_URL}/crm/v3/objects/contacts/{cid}",
            headers=_headers(),
            json={"properties": props},
            timeout=15,
        )
        r.raise_for_status()
        return r.json()

    r = requests.post(
        f"{BASE_URL}/crm/v3/objects/contacts",
        headers=_headers(),
        json={"properties": props},
        timeout=15,
    )
    r.raise_for_status()
    return r.json()


def add_note(contact_id: str, body: str) -> dict[str, Any]:
    # Notes require timestamp in ms.
    import time
    r = requests.post(
        f"{BASE_URL}/crm/v3/objects/notes",
        headers=_headers(),
        json={
            "properties": {
                "hs_note_body": body,
                "hs_timestamp": int(time.time() * 1000),
            },
            "associations": [{
                "to": {"id": contact_id},
                "types": [{
                    "associationCategory": "HUBSPOT_DEFINED",
                    "associationTypeId": ASSOC_NOTE_TO_CONTACT,
                }],
            }],
        },
        timeout=15,
    )
    r.raise_for_status()
    return r.json()


def create_deal(
    contact_id: str,
    name: str,
    amount: float = 0.0,
    stage: str = "appointmentscheduled",
    pipeline: str = "default",
) -> dict[str, Any]:
    r = requests.post(
        f"{BASE_URL}/crm/v3/objects/deals",
        headers=_headers(),
        json={
            "properties": {
                "dealname": name,
                "amount": str(amount),
                "dealstage": stage,
                "pipeline": pipeline,
            },
            "associations": [{
                "to": {"id": contact_id},
                "types": [{
                    "associationCategory": "HUBSPOT_DEFINED",
                    "associationTypeId": ASSOC_DEAL_TO_CONTACT,
                }],
            }],
        },
        timeout=15,
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
) -> dict[str, Any]:
    extra = {"salessignal_score": str(score)}
    contact = upsert_contact(
        name=name, phone=phone, email=email, address=address,
        extra_props=extra,
    )
    cid = contact.get("id")
    if cid:
        add_note(cid, f"[SalesSignal lead score {score}/10]\n\n{summary}")
        # Default pipeline/stage — override in env for real installs.
        try:
            create_deal(cid, f"{name} (score {score})", amount=0.0)
        except requests.HTTPError as e:
            # Non-fatal: pipeline may not exist in dev account.
            print(f"[hubspot] deal create skipped: {e.response.status_code}")
    return {"contact_id": cid, "raw": contact}
