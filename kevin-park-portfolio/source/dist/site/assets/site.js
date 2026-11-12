/* Kevin Park portfolio runtime (English, ink ledger).
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
      var target = { rx: 0, ry: 0, mx: 30, my: 20 }, cur = { rx: 0, ry: 0, mx: 30, my: 20 }, vel = { rx: 0, ry: 0, mx: 0, my: 0 };
      var raf = null;
      /* A small damped spring, so the card keeps a little momentum and settles instead of snapping. */
      function step() {
        var stiff = 0.08, damp = 0.78, done = true;
        ["rx", "ry", "mx", "my"].forEach(function (p) {
          vel[p] = (vel[p] + (target[p] - cur[p]) * stiff) * damp;
          cur[p] += vel[p];
          if (Math.abs(target[p] - cur[p]) > 0.05 || Math.abs(vel[p]) > 0.05) done = false;
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
        target.ry = (x - 0.5) * 14;
        target.rx = (0.5 - y) * 10;
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

  /* ---------- light and dark ----------
     Light is the default. The boot script in <head> sets data-theme before paint (dark only when saved).
     The switch saves the choice and reveals the new theme in a circle growing from the button. */
  var THEME_KEY = "kp-theme";
  var THEME_COLOR = { light: "#FFFFFA", dark: "#0B0D14" };
  function theme() { return root.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
  function syncThemeUI() {
    var next = theme() === "light" ? "dark" : "light";
    var label = "Switch to " + next + " mode";
    document.querySelectorAll("[data-theme-toggle]").forEach(function (b) { b.setAttribute("aria-label", label); b.setAttribute("title", label); });
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_COLOR[theme()]);
  }
  function applyTheme(t, save) {
    root.setAttribute("data-theme", t);
    if (save) { try { localStorage.setItem(THEME_KEY, t); } catch (e) { /* private mode: the choice lasts this page */ } }
    syncThemeUI();
    document.dispatchEvent(new CustomEvent("kp:themechange", { detail: { theme: t } }));
  }
  function switchTheme(btn) {
    var next = theme() === "light" ? "dark" : "light";
    if (!document.startViewTransition || reduce.matches) { applyTheme(next, true); return; }
    var r = btn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    var radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    root.classList.add("is-theming");
    var vt = document.startViewTransition(function () { applyTheme(next, true); });
    vt.ready.then(function () {
      root.animate({ clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + radius + "px at " + x + "px " + y + "px)"] },
        { duration: 560, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" });
    }).catch(function () {});
    vt.finished.finally(function () { root.classList.remove("is-theming"); });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-theme-toggle]");
    if (b) switchTheme(b);
  });
  syncThemeUI();

  /* ---------- liquid glass nav ----------
     liquid-glass-js (MIT, vendor/liquid-glass-js-78cb6cc) refracts a one-time html2canvas snapshot of the page
     through a WebGL shader. It only runs where it can look right: static pages that do not change after load,
     a fine pointer, no reduced motion or transparency, WebGL, and a page short enough for one texture.
     Anywhere else, or after a resize makes the snapshot stale, the nav keeps its CSS blur. */
  function loadScript(src) {
    return new Promise(function (res, rej) { var s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  }
  function initGlass() {
    var nav = document.querySelector(".nav__inner");
    if (!nav || MODE === "spa" || document.querySelector(".fp")) return;
    if (reduce.matches || !finePointer.matches || window.matchMedia("(prefers-reduced-transparency: reduce)").matches) return;
    var probe = document.createElement("canvas").getContext("webgl");
    if (!probe || document.documentElement.scrollHeight > probe.getParameter(probe.MAX_TEXTURE_SIZE)) return;
    window.glassControls = { blurRadius: 10, edgeIntensity: 0.012, rimIntensity: 0.06, baseIntensity: 0.01, edgeDistance: 0.15, rimDistance: 0.8, baseDistance: 0.1, cornerBoost: 0.02, rippleEffect: 0.08 };
    loadScript("/assets/vendor/html2canvas.min.js")
      .then(function () { return loadScript("/assets/vendor/liquid-glass-container.js"); })
      .then(function () {
        if (typeof Container !== "function") return;
        nav.classList.add("glass-container");  /* keeps the nav itself out of the snapshot */
        var glass = new Container({ borderRadius: 12, type: "rounded", tintOpacity: 0.04 });
        glass.element = nav;
        glass.canvas.className = "nav__glass";
        glass.canvas.setAttribute("aria-hidden", "true");
        glass.canvas.style.boxShadow = "none";
        nav.prepend(glass.canvas);
        glass.updateSizeFromDOM();
        var check = setInterval(function () {
          if (!glass.webglInitialized) return;
          clearInterval(check);
          nav.classList.add("has-glass");
        }, 100);
        /* the snapshot shows the old theme after a switch, so fall back to the CSS nav */
        document.addEventListener("kp:themechange", function () { nav.classList.remove("has-glass"); });
        var w = window.innerWidth;
        window.addEventListener("resize", function () {
          if (window.innerWidth === w) return;
          nav.classList.remove("has-glass");  /* the snapshot no longer matches the layout */
        }, { passive: true });
      })
      .catch(function () { /* stay on the CSS nav */ });
  }
  function whenIdle(fn) {
    /* After the hero entrance has finished, so the snapshot shows the settled page. */
    var go = function () { setTimeout(function () { (window.requestIdleCallback || function (f) { setTimeout(f, 300); })(fn, { timeout: 2000 }); }, 900); };
    var ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    if (document.readyState === "complete") ready.then(go);
    else window.addEventListener("load", function () { ready.then(go); }, { once: true });
  }
  whenIdle(initGlass);

  /* ---------- Hairline figures ----------
     Each figure file ends by calling hairline({ name, means, range, tour, mount }). This is the page's side of that
     call: it finds the figure's slot, makes the stage the way the Hairline bench does, mounts the figure at its
     default strength, and plays its tour once when the figure first scrolls into view. */
  window.hairline = function (figure) {
    var HL = window.HL, host = document.querySelector('[data-figure="' + figure.name + '"]');
    if (!HL || !host || host.__hl) return;
    host.__hl = true;
    var stage = host.querySelector(".hl__stage"), out = host.querySelector(".hl__read");
    HL.inject(document);
    stage.setAttribute("data-hairline", figure.name);
    var svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
    var read = { get textContent() { return out.textContent; }, set textContent(v) { out.textContent = v == null ? "" : String(v); } };
    figure.mount({ stage: stage, svg: svg, read: read }, figure.range[1]);
    host.hidden = false;
    if (!figure.tour || reduce.matches || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      var lap = HL.tour(stage, figure.tour, function (i) { if (i === figure.tour.length - 1) lap.stop(); });
    }, { threshold: 0.6 });
    io.observe(stage);
  };

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

  /* ---------- nav: tools menu (disclosure) ---------- */
  function initTools() {
    var menus = document.querySelectorAll("[data-tools]");
    menus.forEach(function (m) {
      if (m.__on) return; m.__on = true;
      var btn = m.querySelector(".tools__btn"), panel = m.querySelector(".tools__panel");
      function set(open, focusBtn) {
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        panel.hidden = !open;
        if (!open && focusBtn) btn.focus();
      }
      btn.addEventListener("click", function () { set(btn.getAttribute("aria-expanded") !== "true"); });
      m.addEventListener("keydown", function (e) { if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") { e.preventDefault(); set(false, true); } });
      m.addEventListener("focusout", function (e) { if (e.relatedTarget && !m.contains(e.relatedTarget)) set(false); });
      document.addEventListener("click", function (e) { if (!m.contains(e.target)) set(false); });
      panel.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
    });
  }
  initTools();

  /* ---------- closing card: resume behind an email field, and a note to Kevin ----------
     Both forms post JSON to Formspree. The resume request sends the email and the page it came from;
     the note sends name, email, and message. The resume still downloads if Formspree is unreachable
     (the visitor did their part). A note that fails says so, because it did not arrive. */
  function initContact() {
    var KEY = "kp-resume", EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    function field(form, name) { return form.querySelector('[name="' + name + '"]'); }
    function say(form, key, tone) {
      var el = form.querySelector("[data-status]");
      el.textContent = key ? form.getAttribute("data-" + key) || "" : "";
      if (tone) el.setAttribute("data-tone", tone); else el.removeAttribute("data-tone");
    }
    function busy(form, on) {
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = on;
      if (on) btn.setAttribute("aria-busy", "true"); else btn.removeAttribute("aria-busy");
    }
    function post(form, payload) {
      var id = form.getAttribute("data-formspree");
      if (!id) return Promise.resolve({ ok: true });
      return fetch("https://formspree.io/f/" + encodeURIComponent(id), {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (res.ok) return { ok: true };
        return res.json().catch(function () { return {}; }).then(function (data) {
          var errs = (data && data.errors) || [];
          if (window.console) console.warn("Formspree", res.status, errs);
          return { ok: false, rejected: errs.some(function (x) { return x.field === "email"; }) };
        });
      }).catch(function (err) { if (window.console) console.warn("Formspree unreachable", err); return { ok: false }; });
    }
    function download(form) {
      var a = document.createElement("a");
      a.href = fileOf(form); a.download = form.getAttribute("data-name");
      document.body.appendChild(a); a.click(); a.remove();
    }
    function checkEmail(form) {
      var input = field(form, "email"), ok = EMAIL.test(input.value.trim());
      if (ok) input.removeAttribute("aria-invalid"); else input.setAttribute("aria-invalid", "true");
      return ok;
    }
    function fileOf(form) { return form.getAttribute("data-file") || window.KP_RESUME || ""; }  // the Artifact build inlines the PDF
    function unlock() {
      document.querySelectorAll("[data-resume] [data-again]").forEach(function (a) { a.href = fileOf(a.closest("form")); a.hidden = false; });
    }
    try { if (localStorage.getItem(KEY) === "1") unlock(); } catch (e) { /* fine */ }

    /* Work addresses only for the resume: personal and throwaway mail domains are turned away before anything is sent.
       This runs in the browser, so it filters honest visitors; it cannot prove the mailbox exists. */
    function isPersonal(form) {
      var domain = field(form, "email").value.trim().toLowerCase().split("@").pop();
      return (form.getAttribute("data-blocked") || "").split(" ").some(function (d) {
        return d && (domain === d || domain.slice(-d.length - 1) === "." + d);
      });
    }
    function sendResume(form) {
      if (!checkEmail(form)) { say(form, "invalid", "error"); field(form, "email").focus(); return; }
      if (isPersonal(form)) { field(form, "email").setAttribute("aria-invalid", "true"); say(form, "personal", "error"); field(form, "email").focus(); return; }
      if (field(form, "_gotcha").value) { say(form, "done"); return; }  // a bot filled the hidden field
      busy(form, true); say(form, "busy");
      post(form, { email: field(form, "email").value.trim(), request: "Resume", page: location.pathname + location.hash, _subject: field(form, "_subject").value })
        .then(function (r) {
          if (r.rejected) { field(form, "email").setAttribute("aria-invalid", "true"); say(form, "rejected", "error"); field(form, "email").focus(); return; }
          download(form); say(form, "done"); unlock();
          try { localStorage.setItem(KEY, "1"); } catch (e) { /* fine */ }
        }).then(function () { busy(form, false); });
    }
    function sendNote(form) {
      var name = field(form, "name"), msg = field(form, "message"), missing = null;
      [msg, name].forEach(function (el) {
        if (el.value.trim()) el.removeAttribute("aria-invalid"); else { el.setAttribute("aria-invalid", "true"); missing = el; }
      });
      var emailOk = checkEmail(form);
      if (missing) { say(form, "incomplete", "error"); missing.focus(); return; }
      if (!emailOk) { say(form, "invalid", "error"); field(form, "email").focus(); return; }
      if (field(form, "_gotcha").value) { say(form, "done"); return; }
      busy(form, true); say(form, "busy");
      post(form, { name: name.value.trim(), email: field(form, "email").value.trim(), message: msg.value.trim(), page: location.pathname + location.hash, _subject: field(form, "_subject").value + ": " + name.value.trim() })
        .then(function (r) {
          if (r.ok) { form.reset(); say(form, "done"); }
          else if (r.rejected) { field(form, "email").setAttribute("aria-invalid", "true"); say(form, "rejected", "error"); field(form, "email").focus(); }
          else say(form, "fail", "error");
        }).then(function () { busy(form, false); });
    }
    document.addEventListener("submit", function (e) {
      var form = e.target;
      if (!form.matches || !form.matches("[data-resume], [data-note]")) return;
      e.preventDefault();
      if (form.hasAttribute("data-resume")) sendResume(form); else sendNote(form);
    });
  }
  initContact();

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
