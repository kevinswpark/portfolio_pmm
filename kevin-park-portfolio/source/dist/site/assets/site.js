/* Kevin Park portfolio runtime (English, dark neon).
   static: one HTML file per route.  spa: all routes in one document with hash tokens (#home, #money-layer, #home.work). */
(function () {
  "use strict";
  var root = document.documentElement;
  var MODE = root.getAttribute("data-mode") || "static";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  /* ---------- hero card: tilt toward the pointer, lerped for a spring-like feel ---------- */
  function initTilt(scope) {
    var cards = (scope || document).querySelectorAll("[data-tilt]");
    cards.forEach(function (card) {
      if (card.__tilt) return;
      card.__tilt = true;
      var host = card.parentElement;
      var target = { rx: 0, ry: 0, mx: 30, my: 20 }, cur = { rx: 0, ry: 0, mx: 30, my: 20 };
      var raf = null;
      function step() {
        var k = 0.14, done = true;
        ["rx", "ry", "mx", "my"].forEach(function (p) {
          cur[p] += (target[p] - cur[p]) * k;
          if (Math.abs(target[p] - cur[p]) > 0.05) done = false;
        });
        card.style.setProperty("--rx", cur.rx.toFixed(2) + "deg");
        card.style.setProperty("--ry", cur.ry.toFixed(2) + "deg");
        card.style.setProperty("--mx", cur.mx.toFixed(1) + "%");
        card.style.setProperty("--my", cur.my.toFixed(1) + "%");
        raf = done ? null : requestAnimationFrame(step);
      }
      function kick() { if (!raf) raf = requestAnimationFrame(step); }
      host.addEventListener("pointerenter", function () {
        if (reduce.matches || !finePointer.matches) return;
        card.classList.add("is-tracking");
      });
      host.addEventListener("pointermove", function (e) {
        if (reduce.matches || !finePointer.matches) return;
        var r = host.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        target.ry = (x - 0.5) * 22;
        target.rx = (0.5 - y) * 16;
        target.mx = x * 100;
        target.my = y * 100;
        kick();
      });
      host.addEventListener("pointerleave", function () {
        target.rx = 0; target.ry = 0; target.mx = 30; target.my = 20;
        card.classList.remove("is-tracking");
        kick();
      });
    });
  }

  /* ---------- zoom view for diagrams ---------- */
  var dlg = document.getElementById("zoom"), lastTrigger = null;
  if (dlg) {
    document.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-zoom]");
      if (!b) return;
      var fig = b.closest("figure");
      var panel = fig.querySelector(".panel");
      var clone = panel.cloneNode(true);
      var zb = clone.querySelector("[data-zoom]"); if (zb) zb.remove();
      clone.querySelectorAll("[id]").forEach(function (n) { n.removeAttribute("id"); });
      dlg.querySelector(".zoom__body").replaceChildren(clone);
      dlg.querySelector(".zoom__title").textContent = fig.getAttribute("data-title") || "";
      var r = b.getBoundingClientRect();
      dlg.style.setProperty("--zx", Math.round(((r.left + r.width / 2) / window.innerWidth) * 100) + "%");
      dlg.style.setProperty("--zy", Math.round(((r.top + r.height / 2) / window.innerHeight) * 100) + "%");
      lastTrigger = b;
      dlg.showModal();
    });
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg || (e.target.closest && e.target.closest(".zoom__close"))) dlg.close();
    });
    dlg.addEventListener("close", function () { if (lastTrigger) lastTrigger.focus(); });
  }

  /* ---------- section rail ---------- */
  function initRail(scope) {
    var rail = (scope || document).querySelector(".rail");
    if (!rail || rail.__on || !("IntersectionObserver" in window)) return;
    rail.__on = true;
    var links = rail.querySelectorAll("a[data-target]"), map = {};
    links.forEach(function (a) { map[a.getAttribute("data-target")] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute("aria-current"); });
        if (map[en.target.id]) map[en.target.id].setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }

  if (MODE !== "spa") { initTilt(document); initRail(document); return; }

  /* ---------- spa router (Artifact build) ---------- */
  var views = Array.prototype.slice.call(document.querySelectorAll("[data-view]"));
  var names = {};
  views.forEach(function (v) { names[v.getAttribute("data-view")] = v; });

  function parse(hash) {
    var h = (hash || "").replace(/^#/, "");
    if (!h) return { view: "home", section: null };
    var dot = h.indexOf(".");
    var v = dot === -1 ? h : h.slice(0, dot);
    var s = dot === -1 ? null : h.slice(dot + 1);
    if (!names[v]) return { view: "404", section: null };
    return { view: v, section: s };
  }

  var current = null;
  function show(route, initial) {
    var next = names[route.view];
    var changed = next !== current;
    function swap() {
      views.forEach(function (v) { v.hidden = v !== next; });
      document.title = next.getAttribute("data-title");
      current = next;
      if (route.section) {
        var el = document.getElementById(route.view + "--" + route.section);
        if (el) {
          el.scrollIntoView({ block: "start", behavior: changed || reduce.matches ? "auto" : "smooth" });
          if (!initial && el.hasAttribute("tabindex")) el.focus({ preventScroll: true });
        }
      } else if (changed) {
        window.scrollTo(0, 0);
      }
      if (!initial && changed && !route.section) {
        var h1 = next.querySelector("h1");
        if (h1) h1.focus({ preventScroll: true });
      }
      initTilt(next);
      initRail(next);
    }
    if (!initial && changed && document.startViewTransition && !reduce.matches) document.startViewTransition(swap);
    else swap();
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (a && a.getAttribute("href") === location.hash) { e.preventDefault(); show(parse(location.hash), false); }
  });
  window.addEventListener("hashchange", function () { show(parse(location.hash), false); });
  show(parse(location.hash), true);
})();
