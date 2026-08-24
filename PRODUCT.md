# Product

## Register

brand

## Platform

web

## Users

The person who arrives has almost always come from Instagram, where they have been
watching Elena's life rather than reading about it. They land mid-scroll, on a phone,
usually at night, with no intention of buying anything. They are not looking for art.
They are looking at someone who seems to have gotten out, and quietly wondering whether
that is available to them.

Two audiences sit inside that one arrival. The **seeker** is the woman still standing at
the door: she has the job, the relationship, the apartment, and the persistent sense that
this was assigned to her rather than chosen. She reads the Journal. The **fan** is the
person already following the life who wants a piece of it in their hands. She buys.
The house rule holds: write to the seeker, sell to the fan.

The job to be done is not decorating a wall. It is taking a first, small, physical step
toward a life the visitor has only been watching. Success is that step: a token bought,
with its story attached.

Caveat worth naming: `brand/personas.md` still has every field on the seeker marked
`proposed` and unvalidated, and the fan persona is not built at all. The description above
is drawn from Elena's own locked strategy material, not from customer research.

## Product Purpose

**Updated 2026-08-24 by Elena. Two things below changed and the rest still holds.**
The persona is retired: the brand is **Elena**, not Eleanora. And the site's job changed.

corraoelena.com is **a travel journal** — Elena's own home and archive. She goes places
and writes about them, doors mostly, and the towns they belong to. The writing is the
site. Prints, the Journal of thirteen laws, and the about page sit in a rail beside the
travel writing rather than owning their own folds.

Her words, 2026-08-24: *"Fuck making money. I just wanna write about my travels."* Take
that literally in any design decision. Selling is allowed to be present and is not
allowed to be the point.

The site sells tokens: prints, postcards, posters, collections. The Journal is what makes
them worth buying. Money is not the endpoint; it funds the travel, the work, and the
program underneath. The site's own scoreboard is tokens sold with their stories intact.

## Positioning

The photography is the entrance, not the ceiling. Every other art site sells the image;
this one sells the story the image came from, and the object is how you keep it.

## Conversion & proof

- **Primary CTA (changed 2026-08-24):** read a travel entry. The old primary, buy a token,
  is now secondary and lives in the rail. A page that pushes the buy ahead of the writing
  is off-brief.
- **Secondary CTA:** read a Journal entry. The visitor arrived from Instagram, so pointing
  them back at Instagram is a dead end. Not ready to buy means go deeper into the archive.
- **The line a visitor remembers after 10 seconds:** the print is a token, not decor.
- **Belief ladder** (synthesized from `1-Clients/Eleanora/eleanora-halo-strategy` material;
  Elena has not ratified this sequence):
  1. She is real, and this is her actual life, not a set.
  2. She was where I am. The gap between us is a decision, not a birthright.
  3. The stories are worth my time on their own, before anything is for sale.
  4. This object carries one of those stories, and it is the cheapest way to hold one.
  5. Owning it changes something small in how I see my own week.
- **Proof on hand:** audience and sales figures exist and Elena is willing to show them.
  No number is recorded here, and none goes on a page, until she supplies the real figure.
  There are no testimonials, case studies, or press mentions on hand. Drop any that appear
  into `.impeccable/assets/proof/`.

## Brand Personality

Mystical, earthy, whimsical, unbothered. Short lines, concrete nouns, no em-dash-heavy
copy, elusive, never salesy. The character is Elena fully expressed, not a costume.

The feel is a sunlit greenhouse at golden hour: real plants, real light, restraint plus
warmth, gallery-quiet, never cold. Confident, a little sexy, completely unbothered. Sexy
here is the self-possessed kind, at home in her skin, never thirst-trap.

The emotional target is recognition followed by permission. A visitor should feel the life
is real and then feel allowed to want it.

## Anti-references

**The coach landing page.** Ruled out explicitly by Elena. No large smiling headshot as the
hero, no testimonial slider, no "as seen in" logo bar, no countdown timer, no three-tier
pricing table, no transformation-promise headline stack. If a section could be lifted onto
any Instagram coach's site with only the name changed, it does not ship.

Two more the codebase has already walked into, recorded so they don't repeat:

- **Text-only editorial pages** on a brand whose entire subject is photography. `site/worth.html`
  scored 21/40 in [the 2026-08-01 critique](.impeccable/critique/2026-08-01T01-35-00Z__site-worth-html.md)
  and its single largest failure was shipping zero images.
- **Meta-criticism copy** that names a cliché in order to correct it ("I'm not going to tell
  you to take control of your life"). Make the claim instead of staging the strawman.

## Design Principles

**A photo never appears bare.** The token rule is the site's spine, not a tagline. An image
appears inside its story or it does not appear. A grid of thumbnails with prices under them
is the failure state, because it converts a token back into decor.

**Show the life, don't pitch it.** Belief comes from the work and the writing, not from
proof furniture. The archive is the argument.

**The photography is the entrance, not the ceiling.** Imagery leads every surface, and the
writing is what the imagery leads to. Neither one is decoration for the other.

**Beauty, not a performance.** Restraint with warmth. One dominant idea per fold, generous
space, calm. Nothing on the page should look like it is trying to be noticed.

**Legible before beautiful.** Where the two conflict, legibility wins and the composition
gets rebuilt rather than the contrast lowered.

## Accessibility & Inclusion

WCAG 2.1 AA, honestly enforced rather than claimed. Body text at 4.5:1 against its actual
rendered background, large and bold display text at 3:1, placeholder text held to the same
4.5:1 as body. Contrast is verified on the render, including type set over photography,
where a scrim is used to earn the ratio rather than assumed to.

Full keyboard navigation with visible focus states, including the nav dropdowns and the
cart. Every animation needs a `prefers-reduced-motion: reduce` alternative. Alt text is part
of the voice, not a compliance field: it describes the specific photograph and its place.

`brand/brand-style.md` already asserts that cream on Forest and Pine passes AA. That claim
is now a requirement to be verified, not a fact to be inherited.
