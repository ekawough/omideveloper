"""Archive raw HTML for every URL in the sitemap, one file per URL.
Rationale: if Omi fixes/removes pages after the audit, this is the forensic
backup. Saved as .html so you can open any of them in a browser later.
"""
import os, re, time, urllib.request, sys

OUT_ROOT = "html"

def slug(url):
    s = re.sub(r"^https?://(www\.)?omi\.me/?", "", url).strip("/")
    s = re.sub(r"[^\w\-./]", "_", s)
    return s or "root"

def fetch(url, timeout=25):
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (omi-archive-bot) AppleWebKit/537.36"
    })
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status, r.url, r.read()

def category_for(url):
    m = re.match(r"https?://(?:www\.)?omi\.me/([^/]+)/", url)
    return m.group(1) if m else "misc"

def main(url_files):
    seen = set()
    urls = []
    for f in url_files:
        with open(f, encoding="utf-8") as fh:
            for line in fh:
                u = line.strip()
                if u and u not in seen:
                    seen.add(u); urls.append(u)

    os.makedirs(OUT_ROOT, exist_ok=True)
    log_path = os.path.join(OUT_ROOT, "_fetch.log")
    logf = open(log_path, "w", encoding="utf-8")
    logf.write("url\tstatus\tbytes\tfile\n")

    for i, u in enumerate(urls, 1):
        cat = category_for(u)
        outdir = os.path.join(OUT_ROOT, cat)
        os.makedirs(outdir, exist_ok=True)
        s = slug(u).replace("/", "__")
        outfile = os.path.join(outdir, s + ".html")

        if os.path.exists(outfile) and os.path.getsize(outfile) > 500:
            # skip already-saved (resume support)
            logf.write(f"{u}\tCACHED\t{os.path.getsize(outfile)}\t{outfile}\n")
            logf.flush()
            if i % 200 == 0:
                print(f"[{i}/{len(urls)}] cached {u}")
            continue

        try:
            status, final, body = fetch(u)
            with open(outfile, "wb") as out:
                out.write(body)
            logf.write(f"{u}\t{status}\t{len(body)}\t{outfile}\n")
            if i % 50 == 0 or i == len(urls):
                print(f"[{i}/{len(urls)}] {status} {u}")
        except Exception as e:
            logf.write(f"{u}\tERR\t0\t{str(e)[:200]}\n")
            print(f"[{i}/{len(urls)}] ERR {u}: {e}")
        logf.flush()
        time.sleep(0.15)

    logf.close()
    print(f"Done. Log: {log_path}")

if __name__ == "__main__":
    main([
        "pages-urls.txt", "products-urls.txt", "collections-urls.txt",
        "blog-sections-urls.txt", "blog-posts-urls.txt",
    ])
