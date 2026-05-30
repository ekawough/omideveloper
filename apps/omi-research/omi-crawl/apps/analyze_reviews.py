"""Mine the 197 text reviews for pain points, stressors, pretty-goods, and dead-app signals.

We flag:
  - dead apps: no review in 6+ months AND low recent installs
  - pain reviews: contain negative phrases (doesn't work / broken / slow / stopped / bug / crash / fails / no / can't / cant / useless)
  - praise reviews: 5-star with what they like
  - feature requests: contain "should", "needs", "wish", "would be", "would love", "can you add"
"""
import json, os, re
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(ROOT, "reviews", "all-reviews.json"), encoding="utf-8") as f:
    data = json.load(f)

NEG_RE = re.compile(r"\b(doesn'?t work|broken|bug|buggy|crash|fail(?:s|ed)?|useless|bad|awful|terrible|horrible|slow|stuck|freeze|froze|can'?t|cannot|hate|stopped|not working|didn'?t work|don'?t work|worst|waste|poor|sucks?|annoying|confusing|missing|pointless|disappointed|unreliable|inaccurate|wrong|error)\b", re.I)
POS_RE = re.compile(r"\b(love|amazing|great|awesome|excellent|fantastic|brilliant|perfect|solid|useful|helpful|works well|genius|goat|best|game.changer)\b", re.I)
REQ_RE = re.compile(r"\b(should|needs|wish|would be|would love|can you|could you|please add|hope|suggest|recommend|integrate|feature request)\b", re.I)

def cutoff_date(days_ago):
    now = datetime.now(timezone.utc)
    return now.timestamp() - days_ago * 86400

rows = []
for app_id, meta in data.items():
    reviews = meta["reviews_with_text"]
    installs = meta.get("installs", 0)
    rating = meta.get("rating_avg", 0) or 0

    # Flags
    neg_reviews = []
    pos_reviews = []
    req_reviews = []
    all_texts = []
    latest_review_ts = 0

    for r in reviews:
        text = (r.get("review") or "").strip()
        if not text:
            continue
        ts_str = r.get("rated_at", "")
        try:
            ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00")).timestamp()
            latest_review_ts = max(latest_review_ts, ts)
        except Exception:
            pass
        all_texts.append((r.get("score", 0), text, ts_str[:10]))
        if NEG_RE.search(text):
            neg_reviews.append((r.get("score", 0), text, ts_str[:10]))
        if POS_RE.search(text):
            pos_reviews.append((r.get("score", 0), text, ts_str[:10]))
        if REQ_RE.search(text):
            req_reviews.append((r.get("score", 0), text, ts_str[:10]))

    # Dead signal: no review in 6+ months AND few installs
    days_since = (datetime.now(timezone.utc).timestamp() - latest_review_ts) / 86400 if latest_review_ts else 9999
    dead_signal = days_since > 180 and installs < 500

    rows.append({
        "id": app_id,
        "name": meta["name"],
        "installs": installs,
        "rating": rating,
        "review_count": len(all_texts),
        "neg_count": len(neg_reviews),
        "pos_count": len(pos_reviews),
        "req_count": len(req_reviews),
        "days_since_last_review": int(days_since) if days_since < 9999 else None,
        "dead_signal": dead_signal,
        "category": meta.get("category", ""),
        "description": meta.get("description", ""),
        "negative_reviews": neg_reviews[:10],
        "positive_reviews": pos_reviews[:5],
        "feature_requests": req_reviews[:10],
        "all_reviews": all_texts,
    })

# Sort by "fix opportunity": high installs + low rating + active recent reviews = BEST target to out-execute
for r in rows:
    fix_score = 0
    if r["installs"] >= 500: fix_score += 3
    elif r["installs"] >= 100: fix_score += 2
    elif r["installs"] >= 20: fix_score += 1
    if r["rating"] and r["rating"] < 3.0: fix_score += 3
    elif r["rating"] and r["rating"] < 4.0: fix_score += 2
    if r["neg_count"] > 0: fix_score += r["neg_count"]
    if r["req_count"] > 0: fix_score += 1
    if r["days_since_last_review"] is not None and r["days_since_last_review"] < 90: fix_score += 2
    r["fix_score"] = fix_score

rows.sort(key=lambda x: -x["fix_score"])

with open(os.path.join(ROOT, "reviews", "fix-opportunities.json"), "w", encoding="utf-8") as f:
    json.dump(rows, f, indent=2, ensure_ascii=False)

print(f"{len(rows)} apps analyzed")
print(f"Apps with negative reviews: {sum(1 for r in rows if r['neg_count'])}")
print(f"Apps with feature requests: {sum(1 for r in rows if r['req_count'])}")
print(f"Apps with dead signal (no review 180+ days, <500 installs): {sum(1 for r in rows if r['dead_signal'])}")
print(f"\nTop 20 fix opportunities (highest installs x lowest rating x most complaints):")
for r in rows[:20]:
    print(f"  score={r['fix_score']:<3} {r['installs']:>5} installs | {r['rating']:.1f}* ({r['review_count']} txt) | neg={r['neg_count']} req={r['req_count']} | {r['name']}")
