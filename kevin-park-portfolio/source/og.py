"""Render the Open Graph card (1200x630) from the site's own CSS, type, header gradient, and hero card.

The card uses the light theme, the site's default. Needs the local server on port 8765 serving dist/site.
Renders with Playwright when it is installed, otherwise with headless Google Chrome."""
import shutil, subprocess, sys
from pathlib import Path
sys.path.insert(0, "src")
import diagrams, content as C
OUT = Path("dist/site"); tmp = OUT / "_og"; tmp.mkdir(exist_ok=True)
URL = "http://127.0.0.1:8765/_og/index.html"
PNG = OUT / "assets" / "og.png"
H = C.HERO
(tmp / "index.html").write_text(f"""<!doctype html><html lang="en" data-theme="light"><head><meta charset="utf-8">
<link rel="stylesheet" href="/assets/fonts/fonts.css"><link rel="stylesheet" href="/assets/site.css">
<style>html,body{{margin:0;width:1200px;height:630px;overflow:hidden;background:var(--ink-0)}}
.og{{position:relative;isolation:isolate;overflow:hidden;box-sizing:border-box;width:1200px;height:630px;padding:64px 72px;display:grid;grid-template-columns:1.25fr 1fr;gap:32px;align-items:center}}
.og h1{{font-size:76px;line-height:1.04;letter-spacing:-.03em;font-weight:500;font-stretch:106%;color:var(--fg);max-width:9.5em}}
.og p{{margin-top:28px;font-size:23px;line-height:1.4;font-weight:500;color:var(--fg-2)}}
.og__card{{perspective:1100px;justify-self:end;width:430px;margin-right:8px}}
.og .sg__canvas{{transition:none}}
/* the card has no bottom fade into a page, so the scrim only calms the text side */
.og .sg::after{{background:linear-gradient(90deg,var(--ink-0) 0%,rgb(var(--bg-rgb) / .9) 34%,rgb(var(--bg-rgb) / .35) 64%,rgb(var(--bg-rgb) / .05) 100%)}}</style></head>
<body>{diagrams.defs_svg()}<div class="og"><div class="sg" data-sg aria-hidden="true"></div>
<div><h1>{H['h1_before']}<span class="story">{H['h1_em']}</span>{H['h1_after']}</h1><p>Kevin Park · Senior Product Marketing Manager</p></div>
<div class="og__card"><span class="card3d"><span class="card3d__face"><span class="card3d__top"><span class="card3d__brand">{H['card_brand']}</span></span>
<span class="card3d__art"><span class="card3d__chip"></span>{diagrams.lines_svg()}</span><span class="card3d__line">{H['card_line']}</span><span class="card3d__bottom"><span class="card3d__kicker">{H["card_kicker"]}</span></span></span></span></div>
</div><script src="/assets/header-gradient.js"></script></body></html>""")


def with_playwright():
    import asyncio
    from playwright.async_api import async_playwright

    async def main():
        async with async_playwright() as p:
            b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1200, "height": 630})
            await pg.goto(URL, wait_until="networkidle"); await pg.evaluate("document.fonts.ready"); await pg.wait_for_timeout(600)
            await pg.screenshot(path=str(PNG)); await b.close()
    asyncio.run(main())


def with_chrome():
    chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    subprocess.run([chrome, "--headless=new", "--hide-scrollbars", "--force-device-scale-factor=1", "--enable-unsafe-swiftshader",
                    "--window-size=1200,630", "--virtual-time-budget=4000", f"--screenshot={PNG.resolve()}", URL],
                   check=True, capture_output=True, timeout=120)


try:
    try:
        with_playwright()
    except ImportError:
        with_chrome()
finally:
    shutil.rmtree(tmp)
Path("assets-src").mkdir(exist_ok=True); shutil.copy(PNG, "assets-src/og.png"); print("og done")
