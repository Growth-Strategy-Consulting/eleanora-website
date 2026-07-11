# corraoelena.com — Site Structure (source of truth)

*Locked 2026-07-10 via a grill-me interview. This is the reference for all build work.
If a page contradicts this doc, the doc wins.*

## Top-level spine (nav on every page)

**Gallery · Collections · Journal · About**

- Password gate stays in front of the whole site (`/` → `/site/`).
- **Contact** lives in the footer, not the nav.
- **Retired:** the Prints room, the Blog room, and home.html's old nav. No page keeps them.

## The four rooms

### Gallery
One flat, filterable wall for wandering. Browse by **vibe** (Women / The Wild /
Editorial / Travel, etc.). Browse-only — no buying here. The old ~15 poetic
set-names (Golden Hour, Last Light, The Ritual…) are image titles/filters, **not**
collections.

### Collections
Curated sets you actually buy. **Buying happens inside a Collection page** — there
is no separate shop. Two sub-types:

- **Place Collections (6)** — one per trip; each pairs with a Journal entry:
  - Dubrovnik
  - Corfu
  - Italy
  - Brazil
  - Miami
  - Treasure Island (FL beach)
- **Theme Collections (1)** — spans many places, sells as a set, **no journal**:
  - Flowers (shot across many botanical gardens)

**Rule:** themes stay Gallery filters by default. A theme is promoted to a Theme
Collection **only** if it's sold as a set. Flowers qualifies; nothing else does yet.
Keep this tier deliberately tiny — it's how the 15-name sprawl stays out.

### Journal
One written room (Blog folded in and deleted). Place-based stories, one per trip.
`journal-croatia.html` is really **Dubrovnik** — rename it.

### About
The girl behind the camera. Contact info sits in the footer here and site-wide.

## Homepage section order (top → bottom)

1. **Hero** — "Eleanora / An archive of her stories"
2. **Collections** — browse by place (6 trips) + Flowers. The main event.
3. **Journal teaser** — latest 2–3 entries (currently missing; needs a front window).
4. **About teaser** — "the girl behind the camera" → Read my story.
5. **Footer** — Instagram + Contact.

Delete the standalone "Shop the Prints" band — buying now lives inside each Collection.

## Place ↔ Journal pairing

Every Place Collection has a matching Journal entry (Collection = the images you buy,
Journal = the story of that trip). Flowers is the one exception (no journal).

| Place | Collection page | Journal entry |
|---|---|---|
| Dubrovnik | build | exists (rename from `journal-croatia`) |
| Corfu | exists (homepage list) | build |
| Italy | build | exists |
| Brazil | exists (`collection-brazil`) | build |
| Miami | build | exists |
| Treasure Island | build | build |
| Flowers (theme) | build | — none — |

## Build order

1. **Skeleton first (no new content).** Unify nav to *Gallery · Collections · Journal ·
   About* on every page; delete `blog.html`; rename `journal-croatia` → Dubrovnik;
   rework homepage to the section order above; clean Gallery down to real vibe filters.
   → Site becomes consistent even while half-empty.
2. **Templates once.** Turn `collection-brazil` into the reusable **Place-Collection**
   template; build the **Flowers** Theme-Collection template; build a **Journal** template.
3. **Fill content, closest-to-a-complete-pair first:** Italy, Miami, Dubrovnik collections
   (journals already exist) → Brazil journal (collection exists) → Corfu + Treasure Island
   (both halves) → **Flowers last** (biggest curation lift).

## Not decided here (out of scope of this grill)

- Whether the password gate stays long-term (that's a strategy/discoverability call).
- Visual/design execution — runs through the `impeccable` skill against the brand sheet.
