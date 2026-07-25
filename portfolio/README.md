# Elena Corrao — Modeling Portfolio

A **standalone** professional modeling portfolio. Separate from the Eleanora art/prints brand
(corraoelena.com). Built to mirror real model-portfolio convention: stark, photo-forward, minimal
chrome, name-led. **Layout modeled on naomibabalola.format.com** — centred serif masthead,
centred nav with a work dropdown, 3-column masonry grid on white.

Intended to live at **portfolio.corraoelena.com** (its own subdomain).

## Structure
- `index.html` — masthead + the whole book (all categories) in a 3-column masonry grid
- `fashion.html` · `beauty.html` · `lifestyle.html` · `swim-travel.html` — category grids
- `about.html` — bio + stats block
- `contact.html` — bookings / representation / social
- `assets/portfolio.json` — **single source of truth**: model info, stats, nav, categories, images
- `assets/portfolio.css` · `assets/portfolio.js` — shared styles + runtime (edit JSON, not HTML)
- `assets/img/` — portfolio images (self-contained; copy in what you use)

Nav: top level is **Fashion · About · Contact**. Beauty / Lifestyle / Swim & Travel live in the
**Fashion dropdown** (`nav[].children` in the JSON). The home page shows every category's images
together in the order set by `selectedOrder`.

## How to add / change photos (hand-picked)
Edit **`assets/portfolio.json`** only. To add a shot to a category, drop the file in
`assets/img/` and add an entry to that category's `images` array:
```json
{ "src": "assets/img/your-file.jpg", "alt": "short description", "caption": "Client / job (optional)" }
```
Empty `images` array → the room shows a clean "Curation in progress" state (never a broken blank).

## Facts to fill in (placeholders until confirmed — nothing fabricated)
In `portfolio.json` → `model`:
- `name` (currently "ELENA CORRAO"), `role`, `location`
- `stats`: Height · Bust · Waist · Hips · Dress · Shoe · Hair · Eyes
  (industry order; e.g. Height "5'10\"", measurements "34-24-34" in inches — never inflate)
- `representation` (Freelance, or agency block)
- `email`, `instagram`, `instagramUrl`

## Local preview
Serve this folder as the web root, e.g.:
```
python3 -m http.server 8931 --directory .
```
then open http://localhost:8931/ . (Pages fetch `portfolio.json`, so a server is required —
file:// will not load the galleries.)

## Deploy to portfolio.corraoelena.com (not done yet — Elena's call)
Two clean options; both need one DNS record at the domain's DNS host:
1. **GitHub Pages, own repo** — new repo, add a `CNAME` file containing `portfolio.corraoelena.com`,
   enable Pages, then add a DNS `CNAME` record: `portfolio` → `<github-user>.github.io`.
2. **Netlify** — new site from this folder/repo, add custom domain `portfolio.corraoelena.com`,
   follow Netlify's DNS instruction (a `CNAME` to their load balancer).

Note: these files currently sit inside the corraoelena.com repo. If that repo is pushed as-is,
this becomes publicly reachable at `corraoelena.com/portfolio/` with **no** password gate. Move to
its own repo/host before going live if that's not wanted.
