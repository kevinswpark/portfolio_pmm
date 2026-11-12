// Shadow Storm graphics: every model here is built in code from three.js primitives.
// No image, model, or texture files are loaded. Look: three-step cel shading, ink outlines
// (inverted hull), and flat 2D backdrop layers behind a 3D foreground.
import * as THREE from 'three';

const PI = Math.PI;
export const C = {
  steel: 0xc6d0e0, dsteel: 0x5b6686, ink: 0x1e2136, indigo: 0x31407a, verm: 0xe8442a,
  gold: 0xf4b93e, dgold: 0xb47b1c, paper: 0xf2e7cd, wood: 0x9b6439, dwood: 0x4d3122,
  jade: 0x35d6a0, rope: 0xcfab72, straw: 0xdcb964, dstraw: 0xa98433, storm: 0x5ccaff,
  violet: 0x8d66ff, bone: 0xece5d3, red: 0xc7372c, skin: 0xe6b48c, wrap: 0x9aa0bd,
  black: 0x0d0e16, cloth: 0x6b4a7a, stone: 0x8390ad, slate: 0x262a46,
};

/* ---------- materials ---------- */
let _grad;
function gradient() {
  if (_grad) return _grad;
  _grad = new THREE.DataTexture(new Uint8Array([70, 150, 255]), 3, 1, THREE.RedFormat);
  _grad.minFilter = _grad.magFilter = THREE.NearestFilter;
  _grad.needsUpdate = true;
  return _grad;
}
const _mats = new Map();
function toon(color, o = {}) {
  const key = color + '|' + (o.double ? 'd' : '') + '|' + (o.glow || 0);
  if (_mats.has(key)) return _mats.get(key);
  const mat = new THREE.MeshToonMaterial({ color, gradientMap: gradient(), side: o.double ? THREE.DoubleSide : THREE.FrontSide });
  if (o.glow) { mat.emissive = new THREE.Color(color); mat.emissiveIntensity = o.glow; }
  _mats.set(key, mat);
  return mat;
}
function outlineMaterial(thickness, color = 0x07080e) {
  return new THREE.ShaderMaterial({
    uniforms: { uT: { value: thickness }, uColor: { value: new THREE.Color(color) } },
    vertexShader: 'attribute vec3 on; uniform float uT; void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position + on * uT, 1.0); }',
    fragmentShader: 'uniform vec3 uColor; void main(){ gl_FragColor = vec4(uColor, 1.0); }',
    side: THREE.BackSide,
  });
}
// Averaged normals per position, so hard-edged meshes get a closed outline hull.
function smoothNormals(geo) {
  if (geo.getAttribute('on')) return;
  if (!geo.getAttribute('normal')) geo.computeVertexNormals();
  const pos = geo.getAttribute('position'), nor = geo.getAttribute('normal');
  const acc = new Map();
  const key = (i) => Math.round(pos.getX(i) * 500) + ',' + Math.round(pos.getY(i) * 500) + ',' + Math.round(pos.getZ(i) * 500);
  for (let i = 0; i < pos.count; i++) {
    const k = key(i), a = acc.get(k) || [0, 0, 0];
    a[0] += nor.getX(i); a[1] += nor.getY(i); a[2] += nor.getZ(i);
    acc.set(k, a);
  }
  const out = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const a = acc.get(key(i)), l = Math.hypot(a[0], a[1], a[2]) || 1;
    out[i * 3] = a[0] / l; out[i * 3 + 1] = a[1] / l; out[i * 3 + 2] = a[2] / l;
  }
  geo.setAttribute('on', new THREE.BufferAttribute(out, 3));
}
function addOutline(root, thickness) {
  const mat = outlineMaterial(thickness);
  const meshes = [];
  root.traverse((n) => { if (n.isMesh && !n.userData.noOutline) meshes.push(n); });
  for (const n of meshes) {
    smoothNormals(n.geometry);
    const hull = new THREE.Mesh(n.geometry, mat);
    hull.userData.noOutline = true;
    n.add(hull);
  }
  return mat;
}

/* ---------- geometry helpers ---------- */
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (rt, rb, h, s = 18) => new THREE.CylinderGeometry(rt, rb, h, s);
const sph = (r, w = 20, h = 14) => new THREE.SphereGeometry(r, w, h);
const tor = (r, t, rs = 8, ts = 26, arc = PI * 2) => new THREE.TorusGeometry(r, t, rs, ts, arc);
const cone = (r, h, s = 16) => new THREE.ConeGeometry(r, h, s);
const cap = (r, l) => new THREE.CapsuleGeometry(r, l, 6, 14);
function ext(pts, depth, bevel = 0.015, hole = 0) {
  const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  if (hole) { const h = new THREE.Path(); h.absarc(0, 0, hole, 0, PI * 2, true); shape.holes.push(h); }
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1, curveSegments: 10 });
  geo.translate(0, 0, -depth / 2);
  return geo;
}
const lathe = (pts, seg = 26) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg);
function place(obj, o) {
  if (o.p) obj.position.set(o.p[0], o.p[1], o.p[2]);
  if (o.r) obj.rotation.set(o.r[0], o.r[1], o.r[2]);
  if (o.s !== undefined) { if (typeof o.s === 'number') obj.scale.setScalar(o.s); else obj.scale.set(o.s[0], o.s[1], o.s[2]); }
  return obj;
}
function m(geo, color, o = {}) {
  const mesh = new THREE.Mesh(geo, toon(color, o));
  if (o.noOutline) mesh.userData.noOutline = true;
  return place(mesh, o);
}
function g(children, o = {}) {
  const grp = new THREE.Group();
  for (const c of children.flat(3)) if (c) grp.add(c);
  return place(grp, o);
}
const UP = new THREE.Vector3(0, 1, 0);
function limb(a, b, r, color, o = {}) {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
  const dir = vb.clone().sub(va), len = dir.length();
  const mesh = m(o.flat ? cyl(r, o.r2 || r, len, 12) : cap(r, len), color, o);
  mesh.position.copy(va).addScaledVector(dir, 0.5);
  mesh.quaternion.setFromUnitVectors(UP, dir.normalize());
  return mesh;
}
// deterministic pseudo-random so every load draws the same art
function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

/* ---------- item models ---------- */
const BOLT = [[0.09, 0.24], [-0.13, -0.02], [-0.01, -0.02], [-0.09, -0.24], [0.13, 0.04], [0.01, 0.04]];
function starPts(n, R, r, twist) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * PI * 2 + (i % 2 ? twist : 0), rad = i % 2 ? r : R;
    pts.push([Math.cos(a) * rad, Math.sin(a) * rad]);
  }
  return pts;
}
function bladePts(L, w, curve) {
  const top = [], bot = [], N = 12;
  for (let i = 0; i <= N; i++) {
    const t = i / N, x = t * L, y = curve * t * t;
    top.push([x, y + w / 2]);
    if (t < 0.93) bot.push([x, y - w / 2]);
  }
  top.push([L * 1.07, curve * 1.14 + w * 0.5]);
  return top.concat(bot.reverse());
}
function kunaiModel() {
  return g([
    m(ext([[0, 1.05], [0.21, 0.4], [0.07, 0.1], [-0.07, 0.1], [-0.21, 0.4]], 0.07, 0.025), C.steel),
    m(cyl(0.055, 0.055, 0.5, 12), C.ink, { p: [0, -0.15, 0] }),
    [0, 1, 2].map((i) => m(tor(0.06, 0.02, 6, 14), C.verm, { p: [0, -0.02 - i * 0.13, 0], r: [PI / 2, 0, 0] })),
    m(tor(0.13, 0.035, 8, 20), C.dsteel, { p: [0, -0.53, 0] }),
  ]);
}
function shurikenModel(n = 4, R = 1) {
  return g([
    m(ext(starPts(n, R, R * 0.3, 0.28), 0.07 * R, 0.03 * R, R * 0.1), C.steel),
    m(tor(R * 0.17, R * 0.04, 8, 20), C.dsteel),
  ]);
}
function koban() {
  const pts = [];
  for (let i = 0; i < 24; i++) { const a = (i / 24) * PI * 2; pts.push([Math.cos(a) * 0.3, Math.sin(a) * 0.46]); }
  return g([
    m(ext(pts, 0.05, 0.015), C.gold),
    [-0.24, -0.08, 0.08, 0.24].map((y) => m(box(0.36 - Math.abs(y) * 0.5, 0.025, 0.09), C.dgold, { p: [0, y, 0], noOutline: true })),
  ]);
}
function coinPile(n, seed, spread = 0.5) {
  const r = rng(seed), out = [];
  for (let i = 0; i < n; i++) out.push(place(koban(), { p: [(r() - 0.5) * spread * 2, (r() - 0.5) * 0.12, (r() - 0.5) * spread], r: [PI / 2 - 0.5 + r() * 0.5, r() * 3, r() * 0.6], s: 0.8 }));
  return out;
}
function pouch(color, tie) {
  return g([
    m(lathe([[0.001, -0.55], [0.45, -0.5], [0.6, -0.2], [0.55, 0.15], [0.3, 0.4], [0.18, 0.48], [0.27, 0.64]]), color, { double: true }),
    m(tor(0.2, 0.04, 6, 20), tie, { p: [0, 0.47, 0], r: [PI / 2, 0, 0] }),
    m(sph(0.06, 8, 6), tie, { p: [0.22, 0.44, 0.08] }),
  ]);
}
function chest() {
  return g([
    m(box(1.3, 0.6, 0.85), C.wood, { p: [0, -0.3, 0] }),
    [-0.45, 0.45].map((x) => m(box(0.1, 0.64, 0.89), C.gold, { p: [x, -0.3, 0] })),
    m(box(0.2, 0.2, 0.06), C.gold, { p: [0, -0.12, 0.44] }),
    g([
      m(new THREE.CylinderGeometry(0.43, 0.43, 1.3, 18, 1, false, 0, PI), C.dwood, { r: [0, 0, PI / 2], double: true }),
      [-0.45, 0.45].map((x) => m(new THREE.CylinderGeometry(0.45, 0.45, 0.1, 18, 1, false, 0, PI), C.gold, { p: [x, 0, 0], r: [0, 0, PI / 2], double: true })),
    ], { p: [0, 0.02, -0.42], r: [-1.1, 0, 0] }),
  ]);
}
function shard(s = 1, color = C.jade) {
  return m(new THREE.OctahedronGeometry(0.34, 0), color, { s: [0.62 * s, 1.35 * s, 0.62 * s], glow: 0.25 });
}
function shards(n, seed, spread) {
  const r = rng(seed), out = [];
  for (let i = 0; i < n; i++) out.push(place(shard(0.55 + r() * 0.6), { p: [(r() - 0.5) * spread * 2, r() * 0.25, (r() - 0.5) * spread], r: [(r() - 0.5) * 0.9, r() * 3, (r() - 0.5) * 0.9] }));
  return out;
}
function scrollModel(band, deco) {
  const roll = g([
    m(cyl(0.27, 0.27, 1.25, 24), C.paper),
    m(cyl(0.287, 0.287, 0.42, 24), band),
    [0.25, -0.25].map((y) => m(tor(0.29, 0.024, 6, 24), deco, { p: [0, y, 0], r: [PI / 2, 0, 0] })),
    [-1, 1].map((s) => [
      m(cyl(0.32, 0.32, 0.07, 24), C.dwood, { p: [0, s * 0.66, 0] }),
      m(cyl(0.1, 0.12, 0.2, 12), C.dwood, { p: [0, s * 0.79, 0] }),
      m(sph(0.11, 12, 8), deco, { p: [0, s * 0.92, 0] }),
    ]),
  ], { r: [0, 0, PI / 2] });
  const sheet = g([
    m(box(1.12, 0.8, 0.025), C.paper, { p: [0, -0.62, 0.14] }),
    [[-0.36, 0.5], [-0.18, 0.34], [0, 0.56], [0.18, 0.42]].map(([x, h]) => m(box(0.055, h, 0.03), C.black, { p: [x, -0.36 - h / 2, 0.15], noOutline: true })),
    m(cyl(0.09, 0.09, 0.035, 16), band, { p: [0.38, -0.86, 0.15], r: [PI / 2, 0, 0], noOutline: true }),
  ]);
  return g([roll, sheet], { p: [0, 0.3, 0], r: [0.12, -0.35, -0.1] });
}
function caltrop() {
  const dirs = [[0, 1, 0], [0.94, -0.33, 0], [-0.47, -0.33, 0.82], [-0.47, -0.33, -0.82]];
  return g([
    m(sph(0.09, 8, 6), C.dsteel),
    dirs.map((d) => { const c = m(cone(0.07, 0.5, 8), C.steel); const v = new THREE.Vector3(...d).normalize(); c.position.copy(v).multiplyScalar(0.25); c.quaternion.setFromUnitVectors(UP, v); return c; }),
  ]);
}

const MODELS = {
  kunai: () => place(kunaiModel(), { p: [0.1, -0.2, 0], r: [0, 0, -0.75] }),
  ironstars: () => g([
    place(shurikenModel(4, 0.62), { p: [-0.42, 0.34, 0], r: [0.3, 0.2, 0.3] }),
    place(shurikenModel(4, 0.62), { p: [0.45, 0.1, 0.2], r: [-0.2, -0.3, 0.9] }),
    place(shurikenModel(4, 0.62), { p: [-0.1, -0.5, 0.35], r: [0.5, 0.1, 0.1] }),
  ]),
  stormwheel: () => g([
    [0, 1, 2, 3].map((i) => m(ext([[0.14, -0.17], [0.72, -0.24], [1.3, 0.06], [0.78, 0.03], [0.2, 0.17]], 0.07, 0.03), C.steel, { r: [0, 0, (i * PI) / 2] })),
    m(tor(0.26, 0.07, 8, 24), C.gold),
    m(sph(0.15, 14, 10), C.storm, { glow: 0.6 }),
  ], { r: [0.25, -0.2, 0.35] }),
  katana: () => g([
    m(ext(bladePts(2.1, 0.12, 0.17), 0.035, 0.014), C.steel, { p: [-0.55, 0, 0] }),
    m(cyl(0.18, 0.18, 0.05, 8), C.gold, { p: [-0.58, 0, 0], r: [0, 0, PI / 2] }),
    m(cyl(0.06, 0.055, 0.62, 10), C.ink, { p: [-0.92, 0, 0], r: [0, 0, PI / 2] }),
    [0, 1, 2, 3].map((i) => m(tor(0.062, 0.016, 6, 12), C.verm, { p: [-0.7 - i * 0.14, 0, 0], r: [0, PI / 2, 0] })),
    m(sph(0.075, 10, 8), C.gold, { p: [-1.25, 0, 0] }),
  ], { p: [-0.1, -0.35, 0], r: [0, 0, 0.62] }),
  tanto: () => g([
    m(ext(bladePts(1.05, 0.15, 0.05), 0.04, 0.016), 0xff8a4a, { p: [-0.2, 0, 0], glow: 0.35 }),
    m(cyl(0.15, 0.15, 0.05, 8), C.dgold, { p: [-0.23, 0, 0], r: [0, 0, PI / 2] }),
    m(cyl(0.065, 0.06, 0.48, 10), C.dwood, { p: [-0.5, 0, 0], r: [0, 0, PI / 2] }),
    [0, 1, 2].map((i) => m(tor(0.068, 0.016, 6, 12), C.gold, { p: [-0.36 - i * 0.14, 0, 0], r: [0, PI / 2, 0] })),
  ], { p: [-0.15, -0.3, 0], r: [0, 0, 0.7] }),
  kusarigama: () => {
    const links = [];
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      links.push(m(tor(0.07, 0.022, 6, 12), C.dsteel, { p: [0.1 + t * 0.95, -0.72 - Math.sin(t * PI) * 0.32, 0], r: [0, i % 2 ? PI / 2 : 0, 0.6] }));
    }
    return g([
      m(cyl(0.055, 0.06, 1.35, 10), C.wood, { p: [0, -0.02, 0] }),
      m(cyl(0.075, 0.075, 0.16, 10), C.dsteel, { p: [0, 0.62, 0] }),
      m(ext([[0, 0.09], [0.5, 0.12], [0.86, -0.08], [0.98, -0.42], [0.7, -0.12], [0.4, 0], [0, -0.06]], 0.045, 0.018), C.steel, { p: [0.02, 0.62, 0] }),
      links,
      m(cyl(0.1, 0.07, 0.24, 10), C.dsteel, { p: [1.14, -0.66, 0], r: [0, 0, 0.5] }),
    ], { p: [-0.35, 0.05, 0], r: [0, 0, 0.15] });
  },
  scrollthunder: () => scrollModel(C.storm, C.gold),
  scrollmist: () => scrollModel(C.indigo, C.steel),
  scrollserpent: () => scrollModel(C.verm, C.gold),
  cuirass: () => g([
    m(lathe([[0.001, -0.75], [0.5, -0.75], [0.56, -0.4], [0.62, 0], [0.68, 0.35], [0.6, 0.62], [0.3, 0.72]], 28), C.indigo, { s: [1, 1, 0.72], double: true }),
    [[-0.55, 0.535], [-0.3, 0.578], [-0.05, 0.615], [0.2, 0.655]].map(([y, r]) => m(tor(r, 0.035, 6, 28), C.verm, { p: [0, y, 0], r: [PI / 2, 0, 0], s: [1, 0.72, 1] })),
    m(tor(0.3, 0.06, 8, 24), C.gold, { p: [0, 0.72, 0], r: [PI / 2, 0, 0], s: [1, 0.72, 1] }),
    [-1, 1].map((s) => g([
      m(box(0.44, 0.52, 0.08), C.indigo),
      m(box(0.46, 0.07, 0.1), C.gold, { p: [0, -0.24, 0] }),
      m(box(0.46, 0.05, 0.1), C.verm, { p: [0, 0.02, 0] }),
    ], { p: [s * 0.8, 0.36, 0], r: [0, 0, s * -0.38] })),
    m(cyl(0.11, 0.11, 0.04, 16), C.gold, { p: [0, 0.32, 0.47], r: [PI / 2, 0, 0] }),
    [-0.4, 0, 0.4].map((x) => g([
      m(box(0.36, 0.36, 0.06), C.indigo),
      m(box(0.38, 0.06, 0.08), C.gold, { p: [0, -0.16, 0] }),
    ], { p: [x, -0.98, 0.34 - Math.abs(x) * 0.25], r: [0.15, x * 0.5, 0] })),
  ], { p: [0, 0.15, 0], r: [0.05, -0.4, 0] }),
  kote: () => {
    const one = () => g([
      m(cyl(0.2, 0.27, 0.95, 16), C.ink),
      m(box(0.17, 0.82, 0.07), C.dsteel, { p: [0, 0, 0.21] }),
      [-0.3, 0, 0.3].map((y) => m(tor(0.245 - y * 0.035, 0.026, 6, 20), C.verm, { p: [0, y, 0], r: [PI / 2, 0, 0] })),
      m(box(0.32, 0.24, 0.06), C.dsteel, { p: [0, -0.6, 0.2], r: [0.35, 0, 0] }),
    ]);
    return g([place(one(), { p: [-0.34, 0, 0.1], r: [0, 0.3, 0.4] }), place(one(), { p: [0.36, -0.05, -0.15], r: [0, -0.3, -0.4] })]);
  },
  headband: () => g([
    m(tor(0.62, 0.1, 8, 36), C.indigo, { r: [PI / 2, 0, 0], s: [1, 1, 1.9] }),
    m(box(0.66, 0.32, 0.08), C.steel, { p: [0, 0, 0.66] }),
    [-0.26, 0.26].map((x) => m(sph(0.035, 8, 6), C.dsteel, { p: [x, 0, 0.71] })),
    m(sph(0.13, 10, 8), C.indigo, { p: [0, 0, -0.72] }),
    m(box(0.17, 0.75, 0.035), C.indigo, { p: [0.16, -0.4, -0.78], r: [0.25, 0, 0.3] }),
    m(box(0.17, 0.62, 0.035), C.indigo, { p: [-0.12, -0.36, -0.8], r: [0.3, 0, -0.2] }),
  ], { r: [0.3, -0.55, 0.05] }),
  tabi: () => {
    const one = () => g([
      m(cap(0.2, 0.52), C.ink, { p: [0, 0, 0.15], r: [PI / 2, 0, 0], s: [1, 1, 0.82] }),
      m(cyl(0.19, 0.21, 0.62, 14), C.ink, { p: [0, 0.38, -0.14] }),
      m(box(0.42, 0.07, 1), C.bone, { p: [0, -0.19, 0.15] }),
      m(box(0.025, 0.2, 0.26), C.black, { p: [0.05, -0.01, 0.53], noOutline: true }),
      [0.26, 0.5].map((y) => m(tor(0.21, 0.03, 6, 18), C.verm, { p: [0, y, -0.14], r: [PI / 2, 0, 0] })),
      [0.14, 0.38].map((y) => m(box(0.06, 0.05, 0.03), C.gold, { p: [0, y, -0.35] })),
    ]);
    return g([place(one(), { p: [-0.32, -0.1, 0.1], r: [0, 0.5, 0] }), place(one(), { p: [0.36, -0.1, -0.2], r: [0, 0.15, 0] })], { r: [0.25, -0.5, 0] });
  },
  menpo: () => g([
    m(new THREE.SphereGeometry(0.7, 28, 16, -PI * 0.05, PI * 1.1, PI * 0.42, PI * 0.4), C.red, { double: true }),
    m(cone(0.11, 0.3, 10), C.red, { p: [0, 0.02, 0.72], r: [PI / 2 + 0.5, 0, 0] }),
    m(box(0.5, 0.11, 0.08), C.black, { p: [0, -0.3, 0.6], noOutline: true }),
    [-0.18, -0.06, 0.06, 0.18].map((x, i) => m(cone(0.045, i % 3 ? 0.13 : 0.2, 6), C.bone, { p: [x, -0.3, 0.64], r: [PI, 0, 0] })),
    [-1, 1].map((s) => m(tor(0.2, 0.03, 6, 14, PI * 0.8), C.gold, { p: [s * 0.3, -0.12, 0.6], r: [0, s * 0.4, s > 0 ? PI * 1.1 : PI * 1.1] })),
    m(cone(0.09, 0.22, 8), C.gold, { p: [0, -0.62, 0.46], r: [PI, 0, 0] }),
    [-1, 1].map((s) => m(box(0.26, 0.05, 0.03), C.violet, { p: [s * 0.74, 0.1, -0.02], r: [0, s * 0.7, s * 0.15] })),
  ], { p: [0, 0.2, 0], r: [0.1, -0.45, 0] }),
  kasa: () => g([
    m(new THREE.ConeGeometry(1, 0.5, 36, 1, true), C.straw, { double: true }),
    [0.32, 0.64, 0.97].map((r) => m(tor(r, 0.025, 6, 36), C.dstraw, { p: [0, 0.25 - 0.5 * r, 0], r: [PI / 2, 0, 0] })),
    m(cone(0.09, 0.14, 10), C.verm, { p: [0, 0.3, 0] }),
    m(tor(0.36, 0.02, 6, 20, PI), C.violet, { p: [0, -0.26, 0], r: [0, 0, PI] }),
  ], { r: [0.28, 0, 0.14] }),
  smoke: () => {
    const one = (c) => g([
      m(sph(0.36, 18, 12), C.ink),
      m(tor(0.365, 0.045, 6, 24), c, { r: [PI / 2, 0, 0] }),
      m(cyl(0.05, 0.07, 0.12, 10), C.dsteel, { p: [0, 0.38, 0] }),
      m(tor(0.12, 0.022, 6, 12, PI * 0.8), C.rope, { p: [0.11, 0.44, 0] }),
      m(sph(0.05, 8, 6), C.gold, { p: [0.22, 0.47, 0], glow: 0.9 }),
    ]);
    return g([place(one(C.verm), { p: [-0.36, -0.12, 0.12] }), place(one(C.storm), { p: [0.42, -0.18, -0.08], s: 0.85 }), place(one(C.violet), { p: [0.06, 0.42, -0.2], s: 0.7 })]);
  },
  caltrops: () => g([
    place(caltrop(), { p: [-0.4, -0.2, 0.2], r: [0.2, 0.4, 0], s: 1.1 }),
    place(caltrop(), { p: [0.45, -0.3, 0], r: [0.1, 1.9, 0.2] }),
    place(caltrop(), { p: [0.05, 0.3, -0.25], r: [0.3, 3.1, 0.1], s: 0.85 }),
  ]),
  omamori: () => g([
    m(ext([[-0.34, -0.52], [0.34, -0.52], [0.34, 0.3], [0.19, 0.5], [-0.19, 0.5], [-0.34, 0.3]], 0.1, 0.02), C.violet),
    m(box(0.42, 0.56, 0.025), C.bone, { p: [0, -0.12, 0.07] }),
    m(ext(BOLT, 0.03, 0.006), C.gold, { p: [0, -0.12, 0.1], s: 0.95 }),
    m(tor(0.13, 0.022, 6, 16), C.gold, { p: [0, 0.63, 0] }),
    m(sph(0.06, 8, 6), C.gold, { p: [0, 0.5, 0.08] }),
    [-0.06, 0.06].map((x) => m(box(0.04, 0.3, 0.02), C.gold, { p: [x, 0.32, 0.09], r: [0, 0, x * 3] })),
  ], { r: [0, -0.35, 0.12] }),
  bell: () => g([
    m(sph(0.46, 22, 16), C.gold),
    m(box(0.56, 0.05, 0.2), C.black, { p: [0, -0.2, 0.36], noOutline: true }),
    m(tor(0.12, 0.035, 6, 16), C.dgold, { p: [0, 0.52, 0] }),
    m(cyl(0.035, 0.035, 0.5, 8), C.verm, { p: [0, 0.86, 0] }),
    m(box(0.14, 0.5, 0.03), C.verm, { p: [-0.1, -0.1, -0.5], r: [0, 0, 0.2] }),
    m(box(0.14, 0.44, 0.03), C.bone, { p: [0.1, -0.12, -0.52], r: [0, 0, -0.2] }),
  ], { p: [0, -0.2, 0], r: [0.1, -0.4, 0.1] }),
  hook: () => g([
    m(cyl(0.05, 0.05, 0.9, 10), C.dsteel, { p: [0, 0.15, 0] }),
    [0, 1, 2, 3].map((i) => g([
      m(tor(0.25, 0.045, 8, 16, PI), C.steel, { p: [0.25, 0, 0], r: [0, 0, PI] }),
      m(cone(0.05, 0.2, 8), C.steel, { p: [0.5, 0.1, 0] }),
    ], { p: [0, -0.3, 0], r: [0, (i * PI) / 2, 0] })),
    m(tor(0.1, 0.03, 6, 14), C.dsteel, { p: [0, 0.68, 0] }),
    [0, 1, 2].map((i) => m(tor(0.5 - i * 0.03, 0.06, 8, 26), C.rope, { p: [0.75, 0.2 + i * 0.1, -0.3], r: [PI / 2 + 0.3, 0.2 * i, 0] })),
  ], { p: [-0.25, -0.1, 0], r: [0.25, 0.5, 0.25] }),
  pass: () => g([
    m(ext([[-0.42, -0.62], [0.42, -0.62], [0.42, 0.34], [0, 0.66], [-0.42, 0.34]], 0.09, 0.02), C.wood),
    m(box(0.66, 0.74, 0.02), C.dwood, { p: [0, -0.2, 0.06] }),
    m(ext(BOLT, 0.03, 0.006), C.gold, { p: [0, -0.2, 0.08], s: 1.5 }),
    m(cyl(0.05, 0.05, 0.12, 10), C.black, { p: [0, 0.42, 0], r: [PI / 2, 0, 0], noOutline: true }),
    m(tor(0.16, 0.028, 6, 18), C.verm, { p: [0, 0.57, 0], r: [0, PI / 2, 0] }),
    m(box(0.08, 0.36, 0.03), C.verm, { p: [0.1, 0.84, 0], r: [0, 0, -0.3] }),
  ], { p: [0, -0.1, 0], r: [0, -0.35, 0.1] }),
  forge: () => g([
    m(box(1.1, 0.09, 0.56), C.dwood, { p: [0, -0.36, 0] }),
    m(box(0.92, 0.2, 0.4), C.stone, { p: [0, -0.22, 0] }),
    g([
      m(cyl(0.045, 0.05, 1, 10), C.wood),
      m(box(0.22, 0.22, 0.46), C.dsteel, { p: [0, 0.46, 0] }),
      m(tor(0.055, 0.015, 6, 12), C.verm, { p: [0, -0.3, 0], r: [PI / 2, 0, 0] }),
    ], { p: [0.15, 0.3, 0.1], r: [0.2, 0.4, -0.75] }),
  ], { r: [0.3, -0.5, 0] }),
  daruma: () => g([
    m(sph(0.7, 26, 18), C.red, { s: [1, 0.96, 0.96] }),
    m(sph(0.42, 20, 14), C.bone, { p: [0, 0.14, 0.47], s: [1, 0.85, 0.6] }),
    [-0.15, 0.15].map((x) => m(sph(0.1, 12, 8), 0xffffff, { p: [x, 0.2, 0.7], s: [1, 1, 0.4] })),
    m(sph(0.05, 8, 6), C.black, { p: [0.15, 0.2, 0.74], noOutline: true }),
    [-1, 1].map((s) => m(tor(0.13, 0.03, 6, 12, PI * 0.7), C.black, { p: [s * 0.15, 0.24, 0.71], r: [0, 0, s > 0 ? 0.3 : 0.75], noOutline: true })),
    m(tor(0.1, 0.028, 6, 12, PI), C.black, { p: [0, 0.0, 0.72], r: [0, 0, PI], noOutline: true }),
    [0.3, 0.42, 0.54].map((r) => m(tor(r, 0.03, 6, 20, PI * 0.5), C.gold, { p: [0, -0.2, 0.36 - (r - 0.3) * 0.6], r: [0.5, 0, PI * 1.25], noOutline: true })),
  ], { r: [0.05, -0.3, 0] }),
  kobansmall: () => g([place(pouch(0x7a5632, C.verm), { p: [0.15, 0.1, -0.1] }), coinPile(4, 7, 0.45).map((c) => place(c, { p: [c.position.x - 0.35, -0.42, 0.45 + c.position.z] }))], { r: [0.2, -0.3, 0] }),
  kobanchest: () => g([chest(), g(coinPile(9, 11, 0.5), { p: [0, 0.12, 0] }), m(sph(0.5, 14, 8), C.dgold, { p: [0, -0.1, 0], s: [1.1, 0.4, 0.7], noOutline: true })], { r: [0.3, -0.5, 0] }),
  kobanhoard: () => g([
    place(chest(), { p: [0.15, 0.1, -0.3], s: 0.9 }),
    g(coinPile(8, 5, 0.45), { p: [0.15, 0.2, -0.3] }),
    m(sph(0.9, 16, 8), C.dgold, { p: [-0.1, -0.52, 0.3], s: [1.2, 0.3, 0.8] }),
    g(coinPile(14, 3, 0.85), { p: [-0.1, -0.3, 0.45] }),
    place(pouch(0x7a5632, C.verm), { p: [-0.95, -0.1, 0.1], s: 0.7 }),
  ], { r: [0.3, -0.45, 0] }),
  jadepouch: () => g([pouch(C.cloth, C.gold), g(shards(4, 9, 0.2), { p: [0, 0.6, 0], s: 0.6 }), g(shards(3, 4, 0.5), { p: [-0.45, -0.38, 0.5], s: 0.7 })], { r: [0.15, -0.3, 0] }),
  jadevault: () => g([
    m(box(1.4, 0.55, 0.9), C.black, { p: [0, -0.3, 0] }),
    [-0.71, 0.71].map((x) => m(box(0.03, 0.6, 0.94), C.gold, { p: [x, -0.3, 0] })),
    m(box(1.44, 0.06, 0.94), C.gold, { p: [0, -0.02, 0] }),
    m(box(1.4, 0.1, 0.9), C.black, { p: [0, 0.45, -0.62], r: [-1.2, 0, 0] }),
    m(ext(BOLT, 0.03, 0.006), C.gold, { p: [0, -0.3, 0.46], s: 0.9 }),
    g(shards(9, 21, 0.5), { p: [0, 0.12, 0], s: 0.95 }),
  ], { r: [0.3, -0.5, 0] }),
};
export const MODEL_IDS = Object.keys(MODELS);

function fitted(id) {
  const inner = (MODELS[id] || MODELS.kunai)();
  const boxb = new THREE.Box3().setFromObject(inner);
  const sphere = boxb.getBoundingSphere(new THREE.Sphere());
  inner.position.sub(sphere.center);
  const outer = new THREE.Group();
  outer.add(inner);
  addOutline(inner, 0.024 * sphere.radius);
  outer.scale.setScalar(1 / sphere.radius);
  return outer;
}
function itemLights(scene) {
  scene.add(new THREE.HemisphereLight(0xdfe6ff, 0x3a2f55, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 2.6);
  key.position.set(-3, 5, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x7fb8ff, 1.4);
  rim.position.set(4, 2, -5);
  scene.add(rim);
}

/* ---------- item thumbnails (rendered once, cached as images) ---------- */
let _thumb;
export function renderThumbs(ids, size = 288) {
  const out = {};
  try {
    if (!_thumb) {
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      renderer.setPixelRatio(1);
      const scene = new THREE.Scene();
      itemLights(scene);
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
      camera.position.set(0, 0.5, 4.6);
      camera.lookAt(0, 0, 0);
      _thumb = { renderer, scene, camera, holder: new THREE.Group() };
      scene.add(_thumb.holder);
    }
    const { renderer, scene, camera, holder } = _thumb;
    renderer.setSize(size, size, false);
    for (const id of ids) {
      holder.clear();
      holder.add(fitted(id));
      renderer.render(scene, camera);
      out[id] = renderer.domElement.toDataURL('image/png');
    }
    holder.clear();
  } catch (e) { /* no WebGL: the UI falls back to a plain tile */ }
  return out;
}

/* ---------- live item viewer (one shared renderer, used inside dialogs) ---------- */
let _viewer;
export function showItem(container, id) {
  try {
    if (!_viewer) {
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      const scene = new THREE.Scene();
      itemLights(scene);
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
      camera.position.set(0, 0.5, 4.6);
      camera.lookAt(0, 0, 0);
      const holder = new THREE.Group();
      scene.add(holder);
      _viewer = { renderer, scene, camera, holder, timer: new THREE.Timer(), still: window.matchMedia('(prefers-reduced-motion: reduce)').matches };
      renderer.domElement.className = 'viewer__canvas';
      renderer.domElement.setAttribute('aria-hidden', 'true');
    }
    const v = _viewer;
    v.holder.clear();
    v.holder.add(fitted(id));
    v.holder.rotation.set(0, 0, 0);
    container.appendChild(v.renderer.domElement);
    const size = Math.max(160, Math.round(container.clientWidth || 240));
    v.renderer.setSize(size, size, false);
    if (v.still) { v.renderer.render(v.scene, v.camera); return; }
    v.renderer.setAnimationLoop(() => {
      v.timer.update();
      const dt = Math.min(Math.max(v.timer.getDelta(), 0), 0.1);
      v.holder.rotation.y += dt * 0.9;
      v.holder.position.y = Math.sin(v.timer.getElapsed() * 1.6) * 0.04;
      v.renderer.render(v.scene, v.camera);
    });
  } catch (e) { /* no WebGL */ }
}
export function hideItem() {
  if (!_viewer) return;
  _viewer.renderer.setAnimationLoop(null);
  _viewer.renderer.domElement.remove();
  _viewer.holder.clear();
}

/* ---------- hero stage: 2D painted layers behind a 3D cel-shaded foreground ---------- */
function layerTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function drawMountains(ctx, w, h, seed, color, base, amp, mist) {
  const r = rng(seed);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, h);
  let x = 0, y = base;
  ctx.lineTo(0, y);
  while (x < w) {
    const up = r() > 0.45, dx = 40 + r() * 120;
    y = Math.max(h * 0.08, Math.min(base + amp * 0.3, y + (up ? -1 : 1) * r() * amp));
    x += dx;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();
  if (mist) {
    const grad = ctx.createLinearGradient(0, h * 0.55, 0, h);
    grad.addColorStop(0, 'rgba(150,130,220,0)');
    grad.addColorStop(1, mist);
    ctx.fillStyle = grad;
    ctx.fillRect(0, h * 0.55, w, h * 0.45);
  }
}
function roofShape(ctx, cx, y, half, rise) {
  ctx.beginPath();
  ctx.moveTo(cx - half * 0.55, y - rise);
  ctx.lineTo(cx + half * 0.55, y - rise);
  ctx.quadraticCurveTo(cx + half * 0.8, y - rise * 0.2, cx + half * 1.12, y - rise * 0.55);
  ctx.lineTo(cx + half, y);
  ctx.lineTo(cx - half, y);
  ctx.lineTo(cx - half * 1.12, y - rise * 0.55);
  ctx.quadraticCurveTo(cx - half * 0.8, y - rise * 0.2, cx - half * 0.55, y - rise);
  ctx.closePath();
  ctx.fill();
}
function drawPagoda(ctx, cx, ground, s, color, lit) {
  let y = ground;
  for (let i = 0; i < 5; i++) {
    const half = (86 - i * 13) * s, bodyH = (i === 0 ? 46 : 34) * s;
    ctx.fillStyle = color;
    ctx.fillRect(cx - half * 0.56, y - bodyH, half * 1.12, bodyH);
    if (lit) {
      ctx.fillStyle = lit;
      for (const dx of [-0.26, 0, 0.26]) ctx.fillRect(cx + half * dx - 4 * s, y - bodyH * 0.72, 8 * s, bodyH * 0.38);
      ctx.fillStyle = color;
    }
    y -= bodyH;
    roofShape(ctx, cx, y, half, 24 * s);
    y -= 24 * s;
  }
  ctx.fillRect(cx - 3 * s, y - 60 * s, 6 * s, 60 * s);
  for (let i = 0; i < 4; i++) ctx.fillRect(cx - (9 - i * 1.5) * s, y - (14 + i * 11) * s, (18 - i * 3) * s, 4 * s);
}
function drawPine(ctx, x, ground, s, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x - 3 * s, ground - 70 * s, 6 * s, 70 * s);
  for (let i = 0; i < 4; i++) {
    const y = ground - (34 + i * 20) * s, half = (44 - i * 9) * s;
    ctx.beginPath();
    ctx.ellipse(x + (i % 2 ? 8 : -8) * s, y, half, 9 * s, 0, 0, PI * 2);
    ctx.fill();
  }
}
function drawTorii(ctx, x, ground, s, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x - 40 * s, ground - 84 * s, 8 * s, 84 * s);
  ctx.fillRect(x + 32 * s, ground - 84 * s, 8 * s, 84 * s);
  ctx.fillRect(x - 46 * s, ground - 66 * s, 92 * s, 6 * s);
  ctx.beginPath();
  ctx.moveTo(x - 60 * s, ground - 96 * s);
  ctx.quadraticCurveTo(x, ground - 86 * s, x + 60 * s, ground - 96 * s);
  ctx.lineTo(x + 56 * s, ground - 84 * s);
  ctx.lineTo(x - 56 * s, ground - 84 * s);
  ctx.closePath();
  ctx.fill();
}

const SKY_FRAG = `
varying vec2 vUv; uniform float uTime; uniform float uFlash; uniform vec3 uAccent;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float a = 0.5, s = 0.0; for(int i=0;i<4;i++){ s += a*noise(p); p *= 2.03; a *= 0.5; } return s; }
void main(){
  vec2 uv = vUv;
  vec3 top = vec3(0.030, 0.035, 0.095), mid = vec3(0.150, 0.105, 0.300), hor = mix(vec3(0.42, 0.20, 0.36), uAccent, 0.35);
  vec3 col = mix(hor, mid, smoothstep(0.30, 0.52, uv.y));
  col = mix(col, top, smoothstep(0.50, 0.92, uv.y));
  vec2 d = (uv - vec2(0.60, 0.635)) * vec2(2.0, 1.0);
  float r = length(d);
  col += vec3(0.95, 0.70, 0.60) * 0.30 * exp(-r * 4.5);
  vec3 moon = vec3(1.0, 0.94, 0.84) - 0.10 * step(0.55, fbm(d * 16.0 + 3.0));
  col = mix(col, moon, smoothstep(0.132, 0.128, r));
  float c = fbm(vec2(uv.x * 3.2 + uTime * 0.012, uv.y * 9.0));
  float sky = smoothstep(0.30, 0.50, uv.y);
  float band = smoothstep(0.560, 0.566, c) * sky;
  col = mix(col, vec3(0.085, 0.075, 0.190), band * 0.9);
  float edge = smoothstep(0.560, 0.566, c) * (1.0 - smoothstep(0.585, 0.590, c)) * sky;
  col = mix(col, vec3(0.34, 0.26, 0.58), edge * 0.55);
  col += uFlash * vec3(0.45, 0.60, 1.0) * (0.18 + 0.65 * band);
  gl_FragColor = vec4(col, 1.0);
}`;

function buildNinja(accent) {
  const A = accent;
  const tails = [];
  function ribbon(len, width, at, phase, color) {
    const geo = new THREE.PlaneGeometry(len, width, 22, 1);
    geo.translate(len / 2, 0, 0);
    const mesh = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ color, gradientMap: gradient(), side: THREE.DoubleSide }));
    mesh.userData.noOutline = true;
    mesh.position.set(at[0], at[1], at[2]);
    mesh.userData.base = geo.getAttribute('position').array.slice();
    mesh.userData.len = len; mesh.userData.phase = phase;
    tails.push(mesh);
    return mesh;
  }
  const accentMat = new THREE.MeshToonMaterial({ color: A, gradientMap: gradient() });
  const am = (geo, o = {}) => place(new THREE.Mesh(geo, accentMat), o);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xeaf6ff });
  const al = (...args) => { const x = limb(...args); x.material = accentMat; return x; };
  const body = g([
    // legs
    limb([-0.2, 1.3, 0], [-0.52, 0.74, 0.34], 0.17, C.ink),
    limb([-0.52, 0.74, 0.34], [-0.46, 0.14, 0.24], 0.13, C.ink),
    limb([-0.5, 0.52, 0.31], [-0.46, 0.2, 0.25], 0.142, C.wrap),
    m(box(0.24, 0.15, 0.54), C.ink, { p: [-0.46, 0.08, 0.36], r: [0, -0.25, 0] }),
    limb([0.2, 1.3, 0], [0.56, 0.72, -0.1], 0.17, C.ink),
    limb([0.56, 0.72, -0.1], [0.52, 0.14, -0.3], 0.13, C.ink),
    limb([0.55, 0.5, -0.17], [0.52, 0.2, -0.29], 0.142, C.wrap),
    m(box(0.24, 0.15, 0.54), C.ink, { p: [0.54, 0.08, -0.2], r: [0, 0.5, 0] }),
    // hips, torso, chest guard
    m(sph(0.33, 16, 12), C.ink, { p: [0, 1.36, 0], s: [1.1, 0.8, 0.85] }),
    place(limb([0, 1.42, 0], [0, 2.02, 0.07], 0.3, C.ink), { s: [1.18, 1, 0.86] }),
    m(box(0.56, 0.42, 0.14), C.indigo, { p: [0, 1.98, 0.24], r: [-0.1, 0, 0] }),
    m(box(0.6, 0.05, 0.16), C.dsteel, { p: [0, 1.79, 0.25], r: [-0.1, 0, 0] }),
    am(tor(0.335, 0.075, 8, 24), { p: [0, 1.46, 0], r: [PI / 2, 0, 0], s: [1.08, 0.86, 1] }),
    am(box(0.1, 0.42, 0.04), { p: [-0.2, 1.24, 0.3], r: [0.2, 0, 0.15] }),
    // scarf, head, face slit, eyes, headband
    am(tor(0.25, 0.115, 8, 22), { p: [0, 2.3, 0.04], r: [PI / 2 - 0.15, 0, 0] }),
    m(sph(0.3, 22, 16), C.ink, { p: [0, 2.62, 0.08] }),
    m(new THREE.SphereGeometry(0.306, 20, 6, PI * 0.08, PI * 0.84, PI * 0.39, PI * 0.15), C.skin, { p: [0, 2.62, 0.08], noOutline: true }),
    [-1, 1].map((s) => place(new THREE.Mesh(box(0.1, 0.035, 0.02), eyeMat), { p: [s * 0.115, 2.655, 0.368], r: [0, s * 0.35, s * -0.22] })),
    am(tor(0.303, 0.052, 8, 26), { p: [0, 2.75, 0.08], r: [PI / 2, 0, 0], s: [1, 1, 1.5] }),
    m(box(0.24, 0.11, 0.035), C.steel, { p: [0, 2.75, 0.39] }),
    am(sph(0.085, 10, 8), { p: [0, 2.75, -0.24] }),
    // left arm forward with kunai
    limb([-0.42, 2.12, 0.02], [-0.66, 1.76, 0.3], 0.12, C.ink),
    limb([-0.66, 1.76, 0.3], [-0.42, 1.72, 0.74], 0.105, C.ink),
    limb([-0.6, 1.75, 0.42], [-0.47, 1.73, 0.66], 0.128, C.dsteel),
    m(sph(0.105, 10, 8), C.ink, { p: [-0.4, 1.72, 0.8] }),
    place(kunaiModel(), { p: [-0.4, 1.66, 0.86], r: [1.9, 0, 0.5], s: 0.42 }),
    // right arm up to the hilt
    limb([0.42, 2.12, 0.02], [0.74, 2.3, -0.06], 0.12, C.ink),
    limb([0.74, 2.3, -0.06], [0.54, 2.76, -0.26], 0.105, C.ink),
    limb([0.7, 2.42, -0.12], [0.59, 2.66, -0.22], 0.128, C.dsteel),
    m(sph(0.105, 10, 8), C.ink, { p: [0.53, 2.8, -0.28] }),
    // katana across the back
    limb([0.55, 2.85, -0.32], [-0.52, 1.22, -0.3], 0.055, C.black, { flat: true }),
    al([0.55, 2.85, -0.32], [0.74, 3.14, -0.33], 0.045, C.verm, { flat: true }),
    limb([0.535, 2.83, -0.32], [0.565, 2.87, -0.32], 0.12, C.gold, { flat: true }),
    limb([-0.2, 1.72, -0.3], [-0.24, 1.66, -0.3], 0.07, C.gold, { flat: true }),
  ]);
  const root = new THREE.Group();
  root.add(body);
  addOutline(body, 0.02);
  body.add(ribbon(2.1, 0.13, [0.02, 2.78, -0.3], 0, A), ribbon(1.7, 0.12, [-0.03, 2.72, -0.3], 1.7, A), ribbon(3.3, 0.42, [0.05, 2.34, -0.22], 0.8, A));
  for (const t of tails) t.rotation.y = 0.95;
  root.userData = { tails, accentMat, body };
  return root;
}
function buildRoof() {
  const tiles = [];
  for (let i = 0; i < 22; i++) tiles.push(m(cyl(0.1, 0.1, 3.2, 8), i % 2 ? 0x2c3050 : C.slate, { p: [-4 + i * 0.4, 0, 0], r: [PI / 2, 0, 0] }));
  const ridge = [];
  for (let i = 0; i < 15; i++) ridge.push(m(cyl(0.2, 0.2, 0.56, 12), i % 2 ? C.slate : 0x30345a, { p: [-4.2 + i * 0.6, 0.02, 0], r: [0, 0, PI / 2] }));
  const roof = g([
    m(box(9, 0.24, 0.5), 0x1b1e34, { p: [0.2, -0.16, 0] }),
    ridge,
    g([m(box(9, 0.1, 3.2), 0x191b2e), g(tiles, { p: [0, 0.08, 0] })], { p: [0.2, -1.05, 1.42], r: [0.62, 0, 0] }),
    // ridge-end ornament
    g([
      m(cyl(0.34, 0.34, 0.14, 16), C.slate, { r: [0, 0, PI / 2] }),
      m(cyl(0.2, 0.2, 0.16, 14), C.gold, { r: [0, 0, PI / 2], p: [-0.02, 0, 0] }),
      m(cone(0.12, 0.7, 8), C.slate, { p: [-0.05, 0.48, 0], r: [0, 0, 0.35] }),
    ], { p: [-4.45, 0.08, 0] }),
  ]);
  addOutline(roof, 0.02);
  return roof;
}

export function createStage(canvas, opts = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (e) { return null; }
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07080f);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
  let accent = new THREE.Color(opts.accent || C.verm);

  const skyMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uFlash: { value: 0 }, uAccent: { value: accent.clone() } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: SKY_FRAG, depthWrite: false,
  });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(150, 75), skyMat);
  sky.position.set(0, 6, -70);
  scene.add(sky);

  const layer = (tex, w, h, x, y, z) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
  };
  layer(layerTexture(2048, 512, (c, w, h) => drawMountains(c, w, h, 12, '#3a2f6b', h * 0.55, 90, 'rgba(170,140,230,0.55)')), 110, 27.5, 0, -1.5, -52);
  layer(layerTexture(2048, 512, (c, w, h) => drawMountains(c, w, h, 31, '#241f4c', h * 0.7, 70, 'rgba(120,100,200,0.35)')), 84, 21, 4, -3.4, -38);
  layer(layerTexture(2048, 512, (c, w, h) => {
    const col = '#15142e', ground = h * 0.86;
    c.fillStyle = col;
    c.fillRect(0, ground, w, h - ground);
    drawPagoda(c, w * 0.34, ground, 1.25, col, '#ffb45c');
    drawTorii(c, w * 0.52, ground, 1.1, col);
    drawPagoda(c, w * 0.8, ground, 0.8, col, '#ff8d4a');
    const r = rng(8);
    for (let i = 0; i < 22; i++) drawPine(c, r() * w, ground + 4, 0.7 + r() * 0.8, col);
  }), 60, 15, 0, -0.6, -24);
  layer(layerTexture(2048, 512, (c, w, h) => {
    c.fillStyle = '#0b0b1a';
    const r = rng(77);
    let x = -40;
    while (x < w) {
      const half = 90 + r() * 90, y = h * (0.62 + r() * 0.22);
      roofShape(c, x + half, y, half, 30 + r() * 14);
      c.fillRect(x + half * 0.2, y, half * 1.6, h - y);
      x += half * 1.7;
    }
  }), 44, 11, -3, -4.3, -11);

  scene.add(new THREE.HemisphereLight(0x8f9cff, 0x241a3a, 1.25));
  const moonLight = new THREE.DirectionalLight(0xffe8d0, 2.2);
  moonLight.position.set(1.5, 5, -6);
  scene.add(moonLight);
  const fill = new THREE.DirectionalLight(0x8fb4ff, 1.5);
  fill.position.set(-6, 3, 7);
  scene.add(fill);
  const flashLight = new THREE.DirectionalLight(0x9fc6ff, 0);
  flashLight.position.set(-4, 6, -3);
  scene.add(flashLight);

  const rig = new THREE.Group();
  scene.add(rig);
  const roof = buildRoof();
  rig.add(roof);
  const ninja = buildNinja(accent);
  ninja.position.set(0, 0.2, 0);
  ninja.rotation.y = -0.72;
  rig.add(ninja);

  // drifting leaves, instanced
  const LEAVES = 46;
  const leafGeo = new THREE.PlaneGeometry(0.16, 0.07);
  const leafMat = new THREE.MeshBasicMaterial({ color: accent.clone(), side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
  const leaves = new THREE.InstancedMesh(leafGeo, leafMat, LEAVES);
  const lr = rng(5), leafData = [];
  for (let i = 0; i < LEAVES; i++) leafData.push({ x: lr() * 26 - 13, y: lr() * 9 - 3, z: lr() * 10 - 6, v: 0.9 + lr() * 1.6, spin: lr() * 6, w: 0.5 + lr() });
  scene.add(leaves);
  const dummy = new THREE.Object3D();

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = (e) => { pointer.tx = (e.clientX / window.innerWidth) * 2 - 1; pointer.ty = (e.clientY / window.innerHeight) * 2 - 1; };
  window.addEventListener('pointermove', onMove, { passive: true });

  let wide = true;
  function resize() {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    wide = camera.aspect > 1.05;
    camera.fov = wide ? 32 : 40;
    camera.updateProjectionMatrix();
    rig.position.set(wide ? 2.7 + Math.min(1.2, (camera.aspect - 1.6) * 1.4) : 0.9, wide ? -2.1 : 1.0, 0);
    if (!running) draw(0);
  }
  const timer = new THREE.Timer();
  timer.connect(document);
  let running = false, time = 0, flash = 0, nextFlash = 3.5, paused = false;
  function draw(dt) {
    time += dt;
    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 3);
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 3);
    camera.position.set(pointer.x * 0.55, 0.7 - pointer.y * 0.25, wide ? 11 : 13.5);
    camera.lookAt(pointer.x * 0.15, 0.35, 0);
    nextFlash -= dt;
    if (nextFlash <= 0) { flash = 1; nextFlash = 5 + ((time * 7.3) % 7); }
    flash *= Math.exp(-dt * 5);
    const strobe = flash * (0.6 + 0.4 * Math.sin(time * 60));
    skyMat.uniforms.uTime.value = time;
    skyMat.uniforms.uFlash.value = strobe;
    flashLight.intensity = strobe * 7;
    ninja.userData.body.position.y = Math.sin(time * 1.5) * 0.018;
    for (const t of ninja.userData.tails) {
      const pos = t.geometry.getAttribute('position'), base = t.userData.base, len = t.userData.len, ph = t.userData.phase;
      for (let i = 0; i < pos.count; i++) {
        const u = base[i * 3] / len;
        pos.setY(i, base[i * 3 + 1] + Math.sin(u * 6 - time * 5.2 + ph) * 0.2 * u + u * u * 0.55);
        pos.setZ(i, Math.cos(u * 4.2 - time * 3.4 + ph) * 0.16 * u);
      }
      pos.needsUpdate = true;
      t.geometry.computeVertexNormals();
    }
    for (let i = 0; i < LEAVES; i++) {
      const L = leafData[i];
      L.x += L.v * dt * 1.4; L.y -= L.v * dt * 0.28;
      if (L.x > 13) { L.x = -13; L.y = lr() * 9 - 2; }
      dummy.position.set(L.x, L.y + Math.sin(time * L.w + L.spin) * 0.3, L.z);
      dummy.rotation.set(time * L.w * 2 + L.spin, time * L.w, L.spin);
      dummy.updateMatrix();
      leaves.setMatrixAt(i, dummy.matrix);
    }
    leaves.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
  }
  function loop() {
    timer.update();
    draw(Math.min(Math.max(timer.getDelta(), 0), 0.1));
  }
  function start() {
    if (still || paused) { draw(0); return; }
    if (running) return;
    running = true;
    renderer.setAnimationLoop(loop);
  }
  function stop() { running = false; renderer.setAnimationLoop(null); }
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else if (!paused) start(); });
  resize();
  start();
  const api = {
    renderer, scene,
    setPaused(p) { paused = p; if (p) { stop(); draw(0); } else start(); },
    setAccent(hex) {
      accent = new THREE.Color(hex);
      ninja.userData.accentMat.color.copy(accent);
      for (const t of ninja.userData.tails) t.material.color.copy(accent);
      leafMat.color.copy(accent);
      skyMat.uniforms.uAccent.value.copy(accent);
      if (!running) draw(0);
    },
    flash() { flash = 1; if (!running) draw(0); },
  };
  return api;
}
