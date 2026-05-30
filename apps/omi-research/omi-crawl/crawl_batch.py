"""Crawl a list of URLs, save each as a markdown-ish text file, and append to a combined log."""
import sys, os, re, json, time
from extract import fetch, clean

def slug(url):
    s = re.sub(r"^https?://(www\.)?omi\.me/", "", url).strip("/")
    s = re.sub(r"[^\w\-./]", "_", s)
    s = s.replace("/", "__") or "root"
    return s[:120] + ".md"

def write_md(path, data):
    with open(path, "w", encoding="utf-8") as f:
        f.write(f"# {data.get('title') or data.get('og_title') or data['url']}\n\n")
        f.write(f"- **URL:** {data['url']}\n")
        if data.get("final_url") and data["final_url"] != data["url"]:
            f.write(f"- **Final URL:** {data['final_url']}\n")
        f.write(f"- **Status:** {data.get('status','')}\n")
        if data.get("published"):
            f.write(f"- **Published:** {data['published']}\n")
        if data.get("description"):
            f.write(f"- **Meta description:** {data['description']}\n")
        if data.get("og_description") and data.get("og_description") != data.get("description"):
            f.write(f"- **OG description:** {data['og_description']}\n")
        f.write("\n---\n\n")
        f.write(data.get("body",""))

def main():
    url_file = sys.argv[1]
    outdir = sys.argv[2]
    os.makedirs(outdir, exist_ok=True)
    index_path = os.path.join(outdir, "_index.tsv")
    with open(url_file, encoding="utf-8") as f:
        urls = [u.strip() for u in f if u.strip()]
    with open(index_path, "w", encoding="utf-8") as idx:
        idx.write("url\tstatus\ttitle\tpublished\tfile\n")
        for i, u in enumerate(urls, 1):
            try:
                status, final, htmlstr = fetch(u)
                d = clean(htmlstr)
                d["url"] = u; d["final_url"] = final; d["status"] = status
                fname = slug(u)
                write_md(os.path.join(outdir, fname), d)
                idx.write(f"{u}\t{status}\t{d.get('title','')}\t{d.get('published','')}\t{fname}\n")
                print(f"[{i}/{len(urls)}] {status} {u}")
            except Exception as e:
                idx.write(f"{u}\tERR\t\t\t\n")
                print(f"[{i}/{len(urls)}] ERR {u}: {e}")
            time.sleep(0.2)  # be polite

if __name__ == "__main__":
    main()
