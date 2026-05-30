"""Fetch a URL and extract clean readable text + metadata."""
import sys, re, urllib.request, urllib.error, html, json

def fetch(url, timeout=20):
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (omi-audit-crawler)"
    })
    with urllib.request.urlopen(req, timeout=timeout) as r:
        raw = r.read()
        charset = r.headers.get_content_charset() or "utf-8"
        return r.status, r.url, raw.decode(charset, errors="replace")

def clean(htmlstr):
    # Grab title, description, h1s
    title = (re.search(r"<title[^>]*>([\s\S]*?)</title>", htmlstr, re.I) or ["",""])[1]
    desc  = (re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)', htmlstr, re.I) or ["",""])[1]
    ogtitle = (re.search(r'<meta[^>]+property=["\']og:title["\'][^>]+content=["\']([^"\']+)', htmlstr, re.I) or ["",""])[1]
    ogdesc  = (re.search(r'<meta[^>]+property=["\']og:description["\'][^>]+content=["\']([^"\']+)', htmlstr, re.I) or ["",""])[1]
    published = (re.search(r'<meta[^>]+property=["\']article:published_time["\'][^>]+content=["\']([^"\']+)', htmlstr, re.I) or ["",""])[1]

    # Strip script/style/svg/noscript
    body = re.sub(r"<(script|style|svg|noscript)[\s\S]*?</\1>", " ", htmlstr, flags=re.I)
    # Line breaks before block elements
    body = re.sub(r"</(p|div|li|h[1-6]|br|tr|section|article|header|footer)[^>]*>", "\n", body, flags=re.I)
    body = re.sub(r"<br[^>]*>", "\n", body, flags=re.I)
    # Strip remaining tags
    body = re.sub(r"<[^>]+>", " ", body)
    body = html.unescape(body)
    # Collapse whitespace
    body = re.sub(r"[ \t]+", " ", body)
    body = re.sub(r"\n[ \t]+", "\n", body)
    body = re.sub(r"\n{3,}", "\n\n", body)
    body = body.strip()
    return {
        "title": html.unescape(title.strip()),
        "description": html.unescape(desc.strip()),
        "og_title": html.unescape(ogtitle.strip()),
        "og_description": html.unescape(ogdesc.strip()),
        "published": published.strip(),
        "body": body,
    }

if __name__ == "__main__":
    url = sys.argv[1]
    try:
        status, final, htmlstr = fetch(url)
        data = clean(htmlstr)
        data["url"] = url
        data["final_url"] = final
        data["status"] = status
        print(json.dumps(data, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"url": url, "error": str(e)}))
