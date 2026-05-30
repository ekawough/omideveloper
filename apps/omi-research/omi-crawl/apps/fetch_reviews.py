"""Pull reviews (with text) for every app that has rating_count > 0."""
import json, os, time, urllib.request, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
APPS_FILE = os.path.join(ROOT, "approved-apps-with-reviews.json")
OUT_DIR = os.path.join(ROOT, "reviews")
os.makedirs(OUT_DIR, exist_ok=True)

with open(APPS_FILE, encoding="utf-8") as f:
    apps = json.load(f)

targets = [a for a in apps if a.get("rating_count", 0) > 0]
print(f"Fetching reviews for {len(targets)} apps...")

all_reviews = {}
for i, app in enumerate(targets, 1):
    app_id = app["id"]
    name = app.get("name", "")
    url = f"https://api.omi.me/v1/apps/{app_id}/reviews"
    try:
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=20) as r:
            reviews = json.loads(r.read().decode("utf-8"))
        all_reviews[app_id] = {
            "name": name,
            "installs": app.get("installs", 0),
            "rating_avg": app.get("rating_avg", 0),
            "rating_count": app.get("rating_count", 0),
            "category": app.get("category", ""),
            "description": app.get("description", ""),
            "created_at": app.get("created_at", ""),
            "reviews_with_text": reviews,
        }
        print(f"[{i}/{len(targets)}] {len(reviews)} text-reviews for {name} ({app.get('rating_count')} total)")
    except Exception as e:
        print(f"[{i}/{len(targets)}] ERR {name}: {e}")
    time.sleep(0.15)

with open(os.path.join(OUT_DIR, "all-reviews.json"), "w", encoding="utf-8") as f:
    json.dump(all_reviews, f, indent=2, ensure_ascii=False)

# Summary stats
total_text = sum(len(v["reviews_with_text"]) for v in all_reviews.values())
apps_with_text = sum(1 for v in all_reviews.values() if v["reviews_with_text"])
print(f"\nSummary: {apps_with_text} apps have text reviews, {total_text} reviews total")
