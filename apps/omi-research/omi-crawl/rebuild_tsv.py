"""Rebuild each subdir's _index.tsv from the .md files actually on disk."""
import os, re, glob

for sub in ["pages", "products", "collections", "blog-sections", "blog-posts"]:
    if not os.path.isdir(sub):
        continue
    rows = []
    for path in sorted(glob.glob(os.path.join(sub, "*.md"))):
        fname = os.path.basename(path)
        with open(path, encoding="utf-8") as f:
            head = f.read(2000)
        url = (re.search(r"\*\*URL:\*\* (\S+)", head) or [None, ""])[1]
        status = (re.search(r"\*\*Status:\*\* (\S+)", head) or [None, ""])[1]
        title_match = re.search(r"^# (.+?)(?:\n|$)", head, re.M)
        title = (title_match.group(1) if title_match else "").replace("\t", " ").strip()
        published = (re.search(r"\*\*Published:\*\* (\S+)", head) or [None, ""])[1]
        rows.append((url, status, title, published, fname))
    out = os.path.join(sub, "_index.tsv")
    with open(out, "w", encoding="utf-8") as f:
        f.write("url\tstatus\ttitle\tpublished\tfile\n")
        for r in rows:
            f.write("\t".join(r) + "\n")
    print(f"{sub}: {len(rows)} rows")
