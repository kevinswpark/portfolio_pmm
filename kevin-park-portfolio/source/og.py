"""Render the Open Graph card (1200x630) from the site's own CSS, type, and hero card."""
import asyncio, shutil, sys
from pathlib import Path
sys.path.insert(0, "src")
import diagrams, content as C
from playwright.async_api import async_playwright
OUT = Path("dist/site"); tmp = OUT / "_og"; tmp.mkdir(exist_ok=True)
H = C.HERO
(tmp / "index.html").write_text(f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<link rel="stylesheet" href="/assets/fonts/fonts.css"><link rel="stylesheet" href="/assets/site.css">
<style>html,body{{margin:0;width:1200px;height:630px;overflow:hidden}}
.og{{position:relative;isolation:isolate;overflow:hidden;box-sizing:border-box;width:1200px;height:630px;padding:64px 72px;display:grid;grid-template-columns:1.2fr 1fr;gap:40px;align-items:center;background:var(--ink-0)}}
.og h1{{font-size:78px;line-height:.98;letter-spacing:-0.04em;font-weight:720;font-stretch:116%}}
.og p{{margin-top:22px;font-size:22px;color:var(--fg-2)}} .og .band{{height:140%}}
.og .card3d{{width:430px}}</style></head><body>{diagrams.defs_svg()}<div class="og">
<div class="band"></div>
<div><h1>{H['h1_before']}<span class="story">{H['h1_em']}</span>{H['h1_after']}</h1><p>Kevin Park, Senior Product Marketing Manager</p></div>
<span class="card3d"><span class="card3d__face"><span class="card3d__top"><span class="card3d__brand">ZBD</span></span>
<span class="card3d__art">{diagrams.lines_svg()}</span><span class="card3d__line">{H['card_line']}</span><span class="card3d__bottom"><span class="card3d__kicker">{H["card_kicker"]}</span></span></span></span>
</div></body></html>""")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1200, "height": 630}, reduced_motion="reduce")
        await pg.goto("http://127.0.0.1:8765/_og/index.html", wait_until="networkidle"); await pg.evaluate("document.fonts.ready"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=str(OUT / "assets" / "og.png")); await b.close()
asyncio.run(main()); shutil.rmtree(tmp)
Path("assets-src").mkdir(exist_ok=True); shutil.copy(OUT / "assets" / "og.png", "assets-src/og.png"); print("og done")
