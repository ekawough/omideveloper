# The Unified Agent Stack — One System, All Revenue

## What This Is

One AI agent system that runs your entire business across four revenue
streams. You're not a passive approver — you're the active leader directing
10 agents that communicate with each other through shared memory and
structured handoffs. Every agent knows about every product, every revenue
stream, and every campaign. Nothing operates in isolation.

---

## The Four Revenue Streams (One Machine)

**Stream 1 — Omi App Store (discovery engine)**
Free apps get mass downloads. Users find one app, discover your others,
upgrade to paid. High installs = developer authority = everything else
converts better.

**Stream 2 — Omi Device Affiliate ($26-39/sale)**
Every piece of content shows what your apps + the device do together.
Affiliate link + code ETHANJOHNKAWOUG on everything. Device buyers become
app users.

**Stream 3 — App Subscriptions ($29-149/mo)**
Your apps sold directly as SaaS on omideveloper.com. Individual
professionals self-serve.

**Stream 4 — Kawough Marketing Agency**
The apps ARE the services. Sold individually or as packages to businesses.
Plus marketing packages using your own AI agent system for other companies.

**How they feed each other:**
```
Content shows what apps + device do
    ├── Individual downloads free app (Stream 1)
    │       └── Upgrades to paid (Stream 3)
    ├── Individual buys device (Stream 2)
    │       └── Discovers more apps (Stream 1 → 3)
    ├── Business sees content
    │       └── Hires Kawough Marketing (Stream 4)
    │               ├── Buys devices for team (Stream 2)
    │               ├── Deploys apps for team (Stream 3)
    │               └── Case study → more content → cycle repeats
    └── Developer sees tutorials
            └── Buys device to build (Stream 2)
```

---

## The Agency — All Apps, All Packages

Kawough Marketing doesn't sell one product. It sells your ENTIRE app
portfolio as services, individually or packaged:

### Individual Services

| Service | App Behind It | Target | Monthly |
|---|---|---|---|
| AI Sales Enablement | SalesSignal | D2D teams, inside sales | $49/seat |
| AI Medical Scribe | SOAP Note Generator | Clinics, private practice | $49/user |
| AI Showing Reports | Real Estate Showing Notes | Agencies, solo agents | $29/user |
| AI Call Intelligence | Sales Call Coach | Sales teams | $29-49/seat |
| AI Legal Transcription | Deposition Digest | Law firms, solo attorneys | $99-149/user |
| AI Creative Briefs | Creative Brief Generator | Agencies, marketing teams | $29/team |
| AI Voice Notes | Voice-to-AI Bridge | Anyone with Omi | $9/user |
| AI Coaching Platform | 1-on-1 Coaching Journal | Managers, coaches | $12-19/user |
| AI Field Reports | Field Service Reports | HVAC, plumbing, electrical | $39-79/tech |
| AI Study Kit | Lecture-to-Study-Kit | Students, educators | $5-10/user |

### Agency Packages

| Package | What's in it | Setup | Monthly | Target |
|---|---|---|---|---|
| **Starter** | 1 app deployed + team training | $300 | $100-200 | Small team, one vertical |
| **Growth** | 2-3 apps + CRM integration + ongoing support | $750 | $300-500 | Growing team |
| **Enterprise** | Full app suite + custom workflows + dedicated support | $2,000 | $800-1,500 | Large org, multiple teams |
| **Marketing Package** | AI content + social + outreach for THEIR business | $500 | $300-500 | Any business |
| **Full Stack** | Apps + marketing + automation | $3,000 | $1,000-2,000 | Companies wanting everything |

### One Deal, All Streams

A 15-person D2D solar company signs the Growth package:
- 15 Omi devices via affiliate: 15 × $35 = **$525** (Stream 2)
- SalesSignal: 15 seats × $49 = **$735/mo** (Stream 3)
- Sales Call Coach: 15 seats × $29 = **$435/mo** (Stream 3)
- Setup fee: **$750** (Stream 4)
- Monthly management: **$400/mo** (Stream 4)
- **Year 1 from ONE client: $525 + $750 + ($1,570 × 12) = $20,115**

Now multiply that across verticals. A medical clinic. A real estate agency.
A law firm. Each one buying devices through your link, subscribing to your
apps, and paying for your agency services.

---

## Your Role — The Active Leader

You're not checking in 30 minutes a week. You're running this. The agents
extend your capacity — they don't replace your thinking.

**What you do daily (1-2 hours):**
- Review agent outputs and direct revisions with specific feedback
- Make strategic calls the agents can't make (which vertical to push harder,
  which prospect to prioritize, when to pivot messaging)
- Record video content (demos, tutorials, TikToks) — agents can't do this
- Engage personally in high-value conversations (agency prospects, key
  community threads, important DMs)
- Build the actual apps — this is your core competitive advantage

**What agents handle under your direction:**
- Draft content (you review, edit, direct rewrites)
- Research (competitors, keywords, prospects, market changes)
- Distribute approved content across platforms
- Track performance metrics and surface insights
- Draft outreach messages (you approve before sending)
- Monitor audience feedback and surface what matters
- Optimize app store listings based on data
- Prepare agency proposals from templates you set

**The relationship:** You're a CEO with a staff of 10. You set direction,
review work, make decisions, and handle the things only you can do (build
apps, record video, close deals). They handle volume and execution speed.

---

## How Agents Actually Connect — Framework Research

I researched the four major production multi-agent frameworks to find what
actually works. Here's the honest comparison:

### Framework Comparison

| Framework | How agents talk | State sharing | Human-in-loop | Production ready | Best for |
|---|---|---|---|---|---|
| **CrewAI** | Delegation tools + task context chains | Unified Memory (LLM-scored, persisted to LanceDB) | `@human_feedback` decorator with routing | Yes (v1.14+) | Structured business workflows |
| **OpenAI Agents SDK** | Handoffs (agent returns another agent) + agent-as-tool | Conversation history + sessions + context_variables | Guardrails + manual checkpoints | Yes (production successor to Swarm) | Clean multi-agent pipelines |
| **AutoGen** | Shared message context + HandoffMessage | All agents see full conversation thread | ExternalTermination + user handoff | Yes (Microsoft-backed) | Complex conversations |
| **LangGraph** | Graph edges + shared state dict | StateGraph with typed state schema | Interrupt nodes + human-in-the-loop | Yes (LangChain ecosystem) | Custom agent architectures |

### What People Actually Use for Marketing/Business Agents

**CrewAI** dominates the marketing agent space. Their example repos include:
- `marketing-strategy` — campaign planning crew
- `content-creator-flow` — multi-crew blog + LinkedIn + research
- `lead-score-flow` — lead qualification with human review
- Instagram post generator, landing page generator

**Why CrewAI wins for your use case:**
1. **Flows** — chain multiple crews together with routing and approval gates
2. **Unified Memory** — agents remember across tasks AND across runs (persisted)
3. **`@human_feedback`** — built-in approval gates where YOU review and route
4. **Hierarchical process** — manager agent (Orchestrator) delegates to specialists
5. **You already use CrewAI** in SalesSignal's agent pipeline

### How CrewAI Agents Actually Communicate

**Within a crew (during one task execution):**
- Agents with `allow_delegation=True` get two automatic tools:
  - **Delegate Work** — assign a subtask to another agent with context
  - **Ask Question** — query another agent for information
- In `process="hierarchical"`, a manager agent orchestrates who does what
- All agents in a crew share a unified memory space

**Between crews (across different phases):**
- **CrewAI Flows** chain crews together with `@start()` and `@listen()` decorators
- One crew's output becomes the next crew's input automatically
- `@router()` enables conditional branching (e.g., route content to different
  channels based on type)
- `@human_feedback()` pauses the flow for your review and routes based on
  your decision

**Memory persistence across everything:**
- CrewAI's Memory class stores facts extracted from every task
- Uses LLM-scored composite ranking: semantic similarity + recency + importance
- Persists to LanceDB (`.crewai/memory/`) — survives across runs
- Scoped memory: crew-level (shared), agent-level (private), or sliced (multi-scope)
- Every agent can recall what happened in previous runs, previous campaigns,
  previous weeks

**This means:** Your SEO Writer agent remembers that the "Omi for Doctors"
post drove 4 affiliate sales last week. Your Outreach agent remembers which
prospects replied and what they said. Your Analyst agent has the full
performance history. All without you manually passing context.

### The Alternative: OpenAI Agents SDK

If you want the cleanest code and tightest control:

```python
from agents import Agent, Runner, handoff

# Every agent knows about all 4 streams via system instructions
SYSTEM_CONTEXT = """
You are part of a unified business system. Four revenue streams:
1. Omi App Store (free downloads → paid upgrades)
2. Omi Affiliate (device sales, code ETHANJOHNKAWOUG)
3. App Subscriptions (direct SaaS, $29-149/mo)
4. Kawough Marketing Agency (apps as services + marketing packages)

Products: SalesSignal, SOAP Notes, Showing Notes, Sales Coach,
Deposition Digest, Creative Brief, Voice Bridge, Coaching Journal,
Field Service Reports, Study Kit.

Every output must serve at least 2 streams. Include specific CTAs for
each stream served.
"""

research_agent = Agent(
    name="Research",
    instructions=SYSTEM_CONTEXT + "\nYou research competitors, keywords, "
    "prospects, market changes, and community signals.",
)

seo_writer = Agent(
    name="SEO Writer",
    instructions=SYSTEM_CONTEXT + "\nYou write 1500-2500 word blog posts "
    "for omideveloper.com from Ethan Kawough's perspective. Every post "
    "has 3 CTAs: download app free (Stream 1), buy device with code "
    "(Stream 2), hire Kawough Marketing (Stream 4).",
    handoffs=[research_agent],  # Can ask Research for data
)

social_writer = Agent(
    name="Social Writer",
    instructions=SYSTEM_CONTEXT + "\nYou create TikTok scripts, LinkedIn "
    "posts, and Twitter threads. Each serves multiple streams.",
    handoffs=[research_agent],
)

outreach_agent = Agent(
    name="Outreach",
    instructions=SYSTEM_CONTEXT + "\nYou draft personalized outreach "
    "messages. Route prospects to the right stream based on size: "
    "individual → self-serve (Stream 3), team → subscription (Stream 3), "
    "business → Kawough Marketing (Stream 4). All get affiliate link.",
    handoffs=[research_agent],
)

# Orchestrator can hand off to ANY specialist
orchestrator = Agent(
    name="Orchestrator",
    instructions=SYSTEM_CONTEXT + "\nYou are the master planner. You read "
    "analytics and research, then delegate to specialists. You ensure "
    "every piece of work serves the unified strategy.",
    handoffs=[seo_writer, social_writer, outreach_agent, research_agent],
)

# Run with YOU in the loop
result = Runner.run_sync(
    orchestrator,
    input="Produce this week's content plan. Analytics show 'omi for "
    "doctors' hit page 1. SalesSignal had 4 affiliate sales from the "
    "sales reps article. Two agency prospects in pipeline."
)
```

**Handoffs in OpenAI Agents SDK:**
- Agent A finishes its work and returns Agent B → control transfers
- Agent B gets the full conversation history (or filtered via `input_filter`)
- State passes through `context_variables` dictionary
- Guardrails validate inputs/outputs before they proceed
- Sessions persist state across multiple runs
- `Agent.as_tool()` lets a manager call specialists without losing control

### My Recommendation: CrewAI Flows + OpenAI Agents SDK Hybrid

**Use CrewAI Flows** for the overall weekly orchestration cycle:
- `@start()` → intelligence gathering (Research + Analytics + Feedback)
- `@listen()` → Orchestrator produces plan
- `@human_feedback()` → YOU review and direct
- `@listen()` → Content production (parallel crews)
- `@human_feedback()` → YOU review drafts
- `@listen()` → Distribution + outreach execution

**Use OpenAI Agents SDK** for the individual agent interactions within each
phase, because:
- Cleaner handoff mechanism (agent returns agent)
- Better guardrails (input/output validation)
- Production-grade sessions for state persistence
- You can use Claude as the LLM (not locked to OpenAI models)

**Or just go pure CrewAI** since you already have it in your stack and it
handles everything. The hybrid adds complexity.

---

## The 10 Agents — Fully Connected Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     SHARED MEMORY                            │
│  (CrewAI Memory → LanceDB, scoped per agent + shared crew)  │
│                                                              │
│  Every agent reads/writes to shared memory.                  │
│  Memory persists across runs — agents remember everything.   │
│  Composite scoring: semantic similarity + recency + weight.  │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │      ORCHESTRATOR       │
              │                         │
              │ • Reads all agent memory │
              │ • Plans weekly campaigns │
              │ • Delegates via Flows   │
              │ • Reports to YOU        │
              │                         │
              │   allow_delegation=True  │
              │   process=hierarchical   │
              └────────────┬────────────┘
                           │
         ┌─────────┬───────┼───────┬─────────┐
         │         │       │       │         │
    ┌────▼───┐ ┌───▼───┐ ┌▼────┐ ┌▼──────┐ ┌▼────────┐
    │RESEARCH│ │CONTENT│ │DIST-│ │OUT-   │ │ANALYTICS│
    │        │ │ENGINE │ │RIBE │ │REACH  │ │         │
    │Monitors│ │       │ │     │ │       │ │Tracks   │
    │competi-│ │3 sub- │ │Pub- │ │Cold   │ │all 4    │
    │tors,   │ │agents:│ │lish │ │email, │ │streams, │
    │markets,│ │SEO,   │ │to   │ │Linke- │ │produces │
    │keywords│ │Social,│ │all  │ │dIn,   │ │unified  │
    │        │ │Email  │ │chan- │ │comm-  │ │reports  │
    │Can be  │ │       │ │nels │ │unity  │ │         │
    │queried │ │Each   │ │     │ │       │ │Feeds    │
    │by ANY  │ │writes │ │     │ │Routes │ │Orches-  │
    │other   │ │for all│ │     │ │pros-  │ │trator   │
    │agent   │ │4      │ │     │ │pects  │ │every    │
    │        │ │streams│ │     │ │to     │ │Monday   │
    └────────┘ └───────┘ └─────┘ │right  │ └─────────┘
                                  │stream │
                                  └───────┘
         ┌─────────┬───────────┬─────────┐
         │         │           │         │
    ┌────▼───┐ ┌───▼─────┐ ┌──▼──────┐ ┌▼──────────┐
    │FEEDBACK│ │APP STORE│ │AGENCY   │ │CROSS-SELL │
    │LOOP    │ │OPTIMIZER│ │OPS      │ │           │
    │        │ │         │ │         │ │Moves users│
    │Monitors│ │Manages  │ │Prepares │ │between    │
    │all     │ │all app  │ │propos-  │ │streams:   │
    │audience│ │listings │ │als for  │ │           │
    │touch-  │ │in Omi   │ │ALL apps │ │Free→Paid  │
    │points  │ │store    │ │and ALL  │ │User→Agency│
    │        │ │         │ │packages │ │1 app→more │
    │Extracts│ │Optimizes│ │         │ │Review→    │
    │testi-  │ │titles,  │ │Manages  │ │  testimony│
    │monials,│ │descrip- │ │client   │ │           │
    │ideas,  │ │tions,   │ │health,  │ │Triggers   │
    │bugs    │ │keywords │ │upsells  │ │on events  │
    └────────┘ └─────────┘ └─────────┘ └───────────┘
```

### How They Actually Talk to Each Other

**Example flow — one blog post from idea to published:**

```
1. ANALYTICS notices "omi for doctors" keyword climbing
       │
       ▼ (writes to shared memory: "medical keyword opportunity detected")
       
2. ORCHESTRATOR reads memory on Monday, sees the signal
       │
       ▼ (delegates to RESEARCH via CrewAI delegation tool)
       
3. RESEARCH investigates:
   - What currently ranks for "omi for doctors"
   - What medical professionals complain about online
   - Competitor SOAP note pricing
   - Community questions about Omi + healthcare
       │
       ▼ (writes findings to shared memory, returns to ORCHESTRATOR)

4. ORCHESTRATOR creates unified brief:
   "Write 'Omi for Doctors' article. Streams: 1 (SOAP Notes free download),
    2 (device affiliate link + code), 3 (paid subscription CTA),
    4 (Kawough Medical AI package mention). Reference Research findings."
       │
       ▼ (delegates to CONTENT ENGINE → SEO WRITER sub-agent)

5. SEO WRITER drafts the article, pulling from:
   - RESEARCH findings (from shared memory)
   - ANALYTICS data (which medical keywords convert)
   - FEEDBACK insights (what doctors actually ask about)
   - All 4 stream CTAs as specified in the brief
       │
       ▼ (draft lands in YOUR review queue)

6. YOU review, make edits, add personal anecdotes from building
   the SOAP Notes app, approve with notes
       │
       ▼ (approved content goes to DISTRIBUTION)

7. DISTRIBUTION deploys simultaneously:
   - Blog post on omideveloper.com
   - LinkedIn excerpt scheduled for Tuesday
   - TikTok script queued (for you to record)
   - Twitter thread scheduled for Wednesday
   - Email newsletter segment for Thursday
   - Omi Discord — helpful post in #medical channel
       │
       ▼ (all deployments logged in shared memory)

8. OUTREACH sees new medical content is live
   - Drafts personalized emails to 10 clinic administrators
   - References the blog post as social proof
   - Routes each prospect: individual → Stream 3, clinic → Stream 4
       │
       ▼ (outreach drafts in YOUR review queue)

9. YOU review outreach, personalize the top 3, approve the rest

10. FEEDBACK monitors responses:
    - Blog comment: "Does this work with Epic?" → content idea
    - LinkedIn share by a PA → testimonial candidate
    - Email reply from Dr. Patel: "Can you set this up for us?" → AGENCY OPS
        │
        ▼ (all signals written to shared memory)

11. AGENCY OPS picks up Dr. Patel lead:
    - Generates proposal with SOAP Notes + any relevant packages
    - Includes device pricing (affiliate link for the clinic's devices)
    - Draft lands in YOUR queue
        │
        ▼

12. YOU customize the proposal, get on a call, close the deal

13. CROSS-SELL activates post-close:
    - After 30 days: "Dr. Patel's team uses SOAP Notes — pitch Voice Bridge?"
    - After positive feedback: "Ask Dr. Patel for a case study"
    - Case study → CONTENT ENGINE → new blog post → cycle repeats

14. ANALYTICS tracks ALL of this:
    - Blog post drove 23 visits, 2 app downloads, 1 device sale, 1 agency lead
    - Feeds into next Monday's report
    - ORCHESTRATOR uses this to plan next week
```

**That's the full loop.** Every agent reads from and writes to shared memory.
Every output triggers the next agent. Every piece of content serves all
streams. And YOU are in the middle — reviewing, directing, personalizing,
closing.

---

## CrewAI Implementation — The Real Code

### Project Structure

```
kawough-agents/
├── src/
│   ├── agents/
│   │   ├── orchestrator.yaml      # Master planner
│   │   ├── research.yaml          # Intelligence gathering
│   │   ├── seo_writer.yaml        # Long-form blog content
│   │   ├── social_writer.yaml     # TikTok/LinkedIn/X
│   │   ├── email_writer.yaml      # Sequences + newsletters
│   │   ├── distribution.yaml      # Multi-channel publishing
│   │   ├── outreach.yaml          # Prospect engagement
│   │   ├── analytics.yaml         # Performance tracking
│   │   ├── feedback.yaml          # Audience monitoring
│   │   ├── aso.yaml               # App store optimization
│   │   ├── agency_ops.yaml        # Proposals + client management
│   │   └── cross_sell.yaml        # Flywheel acceleration
│   │
│   ├── tasks/
│   │   ├── weekly_planning.yaml
│   │   ├── content_creation.yaml
│   │   ├── outreach_campaigns.yaml
│   │   ├── performance_reporting.yaml
│   │   └── agency_operations.yaml
│   │
│   ├── tools/
│   │   ├── notion_tool.py         # Read/write Notion databases
│   │   ├── gsc_tool.py            # Google Search Console data
│   │   ├── wordpress_tool.py      # Publish to omideveloper.com
│   │   ├── buffer_tool.py         # Schedule social posts
│   │   ├── email_tool.py          # Send via ConvertKit/Resend
│   │   ├── omi_store_tool.py      # Update app listings
│   │   ├── supabase_tool.py       # Query business metrics
│   │   └── apollo_tool.py         # Prospect research
│   │
│   ├── flows/
│   │   ├── weekly_cycle.py        # Main weekly orchestration
│   │   ├── content_flow.py        # Content creation → approval → publish
│   │   ├── outreach_flow.py       # Research → draft → approve → send
│   │   └── agency_flow.py         # Lead → proposal → close → onboard
│   │
│   ├── config/
│   │   ├── products.yaml          # All 10 apps + pricing + status
│   │   ├── streams.yaml           # Revenue stream definitions
│   │   ├── packages.yaml          # Agency package definitions
│   │   └── templates.yaml         # Content templates per type
│   │
│   └── main.py                    # Entry point
│
├── .crewai/
│   └── memory/                    # Persistent agent memory (LanceDB)
│
├── pyproject.toml
└── README.md
```

### Agent Definitions

```yaml
# agents/orchestrator.yaml
orchestrator:
  role: Business Operations Director
  goal: >
    Direct all marketing, sales, and agency operations across a unified
    business with four revenue streams: Omi App Store, Omi Affiliate,
    App Subscriptions, and Kawough Marketing Agency. Every campaign serves
    multiple streams. Every piece of content drives multiple revenue sources.
  backstory: >
    You are the strategic brain of Ethan Kawough's AI app business.
    You manage a portfolio of 10 vertical AI apps built on the Omi wearable
    platform, sold both as self-serve SaaS and as managed services through
    Kawough Marketing. You read analytics, research, and audience feedback
    to make decisions about what to produce, who to target, and how to
    grow all four revenue streams simultaneously.

    Products and pricing:
    - SalesSignal: AI CRM auto-fill for D2D sales ($49/seat/mo)
    - SOAP Note Generator: AI medical scribe ($49/mo)
    - Real Estate Showing Notes: AI showing reports ($29/mo)
    - Sales Call Coach: Gong alternative ($29-49/seat/mo)
    - Deposition Digest: AI legal transcription ($99-149/mo)
    - Creative Brief Generator: voice-to-brief ($29/mo)
    - Voice-to-AI Bridge: universal output router ($9/mo)
    - 1-on-1 Coaching Journal: manager tool ($12-19/user/mo)
    - Field Service Reports: HVAC/plumbing ($39-79/mo)
    - Lecture-to-Study-Kit: student tool ($5-10/mo)

    Agency packages: Starter ($300 setup + $100-200/mo),
    Growth ($750 + $300-500/mo), Enterprise ($2K + $800-1500/mo),
    Marketing Only ($500 + $300-500/mo), Full Stack ($3K + $1-2K/mo).

    Affiliate: ETHANJOHNKAWOUG (10% off), 20-30% commission (~$26-39/device).
  allow_delegation: true
  llm: claude-sonnet-4-6-20260415
  memory: true

# agents/research.yaml
research:
  role: Market Intelligence Analyst
  goal: >
    Continuously monitor competitors, keywords, Omi marketplace, community
    signals, and prospect intelligence. Feed actionable data to every other
    agent. When another agent asks you a question, provide specific data
    with sources, not vague summaries.
  backstory: >
    You have access to Google Search Console, Omi marketplace data, social
    media, and community forums. You track everything: competitor content
    changes, new affiliate sites, keyword movements, new Omi apps,
    industry news per vertical (medical, legal, real estate, sales, etc.),
    and prospect intelligence for the outreach team.
  tools:
    - gsc_tool
    - omi_store_tool
    - web_search_tool
  allow_delegation: false
  llm: claude-haiku-4-5-20250929

# agents/seo_writer.yaml
seo_writer:
  role: SEO Content Writer for omideveloper.com
  goal: >
    Write 1500-2500 word blog posts that rank on Google page 1 and drive
    all four revenue streams. Every post has three CTAs: download free app
    (Stream 1 + 3), buy device with ETHANJOHNKAWOUG code (Stream 2), and
    contact Kawough Marketing for business deployment (Stream 4).
  backstory: >
    You write as Ethan Kawough, a full-stack developer who built 10+ apps
    on the Omi AI wearable platform. Your tone is direct, technical, honest.
    You reference real building experience — specific gotchas, real test
    results, actual code snippets. You never write generic AI marketing fluff.
    You include personal anecdotes and real metrics when available.

    You have access to shared memory with Research Agent findings, Analytics
    data, and Feedback Loop audience insights. Use these to make content
    specific and data-driven, not generic.
  allow_delegation: true  # Can ask Research for data
  llm: claude-sonnet-4-6-20260415

# (similar YAML for all other agents — social_writer, email_writer,
#  distribution, outreach, analytics, feedback, aso, agency_ops, cross_sell)
```

### The Weekly Cycle Flow

```python
# flows/weekly_cycle.py
from crewai import Agent, Task, Crew
from crewai.flow.flow import Flow, start, listen, router
from crewai.flow.flow import human_feedback, HumanFeedbackResult
from pydantic import BaseModel
from typing import List, Dict, Optional
import yaml

class UnifiedState(BaseModel):
    """Shared state across the entire weekly cycle."""
    # Analytics
    weekly_report: str = ""
    top_performing_content: List[str] = []
    underperforming_content: List[str] = []
    affiliate_sales_this_week: int = 0
    app_mrr: float = 0
    agency_mrr: float = 0

    # Research
    intelligence_brief: str = ""
    keyword_opportunities: List[str] = []
    competitor_moves: List[str] = []
    prospect_intel: List[Dict] = []

    # Feedback
    audience_insights: str = ""
    testimonial_candidates: List[str] = []
    content_ideas: List[str] = []
    bugs_reported: List[str] = []

    # Plan
    weekly_plan: str = ""
    content_briefs: List[Dict] = []
    outreach_targets: List[Dict] = []

    # Drafts
    blog_drafts: List[Dict] = []
    social_drafts: List[Dict] = []
    email_drafts: List[Dict] = []
    outreach_drafts: List[Dict] = []

    # Agency
    agency_proposals: List[Dict] = []
    client_health: List[Dict] = []
    upsell_opportunities: List[Dict] = []


class WeeklyCycleFlow(Flow[UnifiedState]):
    """
    The main weekly orchestration cycle.
    
    Runs every Monday. YOU are involved at two review gates:
    1. After the Orchestrator produces the weekly plan
    2. After all content/outreach drafts are produced
    
    Plus you can intervene at any point by checking the Notion dashboard.
    """

    # ═══════════════════════════════════════════
    # PHASE 1: INTELLIGENCE (runs in parallel)
    # ═══════════════════════════════════════════

    @start()
    def gather_analytics(self):
        """Analytics Agent pulls unified dashboard across all 4 streams."""
        crew = Crew(
            agents=[analytics_agent],
            tasks=[Task(
                description="""
                Pull performance data across all four revenue streams:
                1. Omi App Store: installs per app, ratings, new reviews
                2. Affiliate: devices sold, commission earned, top converting content
                3. App Subscriptions: MRR, new signups, churn, upgrade rate
                4. Agency: active clients, retainer total, pipeline value
                
                Plus: website traffic, keyword rankings, social engagement,
                email metrics. Produce the Unified Business Dashboard.
                """,
                expected_output="Unified weekly dashboard with all metrics and recommendations",
                agent=analytics_agent
            )],
            memory=True,
        )
        result = crew.kickoff()
        self.state.weekly_report = result.raw
        return result

    @start()
    def gather_research(self):
        """Research Agent scans competitors, keywords, communities, prospects."""
        crew = Crew(
            agents=[research_agent],
            tasks=[Task(
                description="""
                Produce the Weekly Intelligence Brief:
                1. Keyword landscape: new opportunities, position changes
                2. Omi marketplace: new competing apps, rating changes
                3. Affiliate intel: competitor codes, new affiliate sites
                4. Vertical news: regulations, trends, tools per vertical
                5. Community signals: Omi Discord, Reddit, HN discussions
                6. Prospect intel: companies hiring, complaining, expanding
                """,
                expected_output="Intelligence brief with specific recommendations",
                agent=research_agent
            )],
            memory=True,
        )
        result = crew.kickoff()
        self.state.intelligence_brief = result.raw
        return result

    @start()
    def gather_feedback(self):
        """Feedback Loop Agent monitors all audience touchpoints."""
        crew = Crew(
            agents=[feedback_agent],
            tasks=[Task(
                description="""
                Monitor all audience touchpoints from the past week:
                1. Blog comments, social replies, DMs
                2. Email replies to sequences
                3. Omi app store reviews (all apps)
                4. Discord conversations mentioning our apps
                5. Support requests and bug reports
                
                Extract: testimonial candidates, content ideas from real
                questions, feature requests, bugs, competitor mentions.
                """,
                expected_output="Audience intelligence report with actionable items",
                agent=feedback_agent
            )],
            memory=True,
        )
        result = crew.kickoff()
        self.state.audience_insights = result.raw
        return result

    # ═══════════════════════════════════════════
    # PHASE 2: ORCHESTRATOR PLANS
    # ═══════════════════════════════════════════

    @listen(gather_analytics, gather_research, gather_feedback)
    def create_weekly_plan(self, *results):
        """Orchestrator reads ALL intelligence and produces unified plan."""
        crew = Crew(
            agents=[orchestrator_agent],
            tasks=[Task(
                description=f"""
                You have three intelligence inputs:

                ANALYTICS DASHBOARD:
                {self.state.weekly_report}

                RESEARCH BRIEF:
                {self.state.intelligence_brief}

                AUDIENCE FEEDBACK:
                {self.state.audience_insights}

                Produce a unified weekly plan that includes:
                1. Content calendar: 2-3 blog posts, 5-7 social posts,
                   1 email (newsletter or sequence), with SPECIFIC briefs
                   for each — keyword, audience, products, all 4 streams.
                2. Outreach plan: which prospects to target, which sequence,
                   which revenue stream each routes to.
                3. App store updates: any listing changes needed.
                4. Agency actions: proposals to prepare, clients to check in with.
                5. Cross-sell triggers: any flywheel opportunities.

                EVERY item must specify which revenue streams it serves.
                """,
                expected_output="Detailed weekly plan with briefs for all agents",
                agent=orchestrator_agent
            )],
            memory=True,
        )
        result = crew.kickoff()
        self.state.weekly_plan = result.raw
        return result

    # ═══════════════════════════════════════════
    # GATE 1: YOU REVIEW THE PLAN
    # ═══════════════════════════════════════════

    @listen(create_weekly_plan)
    @human_feedback(
        message="""
        Review the weekly plan. Check:
        - Are the right products being pushed this week?
        - Are all 4 streams represented?
        - Any priorities you want to change?
        - Any outreach targets to add or remove?
        
        Respond with your direction. Say 'approved' to proceed,
        or give specific changes.
        """,
        emit=["execute", "revise_plan"],
        llm="claude-sonnet-4-6-20260415",
        default_outcome="revise_plan"
    )
    def review_plan(self):
        return self.state.weekly_plan

    @listen("revise_plan")
    def revise_weekly_plan(self, result: HumanFeedbackResult):
        """Re-plan with your specific direction."""
        self.state.your_direction = result.feedback
        return self.create_weekly_plan()

    # ═══════════════════════════════════════════
    # PHASE 3: PARALLEL EXECUTION
    # ═══════════════════════════════════════════

    @listen("execute")
    def produce_blog_content(self, result: HumanFeedbackResult):
        """SEO Writer produces blog posts per the approved plan."""
        crew = Crew(
            agents=[seo_writer_agent, research_agent],
            tasks=generate_blog_tasks(self.state.weekly_plan),
            process="sequential",  # Research feeds Writer
            memory=True,
        )
        result = crew.kickoff()
        self.state.blog_drafts = parse_drafts(result.raw)
        return result

    @listen("execute")
    def produce_social_content(self, result: HumanFeedbackResult):
        """Social Writer produces platform-specific posts."""
        crew = Crew(
            agents=[social_writer_agent],
            tasks=generate_social_tasks(self.state.weekly_plan),
            memory=True,
        )
        result = crew.kickoff()
        self.state.social_drafts = parse_drafts(result.raw)
        return result

    @listen("execute")
    def produce_email_content(self, result: HumanFeedbackResult):
        """Email Writer produces newsletter or sequence."""
        crew = Crew(
            agents=[email_writer_agent],
            tasks=generate_email_tasks(self.state.weekly_plan),
            memory=True,
        )
        result = crew.kickoff()
        self.state.email_drafts = parse_drafts(result.raw)
        return result

    @listen("execute")
    def produce_outreach(self, result: HumanFeedbackResult):
        """Outreach Agent drafts personalized messages."""
        crew = Crew(
            agents=[outreach_agent, research_agent],
            tasks=generate_outreach_tasks(self.state.weekly_plan),
            process="sequential",
            memory=True,
        )
        result = crew.kickoff()
        self.state.outreach_drafts = parse_drafts(result.raw)
        return result

    @listen("execute")
    def optimize_app_store(self, result: HumanFeedbackResult):
        """ASO Agent updates app listings."""
        crew = Crew(
            agents=[aso_agent],
            tasks=[app_store_task],
            memory=True,
        )
        return crew.kickoff()

    @listen("execute")
    def handle_agency_ops(self, result: HumanFeedbackResult):
        """Agency Ops prepares proposals and checks client health."""
        crew = Crew(
            agents=[agency_ops_agent],
            tasks=generate_agency_tasks(self.state.weekly_plan),
            memory=True,
        )
        result = crew.kickoff()
        self.state.agency_proposals = parse_proposals(result.raw)
        return result

    # ═══════════════════════════════════════════
    # GATE 2: YOU REVIEW ALL DRAFTS
    # ═══════════════════════════════════════════

    @listen(produce_blog_content, produce_social_content,
            produce_email_content, produce_outreach, handle_agency_ops)
    @human_feedback(
        message="""
        All drafts are ready for your review:
        
        BLOG POSTS: Review for accuracy, tone, personal touches, all 4 CTAs.
        SOCIAL POSTS: Review hooks, platform fit, stream coverage.
        EMAIL: Review subject lines, value, CTAs.
        OUTREACH: Review personalization, prospect routing, messaging.
        AGENCY PROPOSALS: Review pricing, packaging, client fit.
        
        Edit what you want. Add your personal anecdotes.
        Kill what doesn't work. Approve what's ready.
        """,
        emit=["publish_all", "publish_some", "revise_drafts"],
        llm="claude-sonnet-4-6-20260415",
        default_outcome="publish_some"
    )
    def review_all_drafts(self):
        return {
            "blogs": self.state.blog_drafts,
            "social": self.state.social_drafts,
            "email": self.state.email_drafts,
            "outreach": self.state.outreach_drafts,
            "agency": self.state.agency_proposals,
        }

    # ═══════════════════════════════════════════
    # PHASE 4: DEPLOY
    # ═══════════════════════════════════════════

    @listen("publish_all")
    def deploy_everything(self, result: HumanFeedbackResult):
        """Distribution Agent publishes all approved content everywhere."""
        crew = Crew(
            agents=[distribution_agent],
            tasks=[Task(
                description=f"""
                Deploy all approved content:
                - Blog posts → omideveloper.com (WordPress)
                - Social posts → Buffer (scheduled across the week)
                - Email → ConvertKit/Resend
                - Cross-post blog excerpts to LinkedIn, Omi Discord
                - Update Notion content calendar with published URLs
                
                Approved content:
                {result.output}
                """,
                expected_output="Deployment report with all published URLs",
                agent=distribution_agent
            )],
            memory=True,
        )
        return crew.kickoff()

    @listen("publish_all")
    def send_outreach(self, result: HumanFeedbackResult):
        """Send approved outreach messages."""
        crew = Crew(
            agents=[outreach_agent],
            tasks=[Task(
                description="Send all approved outreach messages. Log responses.",
                expected_output="Outreach send report",
                agent=outreach_agent
            )],
            memory=True,
        )
        return crew.kickoff()

    @listen(deploy_everything)
    def run_cross_sell(self, result):
        """Cross-Sell Agent scans for flywheel opportunities."""
        crew = Crew(
            agents=[cross_sell_agent],
            tasks=[Task(
                description="""
                Scan the current business state for cross-sell opportunities:
                - Free users who should be nudged to upgrade
                - Existing subscribers who might want another app
                - Agency clients due for upsell conversations
                - New positive reviews to convert to testimonials
                - Testimonials to feed back into content
                """,
                expected_output="List of cross-sell actions with priority",
                agent=cross_sell_agent
            )],
            memory=True,
        )
        return crew.kickoff()


# ═══════════════════════════════════════════
# RUN THE CYCLE
# ═══════════════════════════════════════════

if __name__ == "__main__":
    flow = WeeklyCycleFlow()
    flow.kickoff()
```

---

## Deployment — How to Run This

### Option A: Local (Phase 1 — start here)

```bash
pip install crewai crewai-tools
cd kawough-agents
python -m src.main
```

The flow runs on your machine. Pauses at human feedback gates for your input.
Memory persists in `.crewai/memory/`. Costs ~$2-5 per weekly run in Claude
API calls.

### Option B: Railway (Phase 2 — when ready to schedule)

Deploy as a scheduled Railway service:
- Cron: `0 9 * * 1` (every Monday 9 AM)
- Intelligence gathering runs automatically
- Orchestrator plans automatically
- YOU get notified via Slack/Discord/email when it's time to review
- Approval happens through a simple web UI or Notion status changes
- After your approval, execution + distribution runs automatically

### Option C: Notion-Triggered (Phase 3 — seamless)

- Notion database serves as the command center
- Change a status in Notion → triggers the relevant agent flow
- Review drafts directly in Notion pages
- Approve by changing status from "Review" to "Approved"
- Distribution Agent watches for status changes and deploys

---

## Tools Each Agent Needs

| Agent | Tools | Purpose |
|---|---|---|
| Research | Web search, GSC API, Omi store scraper | Gather intelligence |
| SEO Writer | Research memory, content templates | Write with data |
| Social Writer | Content templates, image generator | Platform-specific content |
| Email Writer | ConvertKit API, subscriber data | Sequences and newsletters |
| Distribution | WordPress API, Buffer API, Discord webhook | Publish everywhere |
| Outreach | Apollo API, LinkedIn (manual), email sender | Prospect and engage |
| Analytics | GSC API, Supabase queries, Omi dashboard, affiliate dashboard | Track everything |
| Feedback | Discord bot, social listeners, email inbox | Monitor responses |
| ASO | Omi store API, app review monitoring | Optimize app listings |
| Agency Ops | Notion API, proposal templates, client CRM | Manage agency |
| Cross-Sell | Supabase queries, email triggers | Move users between streams |
| Orchestrator | All of the above (via delegation) | Direct everything |

### Tool Implementation Priority

**Week 1 (manual):** Use the agent prompts directly in Claude. Copy/paste
outputs. This validates the system before you automate.

**Week 2-3 (basic tools):** Build the Notion tool (read/write databases)
and the WordPress tool (publish posts). These are the two most impactful
automations.

**Month 2 (full tools):** Add Buffer API, ConvertKit API, GSC API, Omi
store scraper. Now the system runs with minimal copy/paste.

**Month 3+ (scheduled):** Deploy on Railway with cron. Notification when
it's your turn to review. Full automation with you in control.

---

## Cost Breakdown

### AI Costs Per Weekly Cycle

| Phase | Agents active | Est. tokens | Est. cost |
|---|---|---|---|
| Intelligence (3 agents) | Research, Analytics, Feedback | ~50K input, ~10K output | $0.50 |
| Planning (Orchestrator) | Orchestrator | ~30K input, ~5K output | $0.30 |
| Content (3 writers) | SEO, Social, Email | ~100K input, ~40K output | $2.50 |
| Outreach | Outreach + Research | ~30K input, ~10K output | $0.50 |
| Operations | ASO, Agency, Cross-Sell | ~20K input, ~5K output | $0.30 |
| **Weekly total** | | | **~$4-6** |
| **Monthly total** | | | **~$16-24** |

### Full Monthly Operating Cost

| Item | Cost |
|---|---|
| Claude API (agent calls) | $20-30 |
| WordPress hosting (omideveloper.com) | $12-20 |
| Email (ConvertKit free → $29) | $0-29 |
| Social scheduling (Buffer) | $0-15 |
| Railway (scheduled runner) | $5 |
| Notion (free tier works) | $0 |
| **Total** | **$37-99/month** |

---

## This Week — Start Now

**Day 1:** Set up the Notion workspace (Product DB, Content Pipeline DB,
Prospect Pipeline DB). Use the schemas from this doc.

**Day 2:** Run the Orchestrator prompt manually in Claude with your current
business data. Get a content plan for the week.

**Day 3-4:** Run the SEO Writer prompt to draft your first 3 blog posts:
1. "Omi AI Review 2026: A Developer Who Built 10 Apps Tells the Truth"
2. "Omi Discount Code 2026: ETHANJOHNKAWOUG"
3. "Omi for Sales Reps: How SalesSignal Auto-Fills Your CRM"

**Day 5:** Run the Social Writer prompt for 5 posts. Run the Outreach
prompt for 10 personalized messages.

**Day 6:** Review everything YOU wrote with agent help. Add your personal
touches. Publish.

**Day 7:** Run the Analytics prompt against your first week's data. Feed
it to the Orchestrator. Plan week 2.

**Week 2 onward:** Same cycle, getting faster each time as you refine prompts
and build tools.

**Month 2:** Code the CrewAI Flow. Deploy on Railway. The cycle runs
automatically with you reviewing and directing at the gates.
