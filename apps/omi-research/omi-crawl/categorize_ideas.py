"""Read the 321 use-case titles and bucket them by vertical via keyword matching.
Output: categorized list ready to paste into PROJECT-BACKLOG.md."""
import re

VERTICALS = [
    ("Sales & Client-Facing", [
        "sales", "client", "pitch", "prospect", "cold call", "deal", "lead",
        "customer", "negotiation", "quote", "proposal", "presentation",
        "consultation", "discovery", "demo", "rfp"
    ]),
    ("Healthcare & Medical", [
        "patient", "medical", "clinic", "surg", "doctor", "nurse", "triage",
        "emergency", "treatment", "therapy", "diagnosis", "health", "pharma",
        "oncology", "radiology", "pediatric", "icu", "care", "tumor", "code blue"
    ]),
    ("Legal & Compliance", [
        "legal", "court", "attorney", "deposition", "witness", "testimony",
        "trademark", "patent", "ip ", "litigation", "contract", "compliance",
        "regulatory", "audit", "due diligence", "plea", "evidence"
    ]),
    ("Engineering / Product / IT", [
        "sprint", "retro", "stand-up", "stand up", "standup", "code review",
        "codebase", "incident", "postmortem", "bug", "qa", "deployment",
        "devops", "sre", "oncall", "on-call", "security", "penetration",
        "vulnerab", "feature prioritization", "requirement", "roadmap"
    ]),
    ("Real Estate & Property", [
        "property", "tenant", "lease", "real estate", "open house",
        "showing", "landlord", "staging", "brokerage"
    ]),
    ("Education & Research", [
        "teacher", "professor", "lecture", "student", "curriculum", "thesis",
        "dissertation", "exam", "study", "classroom", "tutoring", "academic",
        "research", "literature review", "faculty", "parent-teacher"
    ]),
    ("HR & People Ops", [
        "hiring", "interview", "onboard", "performance review", "1-1",
        "1-on-1", "one-on-one", "coaching", "mentor", "feedback", "employee"
    ]),
    ("Finance & Accounting", [
        "budget", "financial", "finance", "tax", "accounting", "m&a",
        "merger", "acquisition", "investment", "portfolio", "wealth",
        "retirement", "estate planning", "audit"
    ]),
    ("Marketing & Content", [
        "campaign", "marketing", "content", "editorial", "seo", "ppc",
        "brand", "social media", "email campaign", "newsletter", "pr ",
        "press", "media briefing", "storyboard"
    ]),
    ("Events & Weddings", [
        "wedding", "bride", "groom", "event", "reception", "ceremony",
        "venue", "guest list", "rehearsal"
    ]),
    ("Field Service & Operations", [
        "technician", "field service", "service call", "maintenance",
        "repair", "inspection", "installation", "warehouse", "logistics",
        "supply chain", "vendor", "procurement", "shift handoff"
    ]),
    ("Security & Investigations", [
        "investigation", "interrogation", "officer", "threat", "forensic",
        "crime", "suspect", "victim", "witness interview"
    ]),
    ("Creative / Media Production", [
        "film", "production", "script", "b-roll", "b roll", "editing",
        "post-production", "post production", "storyboard"
    ]),
    ("Coaching / Personal", [
        "coach", "therapy", "journal", "self-growth", "personal", "goal",
        "habit"
    ]),
]

with open("use-cases-titles.txt", encoding="utf-8") as f:
    titles = [t.strip() for t in f if t.strip()]

buckets = {name: [] for name, _ in VERTICALS}
uncategorized = []
seen_in_bucket = set()

for t in titles:
    low = t.lower()
    placed = False
    for name, kws in VERTICALS:
        for kw in kws:
            if kw in low:
                if (name, t) not in seen_in_bucket:
                    buckets[name].append(t)
                    seen_in_bucket.add((name, t))
                placed = True
                break
    if not placed:
        uncategorized.append(t)

for name, items in buckets.items():
    items.sort()
uncategorized.sort()

with open("use-cases-by-vertical.md", "w", encoding="utf-8") as f:
    f.write("# Omi Use-Cases by Vertical (source material for app ideas)\n\n")
    f.write(f"Auto-categorized from {len(titles)} /blogs/usecases/ URL slugs. "
            "Each one is a real-world workflow Omi has documented but NOT built a dedicated app for.\n\n")
    total = 0
    for name, items in buckets.items():
        if not items: continue
        total += len(items)
        f.write(f"## {name} ({len(items)})\n\n")
        for it in items:
            f.write(f"- {it}\n")
        f.write("\n")
    if uncategorized:
        f.write(f"## Uncategorized ({len(uncategorized)})\n\n")
        for it in uncategorized:
            f.write(f"- {it}\n")
        f.write("\n")
    f.write(f"\n_Total placed: {total}. Uncategorized: {len(uncategorized)}._\n")

print(f"Wrote use-cases-by-vertical.md — {total} placed, {len(uncategorized)} uncategorized")
for name, items in buckets.items():
    if items: print(f"  {name}: {len(items)}")
