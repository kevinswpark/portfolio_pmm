"""Browser and content verification for the English dark-neon build (static site)."""
import asyncio
import re
import sys
from html import unescape
from pathlib import Path
from playwright.async_api import async_playwright

sys.path.insert(0, "src")
import content as C  # noqa: E402

BASE = "http://127.0.0.1:8765"
PAGES = ["/", "/work/money-layer/", "/work/money-lifecycle/"]
results = []


def check(name, ok, detail=""):
    results.append((name, bool(ok), detail))


def norm(s):
    s = unescape(re.sub(r"<[^>]+>", "", s))
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"').replace("–", "-")
    return re.sub(r"\s+", " ", s).strip()


# ---------- 1. copy is verbatim from its sources ----------
SRC = norm(Path(".impeccable/sources/notion-2026-09-27.txt").read_text() + " " + Path(".impeccable/sources/resume-excerpt-2026-09-27.txt").read_text()
           + " " + Path(".impeccable/sources/zbdpay-2026-09-27.json").read_text())
sourced = [C.HERO["sub"], C.HERO["h1_before"] + C.HERO["h1_em"] + C.HERO["h1_after"], C.HERO["cta_work"], C.HERO["cta_linkedin"],
           C.PHILOSOPHY["lead"], C.PHILOSOPHY["body"], C.PHILOSOPHY["context"], C.WORK["h2"].lower(),
           C.WORK["ml"]["title"], C.WORK["ml"]["problem"], C.WORK["ml"]["impact"], C.WORK["ml"]["result"],
           C.WORK["lc"]["desc"], C.ML["deck"], C.EXPERIENCE["profile"], C.LINKEDIN_DISPLAY]
sourced += [t for _, t in C.STRENGTHS["items"]] + C.LC["body"] + C.EXPERIENCE["education"] + C.EXPERIENCE["skills"]
for r in C.EXPERIENCE["roles"]:
    sourced += [r["title"], r["company"], r["place"], r["start"], r["end"]] + r["focus"] + [b for b, _ in r["bullets"]]
for k, v in C.ML["tldr"]:
    sourced.append(f"{k}: {v}")
for s in C.ML["sections"]:
    sourced.append(s["h2"])
    for kind, val in s["blocks"]:
        if kind in ("p", "quote"):
            sourced.append(val)
        if kind == "issues":
            sourced += [f"{k}: {v}" for k, v in val]
for _, v in C.ML["evidence"]:
    sourced.append(v)
for _, v in C.ML["proof_rows"]:
    sourced.append(v)
src_low = SRC.lower()
missing = [s for s in sourced if norm(s).lower() not in src_low]
check(f"{len(sourced)} sourced strings are verbatim in Notion, resume, or zbdpay.com", not missing, missing[:4])
ALL_HTML = "".join(p.read_text() for p in Path("dist").rglob("*.html"))
TEXT_HTML = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", ALL_HTML, flags=re.S)
PRIVATE = {"email address": r"[\w.+-]+@[\w-]+\.[a-z]{2,}", "phone number": r"\b\d{3}[-. ]\d{3}[-. ]\d{4}\b",
           "street address": r"\b\d{3,6} [A-Z][a-z]+ (Street|St|Avenue|Ave|Road|Rd)\b",
           "ZBD metric terms": r"\b(MQLs?|ARPDAU|ARR|D14|ROI|forecasted)\b"}
leaked = [k for k, pat in PRIVATE.items() if re.search(pat, TEXT_HTML)]
check("no ZBD pipeline or retention figures and no personal contact data", not leaked, leaked)
hangul = [str(p) for p in Path("dist").rglob("*") if p.is_file() and p.suffix in (".html", ".css", ".js") and re.search(r"[가-힣]", p.read_text())]
check("no Korean text anywhere in the build", not hangul, hangul)


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for w, h in ((1440, 900), (390, 844)):
            ctx = await b.new_context(viewport={"width": w, "height": h}, reduced_motion="reduce", color_scheme="dark")
            pg = await ctx.new_page()
            errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
            for path in PAGES:
                r = await pg.goto(BASE + path, wait_until="networkidle")
                info = await pg.evaluate("""() => ({
                  lang: document.documentElement.lang,
                  h1: document.querySelectorAll('h1').length,
                  first: document.querySelector('h1,h2,h3').tagName,
                  overflow: document.documentElement.scrollWidth > innerWidth,
                  linkedin: [...document.querySelectorAll('a[href*="linkedin"]')].map(a => [a.href, a.target, a.rel]),
                  footerLinkedIn: !!document.querySelector('footer a[href*="linkedin"]'),
                  noAlt: [...document.querySelectorAll('[role=img]:not([aria-label]), img:not([alt])')].length,
                  dash: /[—–]/.test(document.body.innerText),
                  dupIds: (() => { const s = {}; let d = 0; document.querySelectorAll('[id]').forEach(e => { if (s[e.id]) d++; s[e.id] = 1 }); return d })(),
                  navH: document.querySelector('.nav__inner').getBoundingClientRect().height,
                  ctaWrap: [...document.querySelectorAll('.btn')].filter(b => b.offsetParent).some(b => b.getBoundingClientRect().height > 58),
                  langSwitch: !!document.querySelector('.lang,[hreflang="ko"]'),
                  fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family),
                  lowContrast: (() => { const fg = getComputedStyle(document.body).color; return fg })(),
                })""")
                tag = f"{path} @{w}"
                check(f"200 {tag}", r.status == 200, r.status)
                check(f"lang=en {tag}", info["lang"] == "en")
                check(f"one h1 first {tag}", info["h1"] == 1 and info["first"] == "H1", [info["h1"], info["first"]])
                check(f"no x-overflow {tag}", not info["overflow"])
                check(f"linkedin links correct {tag}", info["linkedin"] and all(l[0] == C.LINKEDIN and l[1] == "_blank" and "noopener" in l[2] for l in info["linkedin"]), len(info["linkedin"]))
                check(f"footer linkedin {tag}", info["footerLinkedIn"])
                check(f"alt text {tag}", info["noAlt"] == 0, info["noAlt"])
                check(f"no em/en dash {tag}", not info["dash"])
                check(f"unique ids {tag}", info["dupIds"] == 0, info["dupIds"])
                check(f"nav one line {tag}", info["navH"] <= 64, info["navH"])
                check(f"CTA no wrap {tag}", not info["ctaWrap"])
                check(f"no language switch {tag}", not info["langSwitch"])
                check(f"Mona Sans loaded {tag}", "Mona Sans" in info["fonts"], info["fonts"])
            check(f"no JS errors @{w}", not errs, errs[:3])
            await ctx.close()

        # first viewport: primary action visible
        for w, h in ((1280, 720), (390, 844), (1440, 900)):
            ctx = await b.new_context(viewport={"width": w, "height": h}, reduced_motion="reduce")
            pg = await ctx.new_page()
            await pg.goto(BASE + "/", wait_until="networkidle")
            bottom = await pg.evaluate("document.querySelector('.hero .btn--blue').getBoundingClientRect().bottom")
            check(f"primary CTA above the fold @{w}x{h}", bottom <= h, round(bottom))
            await ctx.close()

        # 404 and removed Korean routes
        ctx = await b.new_context()
        pg = await ctx.new_page()
        for path in ("/nope/", "/ko/", "/en/"):
            r = await pg.goto(BASE + path)
            t = await pg.evaluate("document.querySelector('h1').innerText")
            check(f"{path} returns 404 page", r.status == 404 and t == C.NF["h1"], [r.status, t])
        await ctx.close()

        # keyboard, zoom, focus return
        ctx = await b.new_context(viewport={"width": 1440, "height": 900})
        pg = await ctx.new_page()
        await pg.goto(BASE + "/work/money-layer/", wait_until="networkidle")
        await pg.keyboard.press("Tab")
        check("first Tab reaches skip link", await pg.evaluate("document.activeElement.className") == "skip")
        await pg.keyboard.press("Tab")
        ring = await pg.evaluate("getComputedStyle(document.activeElement).outlineStyle")
        check("focus ring visible", ring == "solid", ring)
        btn = pg.locator(".zoom-btn").first
        await btn.scroll_into_view_if_needed()
        await btn.focus()
        await pg.keyboard.press("Enter")
        await pg.wait_for_timeout(300)
        check("zoom opens by keyboard", await pg.evaluate("document.getElementById('zoom').open"))
        await pg.screenshot(path=".impeccable/review/zoom-open.png")
        await pg.keyboard.press("Escape")
        await pg.wait_for_timeout(200)
        check("Escape closes, focus returns", await pg.evaluate("[document.getElementById('zoom').open, document.activeElement.classList.contains('zoom-btn')]") == [False, True])
        # Explore the work scrolls to #work
        await pg.goto(BASE + "/", wait_until="networkidle")
        await pg.click(".hero .btn--blue")
        await pg.wait_for_timeout(900)
        top = await pg.evaluate("document.getElementById('work').getBoundingClientRect().top")
        check("Explore the work lands on Selected work", -5 < top < 200, round(top))
        await ctx.close()

        # motion: ambient off under reduced motion, tilt responds to pointer
        ctx = await b.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
        pg = await ctx.new_page()
        await pg.goto(BASE + "/", wait_until="networkidle")
        anim = await pg.evaluate("getComputedStyle(document.querySelector('.band')).animationName")
        check("gradient band static under reduced motion", anim == "none", anim)
        await ctx.close()
        ctx = await b.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="no-preference")
        pg = await ctx.new_page()
        await pg.goto(BASE + "/", wait_until="networkidle")
        box = await pg.locator(".hero__card").bounding_box()
        await pg.mouse.move(box["x"] + box["width"] * 0.9, box["y"] + box["height"] * 0.2)
        await pg.mouse.move(box["x"] + box["width"] * 0.95, box["y"] + box["height"] * 0.15, steps=6)
        await pg.wait_for_timeout(500)
        ry = await pg.evaluate("parseFloat(document.querySelector('[data-tilt]').style.getPropertyValue('--ry'))")
        check("hero card tilts toward pointer", ry > 3, ry)
        await pg.screenshot(path=".impeccable/review/hero-tilt.png", clip={"x": 700, "y": 250, "width": 740, "height": 520})
        await ctx.close()
        await b.close()


asyncio.run(main())
fails = [r for r in results if not r[1]]
print(f"{len(results) - len(fails)}/{len(results)} checks passed")
for n, ok, d in fails:
    print("FAIL", n, d)
