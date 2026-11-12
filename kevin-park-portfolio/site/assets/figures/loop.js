/**
 * Loop: a round slab with a hub, and three basins laid round it as one track:
 * a short one, a long one, a middling one, marked with one, two and three
 * dots. Six coins ride the track without stopping, out of each basin and into
 * the next. The run never ends; a pointer on the figure slows it so a coin can
 * be followed, and the basin under the pointer takes the bright stroke. At
 * rest one coin is the bright one. The slider is the rate while the pointer
 * is there.
 *
 * The pattern: dilate time. An ambient loop, a spring on its rate, and a hit
 * test on the ground plane against the basins' own outlines, which never move.
 */
const {
  Cam, circ, facing, fillet, fit, poly, prism, proj, rad, unproj, spring, stepS, reducedMotion,
  disposer, mk, place, pointer, put, register, solid,
} = HL;

const RS = 64, PB = 5, RO = 55, RI = 31, RM = 43, H = 2.2, HUB = 19, HH = 8, CR = 5, CH = 2, SPEED = 24;
// each basin spans a0 to a1 degrees round the hub; the coins run the way the angle grows: in, through, out, in
const BASINS = [{ name: "in", a0: 236, a1: 316 }, { name: "through", a0: -30, a1: 120 }, { name: "out", a0: 133, a1: 223 }];
const START = [8, 62, 104, 176, 229, 304], LEAD = 1;

const polar = (r, deg) => [r * Math.cos(rad(deg)), r * Math.sin(rad(deg))];
/** A ring moved to (x, y) on the ground. */
const at = (ring, x, y) => ring.map((q) => ({ u: q.u + x, v: q.v + y, nu: q.nu, nv: q.nv }));
/** A basin's outline on the ground: two arcs joined at rounded ends. */
function outline(a0, a1) {
  const n = Math.ceil((a1 - a0) / 5), pts = [];
  for (let k = 0; k <= n; k++) pts.push(polar(RO, a0 + ((a1 - a0) * k) / n));
  for (let k = n; k >= 0; k--) pts.push(polar(RI, a0 + ((a1 - a0) * k) / n));
  return fillet(pts, pts.map((_, k) => (k % (n + 1) === 0 || k % (n + 1) === n ? 5 : 0)));
}
/** How far an angle is from a basin, in degrees: 0 inside it. */
const off = (deg, b) => Math.max(0, Math.abs(((deg - (b.a0 + b.a1) / 2 + 540) % 360) - 180) - (b.a1 - b.a0) / 2);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let slow = value, phase = 0, act = -1;

  const C = Cam(45, 0.5, 2.3);
  fit(C, [[-RS, -RS, -PB], [RS, RS, -PB], [RS, -RS, -PB], [-RS, RS, -PB], [0, 0, HH + 4]], 200, 166);
  const P = proj(C), front = facing(C);
  const DISC = circ(CR, 20), RIM = circ(CR - 1.3, 20);

  const g = mk("g", {}, svg);
  put(solid(g), prism(P, front, circ(RS, 56), circ(RS - 2.2, 56), -PB, 0));
  // the basins: thin plates, so a second line under each top carries its thickness; then its dot code
  const basins = BASINS.map((b, i) => {
    const pts = outline(b.a0, b.a1);
    mk("path", { d: poly(pts.map((p) => P(p[0], p[1], 0))) }, g);
    const top = mk("path", { d: poly(pts.map((p) => P(p[0], p[1], H))), class: "sil" }, g);
    for (let k = 0; k <= i; k++) place(mk("circle", { r: 1.2, class: "dot m" }, g), P(...polar(RO - 5, b.a0 + 7 + k * 5.5), H));
    return { ...b, top };
  });

  // paint order: the coins behind the hub, the hub, the coins in front of it
  const aFar = mk("g", {}, g);
  put(solid(g), prism(P, front, circ(HUB, 36), circ(HUB - 2, 36), 0, HH));
  const aNear = mk("g", {}, g);
  const coins = START.map((a0) => ({ a0, el: solid(g), far: false }));
  coins[LEAD].el.sil.classList.add("hi");
  const rate = spring(1);

  const B = register(stage, (dt) => {
    const settling = stepS(rate, dt), still = reducedMotion();
    if (!still) phase = (phase + SPEED * rate.x * dt) % 360;
    coins.forEach((c) => {
      const [x, y] = polar(RM, c.a0 + phase);
      put(c.el, prism(P, front, at(DISC, x, y), at(RIM, x, y), H, H + CH));
      if (x + y < 0 !== c.far) { c.far = x + y < 0; (c.far ? aFar : aNear).after(c.el.g); }
    });
    return !still || settling; // ambient: it runs while it is on screen
  });
  bag.add(B.unregister);

  /** The basin under a screen point, from the ground plane: -1 off the slab or on the hub. */
  function pick(p) {
    const [x, y] = unproj(C, p[0], p[1], 0), r = Math.hypot(x, y);
    if (r > RS || r < HUB) return -1;
    const deg = (Math.atan2(y, x) * 180) / Math.PI;
    return BASINS.reduce((best, b, i) => (off(deg, b) < off(deg, BASINS[best]) ? i : best), 0);
  }

  /** Slows the run while the pointer is there (a is the basin under it, or -1) and lights that basin. */
  function hover(on, a) {
    rate.t = on ? slow : 1;
    if (a !== act) {
      act = a;
      basins.forEach((b, i) => b.top.classList.toggle("hi", i === a));
      coins[LEAD].el.sil.classList.toggle("hi", a < 0);
      read.textContent = a < 0 ? "rest" : BASINS[a].name;
    }
    B.wake();
  }

  bag.add(pointer(stage, { move: (p) => hover(true, pick(p)), leave: () => hover(false, -1) }));
  bag.add(() => svg.replaceChildren());
  read.textContent = "rest";

  return {
    set: (v) => { slow = v; if (rate.t !== 1) rate.t = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "loop",
  means: "Coins ride a track through three basins and back to the first. A pointer slows the run and lights the basin under it.",
  rules: [1, 4, 5, 7, 8],
  range: [0.45, 0.18, 0.04],
  tour: [[276, 139], [200, 218], [128, 139], null],
  mount,
});
