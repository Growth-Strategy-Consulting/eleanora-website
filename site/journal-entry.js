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
    var isLive = function (e) { if (!e.publishAt) return true; var d = new Date(e.publishAt + 'T00:00:00'); return isNaN(d) ? true : d <= new Date(); };
    var pool = entries.filter(function (e) { return e.slug !== SLUG && isLive(e); });
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


/* ============================================================
   SUBSCRIBE POPUP — shows once, on every story page.
   Lives here so it rides on every current + future journal
   entry automatically (this file is only loaded on story pages,
   each carrying <body data-slug="...">). Scoped to those pages;
   never fires on the home/gallery/shop.

   Behaviour: appears after the reader has spent ~20s on the
   story — never on load. Shows a single time; once someone subscribes or closes
   it, it never nags them again (remembered in localStorage,
   same as the read-history the engine above uses).

   ---- WIRING IT TO SMARTSUITE (the swap) --------------------
   Right now it posts to FormSubmit (no backend; emails Elena),
   matching the Work With Me form. To send signups straight into
   SmartSuite instead:
     1. In SmartSuite, make a table for the email list (one field:
        Email), then add an Automation with the "Incoming Webhook"
        trigger. Copy the unique webhook URL it gives you.
     2. Set SUBSCRIBE_ENDPOINT below to that URL.
     3. Set SUBSCRIBE_MODE to 'smartsuite'.
   That's the whole change. Nothing else in here moves.
   ============================================================ */
(function () {
  if (!document.body.getAttribute('data-slug')) return;      // story pages only

  // ---- the one email inbox / endpoint. INTERIM = FormSubmit. --
  var SUBSCRIBE_MODE = 'formsubmit';                          // 'formsubmit' | 'smartsuite'
  var SUBSCRIBE_ENDPOINT = 'https://formsubmit.co/ajax/corraoconsulting@gmail.com';
  // When you switch to SmartSuite, paste its incoming-webhook URL above and set MODE to 'smartsuite'.

  var DONE_KEY = 'eleanora_sub';                             // 'done' | 'dismissed' -> never show again
  var state;
  try { state = localStorage.getItem(DONE_KEY); } catch (e) { state = null; }
  if (state) return;

  var reduce = false;
  try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  // ---- styles ----
  var css = document.createElement('style');
  css.textContent =
    '.sub-pop{position:fixed;z-index:9998;right:24px;bottom:24px;width:min(370px,calc(100vw - 32px));' +
      'background:var(--forest-d,#122019);border:1px solid rgba(231,196,137,.32);' +
      'box-shadow:0 26px 70px rgba(0,0,0,.5);padding:26px 26px 24px;' +
      'opacity:0;transform:translateY(16px);transition:opacity .55s var(--ease,ease),transform .55s var(--ease,ease);}' +
    '.sub-pop.in{opacity:1;transform:none;}' +
    '.sub-pop .x{position:absolute;top:11px;right:13px;width:26px;height:26px;line-height:24px;text-align:center;' +
      'color:var(--sand,#cbb78f);opacity:.7;font-size:19px;cursor:pointer;background:none;border:0;transition:opacity .3s;}' +
    '.sub-pop .x:hover{opacity:1;}' +
    '.sub-pop .eye{font-size:10.5px;letter-spacing:3px;text-transform:uppercase;color:var(--gold,#e7c489);opacity:.9;}' +
    '.sub-pop h5{font-family:"Didot","Bodoni 72",Georgia,serif;font-weight:400;font-size:23px;line-height:1.2;' +
      'color:var(--cream,#f4ecdc);margin:9px 0 8px;}' +
    '.sub-pop p{font-size:14px;line-height:1.65;color:var(--read,#d7c9ad);margin:0 0 16px;}' +
    '.sub-pop form{display:flex;flex-direction:column;gap:10px;}' +
    '.sub-pop input[type=email]{width:100%;background:rgba(0,0,0,.22);border:1px solid rgba(231,196,137,.3);' +
      'color:var(--cream,#f4ecdc);padding:12px 14px;font-size:14px;font-family:inherit;transition:border-color .3s;}' +
    '.sub-pop input[type=email]:focus{outline:none;border-color:var(--gold,#e7c489);}' +
    '.sub-pop input[type=email]::placeholder{color:var(--sand,#cbb78f);opacity:.6;}' +
    '.sub-pop button.go{font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:var(--forest-dd,#0c1611);' +
      'background:var(--gold,#e7c489);border:0;padding:14px 22px;cursor:pointer;transition:background .35s var(--ease,ease);}' +
    '.sub-pop button.go:hover{background:var(--cream,#f4ecdc);}' +
    '.sub-pop button.go[disabled]{opacity:.6;cursor:default;}' +
    '.sub-pop .hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0;}' +
    '.sub-pop .note{font-size:12px;line-height:1.6;color:var(--sand,#cbb78f);opacity:.85;margin:2px 0 0;min-height:1px;}' +
    '.sub-pop .thanks{font-size:15px;line-height:1.7;color:var(--cream,#f4ecdc);}' +
    '.sub-pop .thanks .sig{color:var(--gold,#e7c489);}' +
    '@media(max-width:520px){.sub-pop{right:12px;left:12px;bottom:12px;width:auto;padding:22px 22px 20px;}}';
  document.head.appendChild(css);

  // ---- build it (hidden until triggered) ----
  var pop = document.createElement('aside');
  pop.className = 'sub-pop';
  pop.setAttribute('role', 'dialog');
  pop.setAttribute('aria-label', 'Join the email list');
  pop.innerHTML =
    '<button class="x" aria-label="Close">&times;</button>' +
    '<div class="eye">Leave the door open</div>' +
    '<h5>There’s always another story.</h5>' +
    '<p>This one found you. Leave your email and I’ll make sure the next one does too.</p>' +
    '<form novalidate>' +
      '<input type="text" class="hp" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<input type="email" name="email" placeholder="your email" required autocomplete="email">' +
      '<button type="submit" class="go">Send me the next one</button>' +
      '<p class="note" aria-live="polite"></p>' +
    '</form>';
  document.body.appendChild(pop);

  var form = pop.querySelector('form');
  var emailEl = pop.querySelector('input[type=email]');
  var honeyEl = pop.querySelector('.hp');
  var noteEl = pop.querySelector('.note');
  var goBtn = pop.querySelector('button.go');
  var closeBtn = pop.querySelector('.x');

  var shown = false;
  function show() {
    if (shown) return;
    shown = true;
    cleanup();
    if (reduce) { pop.classList.add('in'); }
    else { requestAnimationFrame(function () { requestAnimationFrame(function () { pop.classList.add('in'); }); }); }
  }
  function remember(v) { try { localStorage.setItem(DONE_KEY, v); } catch (e) {} }
  function dismiss() { remember('dismissed'); pop.classList.remove('in'); setTimeout(function () { pop.remove(); }, 500); }

  closeBtn.addEventListener('click', dismiss);

  // ---- trigger: after ~20s on the page ----
  function cleanup() { clearTimeout(timer); }
  var timer = setTimeout(show, 20000);

  // ---- submit ----
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = (emailEl.value || '').trim();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { noteEl.textContent = 'That email looks off. Try again?'; emailEl.focus(); return; }
    if (honeyEl.value) { succeed(); return; }               // bot filled the honeypot -> quietly "succeed"

    goBtn.setAttribute('disabled', 'disabled');
    noteEl.textContent = 'One second…';

    var payload, headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    if (SUBSCRIBE_MODE === 'smartsuite') {
      payload = { email: email, source: 'story-popup', slug: document.body.getAttribute('data-slug') };
    } else {
      payload = { email: email, _subject: 'New subscriber — story popup (Eleanora)', _template: 'table', _captcha: 'false' };
    }

    fetch(SUBSCRIBE_ENDPOINT, { method: 'POST', headers: headers, body: JSON.stringify(payload) })
      .then(function (r) { if (!r.ok) throw new Error('bad status'); return r.json().catch(function () { return {}; }); })
      .then(function () { succeed(); })
      .catch(function () {
        goBtn.removeAttribute('disabled');
        noteEl.textContent = 'Hmm, that didn’t go through. One more try?';
      });
  });

  function succeed() {
    remember('done');
    pop.innerHTML =
      '<button class="x" aria-label="Close">&times;</button>' +
      '<div class="eye">You’re in</div>' +
      '<p class="thanks">You’re on the list. The next one finds you first. <span class="sig">x</span></p>';
    pop.querySelector('.x').addEventListener('click', function () { pop.classList.remove('in'); setTimeout(function () { pop.remove(); }, 500); });
  }
})();
