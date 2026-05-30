"""Cross-reference our 321 use-case ideas against Omi's 664 real approved apps.
For each idea, find the best-matching existing app and rank by match strength.
Output:
  - gap-analysis.tsv: every idea + best match + match score + installs
  - OPEN-LANES.md: ideas with NO real app yet (these are buildable)
  - CROWDED-LANES.md: ideas with existing apps (compete or skip)
"""
import json, re, os
from collections import Counter

ROOT = os.path.dirname(os.path.abspath(__file__))
IDEAS_FILE = os.path.join(ROOT, "..", "use-cases-titles.txt")
APPS_FILE = os.path.join(ROOT, "approved-apps.json")

STOP = set("the a an of for and or to with in on at by from is are was be been being this that these those i you he she it we they my your their our as how what when where why".split())

def tokenize(s):
    s = re.sub(r"[^a-zA-Z0-9 ]", " ", (s or "").lower())
    return {t for t in s.split() if t and t not in STOP and len(t) > 2}

with open(IDEAS_FILE, encoding="utf-8") as f:
    ideas = [t.strip() for t in f if t.strip()]

with open(APPS_FILE, encoding="utf-8") as f:
    apps = json.load(f)

# Precompute app tokens + priority
app_tokens = []
for a in apps:
    text = f"{a.get('name','')} {a.get('description','')} {a.get('category','')}"
    toks = tokenize(text)
    app_tokens.append((a, toks))

# For each idea, score match against every app
rows = []
open_lanes = []       # ideas w/ weak best-match (true gap)
contested_lanes = []  # ideas w/ moderate match (competitor exists but weak)
crowded_lanes = []    # ideas w/ strong match (direct competitor)

for idea in ideas:
    idea_toks = tokenize(idea)
    if not idea_toks:
        continue
    best_score = 0
    best_app = None
    runners = []
    for app, toks in app_tokens:
        if not toks: continue
        overlap = idea_toks & toks
        if not overlap: continue
        # Jaccard-ish, boosted for multi-word matches
        score = len(overlap) / max(len(idea_toks), 1)
        if score > best_score:
            if best_app:
                runners.append((best_score, best_app))
            best_score = score
            best_app = app
        elif score > 0.3:
            runners.append((score, app))

    row = {
        "idea": idea,
        "best_score": round(best_score, 2),
        "best_app": (best_app or {}).get("name", ""),
        "best_app_id": (best_app or {}).get("id", ""),
        "best_app_installs": (best_app or {}).get("installs", 0),
        "best_app_rating": (best_app or {}).get("rating_avg", 0),
        "best_app_category": (best_app or {}).get("category", ""),
        "runner_up_names": "; ".join(r[1].get("name","") for r in sorted(runners, key=lambda x: x[0], reverse=True)[:3]),
    }
    rows.append(row)

    if best_score < 0.3:
        open_lanes.append(row)
    elif best_score < 0.55:
        contested_lanes.append(row)
    else:
        crowded_lanes.append(row)

# Sort: open lanes by score asc (truest gaps first); crowded by score desc
open_lanes.sort(key=lambda r: r["best_score"])
contested_lanes.sort(key=lambda r: r["best_score"])
crowded_lanes.sort(key=lambda r: -r["best_score"])

# TSV dump of everything
with open(os.path.join(ROOT, "gap-analysis.tsv"), "w", encoding="utf-8") as f:
    f.write("idea\tmatch_score\tbest_app\tbest_app_installs\tbest_app_rating\tbest_app_category\trunners\n")
    for r in rows:
        f.write(f"{r['idea']}\t{r['best_score']}\t{r['best_app']}\t{r['best_app_installs']}\t{r['best_app_rating']}\t{r['best_app_category']}\t{r['runner_up_names']}\n")

print(f"Ideas total:       {len(rows)}")
print(f"Open lanes (<0.3): {len(open_lanes)}  <-truest gaps, build these")
print(f"Contested (0.3-0.55): {len(contested_lanes)}  <-weak competitor, beatable with focus")
print(f"Crowded (>=0.55):  {len(crowded_lanes)}  <-direct competitor, higher bar")

# Save the lane splits for the narrative doc
with open(os.path.join(ROOT, "open-lanes.json"), "w", encoding="utf-8") as f:
    json.dump(open_lanes, f, indent=2)
with open(os.path.join(ROOT, "contested-lanes.json"), "w", encoding="utf-8") as f:
    json.dump(contested_lanes, f, indent=2)
with open(os.path.join(ROOT, "crowded-lanes.json"), "w", encoding="utf-8") as f:
    json.dump(crowded_lanes, f, indent=2)

# Also dump top-installed apps (what's actually winning)
apps_by_installs = sorted(apps, key=lambda a: a.get("installs", 0), reverse=True)[:50]
with open(os.path.join(ROOT, "top-50-by-installs.json"), "w", encoding="utf-8") as f:
    json.dump(apps_by_installs, f, indent=2)

print(f"\nTop 10 apps by installs:")
for a in apps_by_installs[:10]:
    print(f"  {a.get('installs'):>6,} installs | {a.get('rating_avg'):.1f} stars ({a.get('rating_count')}) | {a.get('name')}")
