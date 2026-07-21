/* mobile-nav.js — shared phone menu for corraoelena.com
   The site hides the desktop nav (`nav ul{display:none}`) below 900px with no
   replacement, so phones had no navigation. This injects a hamburger toggle +
   an on-brand full-screen menu, built from the footer nav links so it always
   matches. One <script src> include per page; no markup edits needed.
   Dark-cinematic brand: deep green-black bg, cream links, gold accent. */
(function () {
  if (window.matchMedia && !window.matchMedia('(max-width:900px)').matches) {
    // Still install for orientation/resize into mobile; cheap, so proceed.
  }
  var header = document.querySelector('header');
  if (!header || document.getElementById('mnav-toggle')) return;

  // --- gather links: mirror the TOP nav exactly — top-level items only, no
  //     submenu children, no footer extras. `> a` skips the dropdown anchors. ---
  function gather() {
    var out = [];
    var srcs = document.querySelectorAll('header nav > ul > li > a');
    srcs.forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var text = (a.textContent || '').trim();
      if (!text) return;
      if (href === '#' || href === '') return;              // dead Instagram placeholder
      if (out.some(function (o) { return o.text.toLowerCase() === text.toLowerCase(); })) return;
      out.push({ href: href, text: text });
    });
    if (!out.length) {
      out = [['Gallery','gallery.html'],['Prints','prints.html'],['Journal','journal.html'],
             ['Portfolio','portfolio.html'],['About Me','about.html']]
        .map(function (p) { return { text: p[0], href: p[1] }; });
    }
    return out;
  }

  var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  // --- styles ---
  var css = document.createElement('style');
  css.id = 'mnav-style';
  css.textContent = [
    '#mnav-toggle{display:none;position:relative;z-index:60;width:46px;height:46px;margin:-6px -8px -6px 0;',
      'background:none;border:0;cursor:pointer;align-items:center;justify-content:center;flex:0 0 auto;}',
    '#mnav-toggle .bars,#mnav-toggle .bars::before,#mnav-toggle .bars::after{content:"";display:block;',
      'width:26px;height:2px;background:var(--cream,#F6F1E7);border-radius:2px;transition:transform .35s cubic-bezier(.16,1,.3,1),opacity .2s;}',
    '#mnav-toggle .bars{position:relative;}',
    '#mnav-toggle .bars::before{position:absolute;top:-8px;left:0;}',
    '#mnav-toggle .bars::after{position:absolute;top:8px;left:0;}',
    'body.mnav-open #mnav-toggle .bars{background:transparent;}',
    'body.mnav-open #mnav-toggle .bars::before{transform:translateY(8px) rotate(45deg);}',
    'body.mnav-open #mnav-toggle .bars::after{transform:translateY(-8px) rotate(-45deg);}',
    '@media(max-width:900px){#mnav-toggle{display:flex;}}',
    // panel
    '#mnav-panel{position:fixed;inset:0;z-index:1000;display:flex;flex-direction:column;',
      'align-items:center;justify-content:center;gap:6px;padding:80px 24px 40px;',
      'background:rgba(9,15,11,.97);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);',
      'opacity:0;visibility:hidden;pointer-events:none;transition:opacity .4s cubic-bezier(.16,1,.3,1),visibility .4s;}',
    'body.mnav-open #mnav-panel{opacity:1;visibility:visible;pointer-events:auto;}',
    '#mnav-panel .mnav-seal{width:58px;height:58px;margin-bottom:14px;opacity:.92;',
      'transform:translateY(10px);transition:transform .5s .05s cubic-bezier(.16,1,.3,1);}',
    'body.mnav-open #mnav-panel .mnav-seal{transform:none;}',
    '#mnav-panel .mnav-seal-link{padding:0;min-height:0;display:block;}',
    '#mnav-panel a{font-family:"Didot","Bodoni 72",Georgia,serif;font-size:28px;letter-spacing:.02em;',
      'color:var(--cream,#F6F1E7);text-decoration:none;padding:14px 18px;min-height:44px;',
      'display:flex;align-items:center;line-height:1;position:relative;',
      'opacity:0;transform:translateY(14px);transition:opacity .5s var(--d,0s),transform .5s cubic-bezier(.16,1,.3,1) var(--d,0s);}',
    'body.mnav-open #mnav-panel a{opacity:1;transform:none;}',
    '#mnav-panel a[aria-current="page"]{color:var(--sir-gold,#E7C489);}',
    '#mnav-panel a[aria-current="page"]::after{content:"";position:absolute;left:18px;right:18px;bottom:6px;',
      'height:1px;background:var(--sir-gold,#E7C489);opacity:.7;}',
    '#mnav-close{position:absolute;top:20px;right:20px;width:46px;height:46px;border:0;background:none;',
      'cursor:pointer;color:var(--cream,#F6F1E7);font-size:30px;line-height:1;opacity:.85;}',
    '@media(prefers-reduced-motion:reduce){',
      '#mnav-panel,#mnav-panel a,#mnav-panel .mnav-seal,#mnav-toggle .bars,',
      '#mnav-toggle .bars::before,#mnav-toggle .bars::after{transition-duration:.001ms!important;}}'
  ].join('');
  document.head.appendChild(css);

  // --- toggle button ---
  var btn = document.createElement('button');
  btn.id = 'mnav-toggle';
  btn.setAttribute('aria-label', 'Open menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'mnav-panel');
  btn.innerHTML = '<span class="bars" aria-hidden="true"></span>';
  header.appendChild(btn);

  // --- panel ---
  var panel = document.createElement('nav');
  panel.id = 'mnav-panel';
  panel.setAttribute('aria-label', 'Site menu');
  var sealSrc = (document.querySelector('.brand img') || {}).getAttribute
    ? document.querySelector('.brand img').getAttribute('src') : null;
  var html = '<button id="mnav-close" aria-label="Close menu">&times;</button>';
  if (sealSrc) html += '<a class="mnav-seal-link" href="index.html" aria-label="Eleanora — home">' +
    '<img class="mnav-seal" src="' + sealSrc + '" alt=""></a>';
  gather().forEach(function (l, i) {
    var cur = l.href.toLowerCase().indexOf(here) === 0 && here !== 'index.html' ||
              (here === 'index.html' && (l.href === 'index.html' || l.href === '#top' || l.href === '/'));
    html += '<a href="' + l.href + '" style="--d:' + (0.08 + i * 0.05).toFixed(2) + 's"' +
            (cur ? ' aria-current="page"' : '') + '>' + l.text + '</a>';
  });
  panel.innerHTML = html;
  document.body.appendChild(panel);

  // --- behavior ---
  var lastFocus = null;
  function open() {
    lastFocus = document.activeElement;
    document.body.classList.add('mnav-open');
    document.body.style.overflow = 'hidden';
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close menu');
    var first = panel.querySelector('#mnav-close');
    if (first) first.focus();
  }
  function close() {
    document.body.classList.remove('mnav-open');
    document.body.style.overflow = '';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open menu');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  btn.addEventListener('click', function () {
    document.body.classList.contains('mnav-open') ? close() : open();
  });
  panel.querySelector('#mnav-close').addEventListener('click', close);
  panel.addEventListener('click', function (e) {
    if (e.target.closest('a')) close();                  // navigating away (incl. seal → home)
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('mnav-open')) close();
  });
})();
