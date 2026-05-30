# Omi Takeover Project — Master README

**What this is:** Everything Omi.me has publicly described as a "use case" but hasn't actually built as a dedicated app, archived + organized + ranked into a buildable backlog. Your job: pick one, ship it, charge for it.

**The thesis:** Omi generates ~3,900 programmatic SEO pages describing every imaginable workflow their generic wearable *could* support. Each page is a potential vertical-specific SaaS product that Omi themselves will almost certainly never build. You can.

---

## 🗺️ Where everything lives

### 🎯 Start here (in this order)

1. **[PROJECT-BACKLOG.md](PROJECT-BACKLOG.md)** — top 20 app ideas ranked by buildability × market size, each with MVP spec + pricing + moat
2. **[QUICK-WINS.md](QUICK-WINS.md)** — the weekend-shippable subset (7 apps you can validate in 48 hours)
3. **[PROJECT-STARTER.md](PROJECT-STARTER.md)** — the technical scaffold (Next.js + Supabase + Claude + Deepgram). Set up once, reuse across all 20.
4. **[OMI-APPS-GAP-ANALYSIS.md](OMI-APPS-GAP-ANALYSIS.md)** — cross-reference of your 321 ideas against Omi's live 664-app marketplace. Shows which ideas are **truly open lanes** (23), weak competition (150), or direct competition (only 32 — and most are generic transcription plugins). Reprioritizes your backlog based on real competitive data.
5. **[OMI-REVIEWS-INSIGHTS.md](OMI-REVIEWS-INSIGHTS.md)** — every public review (197 total) mined for pain points, praise, and fix-opportunities. Headline finding: **the ChatGPT plugin has 4,987 installs + 2.6★ with 11 "not working" complaints** — a validated underserved market waiting for a reliable replacement. Plus the full failure-mode catalog so you don't repeat their mistakes.

### 📚 Reference material (the archive)

4. **[omi-crawl/OMI-VISION.md](omi-crawl/OMI-VISION.md)** — what Omi themselves is building. Know this so you don't accidentally rebuild the wheel or step on their core.
5. **[omi-crawl/use-cases-by-vertical.md](omi-crawl/use-cases-by-vertical.md)** — full 321-idea use-case list, categorized by vertical (sales / healthcare / legal / engineering / real-estate / education / HR / finance / marketing / events / field-service / security / media / coaching)
6. **[omi-crawl/INDEX.md](omi-crawl/INDEX.md)** — master index of every omi.me URL we captured (3,963 total)

### 🗄️ The raw archive (so Omi can't take this back)

7. **[omi-crawl/html/](omi-crawl/html/)** — raw HTML of every omi.me page (~1–2 GB when complete). This is your forensic backup — if they fix the broken links, remove the use-case pages, or take anything else down after you publicize findings, you still have the original evidence.
8. **[omi-crawl/pages/](omi-crawl/pages/)** — cleaned markdown of all 22 static pages
9. **[omi-crawl/products/](omi-crawl/products/)** — all 7 Omi products
10. **[omi-crawl/collections/](omi-crawl/collections/)** — all 4 Shopify collections
11. **[omi-crawl/blog-sections/](omi-crawl/blog-sections/)** — all 33 blog section indexes
12. **[omi-crawl/blog-posts/](omi-crawl/blog-posts/)** — all 3,897 blog posts (cleaned)

### 📝 Optional — if you ever want to pitch them instead

13. **[omi-outreach-email.md](omi-outreach-email.md)** — cold outreach email
14. **[omi-audit-report.md](omi-audit-report.md)** — 10-finding site audit report

---

## 📁 Directory tree

```
New folder/
├── README.md                    ← YOU ARE HERE
├── PROJECT-BACKLOG.md           ← top 20 app ideas
├── QUICK-WINS.md                ← weekend-shippable subset
├── PROJECT-STARTER.md           ← tech scaffold
├── omi-outreach-email.md        ← (optional) pitch to Omi
├── omi-audit-report.md          ← (optional) site audit
│
└── omi-crawl/                   ← 155+ MB archive
    ├── OMI-VISION.md            ← Omi's own strategy
    ├── INDEX.md                 ← every URL, with local paths
    ├── use-cases-by-vertical.md ← 321 ideas categorized
    ├── use-cases-titles.txt     ← plain list for grep-ability
    │
    ├── html/                    ← RAW HTML backup (~1–2 GB)
    │   ├── pages/               ← all /pages/* as .html
    │   ├── products/            ← all /products/* as .html
    │   ├── collections/
    │   ├── blogs/               ← all 3,898 blog posts as .html
    │   └── _fetch.log
    │
    ├── pages/                   ← 22 cleaned static pages
    ├── products/                ← 7 cleaned product pages
    ├── collections/             ← 4 cleaned collections
    ├── blog-sections/           ← 33 cleaned section indexes
    ├── blog-posts/              ← 3,897 cleaned blog posts
    │
    ├── *-urls.txt               ← raw URL lists per category
    │
    └── [scripts]
        ├── extract.py           ← HTML → markdown extractor
        ├── crawl_batch.py       ← batch crawler
        ├── save_html.py         ← raw HTML archiver
        ├── build_index.py       ← INDEX.md generator
        ├── rebuild_tsv.py       ← reconstruct TSVs from disk
        ├── categorize_ideas.py  ← bucket use-cases by vertical
        └── sample_posts.py      ← sample N posts/section
```

---

## 🚦 Recommended next 7 days

**Day 1 (now):** Read `PROJECT-BACKLOG.md`. Pick ONE app. The one where you either (a) know someone in that field or (b) have personally felt the pain.

**Day 2:** Spike the system prompt for your chosen app on Claude.ai directly (see the "1-Hour Spike Test" in `QUICK-WINS.md`). If the output is garbage, iterate the prompt for 30 min. If still garbage, pick a different app.

**Day 3–4:** Set up `PROJECT-STARTER.md` scaffold. Ship the recorder + transcribe + extract pipeline. Hardcode everything. No auth. No payments.

**Day 5:** Add the ONE integration that matters (the vertical-specific export format).

**Day 6:** Find 5 real target users. Show them. Listen. Do not argue with their feedback.

**Day 7:** Decide — iterate on this idea or pick the next one. If 3+ out of 5 users wanted it, you have signal. Keep going. Add auth + Stripe. Launch.

---

## ⚠️ Important notes

- **The HTML archive (`omi-crawl/html/`) is still being populated** in the background. Crawl takes ~30-45 min for all 3,963 URLs. Check progress: `ls omi-crawl/html/*/*.html | wc -l` (target: ~3,963). Log at `omi-crawl/html/_fetch.log`.
- **Don't compete with Omi's hardware/core product.** They have a $179 necklace with $100M+ in funding. You'll lose. Compete on *vertical depth* they can't match.
- **All the scripts are reusable.** Point `crawl_batch.py` or `save_html.py` at any other competitor's sitemap.xml and you get the same archive for them.
- **All dependencies are free-tier friendly.** You can build and ship an MVP without spending a dollar until you have paying users.

---

## 🤖 A note on using AI to build these

Every app in the backlog is well-suited to being built mostly by Claude Code / Cursor / GitHub Copilot. The `PROJECT-STARTER.md` scaffold is intentionally written in a shape that an AI coding assistant can consume and extend.

Rough workflow per app:

1. Open Claude Code in the scaffold directory
2. Tell it: *"Build me the [vertical] variant. System prompt is in `lib/prompts/[name].ts`. Output UI should be [form / scorecard / timeline / checklist]. One integration: [name]."*
3. Review. Test. Ship.

This is how you ship 20 vertical apps in 20 weeks without writing most of the code yourself.
