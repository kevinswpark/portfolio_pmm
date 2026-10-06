"""Verify the single-file Artifact build: hash routes, sections, 404, ids, zoom."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
frag = Path("dist/artifact/index.html").read_text()
Path("/tmp/kp-artifact.html").write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><style>:root{color-scheme:light}body{margin:0}[hidden]{display:none!important}</style></head><body>' + frag + "</body></html>")
URL = "file:///tmp/kp-artifact.html"
res = []
def ok(n, c, d=""): res.append((n, bool(c), d))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await (await b.new_context(viewport={"width": 1280, "height": 800}, reduced_motion="reduce")).new_page()
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        st = lambda: pg.evaluate("[[...document.querySelectorAll('[data-view]')].filter(v=>!v.hidden).map(v=>v.dataset.view), document.title]")
        await pg.goto(URL); s = await st(); ok("default is home", s[0] == ["home"], s)
        for h, v in [("#money-layer", "money-layer"), ("#money-lifecycle", "money-lifecycle"), ("#money-layer.layer", "money-layer"), ("#money-lifecycle.use", "money-lifecycle"), ("#wirebarley", "wirebarley"), ("#wirebarley.results", "wirebarley"), ("#nope", "404"), ("#ko", "404")]:
            await pg.goto(URL + h); await pg.wait_for_timeout(150); s = await st(); ok(f"route {h}", s[0] == [v], s)
        await pg.goto(URL + "#money-layer"); await pg.wait_for_timeout(100)
        await pg.click('[data-view="money-layer"] .nav__links a[href="#home.work"]'); await pg.wait_for_timeout(300)
        s = await st(); y = await pg.evaluate("scrollY"); ok("nav Work from article lands on work section", s[0] == ["home"] and y > 400, [s, y])
        dup = await pg.evaluate("(() => { const s = {}; const d = []; document.querySelectorAll('[id]').forEach(e => { if (s[e.id]) d.push(e.id); s[e.id] = 1 }); return d })()")
        ok("unique ids across views", not dup, dup[:5])
        await pg.goto(URL + "#money-layer"); await pg.wait_for_timeout(150)
        await pg.click('[data-view="money-layer"] .zoom-btn'); await pg.wait_for_timeout(300)
        ok("zoom works", await pg.evaluate("document.getElementById('zoom').open"))
        ok("Artifact has no iframes and links the commercial out", await pg.evaluate("document.querySelectorAll('iframe').length === 0 && !!document.querySelector('[data-view=wirebarley] a.video-card[href*=youtube]')"))
        ok("no JS errors", not errs, errs)
        await b.close()
asyncio.run(main())
f = [r for r in res if not r[1]]
print(f"{len(res)-len(f)}/{len(res)} artifact checks passed"); [print("FAIL", r) for r in f]
