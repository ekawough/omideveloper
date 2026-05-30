"""Build INDEX.md from all _index.tsv files in subdirs."""
import os, csv

ROOT = os.path.dirname(os.path.abspath(__file__))
SUBDIRS = [
    ("pages", "Static pages"),
    ("products", "Products"),
    ("collections", "Collections"),
    ("blog-sections", "Blog section indexes"),
    ("blog-posts", "Blog posts"),
]

out_lines = ["# omi.me — Master URL Index\n\n",
             "Every URL captured from the omi.me sitemap, grouped by category. File paths are relative to `omi-crawl/`.\n\n"]

totals = {}
grand_total = 0
grand_errors = 0

for sub, label in SUBDIRS:
    idx = os.path.join(ROOT, sub, "_index.tsv")
    if not os.path.exists(idx):
        out_lines.append(f"## {label}\n\n_(not yet generated)_\n\n")
        continue
    rows = []
    with open(idx, encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for r in reader:
            rows.append(r)
    totals[sub] = len(rows)
    grand_total += len(rows)
    errors = [r for r in rows if r.get("status") == "ERR" or r.get("status") == "404"]
    grand_errors += len(errors)
    out_lines.append(f"## {label} ({len(rows)} URLs, {len(errors)} errors)\n\n")
    out_lines.append("| # | Status | Title | URL | File |\n|---:|---:|---|---|---|\n")
    for i, r in enumerate(rows, 1):
        title = (r.get("title") or "").replace("|", "\\|").strip()[:80]
        url = r.get("url","")
        file = r.get("file","")
        status = r.get("status","")
        rel = f"{sub}/{file}" if file else ""
        out_lines.append(f"| {i} | {status} | {title} | {url} | `{rel}` |\n")
    out_lines.append("\n")

summary = [f"## Summary\n\n",
           f"- **Total URLs captured:** {grand_total}\n",
           f"- **Errors / 404s:** {grand_errors}\n",
           "- **Breakdown:**\n"]
for sub, label in SUBDIRS:
    if sub in totals:
        summary.append(f"  - {label}: {totals[sub]}\n")
summary.append("\n---\n\n")

# Prepend summary
with open(os.path.join(ROOT, "INDEX.md"), "w", encoding="utf-8") as f:
    f.write(out_lines[0])
    f.write(out_lines[1])
    f.writelines(summary)
    f.writelines(out_lines[2:])

print(f"Wrote INDEX.md — {grand_total} URLs, {grand_errors} errors")
