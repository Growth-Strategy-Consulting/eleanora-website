/* cart.js — Eleanora postcard cart (front-end only, no checkout engine yet)
   A real, working cart for the Postcards experience: a bag in the nav (next to
   About), add-to-cart from the postcard lightbox, a slide-out drawer that lists
   your picks and tallies the mix-and-match tier price. State lives in
   localStorage so it survives moving between collection pages.

   Checkout is intentionally NOT wired — the button shows an honest "coming soon"
   state. Payment gets plugged in (Shopify Buy Button / Snipcart) once the store
   account exists. Pricing tiers are the locked postcard-shop-spec numbers.
   Dark-cinematic brand: green-black bg, cream ink, gold (--sir-gold) accent. */
(function () {
  if (window.EleanoraCart) return;
  var KEY = 'eleanora_cart';
  var GOLD = 'var(--sir-gold,#E7C489)';

  // ---- pricing: tier-that-holds, by total quantity (locked spec) ----
  var TIERS = [{min:10,price:5.00},{min:5,price:5.60},{min:3,price:6.00},{min:1,price:7.00}];
  function perCard(q){ for (var i=0;i<TIERS.length;i++){ if (q>=TIERS[i].min) return TIERS[i].price; } return 7.00; }
  function money(n){ return '$' + (Math.round(n*100)/100).toFixed(2).replace(/\.00$/,''); }
  function nextTier(q){
    if (q<3)  return {need:3-q,  price:6.00};
    if (q<5)  return {need:5-q,  price:5.60};
    if (q<10) return {need:10-q, price:5.00};
    return null;
  }

  // ---- state ----
  function load(){ try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch(e){ return {}; } }
  function save(c){ localStorage.setItem(KEY, JSON.stringify(c)); }
  var cart = load();
  function totalQty(){ var n=0; for (var k in cart) n += cart[k].qty; return n; }

  // ---- styles ----
  var css = document.createElement('style');
  css.id = 'cart-style';
  css.textContent = [
    'header nav{display:flex;align-items:center;gap:28px;margin-left:auto;}',
    // bag button in nav
    '#cart-btn{position:relative;display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;',
      'background:none;border:0;cursor:pointer;color:var(--cream,#F6F1E7);flex:0 0 auto;padding:0;}',
    '#cart-btn svg{width:23px;height:23px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;}',
    '#cart-btn .cc{position:absolute;top:-3px;right:-4px;min-width:17px;height:17px;padding:0 4px;border-radius:9px;',
      'background:'+GOLD+';color:#20160c;font-family:Georgia,serif;font-size:10.5px;font-weight:700;line-height:17px;',
      'text-align:center;opacity:0;transform:scale(.4);transition:opacity .3s,transform .35s cubic-bezier(.16,1,.3,1);}',
    '#cart-btn.has .cc{opacity:1;transform:scale(1);}',
    '#cart-btn.bump .cc{animation:cartbump .5s cubic-bezier(.16,1,.3,1);}',
    '@keyframes cartbump{0%{transform:scale(1);}35%{transform:scale(1.45);}100%{transform:scale(1);}}',
    // backdrop + drawer
    '#cart-back{position:fixed;inset:0;z-index:1290;background:rgba(6,9,7,.62);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);',
      'opacity:0;visibility:hidden;transition:opacity .4s,visibility .4s;}',
    'body.cart-open #cart-back{opacity:1;visibility:visible;}',
    '#cart-draw{position:fixed;top:0;right:0;bottom:0;z-index:1300;width:min(400px,90vw);display:flex;flex-direction:column;',
      'background:#0e140f;color:var(--cream,#F6F1E7);box-shadow:-30px 0 80px -30px rgba(0,0,0,.8);',
      'transform:translateX(100%);transition:transform .44s cubic-bezier(.16,1,.3,1);}',
    'body.cart-open #cart-draw{transform:none;}',
    '#cart-draw .ch{display:flex;align-items:center;justify-content:space-between;padding:26px 26px 18px;',
      'border-bottom:1px solid rgba(231,196,137,.16);}',
    '#cart-draw .ch h3{font-family:"Didot","Bodoni 72",Georgia,serif;font-weight:400;font-size:24px;letter-spacing:.3px;}',
    '#cart-draw .cx{width:34px;height:34px;border:0;background:none;color:var(--cream,#F6F1E7);font-size:26px;line-height:1;cursor:pointer;opacity:.8;}',
    '#cart-draw .cx:hover{opacity:1;}',
    '#cart-items{flex:1 1 auto;overflow-y:auto;padding:6px 26px;}',
    '#cart-items .empty{padding:60px 8px;text-align:center;color:#a9b19d;font-size:14px;line-height:1.7;}',
    '#cart-items .row{display:flex;gap:14px;align-items:center;padding:16px 0;border-bottom:1px solid rgba(255,255,255,.06);}',
    '#cart-items .row img{width:52px;height:52px;object-fit:cover;flex:0 0 auto;background:#12180f;}',
    '#cart-items .row .nm{flex:1 1 auto;min-width:0;font-family:"Didot","Bodoni 72",Georgia,serif;font-size:15.5px;line-height:1.2;}',
    '#cart-items .row .stp{display:flex;align-items:center;gap:9px;flex:0 0 auto;}',
    '#cart-items .row .stp button{width:24px;height:24px;border:1px solid rgba(231,196,137,.4);background:none;color:var(--cream,#F6F1E7);',
      'border-radius:50%;font-size:15px;line-height:1;cursor:pointer;transition:.25s;}',
    '#cart-items .row .stp button:hover{border-color:'+GOLD+';color:'+GOLD+';}',
    '#cart-items .row .stp .q{min-width:16px;text-align:center;font-size:14px;font-variant-numeric:tabular-nums;}',
    '#cart-items .row .rm{flex:0 0 auto;border:0;background:none;color:#7c8479;font-size:12px;letter-spacing:1px;cursor:pointer;text-transform:uppercase;}',
    '#cart-items .row .rm:hover{color:#d98a8a;}',
    '#cart-foot{flex:0 0 auto;padding:20px 26px 26px;border-top:1px solid rgba(231,196,137,.16);}',
    '#cart-foot .nudge{font-size:12.5px;letter-spacing:.3px;color:'+GOLD+';margin-bottom:14px;min-height:16px;}',
    '#cart-foot .sum{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:4px;}',
    '#cart-foot .sum .lab{font-size:13px;color:#a9b19d;}',
    '#cart-foot .sum .tot{font-family:"Didot","Bodoni 72",Georgia,serif;font-size:30px;}',
    '#cart-foot .fine{font-size:11.5px;color:#7c8479;margin-bottom:16px;}',
    '#cart-foot .co{display:block;width:100%;padding:15px;border:0;border-radius:3px;background:'+GOLD+';color:#20160c;',
      'font-size:12px;letter-spacing:2.5px;text-transform:uppercase;cursor:pointer;transition:.3s;}',
    '#cart-foot .co:hover{background:#f0d69a;}',
    '#cart-foot .co[disabled]{background:rgba(231,196,137,.22);color:#c9b48b;cursor:default;}',
    '#cart-foot .soon{font-size:11.5px;color:#a9b19d;text-align:center;margin-top:11px;line-height:1.5;}',
    // lightbox add-to-cart button (used on collection.html)
    '.lbadd{display:inline-block;width:100%;padding:14px;margin-top:6px;border:0;border-radius:3px;background:'+GOLD+';',
      'color:#20160c;font-size:12px;letter-spacing:2.5px;text-transform:uppercase;cursor:pointer;transition:.3s;}',
    '.lbadd:hover{background:#f0d69a;}',
    '.lbadd.added{background:transparent;color:'+GOLD+';box-shadow:inset 0 0 0 1px '+GOLD+';}',
    '@media(prefers-reduced-motion:reduce){#cart-back,#cart-draw,#cart-btn .cc{transition-duration:.001ms!important;}',
      '#cart-btn.bump .cc{animation:none!important;}}'
  ].join('');
  document.head.appendChild(css);

  // ---- bag button in the nav ----
  var nav = document.querySelector('header nav') || document.querySelector('header');
  var btn = document.createElement('button');
  btn.id = 'cart-btn';
  btn.setAttribute('aria-label', 'Open cart');
  btn.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 8h11l-1 11.2a1.5 1.5 0 0 1-1.5 1.3H9a1.5 1.5 0 0 1-1.5-1.3L6.5 8z"/>' +
      '<path d="M9 8.5V6.5a3 3 0 0 1 6 0v2"/></svg><span class="cc">0</span>';
  nav.appendChild(btn);

  // ---- drawer ----
  var back = document.createElement('div'); back.id = 'cart-back';
  var draw = document.createElement('aside'); draw.id = 'cart-draw';
  draw.setAttribute('aria-label', 'Your postcards');
  draw.innerHTML =
    '<div class="ch"><h3>Your postcards</h3><button class="cx" aria-label="Close cart">&times;</button></div>' +
    '<div id="cart-items"></div>' +
    '<div id="cart-foot">' +
      '<div class="nudge" id="cart-nudge"></div>' +
      '<div class="sum"><span class="lab" id="cart-per"></span><span class="tot" id="cart-tot">$0</span></div>' +
      '<div class="fine">Shipping &amp; tax calculated at checkout.</div>' +
      '<button class="co" id="cart-co">Checkout</button>' +
      '<div class="soon" id="cart-soon"></div>' +
    '</div>';
  document.body.appendChild(back);
  document.body.appendChild(draw);

  var elItems = draw.querySelector('#cart-items');
  var elPer = draw.querySelector('#cart-per');
  var elTot = draw.querySelector('#cart-tot');
  var elNudge = draw.querySelector('#cart-nudge');
  var elCo = draw.querySelector('#cart-co');
  var elSoon = draw.querySelector('#cart-soon');

  // ---- render ----
  function render(){
    var q = totalQty();
    btn.classList.toggle('has', q>0);
    btn.querySelector('.cc').textContent = q;

    var keys = Object.keys(cart);
    if (!keys.length){
      elItems.innerHTML = '<div class="empty">No postcards yet.<br>Tap any card, then add it here.</div>';
      elNudge.textContent = ''; elPer.textContent = ''; elTot.textContent = '$0';
      elCo.setAttribute('disabled',''); elSoon.textContent = '';
      return;
    }
    var html = '';
    keys.forEach(function(k){
      var it = cart[k];
      html += '<div class="row" data-src="'+k+'">' +
        '<img src="'+it.src+'" alt="">' +
        '<span class="nm">'+it.title+'</span>' +
        '<span class="stp"><button class="minus" aria-label="One fewer">&minus;</button>' +
          '<span class="q">'+it.qty+'</span>' +
          '<button class="plus" aria-label="One more">+</button></span>' +
        '<button class="rm" aria-label="Remove">remove</button>' +
      '</div>';
    });
    elItems.innerHTML = html;

    var pc = perCard(q);
    elPer.textContent = q + (q===1?' postcard · ':' postcards · ') + money(pc) + ' each';
    elTot.textContent = money(q*pc);
    var nt = nextTier(q);
    elNudge.textContent = nt ? ('Add ' + nt.need + ' more to drop to ' + money(nt.price) + ' each') : 'Best price unlocked ✨';
    elCo.removeAttribute('disabled');
    elSoon.textContent = '';
  }

  // ---- mutations ----
  function add(photo){
    if (!photo || !photo.src) return;
    var k = photo.src;
    if (cart[k]) cart[k].qty += 1;
    else cart[k] = { src: photo.src, title: photo.title || 'Postcard', qty: 1 };
    save(cart); render();
    btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump');
  }
  function setQty(k, d){
    if (!cart[k]) return;
    cart[k].qty += d;
    if (cart[k].qty <= 0) delete cart[k];
    save(cart); render();
  }
  function removeItem(k){ delete cart[k]; save(cart); render(); }

  // ---- open / close ----
  function open(){ document.body.classList.add('cart-open'); back.offsetWidth; }
  function close(){ document.body.classList.remove('cart-open'); }
  btn.addEventListener('click', function(){ document.body.classList.contains('cart-open') ? close() : open(); render(); });
  draw.querySelector('.cx').addEventListener('click', close);
  back.addEventListener('click', close);
  document.addEventListener('keydown', function(e){ if (e.key==='Escape' && document.body.classList.contains('cart-open')) close(); });

  elItems.addEventListener('click', function(e){
    var row = e.target.closest('.row'); if (!row) return;
    var k = row.getAttribute('data-src');
    if (e.target.closest('.plus')) setQty(k, 1);
    else if (e.target.closest('.minus')) setQty(k, -1);
    else if (e.target.closest('.rm')) removeItem(k);
  });

  // honest checkout state — no payment engine wired yet
  elCo.addEventListener('click', function(){
    elSoon.textContent = 'Secure checkout is being set up — you’ll complete your order here soon.';
  });

  // ---- public API (the lightbox calls this) ----
  window.EleanoraCart = { add: add, open: open, count: totalQty };
  render();
})();
