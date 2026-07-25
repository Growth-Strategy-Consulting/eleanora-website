#!/usr/bin/env python3
"""
Build the ORPHANED CATALOG — a private, unlinked page on the portfolio site that
shows a light-table of the PUBLIC-TRACK categories only. Boudoir and _Unsorted are
never read and never uploaded.

- Source of truth: 1-Clients/Eleanora/content/Portfolio/<public categories>
- Output (into the site): portfolio/catalog.html  +  portfolio/catalog/thumbs/<cat>/
- Light password gate (client-side; NOT real security — public-track shots only).

Re-run any time you sort new photos:
    python3 build-catalog.py
"""
import os, html
from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))                 # .../portfolio (site)
SRC  = os.path.abspath(os.path.join(
    HERE, "../../../1-Clients/Eleanora/content/Portfolio"))       # archive
PUBLIC_CATS = ["01-Headshots","02-Beauty","03-Editorial","04-Fashion","05-Swimwear","06-Lifestyle"]
THUMBS_DIR  = os.path.join(HERE, "catalog", "thumbs")
THUMB_W = 680
EXTS = (".jpg",".jpeg",".png",".webp",".tif",".tiff")

# Password gate: stored only as a SHA-256 hash (same word as the main site:
# "yellowbird"). Input is normalised (trim, lowercase, spaces removed).
PASS_HASH = "1f76b0e5058f716c3026eeb07599915e84f2c6de83fee6d1754d55f008689cc0"

os.makedirs(THUMBS_DIR, exist_ok=True)

def thumb(src, cat, name):
    outdir = os.path.join(THUMBS_DIR, cat); os.makedirs(outdir, exist_ok=True)
    dst = os.path.join(outdir, name + ".jpg")
    if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src):
        return dst
    try:
        im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
        im.thumbnail((THUMB_W, THUMB_W*2)); im.save(dst,"JPEG",quality=80)
        return dst
    except Exception as e:
        print("  ! skip", src, e); return None

def esc(s): return html.escape(str(s), quote=True)

groups, total = [], 0
for cat in PUBLIC_CATS:
    d = os.path.join(SRC, cat)
    if not os.path.isdir(d): continue
    names = sorted(f for f in os.listdir(d) if f.lower().endswith(EXTS))
    shots = []
    for name in names:
        t = thumb(os.path.join(d, name), cat, name)
        if not t: continue
        rel = os.path.relpath(t, HERE)
        shots.append(f'<figure class="shot"><a href="{esc(rel)}" target="_blank" rel="noopener">'
                     f'<img loading="lazy" src="{esc(rel)}" alt="{esc(name)}"></a>'
                     f'<figcaption>{esc(name)}</figcaption></figure>')
    if shots:
        total += len(shots)
        label = cat.split("-",1)[1] if "-" in cat else cat
        groups.append((label, len(shots), "".join(shots)))

nav  = "".join(f'<a href="#{esc(l)}">{esc(l)} <b>{n}</b></a>' for l,n,_ in groups)
body = "".join(f'<section id="{esc(l)}" class="grp"><h2>{esc(l)} <span>{n}</span></h2>'
               f'<div class="grid">{s}</div></section>' for l,n,s in groups)

page = f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Catalog</title>
<style>
:root{{--bg:#0e0e10;--panel:#17171a;--ink:#f2efe9;--muted:#8b8790;--line:#2a2a2e;--accent:#d9c08a}}
*{{margin:0;box-sizing:border-box}}
body{{background:var(--bg);color:var(--ink);font:14px/1.5 -apple-system,"Helvetica Neue",Arial,sans-serif}}
#gate{{position:fixed;inset:0;z-index:99;background:#0b0b0d;display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:16px}}
#gate h1{{font-size:14px;letter-spacing:.3em;text-transform:uppercase;color:var(--muted);font-weight:400}}
#gate input{{background:#17171a;border:1px solid var(--line);color:var(--ink);padding:12px 16px;
  border-radius:6px;font-size:15px;width:240px;text-align:center;letter-spacing:.1em}}
#gate button{{background:var(--accent);border:0;color:#141210;padding:11px 26px;border-radius:6px;
  font-size:12px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;font-weight:600}}
#gate .err{{color:#c9736b;font-size:12px;height:14px}}
#app{{display:none}}
header{{position:sticky;top:0;z-index:10;background:rgba(14,14,16,.94);backdrop-filter:blur(8px);
  border-bottom:1px solid var(--line);padding:14px 20px}}
header h1{{font-size:15px;font-weight:600;display:flex;gap:10px;align-items:baseline}}
header h1 span{{color:var(--muted);font-weight:400;font-size:12px}}
.jump{{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}}
.jump a{{font-size:11px;color:var(--muted);text-decoration:none;border:1px solid var(--line);
  padding:4px 9px;border-radius:20px}}
.jump a:hover{{color:var(--ink);border-color:var(--accent)}}
.jump a b{{color:var(--accent)}}
.controls{{margin-top:10px;color:var(--muted);font-size:12px;display:flex;gap:10px;align-items:center}}
.controls input[type=range]{{width:170px;accent-color:var(--accent)}}
main{{padding:8px 20px 80px}}
.grp{{margin-top:28px}}
.grp h2{{font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:8px 0;
  border-bottom:1px solid var(--line);position:sticky;top:0;background:var(--bg)}}
.grp h2 span{{color:var(--muted);font-weight:400;font-size:11px;margin-left:8px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(var(--col,200px),1fr));gap:10px;margin-top:14px}}
.shot{{background:var(--panel);border:1px solid var(--line);border-radius:6px;overflow:hidden}}
.shot:hover{{border-color:var(--accent)}}
.shot a{{display:block;line-height:0}} .shot img{{width:100%;display:block}}
.shot figcaption{{font-size:10px;color:var(--muted);padding:6px 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}
footer{{color:var(--muted);font-size:11px;text-align:center;padding:30px}}
</style></head><body>
<div id="gate">
  <h1>Catalog</h1>
  <input id="pw" type="password" placeholder="password" autofocus>
  <button id="go">Enter</button>
  <div class="err" id="err"></div>
</div>
<div id="app">
<header>
  <h1>Catalog <span>{total} photos · {len(groups)} categories</span></h1>
  <nav class="jump">{nav}</nav>
  <div class="controls"><label>size</label>
    <input type="range" min="130" max="360" value="200"
      oninput="document.documentElement.style.setProperty('--col',this.value+'px')">
    <span>click a photo for the larger version · private working catalog</span>
  </div>
</header>
<main>{body}</main>
<footer>Private catalog · public-track only · regenerate with build-catalog.py</footer>
</div>
<script>
(function(){{
  var EXPECTED={PASS_HASH!r};
  async function sha256(s){{var b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));
    return Array.from(new Uint8Array(b)).map(function(x){{return x.toString(16).padStart(2,'0');}}).join('');}}
  function open(){{document.getElementById('gate').style.display='none';
    document.getElementById('app').style.display='block';}}
  if(sessionStorage.getItem('cat_ok')==='1'){{open();}}
  async function tryit(){{
    var norm=document.getElementById('pw').value.trim().toLowerCase().replace(/\\s+/g,'');
    if(!norm) return;
    if(await sha256(norm)===EXPECTED){{sessionStorage.setItem('cat_ok','1');open();}}
    else{{document.getElementById('err').textContent='Nice try. That\\'s not it.';}}
  }}
  document.getElementById('go').onclick=tryit;
  document.getElementById('pw').addEventListener('keydown',function(e){{if(e.key==='Enter')tryit();}});
}})();
</script>
</body></html>"""

with open(os.path.join(HERE, "catalog.html"), "w") as f:
    f.write(page)
print(f"Catalog: {total} photos in {len(groups)} categories -> catalog.html (password: yellowbird)")
