# Omi — Vision, Strategy & Content Archive

*Compiled from a full crawl of omi.me on 2026-04-14. Every claim below cites the specific file in `omi-crawl/` it came from.*

---

## 1. Identity

- **Legal entity:** Based Hardware Inc.
- **Address:** 81 Lafayette St, San Francisco, CA 94103
- **Primary contact:** `help@omi.me`
- **Website:** [omi.me](https://www.omi.me/)
- **Commerce platform:** Shopify (storefront + checkout)
- **Page builder:** GemPages (visible in rendered class prefixes `gp-*`)
- **Open-source org:** `github.com/BasedHardware` (Omi repo + OpenGlass repo)
- **Enterprise sales:** [cal.com/aaravgarg/enterprise](https://cal.com/aaravgarg/enterprise) *(source: `pages/pages__enterprise.md:138`)*
- **Trust/compliance page:** [trust.delve.co/omi](https://trust.delve.co/omi) — SOC 2 + HIPAA *(source: `pages/pages__enterprise.md:172,182,186`)*
- **Investor page:** [Airtable form](https://airtable.com/appn3zZggQSd0p4js/shr5PXNJefNkxsmkW) *(source: `pages/pages__manifesto.md:292`)*

## 2. Mission & Thesis

> **"Make humans 1,000× more productive."**
> *(from `pages/pages__manifesto.md:171`)*

### The thesis (verbatim from the manifesto)
- *"The next AI moat isn't intelligence. It's personal context."*
- *"People won't choose the smartest AI. They'll choose the AI that knows them."*
- *"Omi is the most personal AI."*

### What they believe is broken in AI today
- *"Today's AI is a vending machine: prompt → answer → forget."*
- *"Real progress needs continuity: memory, goals, patterns, follow-through."*
- *"Advice doesn't change behavior. Timing + context does."*

### What Omi is
- *"Omi is your personal AI mentor. It learns your life from what you say, do, and work on."*
- *"It doesn't just answer. It nudges."*
- *"It doesn't just remember. It pushes."*
- *"It doesn't just help. It keeps you honest."*

### The belief
- *"Personal context beats raw IQ."*
- *"A smaller model with your history beats a bigger model with none."*
- *"The killer feature isn't chat. It's proactivity."*

## 3. The 4-Phase Roadmap

*Direct from `pages/pages__manifesto.md:181–239`. These are Omi's explicit stated phases and milestones.*

| Phase | Form factor | What it captures | Milestone before moving on |
|---|---|---|---|
| **1. Desktop software (current)** | Mac/Windows/browser app | Meetings, files, screen | **200,000 users / ~$100k MRR** — "this will make us self-sustainable" |
| **2. Necklace** | The current $179 Omi wearable | Real-life conversations | **100,000 necklaces sold** — "most likely we will kill the necklace after glasses are launched" |
| **3. Glasses** | Always-on camera + audio eyewear | What you see + hear | **1,000,000 glasses** — "~3B people already wear glasses" |
| **4. Brain / BCI** | Silent speech → non-invasive → invasive | Intent before action | **7 billion devices** — "connect all humans into a single network/metaverse" |

### How they say they'll win *(from `pages/pages__manifesto.md:174–179`)*
1. *"By collecting ALL data about the user."*
2. *"To achieve it, we commit to privacy and open-source."*
3. *"Use the data to give the maximum personalization."*

### Why now *(from `pages/pages__manifesto.md:241–247`)*
- *"Models are commoditizing."*
- *"Context is the new moat."*
- *"The winner is the AI that sticks."*

### Why them *(from `pages/pages__manifesto.md:249–257`)*
- *"We ship hardware + software as one system."*
- *"We use open source as a trust wedge."*
- *"We're not building 'a recorder.' We are collecting context to build the most personal AI."*
- *"thought to action."*

## 4. Product Catalog (as of 2026-04-14)

*All prices in USD. Sources: each product's file in `omi-crawl/products/`.*

| Product | URL | Sale | Regular | Notes |
|---|---|---|---|---|
| **Omi (wearable)** | `/products/omi` | **$179** | $179 | The core necklace. The flagship consumer product. *(file: `products__omi.md`)* |
| **Omi Glass Dev Kit** | `/products/omi-glass-dev-kit` | **$499** | $799 | "First always-on camera + audio smart glasses." Listed price on page vs. "Buy Now for $299" in one spot — possible inconsistency. *(file: `products__omi-glass-dev-kit.md:135,137,160`)* |
| **Omi Firmware Developer Kit** | `/products/omi-firmware-developer-kit` | **$59.99** | $99.99 | SEGGER J-Link debugger + cables. "Everything you need to flash, debug, and develop custom firmware." Dev/hacker SKU. |
| **Omi Unlimited Yearly Plan (Bundle)** | `/products/omi-unlimited-yearly-plan-bundle` | **$199** | $240 | Software subscription bundle (~20% annual discount). |
| **Omi Watch Band (Wristband)** | `/products/omi-watch-band` | **$29.99** | $49.99 | Silicone wristband, alternate wear form. |
| **Omi Wireless Charger** | `/products/omi-wireless-charger` | **$29.99** | $49.99 | Custom charger for Omi only. |
| **Omi Gift Card** | `/products/omi-gift-card` | $150 / $300 / $500 | — | Variants "sold out or unavailable" — worth checking if live. |

**Product signal:** every hardware SKU is currently on sale. That means either a promo is running or the sale prices are the permanent price with fake strikethroughs (a common Shopify conversion tactic).

## 5. Vertical Plays (who they're selling to)

From `pages/` — these are the positioning pages Omi has built out. Not all are linked from the Use Cases dropdown in the nav.

| Vertical | URL | In nav? | Pitch (from meta description) |
|---|---|---|---|
| **Sales teams** | `/pages/sales` | ✅ Yes | "Save 10+ hours a week and close 30% more deals." |
| **Healthcare** | `/pages/healthcare` | ✅ Yes | "HIPAA-compliant AI-powered medical notes." |
| **Technicians / Field service** | `/pages/technicians` | ✅ Yes | "Save 10+ hours a week. Records service visits, creates instant reports." |
| **Coaches** | `/pages/coaching` | ❌ **Missing from nav** | Standalone "Omi For Coaches" page exists but has no discoverability from the homepage. |
| **Enterprise (all orgs)** | `/pages/enterprise` | ❌ Not in main nav | "10,000+ professionals." SOC 2 + HIPAA. CTA is `cal.com/aaravgarg/enterprise`. |
| **Switch (competitors)** | `/pages/switch` | ❌ Not in nav | Comparisons: "omi vs plaud, omi vs friend, omi vs limitless, omi vs fieldy, omi vs bee." |

**Vision observation:** the manifesto is explicit about consumer glasses as the endgame (1M units, "3B people wear glasses"), but the revenue-focused vertical pages skew toward **B2B SaaS positioning** (sales, healthcare, field service). That's a natural bridge — use B2B revenue to fund the consumer-hardware roadmap — but it's a tension worth naming: the site reads like a B2B productivity tool, while the manifesto reads like a consumer-AI-BCI moonshot.

## 6. Open-Source Positioning

Omi leans hard on open-source as trust infrastructure. Evidence from the crawl:

- **OpenGlass** *(`pages/pages__openglass.md`)* — standalone landing page for the open-source smart glasses project.
- **OmiGPT** *(`pages/pages__gpt.md`)* — *"OmiGPT is a wearable AI assistant that brings ChatGPT into real life — with memory, context, and real-time responses."*
- **Firmware Developer Kit** *(`products/products__omi-firmware-developer-kit.md`)* — a $59.99 hardware SKU explicitly for developers to flash/debug/customize Omi firmware. Almost no other wearable company sells a developer hardware SKU.
- **`github.com/BasedHardware/omi`** — public repo.
- Manifesto: *"We use open source as a trust wedge."*

**Strategic read:** open-source is used simultaneously as (a) a privacy trust signal for paranoid consumers, (b) a developer-acquisition funnel (devs build apps → apps become reason to buy Omi), and (c) a defensive moat against closed competitors (Humane, Rabbit, Meta Ray-Ban). The "1,000+ apps" claim on the homepage is the payoff of this strategy.

## 7. Content Strategy — The Surprise Finding

Omi's sitemap lists **3,898 blog posts** across 29 content sections. The distribution is *extremely* skewed:

| Section | Post count | What it targets |
|---|---:|---|
| `ai-integrations` | **665** | Programmatic SEO — "Omi + [tool]" long-tail |
| `api-guides` | **598** | Dev-query long-tail SEO |
| `iot-devices-faq` | **465** | "How to / what is [IoT device]" SEO |
| `firmware-guides` | **454** | Dev/hacker SEO |
| `smart-home-devices-faq` | **401** | Consumer-tech SEO |
| `usecases` | **325** | "Omi for [task]" long-tail |
| `hardware-guides` | 130 | Dev SEO |
| `account-helper` | 102 | Support/SEO |
| `next-js-errors` | **100** | Classic programmatic SEO (dev error messages → traffic) |
| `flutter-errors` | **100** | Same play |
| `tensorflow-errors` | 98 | Same play |
| `tensorflow-guides` | 90 | Same play |
| `firmware-features` | 82 | Dev SEO |
| `overview` | 49 | Generic |
| `ai-note-takers` | 45 | Category SEO |
| `notes-apps-alternatives` | 44 | "alternatives to X" SEO |
| `workflows` | 20 | Use cases |
| `news` | 19 | Corporate news |
| `use-cases` | 19 | Duplicate of `usecases`? Worth investigating. |
| `events` | 14 | Event content |
| `top-hardware-tools` | 14 | SEO listicles |
| `integrations` | 12 | Integration content |
| `top-firmware-tools` | 12 | SEO listicles |
| `ai-self-growth-communication` | 10 | Wellness SEO |
| `industries` | 6 | Vertical-specific content |
| `healthcare-ai-necklace` | **5** | The healthcare vertical has 5 posts. |
| **`case-studies`** | **2** | Only 2 case studies on the site. |
| **`product-updates`** | **1** | One product update post. |

### What this tells you about their content strategy

1. **~85% of the content library is programmatic/long-tail dev SEO** (`ai-integrations`, `api-guides`, `iot-devices-faq`, `firmware-guides`, `smart-home-devices-faq`, plus the `*-errors`/`*-guides` dev categories).
2. **High-credibility content is almost empty.** 2 case studies. 1 product update post. 5 posts for the healthcare vertical they're selling into. For a hardware company that needs to build enterprise trust, this is upside-down.
3. **Two near-duplicate sections** (`use-cases` vs `usecases`) — typical SEO tech-debt from automated content pipelines.
4. **The programmatic SEO is the growth engine.** This strategy works — target long-tail dev queries ("Flutter error X"), capture traffic, convert a tiny % to developer kit buyers. But it's also what's creating most of the site's hygiene issues (orphan pages, thin content, sitemap bloat).

## 8. Tech & Marketing Stack (detected client-side)

*Sources: DOM scan of `omi.me` homepage.*

### Confirmed installed
- **Google Analytics / GTM**
- **Hotjar** (session recording / heatmaps)
- **Facebook Pixel**
- **HubSpot** (CRM + tracking — `js-na2.hs-scripts.com`)
- **Intercom** (chat widget)
- **ShareThis** (social share)
- **Omnisend** (email marketing — `omnisnippet1.com`)
- **Avada SEO** (Shopify SEO app — responsible for the leaked `/pages/tag` page)
- **Swym Wishlist** (Shopify wishlist app — responsible for the leaked `/pages/swym-wishlist`)
- **hCaptcha** (form protection)
- **Apple Pay / Google Pay / Shop Pay** (Shopify wallets)

### Verifications present (meta tags)
- Google Search Console (two verification codes — two properties)
- Facebook domain verification

### Conspicuously absent
- **No Ahrefs, Semrush, Moz, or Screaming Frog signal detected** — no active crawler appears to be auditing the site on a schedule.
- No Plausible / Segment / Heap / PostHog — analytics is GA+Hotjar only.
- No Klaviyo (standard Shopify email tool) — they use Omnisend instead.

## 9. Site-Hygiene Findings (for the audit pitch)

Consolidated from the crawl. Full details in `omi-audit-report.md`.

1. **Broken "Order now" CTA** on `/pages/product` → `/cart/53309819715876:1` returns *"Link no longer exists."* Stale Shopify variant ID. Directly revenue-impacting.
2. **Real 404 in sitemap:** `/pages/notify_me_request/mini_coming_soon_glass_7le` — Shopify "notify me" waitlist page that no longer exists but is still indexed.
3. **Stale duplicate page:** `/pages/download-old` vs. `/pages/download` — should 301 redirect.
4. **Mismatched content page:** `/pages/checkout-page-persona` — page title is *"Refer a friend"*; clearly an internal/test page being publicly indexed.
5. **Leftover Shopify-app pages in sitemap:** `/pages/tag` (Avada), `/pages/swym-wishlist` (Swym), `/collections/frontpage` (Shopify internal).
6. **Nav inconsistency:** `/pages/coaching` exists but is missing from the Use Cases dropdown.
7. **Content credibility gap:** 3,898 blog posts, but only **2 case studies and 1 product-updates post**.
8. **Possible duplicate blog taxonomy:** `/blogs/use-cases` and `/blogs/usecases` both exist.
9. **Possibly dead product:** `/products/omi-gift-card` variants listed as "sold out or unavailable."
10. **Possible price inconsistency:** Omi Glass Dev Kit shows $499 sale / $799 regular in one spot, "$299" in another. Worth verifying live.

## 10. What Omi "envisioned from the start" — one-paragraph version

Omi is a San Francisco hardware startup (Based Hardware Inc.) whose thesis is that the AI moat of the next decade will be **personal context, not model intelligence**. Their stated mission is to make humans 1,000× more productive by capturing every signal of a person's life (meetings, files, screen, speech, vision, eventually brain signals) and feeding it to a personal AI that proactively nudges, reminds, and coaches. Their commercial path is a deliberate 4-phase hardware escalation — desktop app → $179 audio necklace → smart glasses → brain-computer interface — funded along the way by B2B SaaS sales into **sales, healthcare, field service, coaching, and enterprise** verticals. Their defensive moat is **open-source + privacy**: they ship a dev-kit SKU, an OpenGlass project, an omiGPT wrapper, and a SOC 2 + HIPAA-compliant enterprise posture. Their growth engine is **aggressive programmatic SEO** (~3,300 of their ~3,900 blog posts target long-tail dev queries). The gap in that machine — and the opening for outside help — is **site hygiene and credibility content**: the revenue-critical CTAs break silently, internal Shopify app pages leak into search results, and the actually-trust-building content (case studies, product updates) is almost empty.

---

*Artifacts in this directory:*
- `pages/` — 23 static pages, full content
- `products/` — all 7 products, full content
- `collections/` — all 4 Shopify collections
- `blog-sections/` — all 33 blog section indexes
- `blog-posts/` — full crawl of ~3,898 blog posts *(running at time of writing)*
- `*-urls.txt` — raw URL lists per category from `sitemap.xml`
- `INDEX.md` — machine-readable index of every captured URL
