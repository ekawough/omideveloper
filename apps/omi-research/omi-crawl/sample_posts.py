"""Sample 3 blog posts per section so we can understand content strategy without fetching 4k URLs."""
import os, re

with open("blog-posts-urls.txt", encoding="utf-8") as f:
    posts = [u.strip() for u in f if u.strip()]

by_section = {}
for u in posts:
    m = re.match(r"https://www\.omi\.me/blogs/([^/]+)/", u)
    if not m: continue
    by_section.setdefault(m.group(1), []).append(u)

sample = []
for section, urls in sorted(by_section.items()):
    # take first, middle, last (rough distribution)
    n = len(urls)
    picks = []
    if n >= 1: picks.append(urls[0])
    if n >= 3: picks.append(urls[n//2])
    if n >= 2: picks.append(urls[-1])
    sample.extend(picks)

with open("blog-posts-sample.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(sample))

print(f"{len(by_section)} sections, {len(posts)} total posts, sampling {len(sample)}")
for s, u in sorted(by_section.items()):
    print(f"  {s}: {len(u)} posts")
