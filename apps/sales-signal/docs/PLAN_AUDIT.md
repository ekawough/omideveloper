# Full Plan Audit — Everything We Got Wrong

> **Audit date:** April 16, 2026
> **Method:** 5 parallel research agents verified every tool, price, API,
> framework, competitor claim, and legal assumption across all planning docs.
> **Result:** 23 material corrections needed. The core strategy is sound.
> The details had drift.

---

## CRITICAL (blocks execution or costs money if wrong)

### 1. Hackathon deadline is MAY 10, not May 19
**Was:** "lablab.ai deadline May 19"
**Actually:** Hackathon runs May 4-10, 2026. On-site May 9-10 in SF (invite only). Remote is open. Submission deadline is within the May 4-10 window.
**Impact:** You have 9 fewer days than planned. Phase A must complete by early May.
**Prizes:** $10,000 cash + 1x AMD Radeon AI PRO R9700 GPU.

### 2. Omi device price is now $179, not $89-129
**Was:** "$89 AI necklace" throughout all content
**Actually:** Main Omi device is $179. Glass Dev Kit is $499. The $89 was the CES 2025 launch price.
**Impact:** Affiliate commission is higher per sale (~$54 at 30%). All content needs the correct price. "This $179 AI necklace" not "$89."

### 3. Affiliate commission is flat 30%, not tiered 20%/30%
**Was:** "20% commission (30% after 10 sales)"
**Actually:** Flat 30% from sale one. No tier.
**Impact:** This is BETTER than assumed. At $179 device price, commission is ~$54/device, not $26-39. Revenue projections are conservative.

### 4. HIPAA costs are ~$950+/mo, not $200-599/mo
**Was:** "Pro + HIPAA add-on ($200/mo)" or "Team plan ($599/mo)"
**Actually:** Team plan ($599/mo) + HIPAA add-on (~$350/mo) = ~$950/mo minimum. The Pro + $200 add-on path does NOT exist. Deepgram BAA requires enterprise contract (not self-serve).
**Impact:** SOAP Note Generator has higher infrastructure costs than planned. Still viable (competitors charge $49-119/mo per user, so 20 users covers the cost) but the break-even point is higher.

### 5. Claude model names have changed
**Was:** `claude-sonnet-4-5`, referenced throughout code and agent configs
**Actually:** Current flagship is `claude-sonnet-4-6`. Haiku 4.5 is still current. Sonnet 4.5 is now legacy (still works via alias `claude-sonnet-4-5-20250929` but will eventually deprecate). Claude Sonnet 4.0 and Opus 4.0 retire June 15, 2026.
**Impact:** Update all model references in code. Not urgent (aliases work) but should be current.

### 6. Deepgram Python SDK is now v6, not v5
**Was:** `deepgram-sdk` v5 in requirements
**Actually:** Current is v6.1.1 (released March 27, 2026). Major version bump with breaking changes.
**Impact:** The JS SDK is still v5 (correct). The Python SDK in `agents/requirements.txt` needs updating if used directly. Since SalesSignal's Python agents use Deepgram indirectly through the Node.js webhook, this may not affect current code, but any future Python Deepgram work needs v6.

### 7. Two consent states were wrong
**Was:** 15 two-party consent states including Nevada and Vermont
**Actually:** 13 states. Nevada is one-party for in-person conversations. Vermont has no state recording statute at all (federal one-party applies).
**Impact:** Update `admin/consent.html` to remove NV and VT from the two-party list. Less restrictive than assumed, which is good.

---

## IMPORTANT (affects planning, pricing, or positioning)

### 8. Freed AI pricing changed (affects competitive positioning)
**Was:** "$99/mo, 17K clinicians"
**Actually:** Now tiered: Starter $39/mo (40 notes), Core $79/mo (unlimited), Premier $104-119/mo (EHR push). 20K+ clinicians now, $19M ARR confirmed.
**Impact:** Our SOAP Notes at $49/mo now undercuts Freed's Core ($79) by 38%, not their flat $99 by 50%. Positioning still works but the comparison needs updating.

### 9. Avoma pricing dropped significantly
**Was:** "$35-70/user/mo"
**Actually:** $19-39/user/mo (roughly half). Base plans start at $19.
**Impact:** Our Sales Call Coach positioning against Avoma needs adjustment. We're still cheaper than Gong but the "cheap alternative" space has gotten more crowded and cheaper.

### 10. Drata ARR was wrong
**Was:** "$220M ARR"
**Actually:** ~$100M ARR as of early 2025. The $220M figure was likely confused with valuation or total funding.
**Impact:** Minor. Affects the compliance vertical market analysis narrative but not our product decisions.

### 11. KvCORE rebranded to BoldTrail
**Was:** "KvCORE API" in real estate integrations
**Actually:** Rebranded to BoldTrail by Inside Real Estate. Platform and APIs still work.
**Impact:** Update naming in docs. No functional change.

### 12. Nuance DAX rebranded to Dragon Copilot
**Was:** "Nuance DAX ($369-830/mo)"
**Actually:** Rebranded to Dragon Copilot (March 2025) under Microsoft. Pricing range still accurate.
**Impact:** Update naming in competitor comparisons.

### 13. ConvertKit rebranded to Kit, price doubled
**Was:** "ConvertKit, $0-29/mo"
**Actually:** Rebranded to "Kit." Free tier now 10K subscribers (better). Paid Creator plan is $33-39/mo (was ~$15). Roughly doubled.
**Impact:** Update tool name and budget. Free tier is actually more generous now (10K vs 1K subscribers), so start on free.

### 14. Buffer pricing model changed
**Was:** Flat plan pricing
**Actually:** Now per-channel: $5/mo per channel on Essentials. Free tier still has 3 channels with 10 scheduled posts each.
**Impact:** 3 channels on Essentials = $15/mo. Or use GHL Social Planner which you already pay for.

### 15. HeyGen Avatar IV is credit-gated
**Was:** Implied unlimited video at $29/mo
**Actually:** Core avatar creation unlimited. Avatar IV (higher quality) consumes credits: 200 credits/mo = ~10 min of video. Additional credits $15/mo for 300 more.
**Impact:** For high-volume TikTok clone accounts, you may hit the credit limit. Budget for additional credit packs or use Avatar III (unlimited) for volume content and Avatar IV for hero content only.

### 16. AutoGen is in maintenance mode
**Was:** Listed as a viable agent framework option
**Actually:** AutoGen v0.7.5 is the final feature release. Microsoft's successor is "Microsoft Agent Framework." Community fork AG2 continues development.
**Impact:** Remove AutoGen from our framework recommendations. CrewAI remains the right choice. OpenAI Agents SDK is the alternative.

### 17. Llama 4 exists (upgrade path)
**Was:** Llama-3.1-8B-Instruct as the recommended model
**Actually:** Llama 4 released April 2025. Scout (17B, 16 experts) fits on one H100, 10M context window, natively multimodal. Maverick (128 experts) beats GPT-4o on benchmarks. 3.1-8B still works but Scout is the better baseline for structured extraction.
**Impact:** No immediate action needed (3.1-8B works for hackathon). Plan Llama 4 Scout as the upgrade path for production.

### 18. Home service businesses: 2.5M, not 500K
**Was:** "500,000+ US home service businesses"
**Actually:** ~2.5 million. Our 500K was likely a subsegment.
**Impact:** Field Service Reports TAM is 5x larger than stated. Good news.

---

## MINOR (update docs but doesn't affect execution)

### 19. Omi GitHub stars: 8.6K (up from 8K)
Slightly higher than our reference. Still growing.

### 20. Omi now supports third-party hardware officially
Plaud, Limitless Pendant (Meta acquired Limitless Dec 2025, Omi reverse-engineered BLE support), Apple Watch, Frame glasses, OpenGlass. The "ambient AI OS" positioning is confirmed and expanding.

### 21. BSL 1.1 Change License clarification
Must explicitly specify MIT in the LICENSE file's Change License field. Default is "GPL-compatible," not MIT. Our LICENSE file should be checked to confirm MIT is specified.

### 22. BIPA (Illinois) amended August 2024
Damages now limited to one violation per person (not per scan). Electronic consent now allowed (was paper only). Retroactive to pending cases. Still need BIPA consent flow for Illinois but liability exposure is much lower.

### 23. G2 acquired Capterra + Software Advice + GetApp
Broader than stated. Combined 6M reviews, 200M annual buyers. Free listings still available but may change post-integration. List on all platforms now while free.

---

## CONFIRMED CORRECT (no changes needed)

| Item | Status |
|---|---|
| CrewAI v1.14.1 | Correct, latest stable |
| CrewAI Flows + @human_feedback | Still the API |
| CrewAI Memory (LanceDB default) | Correct, now also supports Qdrant |
| OpenAI Agents SDK production-ready | Confirmed |
| vLLM v0.19.0 | Correct, latest stable |
| VLLM_ROCM_USE_AITER_FP4BMM=0 still needed | Confirmed |
| AMD Dev Cloud MI300X + $100 credits | Confirmed (via AMD AI Developer Program) |
| Deepgram Nova-3 current model | Confirmed |
| Deepgram streaming $0.0077/min, batch $0.0043/min | Confirmed |
| Deepgram $200 free credit | Confirmed |
| Deepgram JS SDK v5 | Confirmed |
| Supabase pricing (Free/Pro $25/Team $599) | Confirmed |
| Railway Hobby $5/Pro $20 | Confirmed |
| GHL API at services.leadconnectorhq.com | Confirmed |
| GHL Version: 2021-07-28 header | Confirmed |
| GHL Social Planner posts to TikTok | Confirmed |
| HubSpot API at api.hubspot.com | Confirmed |
| ElevenLabs $22/mo Creator with voice cloning | Confirmed |
| Instructor library (12.7K stars, v1.15.1) | Confirmed (slightly higher than assumed) |
| Next.js 16.2 with Turbopack default | Confirmed |
| shadcn/ui still top component library | Confirmed |
| Stripe acquired Lemon Squeezy | Confirmed (July 2024) |
| Paddle 5% + $0.50/transaction | Confirmed |
| Gong $5K-50K platform + $1,300-1,600/user/yr | Confirmed (prices actually went up) |
| Fireflies.ai $10-39/user/mo | Confirmed |
| Follow Up Boss API at api.followupboss.com/v1 | Confirmed |
| ServiceTitan developer portal | Confirmed (company went public Dec 2024) |
| Jobber GraphQL API | Confirmed |
| AI medical scribe market $397M → $2.96B | Confirmed (US-specific, Grand View Research) |
| Conversation intelligence market $23-25B → $55B | Confirmed |
| Legal AI adoption 79% in 2024 | Confirmed |
| 653,408 active CPAs | Confirmed (August 2025 data) |
| SenseVoice-Small on HuggingFace | Confirmed, still available |
| emotion2vec+ backup | Confirmed |
| SpeechBrain wav2vec2-IEMOCAP | Confirmed |
| Omi company operational | Confirmed (commit April 16, 2026) |
| Omi $2M from Tim Draper | Confirmed |
| Omi 663-700+ marketplace apps | Confirmed |
| Omi webhook system (all 4 triggers) | Confirmed |
| Omi docs.omi.me live | Confirmed |
| Omi Discord active | Confirmed |
| All 3 Omi example repos exist | Confirmed |
| DBA filing for LLC product brands | Confirmed valid |
| BSL 1.1 is a valid license | Confirmed |

---

## Updated Revenue Math (with corrections)

### Omi Affiliate (corrected)
**Old:** $26-39/device (20-30% of $89-129)
**New:** ~$54/device (30% of $179)

At the same number of device sales, affiliate revenue is ~2x what we projected:
- 10 devices/month = $540/mo (was $260-390)
- 50 devices/month = $2,700/mo (was $1,300-1,950)

### Updated Year 1 Projection

| Month | Omi Affiliate | App Subs | Agency | TikTok Shop | Total |
|---|---|---|---|---|---|
| 1 | $160 | $0 | $0 | $200-800 | $360-960 |
| 2 | $540 | $200 | $0 | $800-2,500 | $1,540-3,240 |
| 3 | $810 | $600 | $300 | $2,000-6,000 | $3,710-7,710 |
| 4 | $1,080 | $1,200 | $600 | $3,000-8,000 | $5,880-10,880 |
| 5 | $1,350 | $2,000 | $1,000 | $4,000-10,000 | $8,350-14,350 |
| 6 | $1,620 | $3,000 | $1,500 | $5,000-12,000 | $11,120-18,120 |
| 7-12 | $2,160/mo | $4,500/mo | $2,500/mo | $6,000-15,000/mo | $15,160-24,160/mo |
| **Year 1** | **$18,000** | **$28,000** | **$16,000** | **$40,000-100,000** | **$102,000-162,000** |

The affiliate correction alone adds ~$6,000/year over previous projections.

---

## Immediate Code Changes Needed

Before we start executing, fix these in the codebase:

1. **`agents/agents.py`** — update model references from `claude-sonnet-4-5` to `claude-sonnet-4-6`
2. **`admin/consent.html`** — remove Nevada and Vermont from two-party consent state list
3. **`docs/MULTI_AGENT_MARKETING.md`** — update model references in YAML agent configs
4. **All content/docs** — update device price from $89 to $179, commission from $26-39 to ~$54
5. **`LICENSE`** — verify Change License field explicitly says "MIT"
6. **Hackathon timeline** — everything must be done by May 4, not May 19

---

## Tools Stack — Final Validated Version

### Active and Correct
| Tool | Version/Plan | Monthly Cost | Status |
|---|---|---|---|
| CrewAI | 1.14.1 | Open source | Correct |
| Deepgram | Nova-3 | Usage-based ($200 free) | Correct |
| Supabase | Pro ($25/mo) | $25 | Correct for non-HIPAA |
| Railway | Hobby ($5/mo) | $5-10 | Correct |
| Claude API | Sonnet 4.6 + Haiku 4.5 | ~$20-50 | Update model names |
| GHL | Already active | Already paying | Correct |
| HeyGen | Creator ($29/mo) | $29 | Correct (watch credit limits) |
| ElevenLabs | Creator ($22/mo) | $22 | Correct |
| vLLM | v0.19.0 ROCm | AMD credits | Correct |
| Llama | 3.1-8B-Instruct | Free | Correct (upgrade to Llama 4 later) |

### For TikTok Shop (from TIKTOK_SHOP_RESEARCH.md)
| Tool | Monthly Cost | Status |
|---|---|---|
| CJDropshipping | Free | Replaces AutoDS at launch |
| AdsPower | $9 | Anti-detect browser |
| IPRoyal | $25-50 | Residential proxies |
| Creatify | $19-49 | TikTok product video AI |
| TikTok Creative Center | Free | Product research |

### For Later (Phase E+)
| Tool | Monthly Cost | When |
|---|---|---|
| Kit (ConvertKit) | $0 (free tier, 10K subs) | Phase B |
| Kalodata | $45.90 | When researching new TikTok products |
| Supabase Team + HIPAA | ~$950 | SOAP Notes launch only |
| WordPress + Hostinger | $12-20 | Phase B |

### Removed from Plan
| Tool | Reason |
|---|---|
| AutoDS (at launch) | CJDropshipping is free with same features |
| AutoGen | Maintenance mode, use CrewAI |
| Buffer | Use GHL Social Planner (already paying) |
| Multilogin (at launch) | AdsPower at $9/mo is enough for 5 accounts |
| FastMoss | Overkill, use Kalodata if needed |
