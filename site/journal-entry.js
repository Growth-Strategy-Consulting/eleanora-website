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
    '.wheel-nav{max-width:760px;margin:0 auto;padding:clamp(26px,4vh,40px) 24px clamp(4px,1vh,10px);' +
      'display:flex;gap:16px;align-items:stretch;justify-content:center;' +
      'border-top:1px solid rgba(231,196,137,.16);}' +
    '.wheel-nav a{flex:1 1 0;min-width:0;display:block;padding:14px 16px;border:1px solid rgba(231,196,137,.22);' +
      'transition:border-color .3s,background .3s;}' +
    '.wheel-nav a:hover{border-color:var(--gold,#e7c489);background:rgba(231,196,137,.05);}' +
    '.wheel-nav .dir{font-size:10px;letter-spacing:2.8px;text-transform:uppercase;color:var(--gold,#e7c489);opacity:.85;}' +
    '.wheel-nav .k{font-size:10.5px;letter-spacing:1.6px;text-transform:uppercase;color:var(--sand,#e4d7be);opacity:.7;margin-top:9px;}' +
    '.wheel-nav .t{font-family:\'Didot\',\'Bodoni 72\',Georgia,serif;font-size:17px;line-height:1.3;color:var(--cream,#f6f1e7);' +
      'margin-top:3px;text-transform:none;letter-spacing:normal;text-wrap:balance;}' +
    '.wheel-nav .next{text-align:right;}' +
    '@media(max-width:560px){.wheel-nav{flex-direction:column;} .wheel-nav .next{text-align:left;}}' +
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

  // keys must match journal.json's `bucket` values. The old map used retired keys
  // ('way-i-see-it','travels','people'), so every read-next card rendered a blank label.
  var BUCKET_LABEL = {
    'the-manifesto': 'The 1% Manifesto',
    'the-long-way': 'The Long Way',
    'the-archive': 'The Archive',
    'a-place-to-park': 'A Place to Park',
    'curio': 'The Curio Cabinet'
  };

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
    var talHtml = '';

    // ---------- 0. THE WHEEL PAGER ----------
    // journal.json's entry order IS the wheel order, so the neighbours either
    // side of this story are the previous and next door. Sits under the
    // signature, above "Take it home", so the way onward is obvious.
    var navHtml = '';
    var myIndex = entries.map(function (e) { return e.slug; }).indexOf(SLUG);
    if (myIndex !== -1) {
      var prev = myIndex > 0 ? entries[myIndex - 1] : null;
      var next = myIndex < entries.length - 1 ? entries[myIndex + 1] : null;
      if (prev || next) {
        navHtml += '<nav class="wheel-nav reveal" aria-label="The wheel, in order">';
        if (prev) {
          navHtml += '<a class="prev" href="' + prev.slug + '.html">' +
            '<div class="dir">&larr; The one before</div>' +
            '<div class="k">' + (prev.kicker || '') + '</div>' +
            '<div class="t">' + prev.title + '</div></a>';
        }
        if (next) {
          navHtml += '<a class="next" href="' + next.slug + '.html">' +
            '<div class="dir">Read the next one &rarr;</div>' +
            '<div class="k">' + (next.kicker || '') + '</div>' +
            '<div class="t">' + next.title + '</div></a>';
        }
        navHtml += '</nav>';
      }
    }

    // ---------- 1. TALISMAN CLOSE ----------
    var t = me.talisman || {};
    talHtml += '<section class="tal-close reveal">';
    talHtml += '<div class="eye">' + (me.soft ? 'Something to remember them by' : 'Take it home') + '</div>';
    talHtml += '<figure class="tal-fig"><img src="' + t.img + '" alt="' + (t.alt || '') + '"></figure>';
    if (t.name) { talHtml += '<div class="tal-name serif">' + t.name + '</div>'; }
    if (t.line) { talHtml += '<p class="tal-line">' + t.line + '</p>'; }
    if (me.soft) {
      // People lane: gentle, no hard sell
      if (t.buyUrl) {
        talHtml += '<a class="tal-soon" href="' + t.buyUrl + '">Keep it close &rarr;</a>';
      }
    } else if (t.buyUrl) {
      talHtml += '<a class="tal-buy" href="' + t.buyUrl + '">Make it yours &rarr;</a>';
      if (t.price) { talHtml += '<div class="tal-price">the print · ' + t.price + '</div>'; }
    } else {
      talHtml += '<span class="tal-soon">Prints coming soon</span>';
      if (t.price) { talHtml += '<div class="tal-price">the print · ' + t.price + '</div>'; }
    }
    talHtml += '</section>';

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

    // A page can host the token mid-story by dropping in <div id="token-slot"></div>.
    // Without one, it closes the page exactly as before.
    var slot = document.getElementById('token-slot');
    if (slot) { slot.innerHTML = talHtml; mount.innerHTML = navHtml + html; }
    else { mount.innerHTML = navHtml + talHtml + html; }

    // let the injected .reveal blocks animate in like the rest of the page
    if (document.body.classList.contains('anim')) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { threshold: 0, rootMargin: '0px 0px -2% 0px' });
      mount.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
      if (slot) { slot.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); }); }
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

   ---- WIRING IT TO MAILERLITE (the chosen sender) -----------
   MailerLite is the list + sender; its RSS auto-send drives the
   drip. To point signups straight into MailerLite:
     1. In MailerLite: create a Group (e.g. "Eleanora — Journal"),
        then Forms → Embedded form for that group → HTML code.
     2. In that HTML, copy the <form action="..."> URL. It looks like
        https://assets.mailerlite.com/jsonp/<ACCT>/forms/<FORM_ID>/subscribe
        It is PUBLIC by design — no API key, nothing secret — so it
        is safe to sit in this frontend file.
     3. Paste that URL into SUBSCRIBE_ENDPOINT below and set
        SUBSCRIBE_MODE to 'mailerlite'. That's the whole change.
   (FormSubmit + SmartSuite branches are kept as fallbacks.)
   ============================================================ */
(function () {
  if (!document.body.getAttribute('data-slug')) return;      // story pages only

  // ---- the one email endpoint. CHOSEN SENDER = MailerLite. -----
  var SUBSCRIBE_MODE = 'mailerlite';                          // 'mailerlite' | 'formsubmit' | 'smartsuite'
  // TARGET LIST = the Threshold (the deeper series people opt into from a wheel
  // story). Paste the Threshold group's embedded-form action below to point
  // signups at it. Until then this posts to the "Eleanora — Journal" group, so
  // emails are still captured and nothing is lost, just tagged to the wrong list.
  var SUBSCRIBE_ENDPOINT = 'https://assets.mailerlite.com/jsonp/2518337/forms/193587317692172210/subscribe';
  // ↑ CURRENTLY: "Eleanora — Journal". REPLACE with the Threshold group's form URL.
  //   FormSubmit fallback: 'https://formsubmit.co/ajax/corraoconsulting@gmail.com'

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
    '<h5>Some stories don’t make the website.</h5>' +
    '<p>The deeper ones stay off here. Leave your email and I’ll send those to you instead.</p>' +
    '<form novalidate>' +
      '<input type="text" class="hp" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<input type="email" name="email" placeholder="your email" required autocomplete="email">' +
      '<button type="submit" class="go">Send me those</button>' +
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
    else {
      // rAF is starved while a tab is backgrounded, and gating the reveal only on
      // it means the popup can queue forever and never show. Same trap the veil
      // had. Timer fallback: adding the class twice is harmless.
      requestAnimationFrame(function () { requestAnimationFrame(function () { pop.classList.add('in'); }); });
      setTimeout(function () { pop.classList.add('in'); }, 300);
    }
  }
  function remember(v) { try { localStorage.setItem(DONE_KEY, v); } catch (e) {} }
  function dismiss() { remember('dismissed'); pop.classList.remove('in'); setTimeout(function () { pop.remove(); }, 500); }

  closeBtn.addEventListener('click', dismiss);

  // ---- trigger: the middle of the story, not a stopwatch ----
  // A marker is dropped late in the article (~85%) and watched with an
  // IntersectionObserver, so the ask lands once the reader is genuinely into the
  // piece rather than interrupting someone who just arrived. IO rather than a
  // scroll listener: no scroll thrash, it still fires if the page loads already
  // scrolled, and it is the same mechanism the .reveal system uses here.
  var article = document.querySelector('article.read') || document.body;
  var fired = false;
  var midWatcher = null;
  function fire() { if (fired) return; fired = true; cleanup(); show(); }
  function cleanup() {
    clearTimeout(timer);
    if (midWatcher) { midWatcher.disconnect(); midWatcher = null; }
  }
  var timer = setTimeout(fire, 90000);                 // backstop for very short entries

  var mark = document.createElement('div');
  mark.setAttribute('aria-hidden', 'true');
  mark.style.cssText = 'height:1px;pointer-events:none;';
  var ps = article.querySelectorAll('.prose > p, .prose > div');
  if (ps.length) { var a = ps[Math.min(ps.length - 1, Math.floor(ps.length * 0.85))]; a.parentNode.insertBefore(mark, a); }
  else { article.appendChild(mark); }

  if ('IntersectionObserver' in window) {
    midWatcher = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) fire(); });
    }, { rootMargin: '0px 0px -25% 0px' });
    midWatcher.observe(mark);
  }

  // ---- submit ----
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = (emailEl.value || '').trim();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { noteEl.textContent = 'That email looks off. Try again?'; emailEl.focus(); return; }
    if (honeyEl.value) { succeed(); return; }               // bot filled the honeypot -> quietly "succeed"

    goBtn.setAttribute('disabled', 'disabled');
    noteEl.textContent = 'One second…';

    // --- MailerLite embedded-form endpoint (form-encoded, public, no key) ---
    // The jsonp/.../subscribe endpoint is cross-origin and doesn't return
    // readable CORS headers, so we fire with no-cors and optimistically confirm.
    // The subscribe still registers in MailerLite. (Verify once live with a real
    // signup landing in the MailerLite group.)
    if (SUBSCRIBE_MODE === 'mailerlite') {
      fetch(SUBSCRIBE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'fields[email]=' + encodeURIComponent(email) + '&ml-submit=1&anticsrf=true',
        mode: 'no-cors'
      }).then(function () { succeed(); })
        .catch(function () {
          goBtn.removeAttribute('disabled');
          noteEl.textContent = 'Hmm, that didn’t go through. One more try?';
        });
      return;
    }

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


/* ============================================================
   THE MIDDLE BAR — the inline ask, at the midpoint of the story.
   The popup is the last catch on the way out; this is the one that
   actually explains the offer. Both write the same DONE_KEY, so
   subscribing to either retires the other.
   ============================================================ */
(function () {
  if (!document.body.getAttribute('data-slug')) return;          // story pages only

  var DONE_KEY = 'eleanora_sub';
  try { if (localStorage.getItem(DONE_KEY)) return; } catch (e) {}

  var ENDPOINT = 'https://assets.mailerlite.com/jsonp/2518337/forms/193587317692172210/subscribe';
  // ↑ same list as the popup. Replace with the Threshold group's form URL.

  var article = document.querySelector('article.read');
  if (!article) return;

  var css = document.createElement('style');
  css.textContent =
    '.sub-bar{position:relative;max-width:660px;margin:clamp(64px,10vh,120px) auto;padding:clamp(28px,4vw,40px) clamp(24px,4vw,42px);' +
      'text-align:center;border:1px solid rgba(231,196,137,.28);' +
      'background:radial-gradient(120% 140% at 50% 0%,rgba(184,127,81,.14),transparent 70%),rgba(20,28,22,.5);}' +
    '.sub-bar .eye{font-size:10.5px;letter-spacing:3.2px;text-transform:uppercase;color:var(--gold,#e7c489);opacity:.9;margin-bottom:14px;}' +
    '.sub-bar h4{font-family:\'Didot\',\'Bodoni 72\',Georgia,serif;font-weight:400;font-size:clamp(24px,3.2vw,34px);' +
      'line-height:1.2;color:var(--cream,#f6f1e7);margin:0 0 14px;}' +
    '.sub-bar p{font-family:\'Iowan Old Style\',\'Charter\',\'Palatino Linotype\',Palatino,Georgia,serif;' +
      'font-size:16.5px;line-height:1.75;color:var(--read,#e6e1d2);max-width:46ch;margin:0 auto 22px;}' +
    '.sub-bar form{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}' +
    '.sub-bar input[type=email]{flex:1 1 240px;max-width:300px;background:rgba(10,15,11,.5);border:1px solid rgba(231,196,137,.3);' +
      'color:var(--cream,#f6f1e7);font-family:inherit;font-size:14px;padding:13px 15px;outline:none;}' +
    '.sub-bar input[type=email]:focus{border-color:var(--gold,#e7c489);}' +
    '.sub-bar input::placeholder{color:#9aa392;}' +
    '.sub-bar button{flex:0 0 auto;cursor:pointer;background:none;border:1px solid var(--gold,#e7c489);color:var(--gold,#e7c489);' +
      'font-family:inherit;font-size:11px;letter-spacing:2.4px;text-transform:uppercase;padding:13px 22px;transition:.3s;}' +
    '.sub-bar button:hover{background:var(--gold,#e7c489);color:#1c271f;}' +
    '.sub-bar .hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0;}' +
    '.sub-bar .note{font-size:12px;line-height:1.6;color:var(--sand,#e4d7be);opacity:.75;margin:14px 0 0;min-height:1px;}' +
    '.sub-bar .thanks{font-family:\'Iowan Old Style\',Georgia,serif;font-size:16.5px;line-height:1.8;color:var(--cream,#f6f1e7);margin:0;}' +
    '@media(max-width:520px){.sub-bar form{flex-direction:column;} .sub-bar input[type=email]{max-width:none;}}';
  document.head.appendChild(css);

  var bar = document.createElement('aside');
  bar.className = 'sub-bar reveal';
  bar.innerHTML =
    '<div class="eye">Leave the door open</div>' +
    '<h4>This is the edited version.</h4>' +
    '<p>What I’m reading. What I’m learning the hard way. Where I am, and what I’m building next. The thoughts that run too long for a page like this.</p>' +
    '<form novalidate>' +
      '<input type="text" class="hp" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<input type="email" name="email" placeholder="your email" required autocomplete="email" aria-label="Your email">' +
      '<button type="submit">Send me the long version</button>' +
    '</form>' +
    '<p class="note" aria-live="polite">Leave whenever you like.</p>';

  function paraAt(root, frac) {
    // the article's only child is usually the .prose block, so counting
    // article.children lands everything at the top. Count real paragraphs.
    var ps = root.querySelectorAll('.prose > p, .prose > div');
    if (!ps.length) return null;
    return ps[Math.min(ps.length - 1, Math.floor(ps.length * frac))];
  }
  var anchorP = paraAt(article, 0.5);
  if (anchorP && anchorP.parentNode) { anchorP.parentNode.insertBefore(bar, anchorP); }
  else { article.appendChild(bar); }

  var form = bar.querySelector('form');
  var emailEl = bar.querySelector('input[type=email]');
  var honeyEl = bar.querySelector('.hp');
  var noteEl = bar.querySelector('.note');
  var goBtn = bar.querySelector('button');

  function done() {
    try { localStorage.setItem(DONE_KEY, 'done'); } catch (e) {}
    bar.innerHTML = '<div class="eye">You’re in</div>' +
      '<p class="thanks">You’re on the list. The long version finds you first. <span style="color:var(--gold,#e7c489)">x</span></p>';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = (emailEl.value || '').trim();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      noteEl.textContent = 'That email looks off. Try again?'; emailEl.focus(); return;
    }
    if (honeyEl.value) { done(); return; }
    goBtn.setAttribute('disabled', 'disabled');
    noteEl.textContent = 'One second…';
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'fields[email]=' + encodeURIComponent(email) + '&ml-submit=1&anticsrf=true',
      mode: 'no-cors'
    }).then(done).catch(function () {
      goBtn.removeAttribute('disabled');
      noteEl.textContent = 'Hmm, that didn’t go through. One more try?';
    });
  });
})();
