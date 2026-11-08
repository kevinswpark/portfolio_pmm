/* Financial planner (/tools/financial-planner/).
   Everything runs in the browser. Answers are kept in localStorage on this device only.
   The email gate posts the email address (and nothing else) to Formspree when a form ID is set,
   then builds the PDF with jsPDF from the answers in memory. */
(function () {
  "use strict";
  var root = document.querySelector("[data-fp]");
  var cfgEl = document.getElementById("fp-config");
  if (!root || !cfgEl) return;
  var cfg = JSON.parse(cfgEl.textContent);
  var D = cfg.data, STEPS = cfg.steps, COPY = cfg.copy, Q = cfg.q;
  var page = root.closest("main") || document.body;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var KEY = "kp-planner-v1";
  page.classList.add("js-fp");

  /* ---------- helpers ---------- */
  var $ = function (sel, el) { return (el || root).querySelector(sel); };
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || root).querySelectorAll(sel)); };
  var usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  function money(n) { return usd.format(Math.round(n || 0)); }
  function num(v) { var n = parseFloat(String(v == null ? "" : v).replace(/[^0-9.]/g, "")); return isFinite(n) ? n : 0; }
  function pct(n) { return Math.round(n) + "%"; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function monthYear(monthsAhead) {
    var d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + monthsAhead);
    return MONTHS[d.getMonth()] + " " + d.getFullYear();
  }
  function today() { var d = new Date(); return MONTHS[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear(); }

  /* ---------- state ---------- */
  function fresh() { return { step: STEPS[0], furthest: 0, v: {}, goals: [], split: null, tierManual: false }; }
  var S = fresh();
  try { var saved = JSON.parse(localStorage.getItem(KEY) || "null"); if (saved && saved.v) S = Object.assign(fresh(), saved); } catch (e) { /* storage off: start fresh */ }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* private mode: keep going in memory */ } }

  /* ---------- ZIP to cost of living ---------- */
  var COL = null;
  function col() {
    if (COL || !window.KP_COL) return COL;
    var starts = [], areas = [], z = 0;
    window.KP_COL.runs.split(" ").forEach(function (r) {
      var p = r.split("."); z += parseInt(p[0], 36); starts.push(z); areas.push(parseInt(p[1], 36));
    });
    COL = { starts: starts, areas: areas, names: window.KP_COL.areas };
    return COL;
  }
  function lookupZip(zip) {
    var c = col(); if (!c || !/^\d{5}$/.test(zip)) return null;
    var z = parseInt(zip, 10), lo = 0, hi = c.starts.length - 1, best = -1;
    if (z < c.starts[0] || z > 99950) return null;
    while (lo <= hi) { var mid = (lo + hi) >> 1; if (c.starts[mid] <= z) { best = mid; lo = mid + 1; } else hi = mid - 1; }
    if (best < 0) return null;
    var a = c.names[c.areas[best]];
    return { name: a[0], rpp: a[1] };
  }
  function tierFor(rpp) { return rpp >= D.tiers.high ? "high" : rpp < D.tiers.low ? "low" : "mid"; }
  var TIER_WORD = { high: "higher-cost", mid: "medium-cost", low: "lower-cost" };

  /* ---------- the model ---------- */
  function matchAt(opt, c) {
    switch (opt) {
      case "safe": return Math.min(c, 3) + Math.max(0, Math.min(c, 5) - 3) * 0.5;
      case "half6": return 0.5 * Math.min(c, 6);
      case "full4": return Math.min(c, 4);
      case "full5": return Math.min(c, 5);
      case "full6": return Math.min(c, 6);
      default: return 0;
    }
  }
  function matchOpt(v) { for (var i = 0; i < Q.match_opts.length; i++) if (Q.match_opts[i][0] === v) return Q.match_opts[i]; return null; }

  function model() {
    var v = S.v, m = {};
    m.th = num(v.take_home);
    m.grossGiven = num(v.gross) > 0;
    m.gross = m.grossGiven ? num(v.gross) : m.th * 12 / 0.72;   // rough: take-home is about 72% of gross
    m.filing = v.filing === "joint" ? "joint" : "single";
    m.area = lookupZip(String(v.zip || ""));
    m.autoTier = m.area ? tierFor(m.area.rpp) : null;
    m.tier = v.tier || m.autoTier || "mid";
    m.defaultSplit = D.splits[m.tier];
    m.split = S.split || m.defaultSplit;
    m.needsB = m.th * m.split[0] / 100; m.wantsB = m.th * m.split[1] / 100; m.saveB = m.th * m.split[2] / 100;

    m.bills = {}; m.billsTotal = 0;
    Q.bill_rows.forEach(function (r) { var n = num(v["b_" + r[0]]); m.bills[r[0]] = n; m.billsTotal += n; });
    m.billsKnown = m.billsTotal > 0;
    m.essentials = m.billsKnown ? m.billsTotal : m.th * 0.5;
    var biggest = null;
    Q.bill_rows.forEach(function (r) { if (!biggest || m.bills[r[0]] > m.bills[biggest[0]]) biggest = r; });
    m.biggest = biggest && m.bills[biggest[0]] > 0 ? { name: biggest[1], amount: m.bills[biggest[0]] } : null;
    m.cardBal = v.card === "yes" ? num(v.card_balance) : 0;
    m.cardApr = num(v.card_apr);
    m.highDebt = m.cardBal > 0 && (m.cardApr >= D.high_apr || !v.card_apr);

    var months = v.incomes === "2" ? 3 : 4;
    if (v.dependents === "yes") months += 2;
    if (v.own === "yes") months += 1;
    if (v.pay_type === "variable") months += 3; else if (v.pay_type === "hourly") months += 1;
    if (v.risk_job === "yes") months += 3;
    m.months = clamp(months, 3, 12);
    m.target = Math.round(m.months * m.essentials / 100) * 100;
    m.starter = Math.max(1000, Math.round(m.essentials / 100) * 100);
    m.saved = num(v.saved);
    m.suggestMonthly = Math.max(25, Math.round(m.saveB * 0.5 / 10) * 10);
    m.monthly = v.monthly_save != null && v.monthly_save !== "" ? num(v.monthly_save) : m.suggestMonthly;
    m.efundLeft = Math.max(0, m.target - m.saved);
    m.efundMonths = m.monthly > 0 ? Math.ceil(m.efundLeft / m.monthly) : null;
    m.starterMet = m.saved >= m.starter;
    m.efundMet = m.target > 0 && m.saved >= m.target;

    var now = new Date(), y = now.getFullYear();
    m.goals = S.goals.map(function (g) {
      var monthsLeft = Math.max(1, (num(g.year) - y) * 12 - now.getMonth());
      var left = Math.max(0, num(g.amount) - num(g.saved));
      var yrs = monthsLeft / 12;
      var where = yrs < 3 ? "a high-yield savings account or CDs" : yrs < 5 ? "mostly cash and bonds" : yrs < 10 ? "a stock and bond mix that fits your risk profile" : "investments that match your risk profile";
      return { type: g.type, amount: num(g.amount), year: g.year, monthly: left / monthsLeft, where: where, monthsLeft: monthsLeft };
    }).filter(function (g) { return g.amount > 0; });
    m.goalsMonthly = m.goals.reduce(function (a, g) { return a + g.monthly; }, 0);

    var r = [1, 2, 3, 4, 5].map(function (i) { return num(v["r" + i]); });
    m.riskDone = r.every(function (x) { return x > 0; });
    if (m.riskDone) {
      var cap = (r[0] + r[1]) / 2, will = (r[2] + r[3] + r[4]) / 3, sc = Math.min(cap, will);
      m.profile = sc < 1.75 ? "Conservative" : sc < 2.5 ? "Moderate" : sc < 3.25 ? "Growth" : "Aggressive";
      m.mix = D.mix[m.profile];
      m.capLower = cap < will;
    }

    m.hasPlan = v.plan_offered === "yes";
    var mo = matchOpt(v.match);
    m.matchKnown = m.hasPlan && mo && mo[0] !== "none" && mo[0] !== "unsure";
    m.matchThreshold = m.matchKnown ? mo[2] : 0;
    m.matchMax = m.matchKnown ? mo[3] : 0;
    m.matchLabel = mo ? mo[1] : "";
    m.contrib = num(v.contrib);
    m.matchNow = m.matchKnown ? matchAt(mo[0], m.contrib) : 0;
    m.matchGetting = m.gross * m.matchNow / 100;
    m.matchMissing = m.matchKnown ? m.gross * (m.matchMax - m.matchNow) / 100 : 0;
    m.matchMet = m.matchKnown && m.contrib >= m.matchThreshold;
    m.vestWait = m.hasPlan && (v.vesting === "cliff" || v.vesting === "graded");
    m.hsa = v.hsa === "yes";
    m.roth401k = v.roth401k === "yes";

    var taxable = m.gross - D.std_deduction[m.filing];
    m.highBracket = taxable > D.bracket_24[m.filing];
    var ph = D.roth_phase[m.filing];
    m.rothStatus = m.gross < ph[0] ? "full" : m.gross < ph[1] ? "partial" : "none";
    m.retirePct = m.hasPlan ? m.contrib + m.matchNow : 0;
    m.retireGap = Math.max(0, 15 - m.retirePct);
    m.retireGapMonthly = m.gross * m.retireGap / 100 / 12;
    m.debtExtra = m.highDebt ? Math.max(0, m.saveB - m.monthly) * 0.6 : 0;
    m.committed = (m.efundMet ? 0 : m.monthly) + m.goalsMonthly + m.debtExtra;
    m.investable = Math.max(0, m.saveB - m.committed);
    m.overCommitted = m.committed > m.saveB + 1;
    m.order = buildOrder(m);
    m.next = m.order.filter(function (o) { return !o.done && !o.skip; })[0] || null;
    return m;
  }

  function buildOrder(m) {
    var L = D.limits, o = [];
    o.push({ key: "match", t: "Get your full 401(k) match", skip: !m.matchKnown, done: m.matchMet,
      d: m.matchKnown ? "Put in at least " + m.matchThreshold + "% of your pay. Your employer adds up to " + m.matchMax + "% more." : "" });
    o.push({ key: "starter", t: "Save a starter cushion of " + money(m.starter), done: m.starterMet,
      d: "One month of must-pay bills, or $1,000 if that’s more. Keep it in a high-yield savings account." });
    o.push({ key: "debt", t: "Pay down your " + money(m.cardBal) + " card balance", skip: !m.highDebt, done: false,
      d: "Card interest" + (m.cardApr ? " at " + pct(m.cardApr) : "") + " costs more than investing usually earns. Pay the minimum on everything else and put the rest here." });
    o.push({ key: "efund", t: "Finish your emergency fund: " + money(m.target), done: m.efundMet,
      d: m.months + " months of must-pay bills, based on how steady your income is." });
    o.push({ key: "hsa", t: "Fund your HSA", skip: !m.hsa, done: false,
      d: "Up to " + money(L.hsa_self) + " for yourself or " + money(L.hsa_family) + " for a family in " + D.year + ". It goes in tax-free, grows tax-free, and comes out tax-free for medical costs." });
    var ira = m.rothStatus === "none" ? { t: "Ask a tax pro about an IRA", d: "Your income is above the " + D.year + " Roth IRA limit, so the usual options don’t apply. A tax professional can walk you through the others." }
      : m.highBracket ? { t: "Open a Traditional IRA", d: "In the 24% bracket or higher, cutting your taxes now usually beats a Roth. The " + D.year + " limit is " + money(L.ira) + "." }
      : { t: "Open a Roth IRA", d: "You pay tax now, at a lower rate, and take it out tax-free in retirement. The " + D.year + " limit is " + money(L.ira) + (m.rothStatus === "partial" ? ", reduced at your income" : "") + "." };
    o.push({ key: "ira", t: ira.t, d: ira.d, done: false });
    o.push({ key: "k401", t: m.hasPlan ? "Raise your 401(k) toward 15% of pay" : "Aim for 15% of pay toward retirement", done: m.hasPlan && m.retirePct >= 15,
      d: m.hasPlan ? "Counting the match, you’re at " + pct(m.retirePct) + ". The " + D.year + " limit for your own contributions is " + money(L.k401) + (m.roth401k && !m.highBracket ? ", and the Roth 401(k) option fits your tax bracket." : ".") : "Without a workplace plan, an IRA comes first. Anything past its limit can go into a regular brokerage account." });
    o.push({ key: "taxable", t: "Invest the rest in a brokerage account", done: false,
      d: "For goals 5 or more years away and anything past your retirement accounts." });
    return o;
  }

  function goalName(t) { return t === "Something else" ? "your other goal" : "your " + t.toLowerCase(); }
  function actions(m) {
    var a = [];
    if (m.matchKnown && !m.matchMet) a.push({ t: "Raise your 401(k) to " + m.matchThreshold + "% of your pay", d: "You’re missing about " + money(m.matchMissing) + " a year in free money from your employer." });
    if (!m.starterMet) a.push({ t: "Open a high-yield savings account and build a " + money(m.starter) + " cushion", d: "Set up an automatic transfer of " + money(m.monthly) + " on payday so it happens without you." });
    if (m.highDebt) a.push({ t: "Put every extra dollar toward your " + money(m.cardBal) + " card balance", d: "Card interest" + (m.cardApr ? " at " + pct(m.cardApr) : "") + " grows faster than savings. Once it’s gone, that payment becomes savings." });
    if (!m.efundMet) a.push({ t: "Grow your emergency fund to " + money(m.target), d: m.efundMonths ? "At " + money(m.monthly) + " a month you’ll get there by " + monthYear(m.efundMonths) + "." : "Pick a monthly amount you can keep up." });
    if (m.billsKnown && m.billsTotal > m.needsB * 1.02 && m.biggest) a.push({ t: "Look at your biggest bill: " + m.biggest.name.toLowerCase(), d: "Your must-pay bills are " + money(m.billsTotal - m.needsB) + " a month over your needs budget. " + m.biggest.name + " is " + money(m.biggest.amount) + "." });
    m.goals.forEach(function (g) { a.push({ t: "Set aside " + money(g.monthly) + " a month toward " + goalName(g.type), d: "Keep it in " + g.where + "." }); });
    var rest = m.order.filter(function (o) { return !o.done && !o.skip && ["match", "starter", "debt", "efund"].indexOf(o.key) === -1; });
    rest.forEach(function (o) { a.push({ t: o.t, d: o.d }); });
    return a.slice(0, 6);
  }

  /* ---------- render ---------- */
  function out(name, html) { var el = $('[data-out="' + name + '"]'); if (el && el.innerHTML !== html) el.innerHTML = html; }
  function result(body, mod) { return '<div class="fp-result' + (mod ? " fp-result--" + mod : "") + '">' + body + "</div>"; }

  function render() {
    var m = model(), v = S.v;
    // conditional fields
    $$("[data-show]").forEach(function (el) { var p = el.getAttribute("data-show").split("="); el.hidden = v[p[0]] !== p[1]; });

    // area
    var zip = String(v.zip || "");
    if (zip.length === 5) {
      if (m.area) {
        var diff = Math.round(m.area.rpp - 100);
        var cmp = diff === 0 ? "right at the US average" : Math.abs(diff) + "% " + (diff > 0 ? "above" : "below") + " the US average";
        out("area", result('<span class="fp-tag fp-tag--' + m.autoTier + '">' + esc(TIER_WORD[m.autoTier].replace(/^./, function (c) { return c.toUpperCase(); })) + " area</span>"
          + "<p>" + esc(zip) + " is in the <strong>" + esc(m.area.name) + "</strong>. Prices there run " + cmp + ". Rent is usually the biggest reason. "
          + (v.tier && v.tier !== m.autoTier ? "You picked a different setting below, and that’s what your budget uses." : "Your budget uses the " + TIER_WORD[m.autoTier] + " split.") + "</p>"));
      } else {
        out("area", result("<p>I couldn’t match " + esc(zip) + " to an area. Pick your cost of living below and the planner will use that.</p>", "warn"));
      }
    } else out("area", "");

    // bills
    if (m.billsKnown && m.th > 0) {
      var share = m.billsTotal / m.th * 100;
      var housing = m.bills.rent > 0 && m.gross > 0 && m.bills.rent > m.gross / 12 * 0.3;
      out("bills", result('<div class="fp-result__big">' + money(m.billsTotal) + "<small>a month</small></div>"
        + "<p>That’s <strong>" + pct(share) + "</strong> of your take-home pay, and it sets your emergency fund."
        + (housing ? " Your housing is more than 30% of your pay before taxes, the usual line for being stretched." : "") + "</p>", share > 70 ? "warn" : ""));
    } else out("bills", "");

    // split
    syncSliders(m);
    if (m.th > 0) {
      out("split", result('<div class="fp-bar" role="img" aria-label="Needs ' + pct(m.split[0]) + ", wants " + pct(m.split[1]) + ", savings " + pct(m.split[2]) + '">'
        + '<span class="fp-bar__needs" style="flex-grow:' + m.split[0] + '">' + pct(m.split[0]) + "</span>"
        + '<span class="fp-bar__wants" style="flex-grow:' + m.split[1] + '">' + pct(m.split[1]) + "</span>"
        + '<span class="fp-bar__save" style="flex-grow:' + m.split[2] + '">' + pct(m.split[2]) + "</span></div>"
        + '<dl class="fp-legend"><div style="--c:#2F6BFF"><dt>Needs</dt><dd>' + money(m.needsB) + '</dd></div><div style="--c:#7B3FF2"><dt>Wants</dt><dd>' + money(m.wantsB)
        + '</dd></div><div style="--c:var(--lime)"><dt>Savings</dt><dd class="fp-save">' + money(m.saveB) + "</dd></div></dl>"));
    } else out("split", result("<p>Add your take-home pay in step 1 to see your numbers.</p>"));
    var resetLbl = $("[data-reset-label]");
    if (resetLbl) resetLbl.textContent = "Use the " + TIER_WORD[m.tier] + " split (" + m.defaultSplit.join("/") + ")";
    var resetBtn = $("[data-reset-split]"); if (resetBtn) resetBtn.hidden = !S.split;

    if (m.billsKnown && m.th > 0) {
      var over = m.billsTotal - m.needsB;
      out("budget-check", over > m.needsB * 0.02
        ? result("<p>Your must-pay bills come to <strong>" + money(m.billsTotal) + "</strong>, which is <strong>" + money(over) + "</strong> over your needs budget." + (m.biggest ? " The biggest is " + esc(m.biggest.name.toLowerCase()) + " at " + money(m.biggest.amount) + "." : "") + " That money has to come from wants first, so your savings stay on track.</p>", "warn")
        : result("<p>Your must-pay bills fit inside your needs budget with <strong>" + money(-over) + "</strong> to spare for groceries and other basics that change month to month.</p>", "good"));
    } else out("budget-check", "");

    // safety net
    if (m.th > 0) {
      out("target", result('<div class="fp-result__big">' + money(m.target) + "<small>emergency fund target</small></div>"
        + "<p>That’s <strong>" + m.months + " months</strong> of must-pay bills" + (m.billsKnown ? "" : " (estimated at half your take-home pay until you fill in step 2)") + ". "
        + (m.months >= 6 ? "Your income has more ups and downs, or more people rely on it, so you need a bigger cushion." : "Your income looks steady, so a smaller cushion covers you.") + "</p>"));
      var p = m.target ? clamp(m.saved / m.target, 0, 1) : 0;
      out("progress", result('<div class="fp-meter" role="img" aria-label="' + Math.round(p * 100) + '% of your emergency fund"><span style="transform:scaleX(' + p.toFixed(3) + ')"></span></div>'
        + '<div class="fp-meter__marks"><span>' + money(m.saved) + " saved</span><span>" + money(m.target) + "</span></div>"
        + (m.efundMet ? "<p>You’re already there. Your investing steps are unlocked.</p>"
          : "<p>" + (m.starterMet ? "Starter cushion done. " : "First stop: a " + money(m.starter) + " starter cushion. ")
            + (m.efundMonths ? "At <strong class=\"fp-save\">" + money(m.monthly) + "</strong> a month, you’ll reach " + money(m.target) + " by <strong>" + monthYear(m.efundMonths) + "</strong>." : "") + "</p>"),
        m.efundMet ? "good" : ""));
      var ms = $('[name="monthly_save"]'); if (ms && document.activeElement !== ms && (v.monthly_save == null || v.monthly_save === "")) ms.placeholder = String(m.suggestMonthly);
    } else { out("target", ""); out("progress", ""); }

    // goals
    renderGoals();
    out("goals", m.goals.length ? result('<ul class="fp-goal-list">' + m.goals.map(function (g) {
      return "<li><b>" + esc(g.type) + '</b><span class="fp-save">' + money(g.monthly) + "/mo</span><span>" + money(g.amount) + " by " + esc(g.year) + ", kept in " + g.where + "</span></li>";
    }).join("") + "</ul>") : "");
    out("risk", m.riskDone ? result('<span class="fp-tag">' + m.profile + " profile</span><p>For money you won’t need for 5 or more years, a <strong>" + m.profile.toLowerCase() + "</strong> mix holds about <strong>" + D.mix_range[m.profile] + "</strong> in stocks."
      + (m.capLower ? " Your timeline is what holds this back, and it will change as your safety net grows." : " Your comfort with market swings sets this. You’re more likely to stick with a mix you’re comfortable with.") + "</p>") : "");

    // retirement
    if (m.hasPlan && m.matchKnown) {
      out("match", m.matchMet
        ? result("<p>You’re getting the full match, about <strong class=\"fp-save\">" + money(m.matchGetting) + "</strong> a year" + (m.grossGiven ? "" : " (estimated from your take-home pay)") + ". Nice.</p>" + (m.vestWait ? "<p>The match vests over time, so leaving before then means giving some of it back. It’s still worth taking.</p>" : ""), "good")
        : result('<div class="fp-result__big fp-save">' + money(m.matchMissing) + "<small>a year left on the table</small></div><p>Raise your contribution from " + pct(m.contrib) + " to <strong>" + m.matchThreshold + "%</strong> to get all of it" + (m.grossGiven ? "" : " (estimated from your take-home pay)") + ". Your paycheck drops by less than that, because the money goes in before taxes.</p>"
          + (m.vestWait ? "<p>Your match vests over time. If you leave early you keep your own money but give back some of the match. Take it anyway.</p>" : ""), "warn"));
    } else if (S.v.plan_offered === "yes" && (S.v.match === "unsure")) {
      out("match", result("<p>Find out your match before anything else. Your benefits site or HR can tell you in a minute, and it could be thousands of dollars a year.</p>", "warn"));
    } else out("match", "");
    var shown = 0;
    out("order", m.th > 0 ? '<div class="fp-result"><h3 class="fp-h3">Where your next dollar goes</h3><ol class="fp-order">' + m.order.map(function (o) {
      var cls = o.skip ? "is-skip" : o.done ? "is-done" : o === m.next ? "is-next" : "";
      if (!o.skip) shown++;
      return '<li class="' + cls + '"><span class="fp-order__n">' + (o.done ? ICON_CHECK : String(shown)) + '</span><span class="fp-order__t">' + esc(o.t) + '</span><span class="fp-order__d">' + esc(o.d) + "</span></li>";
    }).join("") + "</ol></div>" : "");

    // investing
    if (m.th > 0) {
      out("invest", result('<div class="fp-result__big fp-save">' + money(m.investable) + "<small>a month you could invest</small></div>"
        + "<p>" + (function () {
          var parts = []; if (!m.efundMet) parts.push("emergency fund"); if (m.highDebt) parts.push("card payoff"); if (m.goals.length) parts.push("goals");
          if (!parts.length) return "That’s your whole " + money(m.saveB) + " savings budget.";
          var list = parts.length === 1 ? parts[0] : parts.slice(0, -1).join(", ") + (parts.length > 2 ? "," : "") + " and " + parts[parts.length - 1];
          return "That’s what’s left of your " + money(m.saveB) + " savings budget after your " + list + ".";
        })()
        + (m.hasPlan ? " You’re putting " + pct(m.retirePct) + " of your pay toward retirement, counting the match." + (m.retireGap > 0 ? " Getting to 15% takes about <strong>" + money(m.retireGapMonthly) + "</strong> more a month." : " That clears the 15% mark.") : "")
        + (!m.efundMet ? " Until your emergency fund is full, the 401(k) match is the only investing that should come first." : "") + "</p>"
        + (m.overCommitted ? "<p>Your safety net" + (m.highDebt ? ", card payoff," : "") + " and goals ask for <strong>" + money(m.committed) + "</strong> a month, more than your " + money(m.saveB) + " savings budget. Push a goal’s date out, lower your monthly emergency fund amount, or move money over from wants.</p>" : ""),
        m.overCommitted ? "warn" : ""));
    } else out("invest", "");
    out("mix", m.riskDone ? result('<h3 class="fp-h3">Your mix: ' + m.profile.toLowerCase() + "</h3>"
      + '<div class="fp-bar" role="img" aria-label="' + m.mix[0] + "% stocks, " + m.mix[1] + '% bonds and cash"><span class="fp-bar__stocks" style="flex-grow:' + m.mix[0] + '">' + m.mix[0] + '% stocks</span><span class="fp-bar__bonds" style="flex-grow:' + m.mix[1] + '">' + m.mix[1] + "% bonds</span></div>"
      + "<p>This is for long-term money only. A common cross-check is 110 minus your age in stocks. Check what your target-date fund or robo-advisor holds against it.</p>")
      : result("<p>Answer the five risk questions in Goals to see your stock and bond mix.</p>"));

    // plan
    var acts = actions(m);
    out("actions", m.th > 0 ? '<ol class="fp-actions">' + acts.map(function (x, i) {
      return '<li><span class="fp-actions__n">' + (i + 1) + '</span><span class="fp-actions__t">' + esc(x.t) + '</span><span class="fp-actions__d">' + esc(x.d) + "</span></li>";
    }).join("") + "</ol>" : result("<p>Add your take-home pay in step 1 and your plan will fill in here.</p>", "warn"));
    out("numbers", m.th > 0 ? '<dl class="fp-numbers">' + numbers(m).map(function (r) { return "<div><dt>" + esc(r[0]) + "</dt><dd" + (r[2] ? ' class="fp-save"' : "") + ">" + esc(r[1]) + "</dd></div>"; }).join("") + "</dl>" : "");

    // summary
    var sum = $("[data-summary]");
    if (m.th > 0) {
      var rows = [["Take-home pay", money(m.th) + "/mo"]];
      rows.push(["Cost of living", m.area ? m.area.name.replace(/ area$/, "") + ", " + TIER_WORD[m.tier] : TIER_WORD[m.tier]]);
      rows.push(["Budget", m.split.join(" / ")]);
      if (m.billsKnown) rows.push(["Must-pay bills", money(m.billsTotal) + "/mo"]);
      rows.push(["To savings", money(m.saveB) + "/mo", true]);
      rows.push(["Emergency fund", money(m.saved) + " of " + money(m.target)]);
      if (m.riskDone) rows.push(["Risk profile", m.profile]);
      var html = "<dl>" + rows.map(function (r) { return "<div><dt>" + r[0] + "</dt><dd" + (r[2] ? ' class="fp-save"' : "") + ">" + esc(r[1]) + "</dd></div>"; }).join("") + "</dl>";
      if (acts[0]) html += '<div class="fp-sum__next"><b>Next move</b><span>' + esc(acts[0].t) + "</span></div>";
      if (sum.innerHTML !== html) sum.innerHTML = html;
    } else sum.innerHTML = '<p class="fp-sum__empty">' + esc(COPY.summary_empty) + "</p>";
    return m;
  }

  function numbers(m) {
    var r = [["Take-home pay", money(m.th) + " a month"], ["Cost of living", (m.area ? m.area.name + ", " : "") + TIER_WORD[m.tier]],
      ["Budget split", m.split[0] + "% needs, " + m.split[1] + "% wants, " + m.split[2] + "% savings"], ["Savings budget", money(m.saveB) + " a month", true]];
    if (m.billsKnown) r.push(["Must-pay bills", money(m.billsTotal) + " a month"]);
    r.push(["Emergency fund target", money(m.target) + " (" + m.months + " months)"]);
    r.push(["Saved now", money(m.saved)]);
    if (m.riskDone) r.push(["Risk profile", m.profile + ", about " + D.mix_range[m.profile] + " stocks"]);
    if (m.matchKnown) r.push(["Employer match", m.matchMet ? "Getting all of it" : money(m.matchMissing) + " a year missed"]);
    return r;
  }

  var ICON_CHECK = (function () { var t = $(".fp-rail__check"); return t ? t.outerHTML.replace("fp-rail__check", "") : ""; })();

  /* ---------- budget sliders ---------- */
  function syncSliders(m) {
    ["needs", "wants", "save"].forEach(function (k, i) {
      var el = $('[name="s_' + k + '"]'); if (!el) return;
      if (document.activeElement !== el) el.value = m.split[i];
      el.style.setProperty("--p", m.split[i] + "%");
      el.setAttribute("aria-valuetext", m.split[i] + "%, " + money(m.th * m.split[i] / 100));
      var o = $('[data-split="' + k + '"]'); if (o) o.textContent = pct(m.split[i]) + (m.th > 0 ? " · " + money(m.th * m.split[i] / 100) : "");
    });
  }
  function moveSlider(idx, val) {
    var cur = (S.split || model().defaultSplit).slice();
    val = clamp(Math.round(val), 0, 100);
    var others = [0, 1, 2].filter(function (i) { return i !== idx; });
    var rest = 100 - val, before = cur[others[0]] + cur[others[1]];
    var a = before > 0 ? Math.round(rest * cur[others[0]] / before) : Math.round(rest / 2);
    cur[idx] = val; cur[others[0]] = a; cur[others[1]] = rest - a;
    S.split = cur;
  }

  /* ---------- goals ---------- */
  function renderGoals() {
    var list = $("[data-goals]"); if (!list) return;
    var y = new Date().getFullYear();
    var want = S.goals.map(function (g, i) { return g.id; }).join(",");
    if (list.getAttribute("data-ids") === want) return;
    list.setAttribute("data-ids", want);
    list.innerHTML = S.goals.map(function (g, i) {
      var years = "";
      for (var yr = y + 1; yr <= y + 30; yr++) years += '<option value="' + yr + '"' + (String(g.year) === String(yr) ? " selected" : "") + ">" + yr + "</option>";
      var id = "fp-g" + g.id;
      return '<li class="fp-goal" data-goal="' + g.id + '"><span class="fp-goal__name">' + esc(g.type) + "</span>"
        + '<div class="fp-field"><label class="fp-label" for="' + id + 'a">' + esc(Q.goal_amount) + '</label><div class="fp-money"><span class="fp-money__sign" aria-hidden="true">$</span><input class="fp-input" id="' + id + 'a" data-g="amount" type="text" inputmode="decimal" autocomplete="off" data-money value="' + (g.amount ? Number(g.amount).toLocaleString("en-US") : "") + '"></div></div>'
        + '<div class="fp-field"><label class="fp-label" for="' + id + 'y">' + esc(Q.goal_year) + '</label><select class="fp-select" id="' + id + 'y" data-g="year">' + years + "</select></div>"
        + '<div class="fp-field"><label class="fp-label" for="' + id + 's">' + esc(Q.goal_saved) + '</label><div class="fp-money"><span class="fp-money__sign" aria-hidden="true">$</span><input class="fp-input" id="' + id + 's" data-g="saved" type="text" inputmode="decimal" autocomplete="off" data-money value="' + (g.saved ? Number(g.saved).toLocaleString("en-US") : "") + '"></div></div>'
        + '<button class="fp-x" type="button" data-remove-goal aria-label="' + esc(Q.goal_remove + " " + g.type) + '">' + ICON_X + "</button></li>";
    }).join("");
  }
  var ICON_X = '<svg class="icon" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/></svg>';

  /* ---------- steps ---------- */
  function idx(step) { return STEPS.indexOf(step); }
  function show(step, focus) {
    var i = idx(step); if (i < 0) i = 0;
    S.step = STEPS[i]; S.furthest = Math.max(S.furthest, i);
    $$(".fp-step").forEach(function (el) {
      var on = el.getAttribute("data-step") === S.step;
      if (on && !el.classList.contains("is-active") && focus) { el.classList.remove("is-entering"); void el.offsetWidth; el.classList.add("is-entering"); }
      el.classList.toggle("is-active", on);
    });
    $$(".fp-rail__btn").forEach(function (b, j) {
      b.disabled = j > S.furthest;
      b.classList.toggle("is-done", j < S.furthest || (j < i));
      if (j === i) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
    });
    var cur = $(".fp-rail__btn[aria-current]"); if (cur && cur.scrollIntoView && window.innerWidth <= 900) { var ol = cur.closest("ol"); if (ol) ol.scrollTo({ left: cur.parentElement.offsetLeft - 16, behavior: reduce.matches ? "auto" : "smooth" }); }
    persist();
    render();
    if (focus) {
      var h = $('.fp-step.is-active .fp-step__h'), stepEl = $(".fp-step.is-active");
      var nav = document.querySelector(".nav__inner"), rail = $(".fp-rail");
      var cover = (nav ? nav.getBoundingClientRect().bottom : 72) + (rail && getComputedStyle(rail).position === "sticky" && window.innerWidth <= 900 ? rail.offsetHeight : 0) + 16;
      var top = stepEl.getBoundingClientRect().top + window.scrollY - cover;
      if (stepEl.getBoundingClientRect().top < cover) window.scrollTo({ top: top, behavior: reduce.matches ? "auto" : "smooth" });
      if (h) h.focus({ preventScroll: true });
    }
  }
  function validate(step) {
    if (step !== "pay") return true;
    var el = $('[name="take_home"]'), ok = num(S.v.take_home) > 0;
    setError(el, ok ? "" : "Enter your monthly take-home pay to keep going. A rough number is fine.");
    if (!ok) el.focus();
    return ok;
  }
  function setError(el, msg) {
    if (!el) return;
    var field = el.closest(".fp-field"), e = field.querySelector(".fp-error");
    if (msg) {
      if (!e) { e = document.createElement("p"); e.className = "fp-error"; e.id = el.id + "-err"; field.appendChild(e); }
      e.textContent = msg; el.setAttribute("aria-invalid", "true");
      el.setAttribute("aria-describedby", ((el.getAttribute("aria-describedby") || "").replace(e.id, "").trim() + " " + e.id).trim());
    } else if (e) { el.removeAttribute("aria-invalid"); el.setAttribute("aria-describedby", (el.getAttribute("aria-describedby") || "").replace(e.id, "").trim()); e.remove(); }
  }

  /* ---------- inputs ---------- */
  function restore() {
    $$("input[name], select[name]").forEach(function (el) {
      var val = S.v[el.name];
      if (el.type === "radio") el.checked = val === el.value;
      else if (el.type === "range") { /* driven by split */ }
      else if (val != null) el.value = el.hasAttribute("data-money") && val !== "" ? Number(num(val)).toLocaleString("en-US") : val;
    });
  }
  root.addEventListener("input", function (e) {
    var el = e.target;
    if (el.closest("[data-gate]")) return;
    if (el.hasAttribute("data-g")) {
      var li = el.closest("[data-goal]"), g = S.goals.filter(function (x) { return String(x.id) === li.getAttribute("data-goal"); })[0];
      if (g) g[el.getAttribute("data-g")] = el.hasAttribute("data-money") ? num(el.value) : el.value;
    } else if (el.type === "range") {
      moveSlider(["s_needs", "s_wants", "s_save"].indexOf(el.name), num(el.value));
    } else if (el.name) {
      if (el.name === "zip") el.value = el.value.replace(/\D/g, "").slice(0, 5);
      if (el.type === "radio") { if (!el.checked) return; S.v[el.name] = el.value; if (el.name === "tier") S.tierManual = true; }
      else S.v[el.name] = el.hasAttribute("data-money") ? (el.value.trim() === "" ? "" : String(num(el.value))) : el.value;
      if (el.name === "take_home" && num(el.value) > 0) setError(el, "");
      if (el.name === "zip" && el.value.length === 5 && !S.tierManual) {
        var a = lookupZip(el.value);
        if (a) { S.v.tier = tierFor(a.rpp); $$('[name="tier"]').forEach(function (r) { r.checked = r.value === S.v.tier; }); }
      }
      if (el.name === "tier" && S.split) S.split = null;  // a new area resets a custom split to that area's rule
    }
    persist(); render();
  });
  root.addEventListener("focusout", function (e) {
    var el = e.target;
    if (el.hasAttribute && el.hasAttribute("data-money") && el.value.trim() !== "") el.value = Number(num(el.value)).toLocaleString("en-US");
  });
  root.addEventListener("click", function (e) {
    var t = e.target.closest("button"); if (!t || !root.contains(t)) return;
    if (t.hasAttribute("data-next")) { if (validate(S.step)) show(STEPS[idx(S.step) + 1], true); }
    else if (t.hasAttribute("data-back")) show(STEPS[idx(S.step) - 1], true);
    else if (t.hasAttribute("data-go")) show(t.getAttribute("data-go"), true);
    else if (t.hasAttribute("data-reset-split")) { S.split = null; persist(); render(); }
    else if (t.hasAttribute("data-add-goal")) {
      var id = Date.now() % 1e9;
      S.goals.push({ id: id, type: t.getAttribute("data-add-goal"), amount: "", year: String(new Date().getFullYear() + 3), saved: "" });
      persist(); render();
      var inp = $('[data-goal="' + id + '"] input'); if (inp) inp.focus();
    } else if (t.hasAttribute("data-remove-goal")) {
      var gid = t.closest("[data-goal]").getAttribute("data-goal");
      S.goals = S.goals.filter(function (x) { return String(x.id) !== gid; }); persist(); render();
      var add = $(".fp-add"); if (add) add.focus();
    } else if (t.hasAttribute("data-reset")) {
      S = fresh(); try { localStorage.removeItem(KEY); } catch (err) { /* nothing stored */ }
      $$("input[name]").forEach(function (el) { if (el.type === "radio") el.checked = false; else if (el.type !== "range") el.value = ""; });
      show(STEPS[0], true);
    } else if (t.hasAttribute("data-again")) makePdf();
  });
  // a radio change also fires input in modern browsers; selects need change
  root.addEventListener("change", function (e) {
    var el = e.target;
    if (el.matches("select[data-g]")) {
      var li = el.closest("[data-goal]"), g = S.goals.filter(function (x) { return String(x.id) === li.getAttribute("data-goal"); })[0];
      if (g) { g.year = el.value; persist(); render(); }
    }
  });

  /* ---------- email gate and PDF ---------- */
  var gate = $("[data-gate]");
  if (gate) gate.addEventListener("submit", function (e) {
    e.preventDefault();
    var input = gate.querySelector('[name="email"]'), status = gate.querySelector("[data-gate-status]"), btn = gate.querySelector('button[type="submit"]');
    var email = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      input.setAttribute("aria-invalid", "true"); status.textContent = COPY.email_error; input.focus(); return;
    }
    input.removeAttribute("aria-invalid");
    btn.setAttribute("aria-busy", "true"); btn.disabled = true; status.textContent = COPY.email_busy;
    var send = D.formspree ? fetch("https://formspree.io/f/" + encodeURIComponent(D.formspree), {
      method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, tool: "Financial planner", _subject: "Financial planner PDF request" })
    }).catch(function () { return null; }) : Promise.resolve(null);
    send.then(function () { return makePdf(); }).then(function () {
      status.textContent = COPY.email_done; gate.querySelector("[data-again]").hidden = false;
      try { localStorage.setItem(KEY + "-email", "1"); } catch (err) { /* fine */ }
    }).catch(function (err) {
      status.textContent = "Something went wrong making the PDF. Try again in a moment."; if (window.console) console.warn(err);
    }).then(function () { btn.removeAttribute("aria-busy"); btn.disabled = false; });
  });

  function loadScript(src) {
    return new Promise(function (res, rej) { var s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  }
  function b64(buf) { var s = "", b = new Uint8Array(buf); for (var i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); }
  function pdfDeps() {
    var lib = window.jspdf ? Promise.resolve() : loadScript(cfg.pdf.lib);
    var fonts = window.KP_PDF_FONTS ? Promise.resolve(window.KP_PDF_FONTS) : Promise.all([cfg.pdf.regular, cfg.pdf.bold].map(function (u) {
      return fetch(u).then(function (r) { if (!r.ok) throw new Error(u); return r.arrayBuffer(); }).then(b64);
    })).then(function (f) { window.KP_PDF_FONTS = { regular: f[0], bold: f[1] }; return window.KP_PDF_FONTS; }).catch(function () { return null; });
    return Promise.all([lib, fonts]).then(function (r) { return r[1]; });
  }

  function makePdf() {
    return pdfDeps().then(function (fonts) {
      var m = model(), acts = actions(m);
      var doc = new window.jspdf.jsPDF({ unit: "pt", format: "letter" });
      var F = "helvetica";
      if (fonts) {
        doc.addFileToVFS("MonaSans-Regular.ttf", fonts.regular); doc.addFont("MonaSans-Regular.ttf", "Mona", "normal");
        doc.addFileToVFS("MonaSans-Bold.ttf", fonts.bold); doc.addFont("MonaSans-Bold.ttf", "Mona", "bold");
        F = "Mona";
      }
      var W = 612, H = 792, M = 56, CW = W - M * 2, y = 0;
      var INK = [8, 8, 12], GRAY = [92, 92, 112], LINE = [226, 226, 234], BLUE = [0, 82, 255];
      var GRAD = [[47, 107, 255], [123, 63, 242], [255, 61, 139], [255, 184, 77]];
      function col(c) { doc.setTextColor(c[0], c[1], c[2]); }
      function fill(c) { doc.setFillColor(c[0], c[1], c[2]); }
      function font(w, s) { doc.setFont(F, w); doc.setFontSize(s); }
      function lerp(a, b, t) { return [0, 1, 2].map(function (i) { return Math.round(a[i] + (b[i] - a[i]) * t); }); }
      function gradBar(x, yy, w, h) {
        var n = 120;
        for (var i = 0; i < n; i++) {
          var t = i / (n - 1) * (GRAD.length - 1), k = Math.min(GRAD.length - 2, Math.floor(t));
          fill(lerp(GRAD[k], GRAD[k + 1], t - k)); doc.rect(x + w * i / n, yy, w / n + 0.6, h, "F");
        }
      }
      function ensure(h) { if (y + h > H - 80) { doc.addPage(); y = M; } }
      function text(str, x, w, size, weight, color, lh) {
        font(weight || "normal", size); col(color || INK);
        var lines = doc.splitTextToSize(str, w), step = size * (lh || 1.4);
        lines.forEach(function (l) { ensure(step); doc.text(l, x, y + size); y += step; });
      }
      function heading(str) { ensure(60); y += 26; font("bold", 15); col(INK); doc.text(str, M, y + 15); y += 26; doc.setDrawColor(LINE[0], LINE[1], LINE[2]); doc.setLineWidth(0.8); doc.line(M, y, W - M, y); y += 14; }

      // cover
      gradBar(0, 0, W, 10);
      y = M + 4;
      font("normal", 10); col(GRAY); doc.text("Kevin Park  ·  Financial planner", M, y + 10); y += 26;
      font("bold", 30); col(INK); doc.text("Your starter money plan", M, y + 28); y += 44;
      font("normal", 11); col(GRAY); doc.text("Made on " + today() + ", from your answers. Your numbers never left your browser.", M, y + 11); y += 22;

      heading("Your next moves");
      acts.forEach(function (a, i) {
        ensure(48);
        var top = y;
        doc.setDrawColor(i === 0 ? BLUE[0] : 180, i === 0 ? BLUE[1] : 180, i === 0 ? BLUE[2] : 196); doc.setLineWidth(1.2); doc.roundedRect(M, top + 1, 13, 13, 3, 3, "S");
        y = top; text((i + 1) + ".  " + a.t, M + 26, CW - 26, 12, "bold", INK, 1.35);
        text(a.d, M + 26, CW - 26, 10.5, "normal", GRAY, 1.45); y += 10;
      });

      var rows = numbers(m), colW = CW / 2 - 10;
      ensure(Math.ceil(rows.length / 2) * 44 + 70);
      heading("Your numbers");
      for (var i = 0; i < rows.length; i += 2) {
        ensure(44); var top2 = y;
        [rows[i], rows[i + 1]].forEach(function (r, j) {
          if (!r) return; y = top2;
          var x = M + j * (colW + 20);
          text(r[0], x, colW, 9.5, "normal", GRAY, 1.3); text(r[1], x, colW, 12.5, "bold", INK, 1.3);
        });
        y = Math.max(y, top2 + 40) + 4;
      }

      heading("Your budget");
      ensure(70);
      var segs = [[m.split[0], [47, 107, 255], "Needs"], [m.split[1], [123, 63, 242], "Wants"], [m.split[2], [120, 170, 0], "Savings"]], x0 = M;
      segs.forEach(function (s) { var w = CW * s[0] / 100; fill(s[1]); doc.roundedRect(x0, y, Math.max(w - 3, 2), 22, 4, 4, "F"); x0 += w; });
      y += 34; x0 = M;
      segs.forEach(function (s, j) {
        var amt = [m.needsB, m.wantsB, m.saveB][j];
        font("normal", 9.5); col(GRAY); doc.text(s[2] + "  " + s[0] + "%", M + j * (CW / 3), y + 9);
        font("bold", 13); col(INK); doc.text(money(amt) + "/mo", M + j * (CW / 3), y + 26);
      });
      y += 36;
      if (m.billsKnown) text("Your must-pay bills come to " + money(m.billsTotal) + " a month" + (m.billsTotal > m.needsB * 1.02 ? ", which is " + money(m.billsTotal - m.needsB) + " over your needs budget. Trim wants first so savings stay on track." : ", inside your needs budget."), M, CW, 10.5, "normal", GRAY);

      heading("Your safety net");
      text("Target: " + money(m.target) + ", which is " + m.months + " months of must-pay bills. You have " + money(m.saved) + " saved." + (m.efundMet ? " You’re there." : m.efundMonths ? " At " + money(m.monthly) + " a month, you’ll reach it by " + monthYear(m.efundMonths) + "." : ""), M, CW, 11, "normal", INK, 1.5);
      y += 6; text("What to look for in a high-yield savings account", M, CW, 11, "bold", INK);
      COPY.hysa_check.forEach(function (c) { ensure(18); doc.setDrawColor(170, 170, 186); doc.setLineWidth(1); doc.roundedRect(M, y + 2, 10, 10, 2, 2, "S"); var t0 = y; text(c, M + 20, CW - 20, 10.5, "normal", GRAY, 1.45); y = Math.max(y, t0 + 16); });

      heading("Where your next dollar goes");
      var n = 0;
      m.order.forEach(function (o) {
        if (o.skip) return; n++;
        ensure(40);
        var tag = o.done ? "Done" : o === m.next ? "Next" : "Later";
        var t0 = y;
        font("bold", 9); col(o.done ? BLUE : o === m.next ? INK : GRAY); doc.text(tag, W - M, y + 12, { align: "right" });
        y = t0; text(n + ".  " + o.t, M, CW - 60, 11.5, "bold", o.done ? GRAY : INK, 1.35);
        text(o.d, M + 16, CW - 76, 10, "normal", GRAY, 1.45); y += 8;
      });

      if (m.goals.length) {
        heading("Your goals");
        m.goals.forEach(function (g) {
          ensure(36);
          var t0 = y; font("bold", 11.5); col(INK); doc.text(money(g.monthly) + "/mo", W - M, y + 12, { align: "right" });
          y = t0; text(g.type + ": " + money(g.amount) + " by " + g.year, M, CW - 90, 11.5, "bold", INK, 1.35);
          text("Keep it in " + g.where + ".", M, CW - 90, 10, "normal", GRAY, 1.45); y += 6;
        });
      }

      heading("Investing");
      text((m.overCommitted ? "Right now your safety net" + (m.highDebt ? ", card payoff," : "") + " and goals ask for " + money(m.committed) + " a month, more than your " + money(m.saveB) + " savings budget. Push a goal’s date out or move money over from wants before you invest more than the 401(k) match."
        : "You could invest about " + money(m.investable) + " a month after your safety net, debt, and goals.") + " A common target is 15% of your pay before taxes for retirement, counting your employer’s match.", M, CW, 11, "normal", INK, 1.5);
      if (m.riskDone) {
        y += 8; ensure(60);
        text("Your mix: " + m.profile.toLowerCase(), M, CW, 11, "bold", INK); y += 2;
        fill([47, 107, 255]); doc.roundedRect(M, y, CW * m.mix[0] / 100 - 2, 18, 4, 4, "F");
        fill([226, 226, 234]); doc.roundedRect(M + CW * m.mix[0] / 100 + 1, y, CW * m.mix[1] / 100 - 1, 18, 4, 4, "F");
        font("bold", 9); doc.setTextColor(255, 255, 255); doc.text(m.mix[0] + "% stocks", M + 8, y + 12.5); col(INK); doc.text(m.mix[1] + "% bonds", M + CW * m.mix[0] / 100 + 9, y + 12.5);
        y += 28;
      }
      y += 6; text("Ways to invest, from least effort to most", M, CW, 11, "bold", INK);
      COPY.learn.forEach(function (l) { ensure(30); var t0 = y; text(l[0], M, 130, 10.5, "bold", INK, 1.45); var hy = y; y = t0; text(l[2], M + 140, CW - 140, 10, "normal", GRAY, 1.45); y = Math.max(y, hy) + 4; });

      // footer on every page
      var pages = doc.getNumberOfPages();
      for (var p = 1; p <= pages; p++) {
        doc.setPage(p);
        doc.setDrawColor(LINE[0], LINE[1], LINE[2]); doc.setLineWidth(0.8); doc.line(M, H - 62, W - M, H - 62);
        font("normal", 8); col(GRAY);
        var foot = doc.splitTextToSize(COPY.disclaimer, CW - 70);
        doc.text(foot, M, H - 48);
        doc.text(p + " of " + pages, W - M, H - 48, { align: "right" });
        if (D.site_url) { doc.setTextColor(BLUE[0], BLUE[1], BLUE[2]); doc.textWithLink(D.site_url.replace(/^https?:\/\//, ""), M, H - 22, { url: D.site_url }); }
      }
      doc.save("money-plan-" + new Date().toISOString().slice(0, 10) + ".pdf");
    });
  }

  /* ---------- start ---------- */
  restore();
  show(S.step, false);
})();
