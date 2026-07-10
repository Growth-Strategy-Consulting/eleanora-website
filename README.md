# Eleanora — corraoelena.com

The public waitlist gate for Eleanora (Elena's personal art brand). Plain
static HTML/CSS. No build step. Hosted on **GitHub Pages** (same as the GSC
site) — every push to `main` auto-deploys.

## Files
- `index.html` — the gate (waitlist front door + soft Patreon link)
- `assets/fonts/` — the script fonts (bundled so nothing breaks off-machine)
- `img/` — background photo + seal
- `CNAME` — the custom domain (corraoelena.com)

## Local preview
```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Waitlist capture
Static-site capture via **Web3Forms** (works on GitHub Pages, no server).
Set the real access key in `index.html` (`WEB3FORMS_KEY`). Signups email to
Elena's inbox and can be piped into SmartSuite later.

## Deploy
GitHub Pages, source = `main` branch, root. Custom domain set via the `CNAME`
file + DNS at GoDaddy.

## Notes
- The gate copy (incl. the Patreon line) is a **placeholder** until run through
  the caption skill in Elena's voice.
- This is gate-only. The full site (gallery/about/journals) stays hidden until
  it's ready; the password unlock is re-added then.
