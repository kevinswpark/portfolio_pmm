/**
 * Gate: a wall of five panels across a slab, with a coin waiting in each lane
 * on the near side. The pointer picks a lane: the panels near it sink into the
 * slab, each on its own spring, and the coins whose way is clear slide through
 * to a landing ring on the far side, staggered outwards from the lane picked.
 * At rest the wall is up and the coin pressed against it is the bright one.
 * The slider is the reach of the opening, in lanes.
 *
 * The pattern: a field for the wall (springs, a falloff by distance) and one of
 * many for the coins (tweens, a stagger by distance). The lane is picked from
 * the wall's rest pose: the ground in front of it, or its front face.
 */
const {
  Cam, circ, clamp, facing, fit, lerp, poly, prism, proj, ringAt, rings, unproj, spring, stepS,
  tdone, tset, tval, tween, disposer, mk, pointer, put, register, solid,
} = HL;

const N = 5, LW = 24, L = N * LW, WT = 3.5, PB = 5, LOW = 0.8;
const TALL = [22, 26, 19, 24, 21], WAIT = [30, 21, 9.5, 27, 16], STUCK = 2;
const D = 9, CR = 5, CH = 2.2, STEP = 45;
const X0 = -10, X1 = L + 10, Y0 = -30, Y1 = 44;

/** A ring moved to (x, y) on the ground. */
const at = (ring, x, y) => ring.map((q) => ({ u: q.u + x, v: q.v + y, nu: q.nu, nv: q.nv }));
/** How far a panel sinks at u reaches from the pointer: all the way to 65%, then up to nothing at the reach. */
const sink = (u) => clamp((1 - u) / 0.35, 0, 1);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let R = value, s = null, act = -1;

  const C = Cam(45, 0.5, 1.95);
  fit(C, [[X0, Y0, -PB], [X1, Y1, -PB], [X1, Y0, -PB], [X0, Y1, -PB], [X0, Y0, 26]], 200, 166);
  const P = proj(C), front = facing(C);
  const DISC = circ(CR, 20), RIM = circ(CR - 1.3, 20), LAND = circ(CR - 0.4, 20);
  const cx = (i) => i * LW + LW / 2;

  const g = mk("g", {}, svg);
  const [sr, si] = rings(X0, Y0, X1, Y1, 9, 2.2);
  put(solid(g), prism(P, front, sr, si, -PB, 0));
  // where each coin lands, drawn on the slab behind the wall: hidden until its panel sinks
  for (let i = 0; i < N; i++) mk("path", { d: poly(ringAt(P, at(LAND, cx(i), -D), 0)), class: "nf lo" }, g);

  // paint order: coins that have crossed, then the wall from its far end, then the coins still waiting
  const aFar = mk("g", {}, g), panels = [];
  for (let i = 0; i < N; i++) {
    const [ring, inner] = rings(i * LW + 1.2, -WT, (i + 1) * LW - 1.2, WT, 2.6, 1);
    panels.push({ ring, inner, sp: spring(TALL[i]), el: solid(g), drawn: NaN });
  }
  const aNear = mk("g", {}, g), coins = [];
  for (let i = 0; i < N; i++) coins.push({ x: cx(i), y: tween(WAIT[i]), el: solid(g), drawn: NaN, far: false });
  coins[STUCK].el.sil.classList.add("hi");

  const B = register(stage, (dt, now) => {
    let moving = false;
    panels.forEach((p) => {
      if (stepS(p.sp, dt)) moving = true;
      const h = Math.max(LOW, p.sp.x);
      if (h === p.drawn) return;
      p.drawn = h;
      put(p.el, prism(P, front, p.ring, p.inner, 0, h));
    });
    coins.forEach((c) => {
      const y = tval(c.y, now);
      if (!tdone(c.y, now)) moving = true;
      if (y === c.drawn) return;
      c.drawn = y;
      put(c.el, prism(P, front, at(DISC, c.x, y), at(RIM, c.x, y), 0, CH));
      // a coin past the wall is painted before it, so the panels still standing cover it
      if (y < 0 !== c.far) { c.far = y < 0; (c.far ? aFar : aNear).after(c.el.g); }
    });
    return moving;
  });
  bag.add(B.unregister);

  /** Aims every panel and coin at the pose for the pointer's lane coordinate s (null at rest). */
  function retarget() {
    const now = performance.now(), a = s === null ? -1 : clamp(Math.round(s), 0, N - 1), from = a >= 0 ? a : act;
    panels.forEach((p, i) => { p.sp.t = s === null ? TALL[i] : lerp(TALL[i], LOW, sink(Math.abs(i - s) / R)); });
    coins.forEach((c, i) => {
      const through = a >= 0 && Math.abs(i - a) <= R * 0.7;
      tset(c.y, through ? -D : WAIT[i], now, Math.abs(i - from) * STEP);
      c.el.sil.classList.toggle("hi", a >= 0 ? i === a : i === STUCK);
    });
    act = a;
    read.textContent = a < 0 ? "rest" : "lane " + (a + 1);
    B.wake();
  }

  /** The lane coordinate under a screen point, from the rest pose: the ground in front of the wall, or the wall's front face. */
  function lane(p) {
    const [gx, gy] = unproj(C, p[0], p[1], 0);
    const x = gy >= WT ? gx : gx - gy + WT;
    return clamp(x / LW - 0.5, -0.6, N - 0.4);
  }

  bag.add(pointer(stage, {
    move: (p) => { s = lane(p); retarget(); },
    leave: () => { s = null; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());
  read.textContent = "rest";
  B.wake();

  return {
    set: (v) => { R = v; if (s !== null) retarget(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "gate",
  means: "A wall across a slab keeps five coins waiting. The panels near the pointer sink, and the coins with a clear way slide through.",
  rules: [1, 2, 3, 5, 8],
  range: [0.8, 1.6, 3],
  tour: [[150, 135], [236, 176], [196, 150], null],
  mount,
});
