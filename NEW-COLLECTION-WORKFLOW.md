# New Collection Workflow — Eleanora

How to add (or edit) a place-collection on corraoelena.com, start to finish. Captured from the Croatia/Dubrovnik build so every next collection goes faster.

**The model:** full-res photo masters live in the library (for print); web-optimized copies live in the site; the whole gallery renders from **one file** — `site/collections.json`. You almost never touch HTML.

Two repos are involved:
- **Library + archive:** `~/Documents/Claude.Code/1-Clients/Eleanora/` (the main repo)
- **Website:** `~/Documents/Claude.Code/4-Websites/eleanora-website/` (its own repo, auto-deploys `main` → the live site)

---

## Phase 1 — Intake & cull the photos (store-once, never delete)

1. Drop edited photos into `1-Clients/Eleanora/_intake/`.
2. File each into the library under its real place:
   `1-Clients/Eleanora/content/<Continent>/<Country>/<City>/`
   with a descriptive kebab-case name (`blue-door-sustjepanska.jpg`, not `IMG_1234.jpg`).
3. **Verify by looking** — never guess a photo's place or identity from the filename.
4. **De-dupe:** if a photo is a re-edit/re-crop of one already there, keep only the **latest** version (check file modified time). Move the superseded one to
   `.system/_archive/eleanora/<collection>-superseded-<date>/` — **archive, never delete.** It stays recoverable in backup.
5. `_intake/` should end empty for this batch (healthy inbox rule).

## Phase 2 — Pick the collection set

- Choose which library photos make the collection.
- Note each one's **orientation** (portrait / landscape) — it drives the layout. Quick check:
  `sips -g pixelWidth -g pixelHeight <file>`

## Phase 3 — Web-optimize into the site

For each chosen photo, copy it into the site and shrink it (masters stay full-res in the library for print):

```bash
cp "<library>/<name>.jpg" "site/img/<slug>-<name>.jpg"
sips -Z 1600 "site/img/<slug>-<name>.jpg"      # 1600px on the long edge
```

Naming convention: `img/<slug>-<short-name>.jpg` (e.g. `img/croatia-blue-door.jpg`).

## Phase 4 — Wire it into `collections.json`

Add one object to the `collections` array:

```json
{
  "slug": "croatia",
  "place": "Dubrovnik",
  "region": "Europe",
  "eyebrow": "Croatia · the Adriatic",
  "cover": "img/croatia-church-hill.jpg",
  "blurb": "Stone walls, still water, and one island in the blue.",
  "photos": [
    { "src": "img/croatia-thirteen-main.jpg", "col": 1, "title": "Thirteen Main Street", "alt": "…", "story": "", "talisman": null },
    { "src": "img/croatia-island.jpg", "col": 2, "title": "Island at Sea", "alt": "…", "story": "", "talisman": { "article": "journal-dubrovnik.html", "buyUrl": null } }
  ]
}
```

Field notes:
- **`cover`** — the big hero behind the place title. Pick a warm/striking **landscape** so the top of the page isn't a wall of one color (we swapped Croatia's blue-island cover for a stone one for exactly this reason).
- **`col`** — `1` = left column, `2` = right column. This is how you art-direct the layout (see Phase 5).
- **`title`** — the photo's name (shows on hover + in the lightbox).
- **`alt`** — short, factual description (accessibility + SEO).
- **`story`** — leave `""` until you author it; the lightbox shows a graceful placeholder.
- **`talisman`** — `null` for a plain photo. To make it a token print:
  `{ "article": "journal-xxx.html", "buyUrl": null }` — `article` is the real story page it links back to; `buyUrl` stays `null` until checkout is live, then paste the pay link and the buy button turns on automatically.

## Phase 5 — Layout: two hand-ordered columns

The gallery is **two equal-width columns**; every photo keeps its true shape (nothing cropped). You control placement:

- Each photo's **`col`** (1 or 2) puts it in the left or right column.
- Within a column, photos stack **in the order they appear** in the `photos` array.
- **Balance the columns:** portraits are tall, landscapes are short. If one column runs long and the other leaves a gap at the bottom, move a **tall portrait** into the short column to fill it (that's how the loggia went bottom-right under the watermelons).
- **Don't stack same-mood photos at the top** — lead each column with contrast (a warm building opposite a golden dock, not two blue seascapes).

No HTML edits needed — `collection.html` reads all of this from the JSON.

## Phase 6 — Verify before you call it done

```bash
cd 4-Websites/eleanora-website/site
python3 -m http.server 8850 --bind 127.0.0.1     # serve the site folder
```

The collection page is gated by a password flag. In the browser console set it once, then load the page:

```js
sessionStorage.setItem('eleanora_pass','1');
location.href = 'http://127.0.0.1:8850/collection.html?place=<slug>';
```

Check: columns read in the right order, they balance (no big gap at one bottom), no broken images, captions/token badge show, and it collapses to one column on mobile.

## Phase 7 — Finish the collection (per-photo, ongoing)

For each photo that becomes a token:
- **Cross-article check** — is the photo used in a journal/article? Decide its `talisman.article` link.
- **Print-size check** — a web copy is 1600px (display only). Print from the **library master**. Rough max print size at good quality: `master_pixels ÷ 300 = inches` (so a 2048px edge ≈ 6.8" at 300dpi, ~13" at 150dpi for larger wall pieces). Flag any master too small for the size you want to sell.

## Phase 8 — Ship it

Commit the website repo and push `main`; the live site auto-deploys. Commit the library/archive changes in the main repo separately (so a big photo migration doesn't get mislabeled under an unrelated message). Cache-bust images that changed with `?v=` if needed.

---

### The fast version (once photos are edited)
1. File + de-dupe into the library (archive olds).
2. `cp` + `sips -Z 1600` each pick into `site/img/`.
3. Add the collection block to `collections.json` (slug, cover, `col`-tagged photos).
4. Serve, set the pass flag, eyeball the columns.
5. Push.

*Idea for later: a helper script that takes a folder of picks and auto-generates the web copies + a `collections.json` skeleton, so Phases 3–4 become one command.*
