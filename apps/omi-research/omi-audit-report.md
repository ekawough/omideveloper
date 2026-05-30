# omi.me — Site Audit Report

**Audit date:** 2026-04-14
**Scope:** Full sitemap crawl (3,965 URLs) + homepage tech-stack scan + navigation / CTA walk-through
**Prepared by:** [Your name] · [Your email]

---

## Executive summary

Omi's site is structurally healthy but carries the common forms of technical debt that accumulate on a fast-growing Shopify store with automated content pipelines. I found **10 distinct issues** in a single crawl, ranging from a directly revenue-impacting broken checkout CTA to a strategic content-credibility gap. None of this is catastrophic — but none of it is being actively monitored either (no Ahrefs / Semrush / Screaming Frog signal detected on the site). At 3,965 indexed URLs, these issues will compound faster than manual QA can catch them.

The highest-priority fix is **#1** (broken "Order now" button) — it's lost revenue and already has a public GitHub issue filed. The highest-leverage fix is **#7** (content credibility imbalance) — it's a strategic positioning gap, not a hygiene issue.

---

## 1. 🔴 **CRITICAL — Broken "Order now" CTA on `/pages/product`**

**Location:** https://www.omi.me/pages/product — the "Order now" button in the hero section
**Bad link:** `https://www.omi.me/cart/53309819715876:1`
**Observed:** Shopify error page — *"Link no longer exists."*
**Expected:** Add-to-cart → checkout flow
**Root cause:** Hardcoded Shopify variant ID `53309819715876` has been deactivated. The homepage's "Buy Now" uses the current variant `53310207000868` correctly.
**Impact:** Every user who reaches `/pages/product` (linked from the homepage Products dropdown → "omi") and clicks "Order now" abandons. This is a direct revenue leak.
**Fix:** Update the button href to either the current variant ID (`/cart/53310207000868:1`) or, better, `/products/omi` — which lets the product page auto-pick a valid variant and survives future variant changes.
**Time to fix:** ~5 minutes in Shopify theme/Gempages editor.

---

## 2. 🟠 **Hard 404 indexed in sitemap**

**URL:** `https://www.omi.me/pages/notify_me_request/mini_coming_soon_glass_7le`
**Observed:** HTTP 404
**Root cause:** Shopify "notify me" waitlist page that was deleted but the sitemap still advertises it to Google.
**Impact:** Search engine trust signal erosion. Google penalizes sites that advertise 404s in their sitemap.
**Fix:** Remove from sitemap OR 301-redirect the path to the active product page.

---

## 3. 🟠 **Stale duplicate page**

**URLs:** `/pages/download-old` vs `/pages/download`
**Observed:** Both return 200. `/pages/download-old` is the old version of the current download page.
**Impact:** SEO duplicate content; split ranking signals.
**Fix:** 301 redirect `/pages/download-old` → `/pages/download` in Shopify URL redirects, then remove from sitemap.

---

## 4. 🟠 **Mismatched-content internal page publicly indexed**

**URL:** `/pages/checkout-page-persona`
**Observed:** Page title is *"Refer a friend"* — content is clearly internal/test/staging.
**Impact:** Confuses Google (wrong title); appears in search for unrelated queries; looks unprofessional when found.
**Fix:** Set `noindex` meta + remove from sitemap, OR delete the page if unused.

---

## 5. 🟡 **Shopify-app internal pages leaking into sitemap**

| URL | Owner app |
|---|---|
| `/pages/tag` | Avada SEO |
| `/pages/swym-wishlist` | Swym Wishlist |
| `/collections/frontpage` | Shopify default internal |

**Impact:** Crawl-budget waste; occasional embarrassing search results.
**Fix:** Add these patterns to the Shopify robots.txt.liquid override (Shopify lets you extend it), and/or `noindex` each page.

---

## 6. 🟡 **Navigation inconsistency — `/pages/coaching` orphaned from Use Cases**

**Observed:** `/pages/coaching` is a fully built vertical-positioning page (titled *"Omi For Coaches"*). It's not in the Use Cases dropdown alongside Sales / Healthcare / Technicians.
**Impact:** The coaching vertical is invisible to anyone browsing the homepage — wasted asset.
**Fix:** Add to the Use Cases dropdown in the theme's `main-menu` Shopify navigation.

---

## 7. 🔵 **STRATEGIC — Content-credibility imbalance**

**Observed:** Sitemap contains **3,898 blog posts** across 29 sections. Distribution is heavily skewed toward programmatic long-tail SEO and away from trust-building content:

| Category | Post count |
|---|---:|
| `ai-integrations` (programmatic SEO) | 665 |
| `api-guides` (programmatic SEO) | 598 |
| `iot-devices-faq` (programmatic SEO) | 465 |
| `firmware-guides` (programmatic SEO) | 454 |
| `smart-home-devices-faq` (programmatic SEO) | 401 |
| `next-js-errors` (dev long-tail) | 100 |
| `flutter-errors` (dev long-tail) | 100 |
| `tensorflow-errors` (dev long-tail) | 98 |
| **`case-studies`** | **2** |
| **`product-updates`** | **1** |
| **`healthcare-ai-necklace`** | **5** |

**Impact:** Omi is simultaneously (a) selling into enterprise / healthcare / sales teams on the commercial side, and (b) running a 3,300-post programmatic SEO machine aimed at dev long-tail queries. The trust-building content enterprise buyers look for — case studies, product updates, healthcare-specific proof — is nearly empty. This hurts conversion for the high-ACV buyers, even while top-of-funnel traffic grows.

**Fix:** Deprioritize new programmatic SEO content in favor of 6–10 real case studies per quarter (sales / healthcare / field-service). The existing 2 case studies can stay; the ratio is the issue.

---

## 8. 🟡 **Possible duplicate blog taxonomy**

**Observed:** Both `/blogs/use-cases` (19 posts) and `/blogs/usecases` (325 posts) exist.
**Impact:** Duplicate blog hubs split SEO authority and confuse internal linking.
**Fix:** Audit which taxonomy is the canonical one; 301 the other + consolidate posts under a single handle.

---

## 9. 🟡 **Possibly dead product live in sitemap**

**URL:** `/products/omi-gift-card`
**Observed:** All three gift-card variants ($150 / $300 / $500) display *"Variant sold out or unavailable"*
**Impact:** Live product page that can't convert — wasted traffic + bad impression for gift-giving intent.
**Fix:** Either restock the variants or set the product to "archived" in Shopify admin.

---

## 10. 🟡 **Potential price inconsistency — Omi Glass Dev Kit**

**URL:** `/products/omi-glass-dev-kit`
**Observed:** Page shows `$499` sale price / `$799` regular. One button on the same page reads *"Buy Now for $299."*
**Impact:** Confused pricing = lost conversions and support tickets.
**Fix:** Audit which price is live in the Shopify product admin; remove the stale CTA copy.

---

## What's not in place (preventative controls)

Based on a client-side scan of omi.me, the following crawler-based monitoring tools are **not installed**:

- ❌ Ahrefs Site Audit (no `ahrefs-site-verification` meta)
- ❌ Semrush Site Audit (no tracker)
- ❌ Screaming Frog / custom crawler (no scheduled-audit signals on any page)
- ❌ No `broken-link-checker` / `linkinator` GitHub Action on the public repo

What you *do* have: Google Search Console (2 properties verified), Hotjar, HubSpot, Intercom, Omnisend, Avada SEO, Facebook Pixel, GA. Those are great for **reactive** monitoring (finding out *after* an issue has impact) — but they don't proactively crawl for dead links, orphaned pages, or sitemap errors.

---

## Recommended engagement

### Option A — one-time deep audit & fix pass (lower commitment)
- Full crawl of the sitemap + Ahrefs cross-check
- Fixes pushed to Shopify for issues #1–6, #8–10 above
- Written handoff doc with before/after
- Flat fee: **$[500–1,500]**

### Option B — ongoing retainer (recommended)
- Weekly automated crawl + sitemap diff
- Slack/email alert when a CTA breaks, a page 404s, or a new orphan enters the sitemap
- Bi-weekly fix pass pushed directly to Shopify
- Monthly report tying hygiene fixes to organic traffic / conversion-rate impact
- Quarterly strategy review (including the content-credibility ratio from issue #7)
- Retainer: **$[1,500–2,500] / month**

---

## Appendix — Methodology

- Crawled `https://www.omi.me/sitemap.xml` and its 6 sub-sitemaps on 2026-04-14
- Fetched and parsed every `/pages/`, `/products/`, `/collections/` URL (34 total)
- Fetched all 33 blog section indexes + full blog post corpus (~3,898 posts)
- Cross-checked every CTA on the homepage + product pages + `/pages/product`
- Tech-stack scan via direct DOM inspection of rendered homepage
- All raw crawl data preserved in a local archive (available on request)
