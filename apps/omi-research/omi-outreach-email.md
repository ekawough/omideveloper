# Cold outreach email to Omi

**To:** Whoever owns web/marketing at Omi (Nik Shevchenko / team@omi.me / or reply on the GitHub issue thread)
**Subject:** Follow-up to my GitHub issue — found 5 more site issues while I was looking

---

Hey [Name],

I'm the one who filed the GitHub issue about the broken "Order now" button on `omi.me/pages/product` (the `/cart/53309819715876:1` variant returning "Link no longer exists"). That one's a direct revenue leak — anyone clicking it from that page can't check out.

Since then I've done a full crawl of your sitemap — all 3,965 URLs — and here's what else nobody seems to be watching:

**Broken / dead pages still indexed**
1. `/pages/notify_me_request/mini_coming_soon_glass_7le` — **hard 404** in your sitemap (stale Shopify "notify me" waitlist page)
2. `/pages/download-old` — stale duplicate of `/pages/download` (SEO duplicate-content hit, should 301)
3. `/pages/tag` — Avada SEO app's internal page, indexed with placeholder content
4. `/pages/checkout-page-persona` — internal page titled "Refer a friend" getting crawled by Google
5. `/pages/swym-wishlist` and `/collections/frontpage` — Shopify-app internals leaking into your public sitemap

**Nav / discoverability gap**
6. `/pages/coaching` exists as a full vertical landing page, but it's missing from the Use Cases dropdown alongside Sales / Healthcare / Technicians

**Content-credibility imbalance** *(this one's more strategic than hygiene)*
7. You have **3,898 blog posts** but only **2 case studies** and **1 product-updates post**. ~85% of the library is programmatic long-tail dev-query SEO (ai-integrations, api-guides, *-errors sections). For a hardware company selling into enterprise / healthcare / sales, the trust-building content is upside-down relative to the top-of-funnel content.

Full 2-page audit attached (PDF).

None of this is catastrophic — but at ~4,000 indexed URLs, no one on your team is going to catch broken cart permalinks, sitemap 404s, or orphan pages manually. Classic Shopify hygiene debt.

I'd like to own this continuously: weekly crawl of the full site + sitemap, Slack/email alert when a CTA breaks or an orphan page appears, fixes pushed straight into Shopify, short monthly report tying hygiene fixes to traffic/conversion impact. Given the site is ~4k URLs and growing (most from automated content pipelines), this problem will only compound — it's exactly the kind of thing where a cheap ongoing check beats an expensive quarterly crisis.

Happy to start with a one-time paid deep audit ($X) if a retainer feels premature.

Either way — the broken Order Now button should ship a fix today. Let me know if you want the full list of cart permalinks to re-point to current variant IDs.

[Your name]
[Link to GitHub issue]
[Your email / site]

---

## Notes for you before sending

- Replace `[Name]`, `[Your name]`, `[Your email / site]`, `[$X]`
- If you want to go retainer-first, price it $1,500–$2,500/mo for weekly crawl + fixes. Anchor high, they'll negotiate.
- If you want to go one-time-audit-first (lower commitment), price it $500–$1,500. Easier to land, can lead to retainer.
- Attach `omi-audit-report.pdf` (exported from `omi-audit-report.md`)
- Send from a professional email, not a gmail burner if you can help it
- Best response rate: Tuesday–Thursday, 9–11am in their timezone (SF — they're a YC company)
