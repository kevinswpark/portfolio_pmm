import asyncio, sys
from playwright.async_api import async_playwright
B = "http://127.0.0.1:8765"
S = [("desktop", "/", 1440, 900), ("user-1280", "/", 1280, 720), ("mobile", "/", 390, 844),
     ("desktop-article", "/work/money-layer/", 1440, 900), ("mobile-article", "/work/money-layer/", 390, 844),
     ("desktop-lifecycle", "/work/money-lifecycle/", 1440, 900), ("mobile-lifecycle", "/work/money-lifecycle/", 390, 844), ("desktop-wirebarley", "/work/wirebarley/", 1440, 900), ("mobile-wirebarley", "/work/wirebarley/", 390, 844), ("desktop-404", "/nope/", 1440, 900)]
async def main(names):
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for n, path, w, h in S:
            if names and n not in names: continue
            c = await b.new_context(viewport={"width": w, "height": h}, color_scheme="dark", reduced_motion="reduce")
            pg = await c.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(B + path, wait_until="networkidle"); await pg.evaluate("document.fonts.ready"); await pg.wait_for_timeout(300)
            await pg.screenshot(path=f".impeccable/review/{n}.png", full_page=(n != "user-1280"))
            ov = await pg.evaluate("document.documentElement.scrollWidth > innerWidth")
            print(n, "overflow:", ov, "errors:", errs)
            await c.close()
        await b.close()
asyncio.run(main(sys.argv[1:]))
