/* ============================================================
   journal-entry.js — the reusable Journal entry engine.
   Each entry page carries <body data-slug="journal-xxx"> and a
   <div id="entry-foot"></div> just before <footer>, plus this script.
   It reads journal.json (single source of truth) and injects:
     1. the talisman-close (the feature image sold as the print),
     2. the second exit (Collection for Travels · the manual for
        the Way I See It · nothing for People),
     3. read-next (3 related, not-yet-visited stories).
   Design tokens (--gold, --cream, .serif, .fig …) come from the
   page's own locked stylesheet — this only adds layout classes.
   ============================================================ */
(function () {
  var SLUG = document.body.getAttribute('data-slug');
  if (!SLUG) return;

  // ---- mark this story visited (for read-next everywhere) ----
  var VKEY = 'eleanora_journal_visited';
  var visited = [];
  try { visited = JSON.parse(localStorage.getItem(VKEY) || '[]'); } catch (e) { visited = []; }
  if (visited.indexOf(SLUG) === -1) { visited.push(SLUG); }
  try { localStorage.setItem(VKEY, JSON.stringify(visited)); } catch (e) {}

  // ---- one-time styles for the injected blocks ----
  var css = document.createElement('style');
  css.textContent =
    '.tal-close{max-width:760px;margin:0 auto;padding:clamp(20px,4vh,44px) 24px clamp(40px,6vh,60px);text-align:center;}' +
    '.tal-close .eye{font-size:11px;letter-spacing:3.5px;text-transform:uppercase;color:var(--gold);opacity:.9;}' +
    '.tal-fig{position:relative;max-width:520px;margin:22px auto 26px;overflow:hidden;box-shadow:0 26px 64px rgba(0,0,0,.42);}' +
    '.tal-fig::after{content:"";position:absolute;inset:0;box-shadow:inset 0 0 0 1px rgba(231,196,137,.2);pointer-events:none;}' +
    '.tal-fig img{width:100%;height:auto;display:block;}' +
    '.tal-name{font-size:clamp(24px,3vw,34px);color:var(--cream);line-height:1.15;}' +
    '.tal-line{max-width:44ch;margin:16px auto 0;font-size:16px;line-height:1.9;color:var(--read);}' +
    '.tal-buy{display:inline-block;margin-top:28px;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;' +
      'color:var(--forest-dd);background:var(--gold);padding:15px 34px;transition:.35s var(--ease);}' +
    '.tal-buy:hover{background:var(--cream);}' +
    '.tal-soon{display:inline-block;margin-top:28px;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;' +
      'color:var(--gold);border:1px solid rgba(231,196,137,.5);padding:14px 32px;opacity:.85;}' +
    '.tal-price{margin-top:14px;font-size:12px;letter-spacing:2px;color:var(--sand);opacity:.85;}' +
    '.exits{max-width:760px;margin:0 auto;padding:0 24px clamp(40px,6vh,60px);display:flex;flex-direction:column;gap:14px;align-items:center;}' +
    '.exit-link{font-size:12px;letter-spacing:2.5px;text-transform:uppercase;color:var(--gold);' +
      'border-bottom:1px solid rgba(231,196,137,.45);padding-bottom:5px;transition:.3s var(--ease);}' +
    '.exit-link:hover{color:var(--cream);border-color:var(--cream);}' +
    '.readnext{background:var(--forest-dd);padding:clamp(56px,8vh,84px) 24px clamp(56px,8vh,80px);position:relative;}' +
    '.readnext::before{content:"";position:absolute;top:0;left:50%;transform:translateX(-50%);width:min(90%,420px);height:1px;' +
      'background:linear-gradient(90deg,transparent,rgba(231,196,137,.4),transparent);}' +
    '.rn-head{text-align:center;font-size:12px;letter-spacing:3.5px;text-transform:uppercase;color:var(--sand);opacity:.85;margin-bottom:34px;}' +
    '.rn-grid{max-width:1080px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:22px;}' +
    '.rn-card{display:block;text-align:left;background:var(--forest-d);overflow:hidden;box-shadow:0 16px 40px rgba(0,0,0,.34);' +
      'transition:transform .5s var(--ease);}' +
    '.rn-card:hover{transform:translateY(-5px);}' +
    '.rn-card .ph{aspect-ratio:4/5;overflow:hidden;}' +
    '.rn-card .ph img{transition:transform 1.1s var(--ease);}' +
    '.rn-card:hover .ph img{transform:scale(1.06);}' +
    '.rn-card .b{padding:20px 20px 24px;}' +
    '.rn-card .k{font-size:10.5px;letter-spacing:2.5px;text-transform:uppercase;color:var(--gold);}' +
    '.rn-card h4{font-family:"Didot","Bodoni 72",Georgia,serif;font-size:19px;color:var(--cream);margin-top:9px;line-height:1.24;}' +
    '@media(max-width:820px){.rn-grid{grid-template-columns:1fr;max-width:420px;}}';
  document.head.appendChild(css);

  var BUCKET_LABEL = { 'way-i-see-it': 'The Way I See It', 'travels': 'Travels', 'people': 'The People' };

  Promise.all([
    fetch('journal.json').then(function (r) { return r.json(); }),
    fetch('collections.json').then(function (r) { return r.json(); }).catch(function () { return { collections: [] }; })
  ]).then(function (res) {
    var data = res[0], colData = res[1] || { collections: [] };
    var entries = data.entries || [];
    var me = entries.filter(function (e) { return e.slug === SLUG; })[0];
    if (!me) return;
    var mount = document.getElementById('entry-foot');
    if (!mount) return;

    var html = '';

    // ---------- 1. TALISMAN CLOSE ----------
    var t = me.talisman || {};
    html += '<section class="tal-close reveal">';
    html += '<div class="eye">' + (me.soft ? 'Something to remember them by' : 'Take it home') + '</div>';
    html += '<figure class="tal-fig"><img src="' + t.img + '" alt="' + (t.alt || '') + '"></figure>';
    if (t.name) { html += '<div class="tal-name serif">' + t.name + '</div>'; }
    if (t.line) { html += '<p class="tal-line">' + t.line + '</p>'; }
    if (me.soft) {
      // People lane: gentle, no hard sell
      if (t.buyUrl) {
        html += '<a class="tal-soon" href="' + t.buyUrl + '">Keep it close &rarr;</a>';
      }
    } else if (t.buyUrl) {
      html += '<a class="tal-buy" href="' + t.buyUrl + '">Make it yours &rarr;</a>';
      if (t.price) { html += '<div class="tal-price">the print · ' + t.price + '</div>'; }
    } else {
      html += '<span class="tal-soon">Prints coming soon</span>';
      if (t.price) { html += '<div class="tal-price">the print · ' + t.price + '</div>'; }
    }
    html += '</section>';

    // ---------- 2. SECOND EXIT ----------
    var ex = me.exits || {};
    var exitBits = '';
    if (ex.collection) {
      var col = colData.collections.filter(function (c) { return c.slug === ex.collection; })[0];
      var place = col ? col.place : ex.collection;
      exitBits += '<a class="exit-link" href="collection.html?place=' + encodeURIComponent(ex.collection) +
                  '">See the whole trip &middot; the ' + place + ' Collection &rarr;</a>';
    }
    if (ex.manual) {
      exitBits += '<a class="exit-link" href="/manifesto/">There’s a deeper practice &middot; walk the 1% path &rarr;</a>';
    }
    if (exitBits) { html += '<section class="exits reveal">' + exitBits + '</section>'; }

    // ---------- 3. READ NEXT (3 related, unvisited) ----------
    var vset = {};
    visited.forEach(function (s) { vset[s] = 1; });
    var myTags = me.tags || [];
    var pool = entries.filter(function (e) { return e.slug !== SLUG; });
    // score by shared tags, then same-bucket bonus
    pool.forEach(function (e) {
      var shared = (e.tags || []).filter(function (tag) { return myTags.indexOf(tag) !== -1; }).length;
      e._score = shared * 10 + (e.bucket === me.bucket ? 1 : 0);
    });
    var unvisited = pool.filter(function (e) { return !vset[e.slug]; });
    var ranked = (unvisited.length ? unvisited : pool).slice().sort(function (a, b) { return b._score - a._score; });
    var picks = ranked.slice(0, 3);

    if (picks.length) {
      html += '<section class="readnext"><div class="rn-head">Keep reading</div><div class="rn-grid">';
      picks.forEach(function (e) {
        var img = (e.talisman && e.talisman.img) || '';
        var alt = (e.talisman && e.talisman.alt) || '';
        html += '<a class="rn-card" href="' + e.slug + '.html">' +
                '<div class="ph"><img src="' + img + '" alt="' + alt + '"></div>' +
                '<div class="b"><div class="k">' + (BUCKET_LABEL[e.bucket] || '') + '</div>' +
                '<h4>' + e.title + '</h4></div></a>';
      });
      html += '</div></section>';
    }

    mount.innerHTML = html;

    // let the injected .reveal blocks animate in like the rest of the page
    if (document.body.classList.contains('anim')) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { threshold: .14, rootMargin: '0px 0px -8% 0px' });
      mount.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
    }
  }).catch(function () { /* leave the page as-is if the manifest can't load */ });
})();
