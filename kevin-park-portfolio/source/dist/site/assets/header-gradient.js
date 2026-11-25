/* Grainy liquid gradient behind the main headers.

   A dependency-free WebGL shader. Changed 2026-11-25 (Kevin: grainier, like a film-grain
   liquid gradient poster): the displaced 3D plane is gone. A slow Perlin field (cnoise, kept from
   ShaderGradient, https://github.com/ruucm/shadergradient, MIT) is warped by itself and cut into
   ribbons, each crisp on one edge and feathered on the other, with heavy still grain on top.
   Colors come from CSS (--sg-1, --sg-2, --sg-3) so each theme owns its palette.

   Each element with [data-sg] gets a canvas. It renders at CSS-pixel resolution, pauses offscreen
   and in background tabs, and draws a single still frame under reduced motion. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* The noise is the expensive part, so it runs per vertex on a coarse grid and is interpolated;
     the ribbon edge and the grain are cut per pixel, which keeps them sharp. */
  var VS = [
    "precision highp float;",
    "attribute vec2 aPos;",
    "uniform vec2 uRes; uniform float uTime, uPx;",
    "varying float vN, vAcross;",
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
    "void main(){",
    " vec2 c=aPos*0.5*uRes/uPx/520.0;", /* one noise unit is about 520 CSS px, on any header size */
    /* squeezed across a diagonal, so the field reads as long streaks that pour down-left instead of round blobs */
    " vec2 p=vec2(dot(c,vec2(0.80,0.60))*0.42,dot(c,vec2(-0.60,0.80))*1.25);",
    " float t=uTime*0.04;",
    /* the field is pushed around by two slower copies of itself: that is what makes it pour instead of pulse */
    " vec2 q=vec2(cnoise(vec3(p*0.9,t)),cnoise(vec3(p*0.9+vec2(5.2,1.3),t)));",
    " vN=cnoise(vec3(p+q*0.9+vec2(t*0.5,0.0),t*0.7));",
    " vAcross=aPos.x*0.5+0.5+q.x*0.12;",
    " gl_Position=vec4(aPos,0.0,1.0);}"
  ].join("\n");

  var FS = [
    "precision highp float;",
    "uniform vec3 uC1, uC2, uC3; uniform float uPx;",
    "varying float vN, vAcross;",
    "void main(){",
    /* sawtooth of the field: each ribbon ramps up softly and ends on a crisp edge */
    " float s=fract(vN*1.7+0.35);",
    " float band=pow(s,1.7)*smoothstep(1.0,0.965,s);",
    /* color1 is the ground; the ribbons run from color3 to color2 across the header */
    " vec3 col=mix(uC1,mix(uC3,uC2,smoothstep(0.1,0.95,vAcross)),band);",
    /* still film grain, one cell per CSS pixel */
    " vec2 g=floor(gl_FragCoord.xy/uPx);",
    " float d=fract(sin(dot(g,vec2(12.9898,78.233)))*43758.5453)-0.5;",
    " gl_FragColor=vec4(col+d*0.16,1.0);}"
  ].join("\n");

  function hex(v) {
    v = (v || "").trim().replace("#", "");
    if (v.length === 3) v = v.replace(/./g, "$&$&");
    var n = parseInt(v, 16);
    if (isNaN(n)) return [0, 0, 0];
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

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

    /* a 160 x 160 grid over the viewport, in clip space */
    var N = 160, verts = new Float32Array((N + 1) * (N + 1) * 2), idx = new Uint16Array(N * N * 6), i = 0, j = 0;
    for (var y = 0; y <= N; y++) for (var x = 0; x <= N; x++) { verts[i++] = x / N * 2 - 1; verts[i++] = y / N * 2 - 1; }
    for (y = 0; y < N; y++) for (x = 0; x < N; x++) {
      var a = y * (N + 1) + x, b = a + 1, c = a + N + 1, d = c + 1;
      idx[j++] = a; idx[j++] = b; idx[j++] = c; idx[j++] = b; idx[j++] = d; idx[j++] = c;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    var aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    var U = {};
    ["uRes", "uPx", "uTime", "uC1", "uC2", "uC3"].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

    host.appendChild(canvas);
    var w = 0, h = 0, visible = true, raf = null, t0 = performance.now(), first = true;
    function colors() {
      var cs = getComputedStyle(host);
      gl.uniform3fv(U.uC1, hex(cs.getPropertyValue("--sg-1")));
      gl.uniform3fv(U.uC2, hex(cs.getPropertyValue("--sg-2")));
      gl.uniform3fv(U.uC3, hex(cs.getPropertyValue("--sg-3")));
    }
    function size() {
      var r = host.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      var nw = Math.max(1, Math.round(r.width * dpr)), nh = Math.max(1, Math.round(r.height * dpr));
      if (nw === w && nh === h) return;
      w = canvas.width = nw; h = canvas.height = nh;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(U.uRes, w, h); gl.uniform1f(U.uPx, dpr);
    }
    function frame(now) {
      raf = null;
      size();
      var t = 4 + (reduce.matches ? 0 : (now - t0) / 1000);
      gl.uniform1f(U.uTime, t);
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
