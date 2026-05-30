"""Dedupe each subdir's _index.tsv, keeping the last entry per URL (most recent fetch)."""
import os, csv

for sub in ["pages", "products", "collections", "blog-sections", "blog-posts"]:
    path = os.path.join(sub, "_index.tsv")
    if not os.path.exists(path):
        continue
    rows = {}
    with open(path, encoding="utf-8") as f:
        header = f.readline()
        for line in f:
            parts = line.rstrip("\n").split("\t")
            if len(parts) < 5:
                continue
            url = parts[0]
            rows[url] = line  # last-wins
    with open(path, "w", encoding="utf-8") as f:
        f.write(header)
        for line in rows.values():
            f.write(line)
    print(f"{sub}: {len(rows)} unique URLs")
