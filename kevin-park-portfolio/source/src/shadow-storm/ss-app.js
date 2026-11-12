// Shadow Storm: a fictional game store with an embedded wallet. Everything runs in the browser on sample data.
import { createStage, renderThumbs, showItem, hideItem, MODEL_IDS } from './ss-gfx.js';
import {
  RATE, STATS, TYPE_LABEL, ITEMS, MODEL_OF, STORE, STORE_TABS, DARUMA_POOL, MARKET, SUGGESTED, MARKET_FEE,
  PLAYER, COPY, REFERRALS, STANDINGS, CREATOR, CASH_METHODS, LIMITS, GIFT_CODE, ACCENTS,
} from './ss-data.js';

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const usd = (n) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = (n) => Math.round(n).toLocaleString('en-US');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cents = (n) => Math.round(n * 100) / 100;
const modelOf = (id) => MODEL_OF[id] || id;
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const P = {
  home: 'M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z', play: 'M7 4l13 8-13 8z',
  store: 'M4 9l1.5-5h13L20 9M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M4 9h16M9 20v-6h6v6',
  bag: 'M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2', tag: 'M3 12V4h8l10 10-8 8zM7.5 8.5h.01',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14.5a6.5 6.5 0 0 1 3.5 5.5',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.5A3.5 3.5 0 0 0 8 10M16 6h3.5A3.5 3.5 0 0 1 16 10M12 13v4M8 20h8M10 17h4',
  signal: 'M12 13a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM7.8 16a6 6 0 0 1 0-9M16.2 7a6 6 0 0 1 0 9M5 19A10 10 0 0 1 5 4M19 4a10 10 0 0 1 0 15',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5a7.5 7.5 0 0 1 15 0',
  wallet: 'M4 7a2 2 0 0 1 2-2h11v3M4 7v10a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H6a2 2 0 0 1-2-1zM16 13.5h.01',
  x: 'M6 6l12 12M18 6L6 18', back: 'M14 6l-6 6 6 6', next: 'M10 6l6 6-6 6', down: 'M12 5v14M6 13l6 6 6-6', up: 'M12 19V5M6 11l6-6 6 6',
  check: 'M5 12.5l4.5 4.5L19 7.5', copy: 'M9 9h10v11H9zM5 15V4h10', bank: 'M4 9l8-5 8 5M5 9v9M9.5 9v9M14.5 9v9M19 9v9M3.5 20h17',
  bolt: 'M13 3L5 13h6l-1 8 8-11h-6z', gift: 'M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7C10.5 4 7 4 7 6s3 1 5 1zM12 7c1.5-3 5-3 5-1s-3 1-5 1z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2', reset: 'M4 12a8 8 0 1 0 2.5-5.8M4 4v4.5h4.5',
  card: 'M3 7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM3 10h18', arrowUp: 'M12 19V6M6.5 11.5L12 6l5.5 5.5',
  cart: 'M3 4h2.5l2 11h10l2-8H7M9 20h.01M17 20h.01', coins: 'M12 21c4.4 0 8-1.6 8-3.5v-11M4 6.5v11C4 19.4 7.6 21 12 21M20 6.5C20 8.4 16.4 10 12 10S4 8.4 4 6.5 7.6 3 12 3s8 1.6 8 3.5zM4 12c0 1.9 3.6 3.5 8 3.5s8-1.6 8-3.5',
};
const ico = (n, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${P[n]}"/></svg>`;
const CUR = {
  k: '<svg class="cur cur--k" viewBox="0 0 20 20" aria-hidden="true"><ellipse cx="10" cy="10" rx="6.2" ry="8.6"/><path d="M6.6 7.2h6.8M6.2 10h7.6M6.6 12.8h6.8"/></svg>',
  j: '<svg class="cur cur--j" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5l6 8.5-6 8.5-6-8.5z"/><path d="M4 10h12M10 1.5V18.5"/></svg>',
  usd: '<svg class="cur cur--u" viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="4.5" width="16" height="11" rx="2"/><circle cx="10" cy="10" r="2.6"/></svg>',
};
function priceHtml(p) {
  if (p.k) return `<span class="price">${CUR.k}<b>${num(p.k)}</b><span class="sr-only"> Koban</span></span>`;
  if (p.j) return `<span class="price">${CUR.j}<b>${num(p.j)}</b><span class="sr-only"> Jade</span></span>`;
  return `<span class="price price--usd"><b>${usd(p.usd)}</b>${p.per ? `<i>/${p.per}</i>` : ''}</span>`;
}
const priceText = (p) => (p.k ? num(p.k) + ' Koban' : p.j ? num(p.j) + ' Jade' : usd(p.usd) + (p.per ? ' per month' : ''));
const when = (ts) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const ref = () => Math.random().toString(16).slice(2, 10).toUpperCase();

/* ---------- state ---------- */
const KEY = 'shadow-storm:v1';
const DAY = 864e5;
function fresh() {
  const now = Date.now();
  return {
    usd: 86.2, koban: 18500, jade: 320, kits: 1, pass: false, accent: 'verm', verified: false,
    inv: [{ uid: 1, id: 'kunai', lvl: 1, eq: true }, { uid: 2, id: 'tabi', lvl: 2, eq: true }, { uid: 3, id: 'omamori', lvl: 1, eq: false }],
    nextUid: 4, listings: [], bought: [], refCash: 34.5, prize: 46, creator: 1034, best: 0,
    log: [['Welcome bonus', '+5,000 K'], ['Daily login streak', '+100 K']],
    tx: [
      { id: ref(), title: 'Marketplace sale', sub: 'Iron Kote', amt: 7.6, ts: now - DAY * 1.2, status: 'settled', kind: 'in' },
      { id: ref(), title: 'Cash out to Bank ••4821', sub: '12,000 Koban', amt: -12, fee: 0.24, ts: now - DAY * 2.6, status: 'sent', kind: 'out' },
      { id: ref(), title: 'Added from Bank ••4821', sub: 'Deposit', amt: 20, ts: now - DAY * 4.1, status: 'settled', kind: 'in' },
    ],
  };
}
let S = fresh();
try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(fresh(), JSON.parse(raw)); } catch (e) { /* storage unavailable: run in memory */ }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }
const cashable = () => cents(S.usd + S.koban / RATE.koban);

const ui = { screen: 'home', storeTab: 'featured', invTab: 'gear', invFilter: 'all', sort: 'default', modal: null, wallet: null, opener: null, game: null };
let T = {}; // item thumbnails
let stage = null;
let heroVideo = null;
// Hero art and its looping animation. The packed single file passes them in; the dev page loads them from ./assets.
const ASSETS = window.SS_ASSETS || { poster: './assets/hero.jpg', video: './assets/hero.mp4', items: Object.fromEntries(MODEL_IDS.map((id) => [id, `./assets/items/${id}.webp`])) };
// Illustrated item art, keyed by model id. Without it the items are rendered from the 3D models instead.
const ITEM_ART = ASSETS.items && Object.keys(ASSETS.items).length ? ASSETS.items : null;

/* ---------- toasts and log ---------- */
function toast(msg, tone = '') {
  const host = $('#toasts');
  const el = document.createElement('div');
  el.className = 'toast ' + tone;
  el.setAttribute('role', 'status');
  el.innerHTML = msg;
  host.appendChild(el);
  setTimeout(() => { el.classList.add('is-out'); setTimeout(() => el.remove(), 320); }, 3600);
}
function log(label, delta) { S.log.unshift([label, delta]); S.log = S.log.slice(0, 5); }
function addTx(t) { const tx = Object.assign({ id: ref(), ts: Date.now() }, t); S.tx.unshift(tx); return tx; }

/* ---------- small renderers ---------- */
function thumb(id, cls = '') {
  const src = T[modelOf(id)];
  return src ? `<img class="thumb ${cls}" src="${src}" alt="" width="384" height="384" loading="lazy">` : `<span class="thumb thumb--none ${cls}" aria-hidden="true">${ico('bolt')}</span>`;
}
const statOf = (it) => ITEMS[it.id].stats.map((v) => Math.round(v * (1 + 0.15 * (it.lvl - 1))));
const rar = (r) => r[0].toUpperCase() + r.slice(1);
function btn(label, act, o = {}) {
  const data = Object.entries(o.data || {}).map(([k, v]) => ` data-${k}="${esc(v)}"`).join('');
  return `<button type="button" class="btn ${o.cls || ''}" data-act="${act}"${data}${o.disabled ? ' disabled' : ''}>${o.icon ? ico(o.icon) : ''}<span>${label}</span></button>`;
}
function head(title, blurb, crumb) {
  return `<header class="phead"><p class="crumb"><button type="button" data-act="go" data-screen="home">Home</button><span aria-hidden="true">/</span><span>${crumb || title}</span></p>
  <h1 class="ptitle" id="ptitle" tabindex="-1"><span>${title}</span></h1><p class="pblurb">${blurb}</p></header>`;
}
const RARITY_ORDER = { common: 0, rare: 1, epic: 2, legendary: 3 };
function sortSelect() {
  const opts = [['default', 'Sort: default'], ['rarity', 'Rarity'], ['name', 'Name']];
  return `<label class="sort"><span class="sr-only">Sort items</span><select data-change="sort">${opts.map(([v, l]) => `<option value="${v}"${ui.sort === v ? ' selected' : ''}>${l}</option>`).join('')}</select></label>`;
}
function sorted(list, idOf) {
  if (ui.sort === 'rarity') return list.slice().sort((a, b) => RARITY_ORDER[ITEMS[idOf(b)].rarity] - RARITY_ORDER[ITEMS[idOf(a)].rarity]);
  if (ui.sort === 'name') return list.slice().sort((a, b) => ITEMS[idOf(a)].name.localeCompare(ITEMS[idOf(b)].name));
  return list;
}

/* ---------- screens ---------- */
const NAV = [['home', 'Home', 'home'], ['play', 'Train', 'play'], ['store', 'Store', 'store'], ['inventory', 'Inventory', 'bag'], ['market', 'Market', 'tag'], ['referral', 'Refer a friend', 'users'], ['ranks', 'Leaderboard', 'trophy'], ['creator', 'Creator portal', 'signal'], ['profile', 'Profile', 'user']];

const SCREENS = {
  home() {
    return `<section class="hero" aria-labelledby="ptitle">
      <h1 class="logo logo--xl" id="ptitle" tabindex="-1"><span class="logo__a">Shadow</span><span class="logo__b">Storm</span></h1>
      <p class="kicker">${COPY.kicker}</p>
      <p class="hero__who">${PLAYER.name} <span>Level ${PLAYER.level}</span> <span>${PLAYER.clan} clan</span></p>
      <p class="hero__hint">${COPY.hint}</p>
      <div class="hero__cta">${btn('Start training', 'go', { cls: 'btn--accent btn--lg', icon: 'play', data: { screen: 'play' } })}${btn('Open the store', 'go', { cls: 'btn--ghost btn--lg', icon: 'store', data: { screen: 'store' } })}</div>
      <dl class="mlog"><dt>Mission log</dt>${S.log.slice(0, 3).map(([l, d]) => `<dd><span>${esc(l)}</span><b>${esc(d)}</b></dd>`).join('')}</dl>
    </section>`;
  },
  play() {
    const g = ui.game;
    if (g && g.on) {
      return `<section class="train is-on" aria-labelledby="ptitle"><h1 class="sr-only" id="ptitle" tabindex="-1">Training round</h1>
        <div class="train__hud"><span><i>Time</i><b id="g-time">${g.left}</b></span><span><i>Hits</i><b id="g-hits">${g.hits}</b></span><span><i>Koban</i><b id="g-pay">+${num(g.pay)}</b></span></div>
        <div class="train__field" id="g-field" aria-label="Training field. Activate a target to throw."></div>
        <p class="train__tip">Click, tap, or press Enter on a target to throw.</p></section>`;
    }
    return `${head('Training grounds', COPY.train, 'Train')}
      <div class="panel panel--train"><div class="train__art">${thumb('ironstars')}</div>
      <div><p class="eyebrow">Solo drill</p><h2 class="h2">Shuriken practice</h2><p class="muted">20 seconds. 50 Koban a hit, with a bonus for streaks. What you earn lands in your wallet, where it can be spent or cashed out.</p>
      <p class="muted">Best round: <b>${S.best} hits</b></p>${btn('Start round', 'train-start', { cls: 'btn--accent btn--lg', icon: 'play' })}</div></div>`;
  },
  store() {
    const list = sorted(STORE.filter((s) => s.tabs.includes(ui.storeTab)), (s) => s.sku);
    return `${head('Store', COPY.store)}
      <div class="tools"><div class="tabs" role="tablist" aria-label="Store sections">${STORE_TABS.map(([k, l]) => `<button type="button" role="tab" aria-selected="${ui.storeTab === k}" class="tab" data-act="store-tab" data-tab="${k}">${l}</button>`).join('')}</div>${sortSelect()}</div>
      <ul class="grid">${list.map((s) => {
        const it = ITEMS[s.sku], owned = s.kind === 'pass' && S.pass;
        return `<li><button type="button" class="card r-${it.rarity}" data-act="buy" data-sku="${s.sku}"${owned ? ' disabled' : ''}>
          <span class="card__art">${thumb(s.sku)}</span><span class="card__rar">${rar(it.rarity)} · ${TYPE_LABEL[it.type]}</span>
          <span class="card__name">${it.name}</span><span class="card__desc">${it.desc}</span>
          <span class="card__foot">${owned ? '<span class="price"><b>Active</b></span>' : priceHtml(s.price)}<span class="card__tag">${s.price.usd ? 'Wallet' : 'Instant'}</span></span></button></li>`;
      }).join('')}</ul>`;
  },
  inventory() {
    const tabs = `<div class="tabs tabs--line" role="tablist" aria-label="Inventory sections">
      <button type="button" role="tab" class="tab" aria-selected="${ui.invTab === 'gear'}" data-act="inv-tab" data-tab="gear">My gear</button>
      <button type="button" role="tab" class="tab" aria-selected="${ui.invTab === 'market'}" data-act="inv-tab" data-tab="market">Marketplace</button></div>`;
    if (ui.invTab === 'market') return `${head('Marketplace', COPY.market, 'Market')}${tabs}${marketHtml()}`;
    const filters = [['all', 'All'], ['weapon', 'Weapons'], ['armor', 'Armor'], ['scroll', 'Scrolls'], ['gear', 'Gear']];
    const list = sorted(S.inv.filter((it) => ui.invFilter === 'all' || ITEMS[it.id].type === ui.invFilter), (it) => it.id);
    return `${head('Inventory', COPY.inventory)}${tabs}
      <div class="tools"><div class="chips" role="group" aria-label="Filter by type">${filters.map(([k, l]) => `<button type="button" class="chip" aria-pressed="${ui.invFilter === k}" data-act="inv-filter" data-f="${k}">${l}</button>`).join('')}</div>
      <span class="kits">${thumb('forge', 'thumb--xs')}<b>${S.kits}</b> Forge Kit${S.kits === 1 ? '' : 's'}</span>${sortSelect()}</div>
      ${list.length ? `<ul class="grid grid--inv">${list.map((it) => {
        const d = ITEMS[it.id], st = statOf(it);
        return `<li class="card card--inv r-${d.rarity}${it.eq ? ' is-eq' : ''}">
          <div class="card__top"><span class="card__art card__art--sm">${thumb(it.id)}</span><div><span class="card__rar">${rar(d.rarity)} · Lv ${it.lvl}</span><h2 class="card__name">${d.name}</h2><span class="card__type">${TYPE_LABEL[d.type]}${it.eq ? ' · Equipped' : ''}</span></div></div>
          <dl class="stats">${STATS.map((s, i) => `<div><dt>${s}</dt><dd>${st[i]}</dd></div>`).join('')}</dl>
          <div class="card__acts">${btn(it.eq ? 'Unequip' : 'Equip', 'equip', { cls: it.eq ? 'btn--ghost' : 'btn--accent', data: { uid: it.uid } })}
          <button type="button" class="ibtn" data-act="upgrade" data-uid="${it.uid}" aria-label="Upgrade ${esc(d.name)} with a Forge Kit" title="Upgrade">${ico('arrowUp')}</button>
          <button type="button" class="ibtn" data-act="list" data-uid="${it.uid}" aria-label="List ${esc(d.name)} on the marketplace" title="List on marketplace">${ico('tag')}</button></div></li>`;
      }).join('')}</ul>` : `<p class="empty">Nothing here yet. ${btn('Visit the store', 'go', { cls: 'btn--ghost', data: { screen: 'store' } })}</p>`}`;
  },
  referral() {
    return `${head('Refer a friend', COPY.referral)}
      <div class="cols"><div class="panel"><p class="eyebrow">Your clan code</p><p class="code">${PLAYER.code}</p>
        <p class="muted">Share it. Every recruit who joins earns you a cut of their first season.</p>${btn('Copy code', 'copy-code', { cls: 'btn--ghost', icon: 'copy' })}
        <hr><p class="eyebrow">Available to cash out</p><p class="big">${usd(S.refCash)}</p><p class="muted">${S.refCash ? 'From 2 active referrals' : 'Paid out to your wallet'}</p>
        ${btn(S.refCash ? 'Cash out earnings' : 'Paid out', 'claim', { cls: 'btn--accent', icon: 'down', disabled: !S.refCash, data: { what: 'ref' } })}</div>
      <div class="panel"><p class="eyebrow">Tracked referrals</p><ul class="rows">${REFERRALS.map(([n, st, amt]) => `<li><span class="ava" aria-hidden="true">${n[0]}</span><span class="rows__main"><b>${n}</b><i class="${st === 'Qualified' ? 'ok' : ''}">${st}</i></span><span class="rows__amt">${usd(amt)}</span></li>`).join('')}</ul></div></div>`;
  },
  ranks() {
    return `${head('Leaderboard', COPY.ranks)}
      <div class="cols"><div class="panel"><p class="eyebrow">Storm season · Standings</p><ol class="rows rows--rank">${STANDINGS.map(([n, pts, prize], i) => `<li class="${n === PLAYER.clan ? 'is-you' : ''}"><span class="rank">${i + 1}</span><span class="rows__main"><b>${n}${n === PLAYER.clan ? ' <em>You</em>' : ''}</b><i>${num(pts)} pts</i></span><span class="rows__amt">${usd(prize)}</span></li>`).join('')}</ol></div>
      <div class="panel"><p class="eyebrow">Your share of the pot</p><p class="big">${usd(S.prize)}</p><p class="muted">${S.prize ? `Rank 4 · ${PLAYER.clan} clan` : 'Claimed. It is in your wallet.'}</p>
        ${btn(S.prize ? 'Cash out prize' : 'Claimed', 'claim', { cls: 'btn--accent', icon: 'down', disabled: !S.prize, data: { what: 'prize' } })}</div></div>`;
  },
  creator() {
    const spark = (pts) => { const mx = Math.max(...pts); const d = pts.map((v, i) => `${i ? 'L' : 'M'}${(i / (pts.length - 1)) * 120} ${40 - (v / mx) * 34}`).join(' '); return `<svg class="spark" viewBox="0 0 120 42" aria-hidden="true"><path class="spark__fill" d="${d} L120 42 L0 42 Z"/><path class="spark__line" d="${d}"/></svg>`; };
    return `${head('Creator portal', COPY.creator)}
      <div class="cols cols--2">${CREATOR.map(([l, amt, pct, pts]) => `<div class="panel"><p class="eyebrow">${l}</p><p class="big">${usd(amt)}</p><p class="muted">${pct}% of revenue, last 6 months</p>${spark(pts)}</div>`).join('')}
      <div class="panel panel--hot"><p class="eyebrow">Studio payout</p><p class="big">${usd(S.creator)}</p><p class="muted">${S.creator ? 'Ready to request' : 'Requested. Watch it settle in your wallet.'}</p>${btn(S.creator ? 'Request payout' : 'Requested', 'claim', { cls: 'btn--accent', icon: 'down', disabled: !S.creator, data: { what: 'creator' } })}</div></div>`;
  },
  profile() {
    return `${head('Profile', COPY.profile)}
      <div class="cols"><div class="panel"><div class="who"><span class="who__ava">${thumb('menpo')}</span><div><h2 class="h2">${PLAYER.name}</h2><p class="muted">${PLAYER.code} · Level ${PLAYER.level} · ${PLAYER.clan} clan</p></div></div>
        <dl class="pstats">${PLAYER.stats.map(([v, l]) => `<div><dd>${v}</dd><dt>${l}</dt></div>`).join('')}</dl></div>
      <div class="panel"><p class="eyebrow">Studio theme</p><p class="muted">The store and wallet take the studio’s colors. Try another.</p>
        <div class="chips" role="group" aria-label="Accent color">${Object.entries(ACCENTS).map(([k, [l, c]]) => `<button type="button" class="chip chip--sw" aria-pressed="${S.accent === k}" data-act="accent" data-k="${k}"><i style="background:${c}"></i>${l}</button>`).join('')}</div>
        <hr><p class="eyebrow">Demo controls</p><p class="muted">Reset every balance, item, listing, and transaction to the start of the demo.</p>${btn('Reset demo', 'reset', { cls: 'btn--danger', icon: 'reset' })}</div></div>`;
  },
};
SCREENS.market = SCREENS.inventory;

function marketHtml() {
  const mine = S.listings, others = sorted(MARKET.filter((m) => !S.bought.includes(m.mid)), (m) => m.id);
  return `${mine.length ? `<p class="eyebrow">Your listings</p><ul class="grid">${mine.map((l) => { const d = ITEMS[l.id]; return `<li class="card card--mk r-${d.rarity}"><span class="card__art">${thumb(l.id)}</span><span class="card__rar">${rar(d.rarity)} · Lv ${l.lvl}</span><h2 class="card__name">${d.name}</h2><span class="card__desc">Listed. Waiting for a buyer.</span><span class="card__foot"><span class="price price--usd"><b>${usd(l.price)}</b></span>${btn('Cancel', 'unlist', { cls: 'btn--ghost btn--sm', data: { uid: l.uid } })}</span></li>`; }).join('')}</ul>` : ''}
    <div class="tools"><p class="eyebrow">For sale by other players</p>${sortSelect()}</div>
    ${others.length ? `<ul class="grid">${others.map((mk) => { const d = ITEMS[mk.id]; return `<li><button type="button" class="card r-${d.rarity}" data-act="mbuy" data-mid="${mk.mid}"><span class="card__art">${thumb(mk.id)}</span><span class="card__rar">${rar(d.rarity)} · Lv ${mk.lvl}</span><span class="card__name">${d.name}</span><span class="card__desc">Sold by ${mk.seller}</span><span class="card__foot"><span class="price price--usd"><b>${usd(mk.price)}</b></span><span class="card__tag">Buy</span></span></button></li>`; }).join('')}</ul>` : '<p class="empty">You bought everything. New listings arrive each season.</p>'}`;
}

/* ---------- shell ---------- */
function renderNav() {
  $('#nav').innerHTML = NAV.map(([k, l, i]) => `<li><button type="button" class="nav__btn" data-act="go" data-screen="${k}"${ui.screen === k ? ' aria-current="page"' : ''}>${ico(i)}<span>${l}</span></button></li>`).join('');
}
function renderHud() {
  $('#hud').innerHTML = `<span class="pill" title="Koban">${CUR.k}<b>${num(S.koban)}</b><span class="sr-only"> Koban</span></span>
    <span class="pill" title="Jade">${CUR.j}<b>${num(S.jade)}</b><span class="sr-only"> Jade</span></span>
    <button type="button" class="pill pill--btn" data-act="wallet" aria-haspopup="dialog">${ico('wallet')}<b>${usd(S.usd)}</b><span class="sr-only"> in your wallet. Open wallet</span></button>`;
}
function render(focus) {
  document.body.dataset.screen = ui.screen;
  document.body.dataset.accent = S.accent;
  document.body.classList.toggle('is-training', !!(ui.game && ui.game.on));
  renderNav();
  renderHud();
  const view = $('#view');
  view.innerHTML = SCREENS[ui.screen]();
  const live = ui.screen === 'home' || (ui.screen === 'play' && ui.game && ui.game.on);
  if (stage) stage.setPaused(!live);
  if (heroVideo) { if (live) heroVideo.play().catch(() => {}); else heroVideo.pause(); }
  if (focus) { view.scrollTop = 0; const h = $('#ptitle'); if (h) h.focus({ preventScroll: true }); }
}
function go(screen) {
  if (ui.game && ui.game.on && screen !== 'play') endRound(true);
  if (screen === 'market') { ui.screen = 'market'; ui.invTab = 'market'; } else { ui.screen = screen; if (screen === 'inventory') ui.invTab = 'gear'; }
  render(true);
}

/* ---------- overlays: focus handling shared by the modal and the wallet ---------- */
function lockShell(on) { $('#shell').inert = on; }
function trapFocus(root) {
  const first = root.querySelector('[data-autofocus]') || root.querySelector('button:not([disabled]), input, select, a[href]');
  if (first) first.focus({ preventScroll: true });
}
function closeOverlays() { if (ui.modal) closeModal(); else if (ui.wallet) closeWallet(); }

/* ---------- modal ---------- */
function openModal(m) {
  if (!ui.modal && !ui.wallet) ui.opener = document.activeElement;
  ui.modal = m;
  renderModal();
}
function closeModal() {
  hideItem();
  ui.modal = null;
  $('#modal').hidden = true;
  $('#modal').innerHTML = '';
  if (ui.wallet) { $('#wallet').inert = false; trapFocus($('#wallet')); } else { lockShell(false); const back = ui.opener && ui.opener.isConnected ? ui.opener : $('#ptitle'); if (back) back.focus({ preventScroll: true }); }
}
function itemSummary(id, lvl) {
  const d = ITEMS[id];
  const st = d.stats ? `<dl class="stats">${STATS.map((s, i) => `<div><dt>${s}</dt><dd>${Math.round(d.stats[i] * (1 + 0.15 * ((lvl || 1) - 1)))}</dd></div>`).join('')}</dl>` : '';
  return `<div class="viewer r-${d.rarity}" id="viewer"></div><p class="card__rar r-${d.rarity}">${rar(d.rarity)} · ${TYPE_LABEL[d.type]}</p><h2 class="h2" id="modal-h">${d.name}</h2><p class="muted">${d.desc}</p>${st}`;
}
function renderModal() {
  const m = ui.modal, host = $('#modal');
  let body = '', viewId = null;
  if (m.kind === 'buy') {
    const s = STORE.find((x) => x.sku === m.sku);
    viewId = s.sku;
    const short = s.price.k ? S.koban < s.price.k : s.price.j ? S.jade < s.price.j : S.usd < s.price.usd;
    const source = s.price.usd ? `Charged to your wallet balance (${usd(S.usd)})` : s.price.k ? `Paid in Koban (you have ${num(S.koban)})` : `Paid in Jade (you have ${num(S.jade)})`;
    body = `${itemSummary(s.sku)}<div class="sum"><div><span>Price</span>${priceHtml(s.price)}</div><p>${source}</p></div>
      ${short ? `<p class="err" role="alert">${s.price.usd ? 'Your wallet balance is too low for this.' : s.price.k ? 'You need more Koban for this.' : 'You need more Jade for this.'}</p>
        <div class="acts">${s.price.usd ? btn('Add money', 'wallet-add', { cls: 'btn--accent', icon: 'down' }) : btn('Buy currency', 'to-currency', { cls: 'btn--accent', icon: 'coins' })}${btn('Cancel', 'close', { cls: 'btn--ghost' })}</div>`
      : `<div class="acts">${btn('Confirm purchase', 'buy-ok', { cls: 'btn--accent', icon: 'check', data: { sku: s.sku, autofocus: '' } })}${btn('Cancel', 'close', { cls: 'btn--ghost' })}</div>`}`;
  } else if (m.kind === 'bought') {
    viewId = m.id;
    body = `<p class="stamp">${ico('check')}Purchase complete</p>${itemSummary(m.id)}<p class="muted">${m.note}</p>
      <div class="acts">${m.uid ? btn('Equip now', 'equip', { cls: 'btn--accent', data: { uid: m.uid, close: '1', autofocus: '' } }) : ''}${btn('Keep shopping', 'close', { cls: m.uid ? 'btn--ghost' : 'btn--accent', data: m.uid ? {} : { autofocus: '' } })}${m.uid ? btn('View inventory', 'go', { cls: 'btn--ghost', data: { screen: 'inventory', close: '1' } }) : ''}</div>`;
  } else if (m.kind === 'mbuy') {
    const mk = MARKET.find((x) => x.mid === m.mid);
    viewId = mk.id;
    const short = S.usd < mk.price;
    body = `${itemSummary(mk.id, mk.lvl)}<div class="sum"><div><span>Buying from ${mk.seller}</span><span class="price price--usd"><b>${usd(mk.price)}</b></span></div><p>Charged to your wallet balance (${usd(S.usd)}). The seller is paid at once.</p></div>
      ${short ? `<p class="err" role="alert">Your wallet balance is too low for this.</p><div class="acts">${btn('Add money', 'wallet-add', { cls: 'btn--accent', icon: 'down' })}${btn('Cancel', 'close', { cls: 'btn--ghost' })}</div>`
      : `<div class="acts">${btn('Buy now', 'mbuy-ok', { cls: 'btn--accent', icon: 'check', data: { mid: mk.mid, autofocus: '' } })}${btn('Cancel', 'close', { cls: 'btn--ghost' })}</div>`}`;
  } else if (m.kind === 'list') {
    const it = S.inv.find((x) => x.uid === m.uid), d = ITEMS[it.id];
    viewId = it.id;
    const price = m.price === undefined ? SUGGESTED[d.rarity] : m.price;
    body = `${itemSummary(it.id, it.lvl)}<label class="field"><span>Your price (USD)</span><input id="list-price" inputmode="decimal" autocomplete="off" value="${price.toFixed(2)}" data-autofocus></label>
      <div class="sum"><div><span>Marketplace fee (${MARKET_FEE * 100}%)</span><b id="list-fee">${usd(price * MARKET_FEE)}</b></div><div><span>You receive when it sells</span><b id="list-net">${usd(price * (1 - MARKET_FEE))}</b></div><p>Sale proceeds go to your wallet in USD, ready to spend or cash out.</p></div>
      <div class="acts">${btn('List item', 'list-ok', { cls: 'btn--accent', icon: 'tag', data: { uid: it.uid } })}${btn('Cancel', 'close', { cls: 'btn--ghost' })}</div>`;
  } else if (m.kind === 'reset') {
    body = `<h2 class="h2" id="modal-h">Reset the demo?</h2><p class="muted">Balances, items, listings, and transactions go back to where they started.</p><div class="acts">${btn('Reset', 'reset-ok', { cls: 'btn--danger', icon: 'reset' })}${btn('Cancel', 'close', { cls: 'btn--ghost', data: { autofocus: '' } })}</div>`;
  } else if (m.kind === 'round') {
    viewId = 'kobanchest';
    body = `<p class="stamp">${ico('check')}Training complete</p><div class="viewer r-legendary" id="viewer"></div><h2 class="h2" id="modal-h">${m.hits} hit${m.hits === 1 ? '' : 's'} · +${num(m.pay)} Koban</h2>
      <p class="muted">${m.pay ? `That is ${usd(m.pay / RATE.koban)} you could cash out. It is in your wallet now.` : 'No hits this time. The targets will be back.'}</p>
      <div class="acts">${btn('Train again', 'train-start', { cls: 'btn--accent', icon: 'play', data: { close: '1', autofocus: '' } })}${btn('Open wallet', 'wallet', { cls: 'btn--ghost', icon: 'wallet', data: { close: '1' } })}${btn('Done', 'close', { cls: 'btn--ghost' })}</div>`;
  }
  host.innerHTML = `<div class="modal__scrim" data-act="close"></div><div class="modal__box" role="dialog" aria-modal="true" aria-labelledby="modal-h"><button type="button" class="ibtn modal__x" data-act="close" aria-label="Close">${ico('x')}</button>${body}</div>`;
  host.hidden = false;
  lockShell(true);
  if (ui.wallet) $('#wallet').inert = true;
  const v = $('#viewer');
  if (v && viewId) {
    if (ITEM_ART && ITEM_ART[modelOf(viewId)]) v.innerHTML = `<img class="viewer__img" src="${ITEM_ART[modelOf(viewId)]}" alt="" width="384" height="384">`;
    else showItem(v, modelOf(viewId));
  }
  trapFocus(host);
}

/* ---------- purchases and inventory ---------- */
function giveItem(id) { const it = { uid: S.nextUid++, id, lvl: 1, eq: false }; S.inv.push(it); return it; }
function buy(sku) {
  const s = STORE.find((x) => x.sku === sku), d = ITEMS[sku], p = s.price;
  if (p.k) { if (S.koban < p.k) return; S.koban -= p.k; }
  else if (p.j) { if (S.jade < p.j) return; S.jade -= p.j; }
  else { if (S.usd < p.usd) return; S.usd = cents(S.usd - p.usd); addTx({ title: 'Store purchase', sub: d.name, amt: -p.usd, status: 'settled', kind: 'buy' }); }
  let done = { kind: 'bought', id: sku, note: '' };
  if (s.kind === 'item') { const it = giveItem(sku); done.uid = it.uid; done.note = 'Added to your inventory.'; }
  else if (s.kind === 'pack') { if (s.grant.koban) S.koban += s.grant.koban; if (s.grant.jade) S.jade += s.grant.jade; done.note = `${s.grant.koban ? num(s.grant.koban) + ' Koban' : num(s.grant.jade) + ' Jade'} added. Settled the moment you paid.`; }
  else if (s.kind === 'kit') { S.kits += 1; done.note = `You now hold ${S.kits} Forge Kit${S.kits === 1 ? '' : 's'}. Use one from your inventory.`; }
  else if (s.kind === 'pass') { S.pass = true; S.koban += 2000; done.note = 'Storm Pass is active. 2,000 bonus Koban added.'; }
  else if (s.kind === 'daruma') { const pool = DARUMA_POOL.filter((id) => !S.inv.some((x) => x.id === id)); const id = (pool.length ? pool : DARUMA_POOL)[Math.floor(Math.random() * (pool.length || DARUMA_POOL.length))]; const it = giveItem(id); done = { kind: 'bought', id, uid: it.uid, note: 'The daruma granted your wish. Added to your inventory.' }; }
  log(d.name, p.k ? `-${num(p.k)} K` : p.j ? `-${num(p.j)} J` : `-${usd(p.usd)}`);
  save();
  render();
  ui.modal = done;
  renderModal();
}
function equip(uid) {
  const it = S.inv.find((x) => x.uid === uid);
  if (!it) return;
  if (!it.eq) for (const o of S.inv) if (o.eq && ITEMS[o.id].type === ITEMS[it.id].type) o.eq = false;
  it.eq = !it.eq;
  toast(`${ITEMS[it.id].name} ${it.eq ? 'equipped' : 'unequipped'}.`);
  save(); render();
}
function upgrade(uid) {
  const it = S.inv.find((x) => x.uid === uid);
  if (!it) return;
  if (S.kits < 1) { toast('You need a Forge Kit. The store sells them for 2,500 Koban.', 'warn'); return; }
  if (it.lvl >= 5) { toast(`${ITEMS[it.id].name} is already at its top level.`); return; }
  S.kits -= 1; it.lvl += 1;
  toast(`${ITEMS[it.id].name} is now level ${it.lvl}.`, 'good');
  if (stage) stage.flash();
  save(); render();
}
function listItem(uid) {
  const it = S.inv.find((x) => x.uid === uid), input = $('#list-price');
  const price = cents(parseFloat(input.value.replace(/[^0-9.]/g, '')));
  if (!it || !(price >= 1) || price > 500) { input.setAttribute('aria-invalid', 'true'); toast('Set a price between $1.00 and $500.00.', 'warn'); input.focus(); return; }
  S.inv = S.inv.filter((x) => x.uid !== uid);
  S.listings.push({ uid, id: it.id, lvl: it.lvl, price, sellAt: Date.now() + 14000 + Math.random() * 6000 });
  save(); closeModal();
  ui.screen = 'market'; ui.invTab = 'market';
  render(true);
  toast(`${ITEMS[it.id].name} listed for ${usd(price)}.`, 'good');
}
function unlist(uid) {
  const l = S.listings.find((x) => x.uid === uid);
  if (!l) return;
  S.listings = S.listings.filter((x) => x.uid !== uid);
  S.inv.push({ uid: l.uid, id: l.id, lvl: l.lvl, eq: false });
  toast(`${ITEMS[l.id].name} is back in your inventory.`);
  save(); render();
}
function marketBuy(mid) {
  const mk = MARKET.find((x) => x.mid === mid);
  if (!mk || S.usd < mk.price) return;
  S.usd = cents(S.usd - mk.price);
  S.bought.push(mid);
  const it = { uid: S.nextUid++, id: mk.id, lvl: mk.lvl, eq: false };
  S.inv.push(it);
  addTx({ title: 'Marketplace purchase', sub: ITEMS[mk.id].name, amt: -mk.price, status: 'settled', kind: 'buy' });
  log(ITEMS[mk.id].name, `-${usd(mk.price)}`);
  save(); render();
  ui.modal = { kind: 'bought', id: mk.id, uid: it.uid, note: `Bought from ${mk.seller}. Added to your inventory.` };
  renderModal();
}
function claim(what) {
  const map = { ref: ['refCash', 'Referral earnings', 'Clan code ' + PLAYER.code], prize: ['prize', 'Season prize', 'Storm season, rank 4'], creator: ['creator', 'Creator payout', 'Studio payout'] };
  const [key, title, sub] = map[what], amt = S[key];
  if (!amt) return;
  S[key] = 0;
  if (what === 'creator') { addTx({ title, sub, amt, status: 'requested', kind: 'in', settleAt: Date.now() + 6000, credit: true }); toast(`Payout of ${usd(amt)} requested. It will settle in a few seconds.`); }
  else { S.usd = cents(S.usd + amt); addTx({ title, sub, amt, status: 'settled', kind: 'in' }); toast(`${usd(amt)} added to your wallet.`, 'good'); }
  log(title, `+${usd(amt)}`);
  save(); render();
}

/* ---------- training round ---------- */
function startRound() {
  if (ui.modal) closeModal();
  ui.screen = 'play';
  ui.game = { on: true, left: 20, hits: 0, pay: 0, streak: 0, timers: [] };
  render(true);
  const g = ui.game;
  g.timers.push(setInterval(() => { g.left -= 1; const t = $('#g-time'); if (t) t.textContent = g.left; if (g.left <= 0) endRound(false); }, 1000));
  const spawn = () => {
    const field = $('#g-field');
    if (!field || !g.on) return;
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'target';
    el.dataset.act = 'hit';
    el.setAttribute('aria-label', 'Target');
    el.style.left = 6 + Math.random() * 80 + '%';
    el.style.top = 8 + Math.random() * 68 + '%';
    el.innerHTML = '<svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="28" class="t1"/><circle cx="30" cy="30" r="19" class="t2"/><circle cx="30" cy="30" r="10" class="t1"/><circle cx="30" cy="30" r="3.5" class="t3"/></svg>';
    field.appendChild(el);
    setTimeout(() => { if (el.isConnected && !el.classList.contains('is-hit')) { el.remove(); g.streak = 0; } }, 1900);
  };
  spawn();
  g.timers.push(setInterval(spawn, 620));
}
function hit(el) {
  const g = ui.game;
  if (!g || !g.on || el.classList.contains('is-hit')) return;
  el.classList.add('is-hit');
  g.hits += 1; g.streak += 1;
  const gain = 50 + (g.streak >= 3 ? 25 : 0);
  g.pay += gain;
  $('#g-hits').textContent = g.hits;
  $('#g-pay').textContent = '+' + num(g.pay);
  const field = $('#g-field'), fr = field.getBoundingClientRect(), tr = el.getBoundingClientRect();
  const star = document.createElement('img');
  star.className = 'star';
  star.alt = '';
  star.src = T.ironstars || '';
  const tx = tr.left - fr.left + tr.width / 2, ty = tr.top - fr.top + tr.height / 2;
  star.style.setProperty('--x0', fr.width * 0.78 + 'px'); star.style.setProperty('--y0', fr.height * 0.6 + 'px');
  star.style.setProperty('--x1', tx + 'px'); star.style.setProperty('--y1', ty + 'px');
  field.appendChild(star);
  const pop = document.createElement('span');
  pop.className = 'pop'; pop.textContent = '+' + gain;
  pop.style.left = tx + 'px'; pop.style.top = ty + 'px';
  field.appendChild(pop);
  if (!REDUCED) { document.body.classList.add('is-shake'); setTimeout(() => document.body.classList.remove('is-shake'), 140); }
  setTimeout(() => { star.remove(); el.remove(); }, 380);
  setTimeout(() => pop.remove(), 700);
}
function endRound(silent) {
  const g = ui.game;
  if (!g || !g.on) return;
  g.on = false;
  g.timers.forEach(clearInterval);
  if (g.pay) { S.koban += g.pay; log('Training round', `+${num(g.pay)} K`); }
  S.best = Math.max(S.best, g.hits);
  save();
  if (silent) return;
  render();
  openModal({ kind: 'round', hits: g.hits, pay: g.pay });
}

/* ---------- wallet ---------- */
const W = () => ui.wallet;
function openWallet(view = { v: 'home' }) {
  if (ui.modal) closeModal();
  if (!ui.wallet) ui.opener = document.activeElement;
  ui.wallet = { stack: view.v === 'home' ? [view] : [{ v: 'home' }, view], d: {} };
  $('#wallet').hidden = false;
  lockShell(true);
  requestAnimationFrame(() => $('#wallet').classList.add('is-open'));
  renderWallet(true);
}
function closeWallet() {
  ui.wallet = null;
  const el = $('#wallet');
  el.classList.remove('is-open');
  el.hidden = true;
  lockShell(false);
  const back = ui.opener && ui.opener.isConnected ? ui.opener : $('#ptitle');
  if (back) back.focus({ preventScroll: true });
}
function wPush(view) { W().stack.push(view); renderWallet(true); }
function wBack() { const w = W(); if (w.stack.length > 1) { w.stack.pop(); renderWallet(true); } else closeWallet(); }
function wHome() { W().stack = [{ v: 'home' }]; W().d = {}; renderWallet(true); }
const STATUS = { settled: ['Settled', 'ok'], sent: ['Sent', 'ok'], requested: ['Requested', 'wait'], processing: ['Processing', 'wait'], failed: ['Failed', 'bad'] };
function txRow(t) {
  const [label, tone] = STATUS[t.status];
  return `<li><button type="button" class="tx" data-act="w-tx" data-id="${t.id}"><span class="tx__ic tx__ic--${t.kind}">${ico(t.kind === 'out' ? 'up' : t.kind === 'buy' ? 'cart' : 'down')}</span>
    <span class="tx__main"><b>${esc(t.title)}</b><i>${when(t.ts)} · <span class="st st--${tone}">${label}</span></i></span>
    <span class="tx__amt ${t.amt > 0 ? 'pos' : ''}">${t.amt > 0 ? '+' : ''}${usd(t.amt)}</span></button></li>`;
}
function timeline(t) {
  const steps = t.kind === 'out' ? [['Requested', true], ['Processing', t.status !== 'requested'], ['Sent to ' + (t.dest || 'your account'), t.status === 'sent']]
    : [['Requested', true], ['Settled in your wallet', t.status === 'settled']];
  return `<ol class="tl">${steps.map(([l, done]) => `<li class="${done ? 'is-done' : ''}"><span class="tl__dot">${done ? ico('check') : ''}</span>${l}</li>`).join('')}</ol>`;
}
function amountOf(str) { const n = parseFloat(String(str || '').replace(/[^0-9.]/g, '')); return isFinite(n) ? cents(n) : 0; }
function cashDraft() {
  const d = W().d, m = CASH_METHODS.find((x) => x.key === d.method) || CASH_METHODS[0];
  const src = d.src || 'usd', avail = src === 'usd' ? S.usd : cents(S.koban / RATE.koban), amt = amountOf(d.amount);
  const fee = cents(amt * m.fee), net = cents(amt - fee);
  const error = !amt ? '' : amt < LIMITS.cashMin ? `The minimum cash out is ${usd(LIMITS.cashMin)}.` : amt > avail ? `You have ${usd(avail)} available from this balance.` : '';
  return { m, src, avail, amt, fee, net, error, ok: amt >= LIMITS.cashMin && amt <= avail };
}
function wTop(title, back = true) {
  return `<div class="w__top">${back ? `<button type="button" class="ibtn" data-act="w-back" aria-label="Back">${ico('back')}</button>` : '<span class="w__seal" aria-hidden="true">' + ico('bolt') + '</span>'}
    <h2 class="w__title" id="wallet-h" tabindex="-1">${title}</h2><button type="button" class="ibtn" data-act="wallet-close" aria-label="Close wallet">${ico('x')}</button></div>`;
}
const opt = (act, icon, title, sub, data = '') => `<li><button type="button" class="opt" data-act="${act}" ${data}><span class="opt__ic">${ico(icon)}</span><span class="opt__main"><b>${title}</b><i>${sub}</i></span>${ico('next', 'opt__go')}</button></li>`;
const WV = {
  home() {
    return `${wTop('Storm Wallet', false)}
      <div class="w__bal"><p>Available to cash out</p><p class="w__big">${usd(cashable())}</p>
        <ul class="w__tiles"><li>${CUR.usd}<b>${usd(S.usd)}</b><i>USD balance</i></li><li>${CUR.k}<b>${num(S.koban)}</b><i>Koban · ${usd(S.koban / RATE.koban)}</i></li><li>${CUR.j}<b>${num(S.jade)}</b><i>Jade · spend only</i></li></ul></div>
      <div class="w__acts">${btn('Add money', 'w-go', { cls: 'btn--accent', icon: 'down', data: { v: 'add', autofocus: '' } })}${btn('Cash out', 'w-go', { cls: 'btn--paper', icon: 'up', data: { v: 'cash' } })}</div>
      <div class="w__sec"><h3>Transactions</h3><button type="button" class="link" data-act="w-go" data-v="txs">View all</button></div>
      <ul class="txs">${S.tx.slice(0, 4).map(txRow).join('')}</ul>
      <p class="w__note">Embedded wallet demo. Sample data, no real money moves.</p>`;
  },
  txs() { return `${wTop('Transactions')}<ul class="txs">${S.tx.map(txRow).join('')}</ul>`; },
  tx(v) {
    const t = S.tx.find((x) => x.id === v.id);
    if (!t) return WV.txs();
    return `${wTop('Transaction')}<div class="w__done"><p class="w__amt ${t.amt > 0 ? 'pos' : ''}">${t.amt > 0 ? '+' : ''}${usd(t.amt)}</p><p class="muted">${esc(t.title)}${t.sub ? ' · ' + esc(t.sub) : ''}</p></div>
      ${t.kind === 'buy' ? '' : timeline(t)}
      <dl class="kv"><div><dt>Date</dt><dd>${when(t.ts)}</dd></div>${t.fee !== undefined ? `<div><dt>Fee</dt><dd>${usd(t.fee)}</dd></div>` : ''}${t.eta && t.status !== 'sent' ? `<div><dt>Estimated arrival</dt><dd>${t.eta}</dd></div>` : ''}<div><dt>Reference</dt><dd>${t.id}</dd></div></dl>`;
  },
  add() {
    return `${wTop('Add money')}<ul class="opts">
      ${opt('w-go', 'bank', 'Add USD from your bank', 'Bank ••4821 · No fee', 'data-v="addamt" data-autofocus')}
      ${opt('w-go', 'gift', 'Redeem a gift code', 'No fee · Instant', 'data-v="code"')}
      ${opt('to-currency', 'coins', 'Buy Koban or Jade', 'Opens the store', '')}</ul>`;
  },
  addamt() {
    const d = W().d, amt = amountOf(d.add);
    const error = amt > LIMITS.addMax ? `Enter an amount up to ${usd(LIMITS.addMax)}.` : '';
    return `${wTop('Add USD')}<label class="amt"><span>Amount</span><span class="amt__in"><i>$</i><input id="w-amt" inputmode="decimal" autocomplete="off" placeholder="0.00" value="${esc(d.add || '')}" data-input="add" data-autofocus aria-describedby="w-err"></span></label>
      <div class="chips">${[10, 25, 50, 100].map((n) => `<button type="button" class="chip" data-act="w-chip" data-field="add" data-val="${n}">${usd(n)}</button>`).join('')}</div>
      <p class="err" id="w-err" role="alert">${error}</p><p class="muted">From Bank ••4821. Up to ${usd(LIMITS.addMax)} per deposit.</p>
      <div class="w__foot">${btn('Review', 'w-go', { cls: 'btn--accent', data: { v: 'addrev' }, disabled: !(amt > 0) || !!error })}</div>`;
  },
  addrev() {
    const amt = amountOf(W().d.add);
    return `${wTop('Review deposit')}<div class="w__done"><p class="w__amt">${usd(amt)}</p><p class="muted">From Bank ••4821 to your Storm Wallet</p></div>
      <dl class="kv"><div><dt>Amount</dt><dd>${usd(amt)}</dd></div><div><dt>Fee</dt><dd>${usd(0)}</dd></div><div><dt>Estimated arrival</dt><dd>Within minutes</dd></div></dl>
      <div class="w__foot">${btn('Confirm deposit', 'w-add-ok', { cls: 'btn--accent', icon: 'check', data: { autofocus: '' } })}</div>`;
  },
  code() {
    return `${wTop('Redeem a gift code')}<label class="field"><span>Gift code</span><input id="w-code" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="${GIFT_CODE.code}" value="${esc(W().d.code || '')}" data-input="code" data-autofocus aria-describedby="w-err"></label>
      <p class="err" id="w-err" role="alert">${W().d.codeErr || ''}</p><p class="muted">Demo code: ${GIFT_CODE.code} adds ${usd(GIFT_CODE.usd)}.</p>
      <div class="w__foot">${btn('Redeem', 'w-code-ok', { cls: 'btn--accent' })}</div>`;
  },
  cash() {
    return `${wTop('Cash out')}<p class="muted">Send your balance, or the Koban you earned, out of the game.</p><ul class="opts">${CASH_METHODS.map((m, i) => opt('w-method', m.icon, m.title, m.sub, `data-key="${m.key}"${i ? '' : ' data-autofocus'}`)).join('')}</ul>
      <p class="w__note">Fees and timing shown here are sample values for the demo.</p>`;
  },
  otp() {
    return `${wTop('Verify it’s you')}<p class="muted">Enter the 6-digit code we sent to <b>${PLAYER.email}</b>.</p>
      <label class="field field--otp"><span class="sr-only">6-digit code</span><input id="w-otp" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="••••••" value="${esc(W().d.otp || '')}" data-input="otp" data-autofocus aria-describedby="w-err"></label>
      <p class="err" id="w-err" role="alert">${W().d.otpErr || ''}</p>
      <button type="button" class="link" data-act="w-otp-fill">Use the demo code</button>
      <div class="w__foot">${btn('Verify', 'w-otp-ok', { cls: 'btn--accent' })}</div>`;
  },
  cashamt() {
    const c = cashDraft();
    return `${wTop('Cash out amount')}<div class="seg" role="group" aria-label="Cash out from">
        <button type="button" aria-pressed="${c.src === 'usd'}" data-act="w-src" data-src="usd">USD balance<i>${usd(S.usd)}</i></button>
        <button type="button" aria-pressed="${c.src === 'koban'}" data-act="w-src" data-src="koban">Koban<i>${num(S.koban)} = ${usd(S.koban / RATE.koban)}</i></button></div>
      <label class="amt"><span>Amount</span><span class="amt__in"><i>$</i><input id="w-amt" inputmode="decimal" autocomplete="off" placeholder="0.00" value="${esc(W().d.amount || '')}" data-input="amount" data-autofocus aria-describedby="w-err"></span></label>
      <div class="chips">${[['25%', 0.25], ['50%', 0.5], ['Max', 1]].map(([l, f]) => `<button type="button" class="chip" data-act="w-chip" data-field="amount" data-val="${(Math.floor(c.avail * f * 100) / 100).toFixed(2)}">${l}</button>`).join('')}</div>
      <p class="err" id="w-err" role="alert">${c.error}</p>
      <p class="muted" id="w-conv">${c.src === 'koban' && c.amt ? `${num(c.amt * RATE.koban)} Koban converts to ${usd(c.amt)}.` : `To ${c.m.dest}. Minimum ${usd(LIMITS.cashMin)}.`}</p>
      <div class="w__foot">${btn('Review', 'w-go', { cls: 'btn--accent', data: { v: 'cashrev' }, disabled: !c.ok })}</div>`;
  },
  cashrev() {
    const c = cashDraft();
    return `${wTop('Confirm cash out')}<div class="w__done"><p class="w__amt">${usd(c.net)}</p><p class="muted">Arrives at ${c.m.dest}</p></div>
      <dl class="kv"><div><dt>From</dt><dd>${c.src === 'usd' ? 'USD balance' : num(c.amt * RATE.koban) + ' Koban'}</dd></div><div><dt>Amount</dt><dd>${usd(c.amt)}</dd></div><div><dt>Fee (${+(c.m.fee * 100).toFixed(1)}%)</dt><dd>${usd(c.fee)}</dd></div><div><dt>You receive</dt><dd>${usd(c.net)}</dd></div><div><dt>Estimated arrival</dt><dd>${c.m.eta}</dd></div></dl>
      <div class="w__foot">${btn('Confirm cash out', 'w-cash-ok', { cls: 'btn--accent', icon: 'check', data: { autofocus: '' } })}</div>`;
  },
  done(v) {
    const t = S.tx.find((x) => x.id === v.id);
    return `${wTop(v.title, false)}<div class="w__done"><span class="w__ok">${ico('check')}</span><p class="w__amt">${usd(Math.abs(v.amount))}</p><p class="muted">${v.note}</p></div>${t ? timeline(t) : ''}
      <div class="w__foot">${btn('Done', 'w-home', { cls: 'btn--accent', data: { autofocus: '' } })}${t ? btn('View transaction', 'w-tx', { cls: 'btn--ghost', data: { id: t.id } }) : ''}</div>`;
  },
};
function renderWallet(focus) {
  const w = W();
  if (!w) return;
  const top = w.stack[w.stack.length - 1];
  $('#wallet-body').innerHTML = WV[top.v](top);
  if (focus) trapFocus($('#wallet'));
}
function liveAmount(field) {
  // update the amount views in place so the input keeps focus while typing
  const w = W(), top = w.stack[w.stack.length - 1];
  const review = $('#wallet-body .w__foot .btn');
  if (top.v === 'addamt') {
    const amt = amountOf(w.d.add), error = amt > LIMITS.addMax ? `Enter an amount up to ${usd(LIMITS.addMax)}.` : '';
    $('#w-err').textContent = error;
    review.disabled = !(amt > 0) || !!error;
  } else if (top.v === 'cashamt') {
    const c = cashDraft();
    $('#w-err').textContent = c.error;
    $('#w-conv').textContent = c.src === 'koban' && c.amt ? `${num(c.amt * RATE.koban)} Koban converts to ${usd(c.amt)}.` : `To ${c.m.dest}. Minimum ${usd(LIMITS.cashMin)}.`;
    review.disabled = !c.ok;
  }
  void field;
}
function confirmDeposit() {
  const amt = amountOf(W().d.add);
  if (!(amt > 0) || amt > LIMITS.addMax) return;
  const t = addTx({ title: 'Added from Bank ••4821', sub: 'Deposit', amt, fee: 0, status: 'requested', kind: 'in', settleAt: Date.now() + 5000, credit: true, eta: 'Within minutes' });
  save();
  W().d = {};
  W().stack = [{ v: 'home' }, { v: 'done', id: t.id, title: 'Deposit requested', amount: amt, note: 'Your bank is sending it. Your balance updates when it settles.' }];
  renderWallet(true);
}
function confirmCashOut() {
  const c = cashDraft();
  if (!c.ok) return;
  if (c.src === 'usd') S.usd = cents(S.usd - c.amt); else S.koban -= Math.round(c.amt * RATE.koban);
  const instant = c.m.key === 'gift';
  const t = addTx({ title: 'Cash out to ' + c.m.dest, sub: c.src === 'usd' ? 'USD balance' : num(c.amt * RATE.koban) + ' Koban', amt: -c.amt, fee: c.fee, status: instant ? 'sent' : 'requested', kind: 'out', dest: c.m.dest, eta: c.m.eta, processAt: Date.now() + 4000, sentAt: Date.now() + 10000 });
  log('Cash out', `-${usd(c.amt)}`);
  save(); render();
  W().d = {};
  W().stack = [{ v: 'home' }, { v: 'done', id: t.id, title: instant ? 'Gift card sent' : 'Cash out requested', amount: c.net, note: instant ? `A ${usd(c.net)} gift card is on its way to ${PLAYER.email}.` : `${usd(c.net)} is on its way to ${c.m.dest}. ${c.m.eta}.` }];
  renderWallet(true);
}

/* ---------- background clock: settles deposits, moves cash-outs along, sells listings ---------- */
function tick() {
  const now = Date.now();
  let changed = false;
  for (const t of S.tx) {
    if (t.status === 'requested' && t.kind === 'in' && t.settleAt && now >= t.settleAt) {
      t.status = 'settled';
      if (t.credit) { S.usd = cents(S.usd + t.amt); t.credit = false; }
      toast(`${esc(t.title)}: ${usd(t.amt)} settled in your wallet.`, 'good');
      changed = true;
    }
    if (t.kind === 'out' && t.status === 'requested' && now >= t.processAt) { t.status = 'processing'; changed = true; }
    if (t.kind === 'out' && t.status === 'processing' && now >= t.sentAt) { t.status = 'sent'; toast(`${usd(-t.amt - t.fee)} sent to ${esc(t.dest)}.`, 'good'); changed = true; }
  }
  for (const l of S.listings.slice()) {
    if (now >= l.sellAt) {
      S.listings = S.listings.filter((x) => x.uid !== l.uid);
      const net = cents(l.price * (1 - MARKET_FEE));
      S.usd = cents(S.usd + net);
      addTx({ title: 'Marketplace sale', sub: ITEMS[l.id].name, amt: net, fee: cents(l.price * MARKET_FEE), status: 'settled', kind: 'in' });
      log('Sold ' + ITEMS[l.id].name, `+${usd(net)}`);
      toast(`Sold. ${ITEMS[l.id].name} went for ${usd(l.price)}, and ${usd(net)} is in your wallet.`, 'good');
      changed = true;
    }
  }
  if (!changed) return;
  save();
  if (!(ui.game && ui.game.on)) { if (ui.modal) renderHud(); else keepFocus(render); }
  if (W()) { const top = W().stack[W().stack.length - 1]; if (['home', 'txs', 'tx', 'done'].includes(top.v)) renderWallet(false); }
}

/* ---------- events ---------- */
const ACT = {
  go: (d) => { if (d.close) closeModal(); go(d.screen); },
  wallet: (d) => { if (d.close) closeModal(); openWallet(); },
  'wallet-close': closeWallet,
  'wallet-add': () => openWallet({ v: 'add' }),
  'to-currency': () => { if (ui.modal) closeModal(); if (ui.wallet) closeWallet(); ui.storeTab = 'currency'; go('store'); },
  close: closeModal,
  'store-tab': (d) => { ui.storeTab = d.tab; render(); refocus(`[data-act="store-tab"][data-tab="${d.tab}"]`); },
  'inv-tab': (d) => { ui.invTab = d.tab; ui.screen = d.tab === 'market' ? 'market' : 'inventory'; render(); refocus(`[data-act="inv-tab"][data-tab="${d.tab}"]`); },
  'inv-filter': (d) => { ui.invFilter = d.f; render(); refocus(`[data-act="inv-filter"][data-f="${d.f}"]`); },
  buy: (d) => openModal({ kind: 'buy', sku: d.sku }),
  'buy-ok': (d) => buy(d.sku),
  mbuy: (d) => openModal({ kind: 'mbuy', mid: d.mid }),
  'mbuy-ok': (d) => marketBuy(d.mid),
  equip: (d) => { if (d.close) closeModal(); equip(+d.uid); refocus(`[data-act="equip"][data-uid="${d.uid}"]`); },
  upgrade: (d) => { upgrade(+d.uid); refocus(`[data-act="upgrade"][data-uid="${d.uid}"]`); },
  list: (d) => openModal({ kind: 'list', uid: +d.uid }),
  'list-ok': (d) => listItem(+d.uid),
  unlist: (d) => unlist(+d.uid),
  claim: (d) => claim(d.what),
  'copy-code': () => { try { navigator.clipboard.writeText(PLAYER.code).then(() => toast('Code copied.', 'good'), () => toast('Copy it by hand: ' + PLAYER.code)); } catch (e) { toast('Copy it by hand: ' + PLAYER.code); } },
  accent: (d) => { S.accent = d.k; save(); if (stage) stage.setAccent(ACCENTS[d.k][1]); render(); refocus(`[data-act="accent"][data-k="${d.k}"]`); },
  reset: () => openModal({ kind: 'reset' }),
  'reset-ok': () => { S = fresh(); save(); closeModal(); if (stage) stage.setAccent(ACCENTS[S.accent][1]); ui.screen = 'home'; render(true); toast('Demo reset.'); },
  'train-start': startRound,
  hit: (d, el) => hit(el),
  'w-go': (d) => wPush({ v: d.v }),
  'w-back': wBack,
  'w-home': wHome,
  'w-tx': (d) => wPush({ v: 'tx', id: d.id }),
  'w-chip': (d) => { W().d[d.field] = String(d.val); renderWallet(false); const i = $('#w-amt'); if (i) i.focus(); },
  'w-src': (d) => { W().d.src = d.src; W().d.amount = ''; renderWallet(false); refocus(`[data-act="w-src"][data-src="${d.src}"]`); },
  'w-method': (d) => { W().d.method = d.key; wPush({ v: S.verified ? 'cashamt' : 'otp' }); },
  'w-otp-fill': () => { W().d.otp = '428913'; W().d.otpErr = ''; renderWallet(false); $('#w-otp').focus(); },
  'w-otp-ok': () => {
    const w = W();
    if (!/^\d{6}$/.test(w.d.otp || '')) { w.d.otpErr = 'Enter all 6 digits. Any 6 digits work in this demo.'; renderWallet(false); $('#w-otp').focus(); return; }
    S.verified = true; save(); w.d.otpErr = '';
    w.stack.pop(); wPush({ v: 'cashamt' });
  },
  'w-add-ok': confirmDeposit,
  'w-cash-ok': confirmCashOut,
  'w-code-ok': () => {
    const w = W(), code = (w.d.code || '').trim().toUpperCase();
    if (code !== GIFT_CODE.code) { w.d.codeErr = `That code isn’t valid. Try ${GIFT_CODE.code}.`; renderWallet(false); $('#w-code').focus(); return; }
    S.usd = cents(S.usd + GIFT_CODE.usd);
    const t = addTx({ title: 'Gift code redeemed', sub: GIFT_CODE.code, amt: GIFT_CODE.usd, fee: 0, status: 'settled', kind: 'in' });
    save(); render();
    w.d = {};
    w.stack = [{ v: 'home' }, { v: 'done', id: t.id, title: 'Code redeemed', amount: GIFT_CODE.usd, note: 'Added to your USD balance.' }];
    renderWallet(true);
  },
};
function keepFocus(fn) {
  const a = document.activeElement;
  let sel = null;
  if (a && a.dataset && a.dataset.act && $('#view').contains(a)) sel = '#view [data-act="' + a.dataset.act + '"]' + Object.entries(a.dataset).filter(([k]) => k !== 'act').map(([k, v]) => `[data-${k}="${v}"]`).join('');
  fn();
  if (sel) refocus(sel);
}
function refocus(sel) { const el = $(sel); if (el) el.focus({ preventScroll: true }); }
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const fn = ACT[el.dataset.act];
  if (fn) fn(el.dataset, el);
});
document.addEventListener('input', (e) => {
  const el = e.target;
  if (el.dataset.input && W()) { W().d[el.dataset.input] = el.value; if (el.dataset.input === 'otp') el.value = W().d.otp = el.value.replace(/\D/g, '').slice(0, 6); liveAmount(el.dataset.input); }
  if (el.id === 'list-price') { const p = amountOf(el.value); $('#list-fee').textContent = usd(p * MARKET_FEE); $('#list-net').textContent = usd(p * (1 - MARKET_FEE)); el.removeAttribute('aria-invalid'); }
});
document.addEventListener('change', (e) => { if (e.target.dataset.change === 'sort') { ui.sort = e.target.value; render(); refocus('[data-change="sort"]'); } });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && (ui.modal || ui.wallet)) { e.preventDefault(); closeOverlays(); return; }
  if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
    const primary = (ui.modal ? $('#modal') : $('#wallet')).querySelector('.w__foot .btn--accent, .acts .btn--accent');
    if (primary && !primary.disabled) { e.preventDefault(); primary.click(); }
    return;
  }
  if (e.key !== 'Tab') return;
  const root = ui.modal ? $('#modal .modal__box') : ui.wallet ? $('#wallet') : null;
  if (!root) return;
  const f = [...root.querySelectorAll('button:not([disabled]), input, select, a[href]')].filter((n) => n.offsetParent !== null);
  if (!f.length) return;
  if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
  else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
});

/* ---------- boot ---------- */
T = ITEM_ART || renderThumbs(MODEL_IDS, 288);
function startStage() {
  if (stage) return;
  document.body.classList.remove('has-art');
  $('#heroart').hidden = true;
  if (heroVideo) { heroVideo.pause(); heroVideo = null; }
  stage = createStage($('#stage'), { accent: ACCENTS[S.accent][1] });
  if (!stage) document.body.classList.add('no-gl');
}
// The illustrated hero replaces the real-time scene when its art is available; the 3D scene stays as the fallback.
function startHeroArt() {
  if (!ASSETS.poster) return false;
  const box = $('#heroart'), img = $('#hero-poster'), vid = $('#hero-video');
  img.addEventListener('error', () => { startStage(); render(); }, { once: true });
  img.src = ASSETS.poster;
  box.hidden = false;
  document.body.classList.add('has-art');
  let src = ASSETS.video;
  if (ASSETS.video64) {
    try {
      const bin = atob(ASSETS.video64), bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      src = URL.createObjectURL(new Blob([bytes], { type: 'video/mp4' }));
    } catch (e) { src = ''; }
  }
  if (src && !REDUCED) {
    // The clip's last frame nearly matches its first. Dissolving to the still underneath around the loop point hides the seam.
    // The dissolve itself is a CSS transition, so it keeps running when the browser throttles script timers.
    vid.addEventListener('playing', () => box.classList.add('is-live'), { once: true });
    vid.addEventListener('timeupdate', () => {
      const t = vid.currentTime, d = vid.duration || 0;
      box.classList.toggle('is-seam', d > 0 && (t > d - 0.75 || t < 0.12));
    });
    vid.addEventListener('error', () => { heroVideo = null; }, { once: true });
    vid.src = src;
    heroVideo = vid;
  }
  return true;
}
if (!startHeroArt()) startStage();
window.__ss = { stage, state: () => S };
render();
setInterval(tick, 1000);
document.body.classList.add('is-ready');
