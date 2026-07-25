/* CORRAO ELENA — portfolio runtime.
   One JSON drives the masthead, nav, grids, stats and contact.
   Edit assets/portfolio.json only. */
(function () {
  "use strict";

  var DATA = null;
  var page = document.body.getAttribute("data-page") || "index";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* ---------- reveal (with failsafe so content is never stuck hidden) ---------- */
  function armReveals() {
    var els = document.querySelectorAll(".reveal:not(.in)");
    if (!els.length) return;
    var revealAll = function () {
      els.forEach(function (el) { el.classList.add("in"); });
    };
    if (!("IntersectionObserver" in window)) { revealAll(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });
    setTimeout(revealAll, 1400);
  }

  /* ---------- masthead + nav ---------- */
  function isCurrent(item) {
    if (item.key === page) return true;
    if (item.children) {
      return item.children.some(function (c) { return c.key === page; });
    }
    return false;
  }

  function renderMasthead() {
    var d = DATA;
    document.querySelectorAll("[data-wordmark]").forEach(function (el) {
      el.textContent = d.model.name;
    });
    var host = document.querySelector("[data-nav]");
    if (!host) return;
    var navset = document.body.getAttribute("data-navset") === "work" && d.navWork ? d.navWork : d.nav;
    host.innerHTML = navset.map(function (item) {
      var cur = isCurrent(item) ? ' aria-current="page"' : "";
      var chev = item.children ? '<i class="chev" aria-hidden="true"></i>' : "";
      var sub = "";
      if (item.children) {
        sub = '<ul class="submenu">' + item.children.map(function (c) {
          var ccur = c.key === page ? ' aria-current="page"' : "";
          return '<li><a href="' + c.href + '"' + ccur + ">" + esc(c.label) + "</a></li>";
        }).join("") + "</ul>";
      }
      return '<span class="item"><a href="' + item.href + '"' + cur + ">" +
             esc(item.label) + chev + "</a>" + sub + "</span>";
    }).join("");

    // touch: first tap on a parent opens its submenu instead of navigating
    host.querySelectorAll(".item").forEach(function (item) {
      var link = item.querySelector("a");
      if (!item.querySelector(".submenu")) return;
      link.addEventListener("click", function (e) {
        if (window.matchMedia("(max-width:860px)").matches && !item.classList.contains("open")) {
          e.preventDefault();
          item.classList.add("open");
        }
      });
    });
  }

  /* ---------- grids ---------- */
  function imagesFor(key) {
    var cats = DATA.categories;
    if (key === "index") {
      // home shows the whole book, in category order
      return DATA.selectedOrder.reduce(function (acc, k) {
        return acc.concat((cats[k] && cats[k].images) || []);
      }, []);
    }
    return (cats[key] && cats[key].images) || [];
  }

  function renderGrid() {
    var host = document.querySelector("[data-grid]");
    if (!host) return;
    var key = host.getAttribute("data-grid");
    var cat = DATA.categories[key];

    var title = document.querySelector("[data-page-title]");
    if (title && cat) title.childNodes[0].nodeValue = cat.title;
    var sub = document.querySelector("[data-page-sub]");
    if (sub && cat) sub.textContent = cat.blurb || "";

    var imgs = imagesFor(key);
    if (!imgs.length) {
      host.className = "empty-room reveal";
      host.innerHTML = '<span class="lab">Curation in progress</span>' +
        "<p>This room is being hung. Selects are on the way.</p>";
      armReveals();
      return;
    }
    host.className = "grid";
    host.innerHTML = imgs.map(function (im) {
      var cap = im.caption ? "<figcaption>" + esc(im.caption) + "</figcaption>" : "";
      return '<figure class="shot reveal">' +
        '<img src="' + esc(im.src) + '" alt="' + esc(im.alt || "") + '" loading="lazy">' +
        cap + "</figure>";
    }).join("");
    armReveals();
  }

  /* ---------- about / contact ---------- */
  function renderStats() {
    var host = document.querySelector("[data-stats]");
    if (!host) return;
    var s = DATA.model.stats;
    var order = ["Height", "Bust", "Waist", "Hips", "Dress", "Shoe", "Hair", "Eyes"];
    host.innerHTML = order.map(function (k) {
      var v = s[k];
      var val = v ? esc(v) : "to confirm";
      var cls = v ? "" : ' class="tbd"';
      return '<div class="row"><dt>' + k + "</dt><dd" + cls + ">" + val + "</dd></div>";
    }).join("");
  }

  function renderContact() {
    var host = document.querySelector("[data-contact]");
    if (!host) return;
    var m = DATA.model;
    var rows = [];
    rows.push(row("For bookings & inquiries",
      m.email ? '<a href="mailto:' + esc(m.email) + '">' + esc(m.email) + "</a>"
              : '<span class="tbd-inline">[ booking email TBD ]</span>'));
    rows.push(row("Representation",
      '<span class="val">' + esc(m.representation || "Freelance") + "</span>"));
    rows.push(row("Instagram",
      m.instagram ? '<a href="' + esc(m.instagramUrl || "#") + '" target="_blank" rel="noopener">' + esc(m.instagram) + "</a>"
                  : '<span class="tbd-inline">[ handle TBD ]</span>'));
    if (m.location) rows.push(row("Based in", '<span class="val">' + esc(m.location) + "</span>"));
    host.innerHTML = rows.join("");
    function row(label, val) {
      return '<div class="contact-line"><span class="lab">' + label + "</span>" + val + "</div>";
    }
  }

  /* ---------- boot ---------- */
  fetch("assets/portfolio.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (json) {
      DATA = json;
      renderMasthead();
      renderGrid();
      renderStats();
      renderContact();
      armReveals();
    })
    .catch(function (err) {
      console.error("portfolio.json failed to load:", err);
      document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
    });
})();
