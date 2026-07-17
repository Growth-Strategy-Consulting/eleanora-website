#!/usr/bin/env python3
"""
Build feed.xml (RSS) from journal.json for the Eleanora Journal.

An entry is PUBLISHED when its `publishAt` date (YYYY-MM-DD) is today or past.
Entries with no `publishAt` are treated as already-live (backward compatible).
Future-dated entries are omitted, so they stay invisible to the email tool
until their day. A daily GitHub Action re-runs this so a scheduled story enters
the feed on its date, which is what triggers MailerLite's RSS auto-send.

Run: python3 build-feed.py   (from the site/ folder)
"""
import json, datetime, html, pathlib

BASE = "https://corraoelena.com/site/"          # story pages live under /site/
HERE = pathlib.Path(__file__).parent
TODAY = datetime.date.today()


def is_published(entry):
    d = entry.get("publishAt")
    if not d:
        return True
    try:
        return datetime.date.fromisoformat(d) <= TODAY
    except ValueError:
        return True


def pub_date(entry):
    d = entry.get("publishAt")
    try:
        dt = datetime.datetime.fromisoformat(d)
    except (TypeError, ValueError):
        dt = datetime.datetime(2026, 1, 1)
    return dt


def rfc822(dt):
    return dt.strftime("%a, %d %b %Y %H:%M:%S +0000")


def main():
    data = json.loads((HERE / "journal.json").read_text())
    entries = [e for e in data.get("entries", []) if is_published(e)]
    entries.sort(key=pub_date, reverse=True)

    items = []
    for e in entries:
        link = BASE + e["slug"] + ".html"
        title = html.escape(e.get("title", ""))
        desc = html.escape(e.get("excerpt", ""))
        img = (e.get("talisman") or {}).get("img", "")
        img_url = BASE + img if img else ""
        item = [
            "    <item>",
            f"      <title>{title}</title>",
            f"      <link>{link}</link>",
            f"      <guid isPermaLink=\"true\">{link}</guid>",
            f"      <pubDate>{rfc822(pub_date(e))}</pubDate>",
            f"      <description>{desc}</description>",
        ]
        if img_url:
            item.append(f"      <enclosure url=\"{html.escape(img_url)}\" type=\"image/jpeg\" />")
        item.append("    </item>")
        items.append("\n".join(item))

    now = rfc822(datetime.datetime(TODAY.year, TODAY.month, TODAY.day))
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<rss version="2.0"><channel>\n'
        "    <title>Eleanora — the Journal</title>\n"
        f"    <link>{BASE}journal.html</link>\n"
        "    <description>An archive of her stories. New ones, as they land.</description>\n"
        f"    <lastBuildDate>{now}</lastBuildDate>\n"
        + "\n".join(items) + "\n"
        "</channel></rss>\n"
    )
    (HERE / "feed.xml").write_text(xml)
    print(f"feed.xml built: {len(entries)} published item(s) (of {len(data.get('entries', []))} total)")


if __name__ == "__main__":
    main()
