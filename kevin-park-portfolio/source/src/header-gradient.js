/* Moving shader gradient behind the main headers.

   A dependency-free WebGL port of the default "plane" look from ShaderGradient
   (https://github.com/ruucm/shadergradient, MIT, packages/shadergradient/src/shaders/defaults/plane).
   Kept from the source: the classic Perlin noise (cnoise), the displacement of a plane along its
   normal by 0.75 * cnoise(0.43 * position * density + time) * strength, and the color rule
   mix(mix(color1, color2, smoothstep(-3, 3, pos.x)), color3, pos.z).
   Replaced: three.js and react-three-fiber, and three's physical lighting chunks, which become one
   soft key light and a clearcoat-like highlight. Colors come from CSS (--sg-1, --sg-2, --sg-3) so
   each theme owns its palette.

   Each element with [data-sg] gets a canvas. It renders at reduced resolution, pauses offscreen
   and in background tabs, and draws a single still frame under reduced motion. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  var VS = [
    "precision highp float;",
    "attribute vec2 aPos;",
    "uniform mat4 uMVP;",
    "uniform float uTime, uSpeed, uDensity, uStrength;",
    "varying vec3 vPos; varying vec3 vNormal;",
    "vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}",
    "vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}",
    "vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}",
    "vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}",
    "vec3 fade(vec3 t){return t*t*t*(t*(t*6.0-15.0)+10.0);}",
    "float cnoise(vec3 P){",
    " vec3 Pi0=floor(P),Pi1=Pi0+vec3(1.0);Pi0=mod289(Pi0);Pi1=mod289(Pi1);",
    " vec3 Pf0=fract(P),Pf1=Pf0-vec3(1.0);",
    " vec4 ix=vec4(Pi0.x,Pi1.x,Pi0.x,Pi1.x),iy=vec4(Pi0.yy,Pi1.yy),iz0=Pi0.zzzz,iz1=Pi1.zzzz;",
    " vec4 ixy=permute(permute(ix)+iy),ixy0=permute(ixy+iz0),ixy1=permute(ixy+iz1);",
    " vec4 gx0=ixy0*(1.0/7.0),gy0=fract(floor(gx0)*(1.0/7.0))-0.5;gx0=fract(gx0);",
    " vec4 gz0=vec4(0.5)-abs(gx0)-abs(gy0),sz0=step(gz0,vec4(0.0));",
    " gx0-=sz0*(step(0.0,gx0)-0.5);gy0-=sz0*(step(0.0,gy0)-0.5);",
    " vec4 gx1=ixy1*(1.0/7.0),gy1=fract(floor(gx1)*(1.0/7.0))-0.5;gx1=fract(gx1);",
    " vec4 gz1=vec4(0.5)-abs(gx1)-abs(gy1),sz1=step(gz1,vec4(0.0));",
    " gx1-=sz1*(step(0.0,gx1)-0.5);gy1-=sz1*(step(0.0,gy1)-0.5);",
    " vec3 g000=vec3(gx0.x,gy0.x,gz0.x),g100=vec3(gx0.y,gy0.y,gz0.y),g010=vec3(gx0.z,gy0.z,gz0.z),g110=vec3(gx0.w,gy0.w,gz0.w);",
    " vec3 g001=vec3(gx1.x,gy1.x,gz1.x),g101=vec3(gx1.y,gy1.y,gz1.y),g011=vec3(gx1.z,gy1.z,gz1.z),g111=vec3(gx1.w,gy1.w,gz1.w);",
    " vec4 n0=taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));",
    " g000*=n0.x;g010*=n0.y;g100*=n0.z;g110*=n0.w;",
    " vec4 n1=taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));",
    " g001*=n1.x;g011*=n1.y;g101*=n1.z;g111*=n1.w;",
    " float n000=dot(g000,Pf0),n100=dot(g100,vec3(Pf1.x,Pf0.yz)),n010=dot(g010,vec3(Pf0.x,Pf1.y,Pf0.z)),n110=dot(g110,vec3(Pf1.xy,Pf0.z));",
    " float n001=dot(g001,vec3(Pf0.xy,Pf1.z)),n101=dot(g101,vec3(Pf1.x,Pf0.y,Pf1.z)),n011=dot(g011,vec3(Pf0.x,Pf1.yz)),n111=dot(g111,Pf1);",
    " vec3 f=fade(Pf0);vec4 nz=mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),f.z);",
    " vec2 nyz=mix(nz.xy,nz.zw,f.y);return 2.2*mix(nyz.x,nyz.y,f.x);}",
    "float disp(vec2 p){return 0.75*cnoise(0.43*vec3(p,0.0)*uDensity+uTime*uSpeed)*uStrength;}",
    "void main(){",
    " float e=0.08;",
    " float h=disp(aPos),hx=disp(aPos+vec2(e,0.0)),hy=disp(aPos+vec2(0.0,e));",
    " vNormal=normalize(vec3(-(hx-h)/e,-(hy-h)/e,1.0));",
    " vPos=vec3(aPos,h);",
    " gl_Position=uMVP*vec4(vPos,1.0);}"
  ].join("\n");

  var FS = [
    "precision highp float;",
    "uniform vec3 uC1, uC2, uC3; uniform float uLight;",
    "varying vec3 vPos; varying vec3 vNormal;",
    "void main(){",
    " vec3 base=mix(mix(uC1,uC2,smoothstep(-3.0,3.0,vPos.x)),uC3,clamp(vPos.z,0.0,1.0));",
    " vec3 n=normalize(vNormal);",
    " vec3 L=normalize(vec3(-0.35,0.55,0.75));",
    " float diff=max(dot(n,L),0.0);",
    " vec3 H=normalize(L+vec3(0.0,0.0,1.0));",
    " float spec=pow(max(dot(n,H),0.0),36.0);",
    " vec3 col=base*(0.62+0.48*diff)+vec3(spec)*0.22*uLight;",
    " gl_FragColor=vec4(col,1.0);}"
  ].join("\n");

  function hex(v) {
    v = (v || "").trim().replace("#", "");
    if (v.length === 3) v = v.replace(/./g, "$&$&");
    var n = parseInt(v, 16);
    if (isNaN(n)) return [0, 0, 0];
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  /* column-major 4x4 helpers */
  function mul(a, b) {
    var o = new Float32Array(16);
    for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) {
      var s = 0; for (var k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s;
    }
    return o;
  }
  function persp(fov, asp, near, far) {
    var f = 1 / Math.tan(fov / 2), nf = 1 / (near - far);
    return new Float32Array([f / asp, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
  }
  function rotX(a) { var c = Math.cos(a), s = Math.sin(a); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); }
  function rotZ(a) { var c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); }
  function trans(x, y, z) { return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]); }

  function compile(gl, type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; }
    return s;
  }

  function Gradient(host) {
    var canvas = document.createElement("canvas");
    /* "glass-container" keeps this canvas out of the liquid glass nav's html2canvas snapshot, which cannot
       read WebGL pixels; the snapshot shows the CSS fallback gradient behind it instead. */
    canvas.className = "sg__canvas glass-container";
    canvas.setAttribute("aria-hidden", "true");
    var gl = canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: "low-power" });
    if (!gl) return;
    var vs = compile(gl, gl.VERTEX_SHADER, VS), fs = compile(gl, gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return;
    var prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    /* a 22 x 22 plane, 128 x 128 quads, as an indexed triangle grid; large enough that its edges never show */
    var N = 128, SIZE = 22, verts = new Float32Array((N + 1) * (N + 1) * 2), idx = new Uint16Array(N * N * 6), i = 0, j = 0;
    for (var y = 0; y <= N; y++) for (var x = 0; x <= N; x++) { verts[i++] = (x / N - 0.5) * SIZE; verts[i++] = (y / N - 0.5) * SIZE; }
    for (y = 0; y < N; y++) for (x = 0; x < N; x++) {
      var a = y * (N + 1) + x, b = a + 1, c = a + N + 1, d = c + 1;
      idx[j++] = a; idx[j++] = b; idx[j++] = c; idx[j++] = b; idx[j++] = d; idx[j++] = c;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    var aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    var U = {};
    ["uMVP", "uTime", "uSpeed", "uDensity", "uStrength", "uC1", "uC2", "uC3", "uLight"].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
    /* ShaderGradient's defaults: density 1.3, strength 4, speed 0.4 (slowed here; it sits behind reading) */
    gl.uniform1f(U.uDensity, 1.3); gl.uniform1f(U.uStrength, 3.2); gl.uniform1f(U.uSpeed, 0.12);
    gl.enable(gl.DEPTH_TEST);

    host.appendChild(canvas);
    var w = 0, h = 0, visible = true, raf = null, t0 = performance.now(), first = true;
    var SCALE = 0.6; /* the gradient is soft, so a lower-resolution buffer upscaled by CSS reads the same */

    function colors() {
      var cs = getComputedStyle(host);
      gl.uniform3fv(U.uC1, hex(cs.getPropertyValue("--sg-1")));
      gl.uniform3fv(U.uC2, hex(cs.getPropertyValue("--sg-2")));
      gl.uniform3fv(U.uC3, hex(cs.getPropertyValue("--sg-3")));
      gl.uniform1f(U.uLight, parseFloat(cs.getPropertyValue("--sg-light")) || 1);
    }
    function size() {
      var r = host.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2) * SCALE;
      var nw = Math.max(1, Math.round(r.width * dpr)), nh = Math.max(1, Math.round(r.height * dpr));
      if (nw === w && nh === h) return;
      w = canvas.width = nw; h = canvas.height = nh;
      gl.viewport(0, 0, w, h);
      var asp = w / h;
      /* camera 6 units back; the plane is tilted away and turned so the folds run diagonally */
      /* shifted so the amber side of the mix sits behind the hero card */
      var view = trans(0, 0, -6), model = mul(mul(rotZ(-0.62), rotX(-0.42)), trans(-1.4, 0.4, 0));
      var proj = persp(asp < 1 ? 1.15 : 0.82, asp, 0.1, 50);
      gl.uniformMatrix4fv(U.uMVP, false, mul(proj, mul(view, model)));
    }
    function frame(now) {
      raf = null;
      size();
      var t = 4 + (reduce.matches ? 0 : (now - t0) / 1000);
      gl.uniform1f(U.uTime, t);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
      if (first) { first = false; host.classList.add("is-live"); }
      if (visible && !document.hidden && !reduce.matches) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }

    colors(); kick();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) kick(); }).observe(host);
    }
    document.addEventListener("visibilitychange", function () { if (!document.hidden) kick(); });
    window.addEventListener("resize", kick, { passive: true });
    document.addEventListener("kp:themechange", function () { colors(); kick(); });
    if (reduce.addEventListener) reduce.addEventListener("change", kick);
  }

  function init(scope) {
    (scope || document).querySelectorAll("[data-sg]").forEach(function (el) {
      if (el.__sg) return; el.__sg = true;
      try { new Gradient(el); } catch (e) { /* the CSS fallback behind it stays */ }
    });
  }
  window.KPHeaderGradient = { init: init };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { init(); });
  else init();
})();
