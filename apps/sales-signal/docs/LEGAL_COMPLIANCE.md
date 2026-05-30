# Legal & compliance — what SalesSignal does for you

**Disclaimer.** This is engineering context, not legal advice. Check your
own state's statutes and talk to a lawyer before deploying in production.
That said, SalesSignal ships with the compliance pieces most D2D competitors
either skip or bolt on as a pdf the rep never reads.

## What states require

Recording law is state-level in the US. The three buckets we care about:

| Bucket | States (D2D-relevant) | What you need |
|---|---|---|
| **One-party consent** | AL, AK, AR, CO, DC, GA, HI, ID, IN, IA, KS, KY, LA, ME, MN, MS, MO, NE, NJ, NM, NY, NC, ND, OH, OK, RI, SC, SD, TN, TX, UT, VA, WV, WI, WY | Rep consents to themselves — technically enough, but disclosure is still best practice. |
| **Two-party consent** | CA, CT, DE, FL, IL, MD, MA, MI, MT, NV, NH, OR, PA, VT, WA | Both parties must agree. Verbal disclosure is acceptable but verbal-plus-gesture (button tap) is stronger. |
| **Biometric (BIPA)** | IL | Voiceprints count as biometric data; you need an explicit written/electronic consent form and a retention schedule. Liquidated damages of $1,000–$5,000 per violation. |

Lists verified against state statutes as of April 2026; we keep the source
set in `admin/consent.html` (`TWO_PARTY`, `BIPA`) so they're trivially
auditable.

## What SalesSignal captures per conversation

Every session writes one row to `consent_log`:

```
session_id, rep_id, consent_given, consent_method,
state_code, gps_lat, gps_lon, consent_script, homeowner_name, consented_at
```

The GPS + state snapshot is the legally-material part: if a homeowner later
claims the call happened in a two-party state and the rep didn't disclose,
you can produce a row showing (a) the rep's location at the moment of
consent, (b) the exact script the app displayed, and (c) the homeowner's
acknowledgment.

Retention is configurable in `org_settings.data_retention_days`. Default: 30
days for audio, indefinite for the `consent_log` row itself (it's the
evidentiary record — you want it around even after the audio is gone).

## What the rep sees in the field

The Omi app on the rep's iPad shows `admin/consent.html` when a new session
starts:

1. Browser geolocation → reverse geocode → detect state code.
2. Look up two-party / BIPA status.
3. Display the appropriate script (configurable per-org).
4. Two-party states: require a tap.
5. Illinois: require the BIPA electronic-consent checkbox.
6. On submit, insert into `consent_log` and let the webhook start recording.

If the user denies geolocation, they pick the state manually. The form
blocks recording until consent is recorded.

## What we deliberately don't do

- **Auto-record without disclosure.** There's no "stealth" mode. Even in
  one-party states the script surfaces a disclosure.
- **Store voiceprint features long-term in Illinois.** SenseVoice extracts
  acoustic embeddings on-the-fly and discards them after fusion; only the
  emotion label is persisted.
- **Sell or share audio.** The `audio-recordings` bucket is private and
  scoped to the org.

## What to double-check before shipping to real customers

- [ ] Update the consent script template with your actual company name
- [ ] Set `data_retention_days` per your DPA / customer contract
- [ ] Confirm your GHL/HubSpot subprocessors are acceptable to the customer
- [ ] Add a DSAR workflow for homeowners who ask for their data
- [ ] Run a tabletop with counsel for BIPA-specific deployment in IL
