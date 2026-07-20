/* Renders the print shop from prints.json.
   Place-sorted with the story on every card (Elena, 2026-07-19).
   Story never drives the sort: place is how people shop, story is what closes.

   posters.html is the OPEN tier only. The `vanishing` tier (user-facing "The Limited
   Edition") lives on limited-edition.html as a September waitlist. Elena, 2026-07-20.

   THE RULE (prints.json `the-rule`): a print does not ship without a true story.
   `article` must point at a real journal entry. Cards without one render in the
   "story being written" state: browsable, named, never buyable. */
(async function () {
  const grid = document.getElementById('grid');
  const chips = document.getElementById('chips');
  const note = document.getElementById('pnote');
  if (!grid) return;

  let data;
  try {
    data = await (await fetch('prints.json', { cache: 'no-cache' })).json();
  } catch (e) {
    if (note) note.textContent = 'Prints are loading slowly. Refresh in a moment.';
    return;
  }

  const open = data.prints.filter(p => p.tier === 'open');
  const from = Math.min(...data.ladder.sizes.map(s => s.price));

  // Story-backed prints lead. They are the ones that can actually sell, and a shop
  // whose first row is "coming soon" reads as empty. Place order is preserved inside
  // each group, so the chips still behave.
  const ready   = open.filter(p => p.article);
  const pending = open.filter(p => !p.article);
  const ordered = ready.concat(pending);

  // chips are built from the places that actually have prints, so no empty filters
  const live = data.places.filter(pl => open.some(p => p.place === pl.slug));
  chips.innerHTML =
    `<button class="on" data-f="all">All</button>` +
    live.map(pl => `<button data-f="${pl.slug}">${pl.label}</button>`).join('');

  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const card = p => {
    const hasStory = !!p.article;
    const wide = p.orientation === 'landscape';
    const img = `<img src="${esc(p.img)}" alt="${esc(p.alt)}">`;
    const frame = hasStory
      ? `<a class="ph" href="${esc(p.article)}">${img}</a>`
      : `<div class="ph">${img}</div>`;

    // With a story: read it, then buy it. Without: say so plainly and stop.
    const body = hasStory
      ? `${p.line ? `<div class="meta">${esc(p.line)}</div>` : ''}
         <a class="cta" href="${esc(p.article)}">Read the story</a>
         ${p.buyUrl
            ? `<a class="cta" href="${esc(p.buyUrl)}">From $${from}</a>`
            : `<span class="cta soon">From $${from} · opening soon</span>`}`
      : `<span class="cta soon">The story is being written</span>`;

    return `<article class="pcard${wide ? ' wide' : ''}${hasStory ? '' : ' pending'}" data-cat="${esc(p.place)}">
      ${frame}
      <h3 class="serif">${esc(p.name)}</h3>
      ${body}
    </article>`;
  };

  grid.innerHTML = ordered.map(card).join('');

  chips.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    chips.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    const f = b.dataset.f;
    grid.querySelectorAll('.pcard').forEach(c => {
      c.classList.toggle('tile-hide', f !== 'all' && c.dataset.cat !== f);
    });
  });

  if (note) {
    note.textContent = ready.length
      ? `${ready.length} ready to hang · ${pending.length} still finding their words`
      : 'The first prints are being made now.';
  }
})();
