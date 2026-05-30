"""Build two zips of the project:
  - omi-project-docs.zip:  docs + scripts + analysis (small, ~5MB, portable)
  - omi-project-full.zip:  everything including raw HTML archive (~1-2GB)
"""
import os, sys, zipfile, time

ROOT = os.path.dirname(os.path.abspath(__file__))

# What to always include (relative paths)
ALWAYS = [
    "README.md",
    "PROJECT-BACKLOG.md",
    "QUICK-WINS.md",
    "PROJECT-STARTER.md",
    "OMI-APPS-GAP-ANALYSIS.md",
    "OMI-REVIEWS-INSIGHTS.md",
    "omi-outreach-email.md",
    "omi-audit-report.md",
    ".gitignore",
]

# Dirs to always include (everything inside)
ALWAYS_DIRS = [
    "stitch_screens",
    "omi-crawl/pages",
    "omi-crawl/products",
    "omi-crawl/collections",
    "omi-crawl/blog-sections",
    "omi-crawl/apps",
]

# Dirs included in FULL only
FULL_ONLY_DIRS = [
    "omi-crawl/blog-posts",
    "omi-crawl/html",
]

# Files in omi-crawl/ root
OMI_CRAWL_ROOT_FILES = [
    "omi-crawl/INDEX.md",
    "omi-crawl/OMI-VISION.md",
    "omi-crawl/use-cases-titles.txt",
    "omi-crawl/use-cases-by-vertical.md",
    "omi-crawl/pages-urls.txt",
    "omi-crawl/products-urls.txt",
    "omi-crawl/collections-urls.txt",
    "omi-crawl/blog-sections-urls.txt",
    "omi-crawl/blog-posts-urls.txt",
    "omi-crawl/blog-posts-sample.txt",
    "omi-crawl/extract.py",
    "omi-crawl/crawl_batch.py",
    "omi-crawl/sample_posts.py",
    "omi-crawl/build_index.py",
    "omi-crawl/rebuild_tsv.py",
    "omi-crawl/dedupe_tsv.py",
    "omi-crawl/categorize_ideas.py",
    "omi-crawl/save_html.py",
]

# Optional — not present in early runs
MAYBE = [
    "index.html",
]


def collect(paths, dirs):
    out = []
    for p in paths:
        full = os.path.join(ROOT, p)
        if os.path.isfile(full):
            out.append(p)
    for d in dirs:
        full = os.path.join(ROOT, d)
        if not os.path.isdir(full):
            continue
        for dirpath, _, files in os.walk(full):
            for f in files:
                abs_ = os.path.join(dirpath, f)
                rel = os.path.relpath(abs_, ROOT).replace("\\", "/")
                out.append(rel)
    return out


def build(zip_name, include_full):
    dirs = list(ALWAYS_DIRS)
    if include_full:
        dirs += FULL_ONLY_DIRS
    paths = list(ALWAYS) + OMI_CRAWL_ROOT_FILES + MAYBE
    files = collect(paths, dirs)
    out_path = os.path.join(ROOT, zip_name)

    t0 = time.time()
    total_bytes = 0
    with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED, compresslevel=6, allowZip64=True) as zf:
        for i, rel in enumerate(files, 1):
            abs_ = os.path.join(ROOT, rel)
            try:
                total_bytes += os.path.getsize(abs_)
                zf.write(abs_, rel)
            except Exception as e:
                print(f"  SKIP {rel}: {e}", flush=True)
            if i % 500 == 0:
                print(f"  [{i}/{len(files)}] {rel} ({total_bytes/1e9:.2f} GB packed)", flush=True)

    final_size = os.path.getsize(out_path) / 1e6
    print(f"\n{zip_name}: {len(files)} files, {final_size:.1f} MB final ({total_bytes/1e6:.1f} MB uncompressed) in {time.time()-t0:.1f}s\n")


if __name__ == "__main__":
    which = sys.argv[1] if len(sys.argv) > 1 else "both"
    if which in ("docs", "both"):
        print(">>> Building omi-project-docs.zip (small, portable)")
        build("omi-project-docs.zip", include_full=False)
    if which in ("full", "both"):
        print(">>> Building omi-project-full.zip (everything including raw HTML)")
        build("omi-project-full.zip", include_full=True)
