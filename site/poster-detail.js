/* Renders one poster's detail page from prints.json by ?slug=.
   Sibling to collection.html's param-render pattern. The Buy action links OUT to
   the poster's Shopify product page (prints.json `buyUrl`); until that exists it
   shows an honest "opening soon" state. Elena, 2026-07-21. */
(async function () {
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const slug = new URLSearchParams(location.search).get('slug');
  let data;
  try { data = await (await fetch('prints.json', { cache: 'no-cache' })).json(); }
  catch (e) { $('pdTitle').textContent = 'This print is loading slowly. Refresh in a moment.'; return; }

  const p = data.prints.find(x => x.slug === slug);
  if (!p) {
    document.title = 'Print not found — Eleanora';
    $('pdTitle').textContent = 'That print is not here.';
    $('pdSizes').innerHTML = '';
    return;
  }

  document.title = p.name + ' — Eleanora';

  // image (honor optional per-image crop focus)
  const img = $('pdImg');
  img.src = p.img; img.alt = p.alt || p.name;
  if (p.objectPosition) img.style.objectPosition = p.objectPosition;

  $('pdTitle').textContent = p.name;
  const line = $('pdLine');
  if (p.line) { line.textContent = p.line; } else { line.style.display = 'none'; }

  // size ladder (shared across prints)
  const sizes = (data.ladder && data.ladder.sizes) || [];
  $('pdSizes').innerHTML = sizes.map(s =>
    `<div class="row"><span class="sz">${esc(s.label)}</span><span>$${esc(s.price)}</span></div>`
  ).join('');

  // buy: link OUT to Shopify product page; honest fallback until it exists
  const actions = $('pdActions');
  if (p.buyUrl) {
    actions.innerHTML =
      `<a class="buy-btn" href="${esc(p.buyUrl)}">Buy this print &rarr;</a>` +
      `<div class="pd-note">Choose your size at checkout.</div>`;
  } else {
    actions.innerHTML =
      `<span class="buy-soon">Opening soon</span>` +
      `<div class="pd-note">${p.article ? 'Available shortly.' : 'The story is being written.'}</div>`;
  }

  // story link when one exists
  const story = $('pdStory');
  if (p.article) {
    story.innerHTML = `<a href="${esc(p.article)}">Read the story &rarr;</a>`;
  } else {
    story.style.display = 'none';
  }
})();
