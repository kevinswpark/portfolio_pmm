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
PAGES = ["/", "/work/money-layer/", "/work/money-lifecycle/", "/work/wirebarley/", "/tools/financial-planner/"]
results = []


def check(name, ok, detail=""):
    results.append((name, bool(ok), detail))


def norm(s):
    s = unescape(re.sub(r"<[^>]+>", "", s))
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"').replace("–", "-")
    return re.sub(r"\s+", " ", s).strip()


# ---------- 1. copy is verbatim from its sources ----------
SOURCES = ["notion-2026-09-27.txt", "notion-lifecycle-2026-09-27.txt", "resume-excerpt-2026-09-27.txt",
           "zbdpay-2026-09-27.json", "zbdpay-lifecycle-2026-09-27.json", "wirebarley-case-study-2026-10-05.md",
           "copy-audit-2026-10-05.md", "kevin-chat-2026-10-05.txt", "kevin-chat-2026-10-11.txt", "kevin-chat-2026-11-05.txt"]
SRC = norm(" ".join(Path(".impeccable/sources", f).read_text() for f in SOURCES))
AB = C.ABOUT
sourced = [C.HERO["role"], C.HERO["sub"], C.HERO["h1_before"] + C.HERO["h1_em"] + C.HERO["h1_after"], C.HERO["cta_work"], C.HERO["cta_linkedin"],
           C.PHILOSOPHY["lead"], C.PHILOSOPHY["body"], C.WORK["h2"].lower(), C.UI["about"], C.CLOSING["h2"],
           C.WORK["ml"]["title"], C.WORK["ml"]["problem"], C.WORK["ml"]["impact"], C.WORK["ml"]["result"],
           C.WORK["lc"]["desc"], C.ML["deck"], C.EXPERIENCE["profile"], C.LINKEDIN_DISPLAY]
sourced += [AB["h2"], " ".join(AB["lead"]), AB["beyond_h"], AB["expect_h"]] + AB["intro"] + AB["beyond"] + [" ".join(line) for line in AB["expect"]]
sourced += C.EXPERIENCE["education"] + C.EXPERIENCE["skills"]
sourced += [C.META["home_desc"], C.META["ml_desc"], C.META["lc_desc"], C.WORK["lc"]["desc"], C.WORK["lc"]["impact"]]
sourced += [C.WORK["lc"]["title"], C.WORK["lc"]["impact"], C.LC["h1"], C.LC["deck"], C.LC["follows"]] + C.WORK["lc"]["result"]
sourced += C.LC["naming"]["tried"] + C.LC["naming"]["final"] + C.DIAGRAM["step"]
for r in C.EXPERIENCE["roles"]:
    sourced += [r["title"], r["company"], r["place"], r["start"], r["end"]] + r["focus"] + [b for b, _ in r["bullets"]]
W = C.WORK["wb"]
sourced += [W["title"], W["problem"], W["result"], W["impact"], C.WB["h1"], C.WB["deck"], C.UI["watch"]] + [v for _, v in C.WB["facts"]]
for t, d in C.WB["steps"]:
    sourced += [t, d]
for A in (C.ML, C.LC, C.WB):
    for k, v in A["tldr"]:
        sourced.append(f"{k}: {v}")
    for s in A["sections"]:
        sourced.append(s["h2"])
        for kind, val in s["blocks"]:
            if kind in ("p", "quote"):
                sourced.append(val.replace("{ML_LINK}", "“The Money Layer for Games”"))
            if kind == "issues":
                sourced += [f"{k}: {v}" for k, v in val]
            if kind == "results":
                sourced += [f"{k}: {v}" for k, v, _ in val]
for _, v in C.ML["proof_rows"]:
    sourced.append(v)
for _, _, v in C.LC["proof_rows"]:
    sourced.append(v)
src_low = SRC.lower()
LC_SRC = norm(Path(".impeccable/sources/notion-lifecycle-2026-09-27.txt").read_text()).lower()


def undo_edits(text):
    t = norm(text)
    for e in C.EDITS:
        t = t.replace(norm(e["to"]), norm(e["from"]))
    return t.lower()


missing = [s for s in sourced if norm(s).lower() not in src_low and undo_edits(s) not in src_low]
edited = [s for s in sourced if norm(s).lower() not in src_low and undo_edits(s) in src_low]
check(f"{len(sourced)} sourced strings are verbatim in Notion, resume, or zbdpay.com ({len(edited)} carry a logged edit)", not missing, missing[:4])
bad_from = [e["from"] for e in C.EDITS if norm(e["from"]).lower() not in src_low]
check(f"all {len(C.EDITS)} logged edits trace to a saved source", not bad_from, bad_from[:3])
all_copy = norm(" ".join(sourced)).lower()
unused = [e["to"] for e in C.EDITS if norm(e["to"]).lower() not in all_copy]
check("every logged edit is live in the copy", not unused, unused[:3])
ALL_HTML = "".join(p.read_text() for p in Path("dist").rglob("*.html"))
TEXT_HTML = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", ALL_HTML, flags=re.S)
PRIVATE = {"email address": r"[\w.+-]+@[\w-]+\.[a-z]{2,}", "phone number": r"\b\d{3}[-. ]\d{3}[-. ]\d{4}\b",
           "street address": r"\b\d{3,6} [A-Z][a-z]+ (Street|St|Avenue|Ave|Road|Rd)\b",
           "ZBD metric terms": r"\b(MQLs?|ARPDAU|ARR|D14|ROI|forecasted)\b"}
leaked = [k for k, pat in PRIVATE.items() if re.search(pat, TEXT_HTML)]
check("no ZBD pipeline or retention figures and no personal contact data", not leaked, leaked)
hangul = [str(p) for p in Path("dist").rglob("*") if p.is_file() and p.suffix in (".html", ".css", ".js") and re.search(r"[가-힣]", p.read_text())]
check("no Korean text anywhere in the build", not hangul, hangul)
meta_sync = [C.META["ml_desc"] == C.ML["deck"], C.META["lc_desc"] == C.LC["deck"] == C.WORK["lc"]["desc"], C.META["wb_desc"] == C.WB["deck"]]
check("meta descriptions match article decks and shared cards", all(meta_sync), meta_sync)
stale = [x for x in ("Checked ", "Set in type", "Specialization", "Concentration", " percent", "-plus", "YoY", "seniors", "Overall conversion", "credibility", "Proven track record", "My recurring strengths", "The later organizing model", "External proof",
                     "How I work", "bento", "closing__url", "Product marketing connects what a company builds", "then bring them into websites, sales decks") if x in TEXT_HTML]
check("no retired copy, no spelled-out percent or -plus, one audience term", not stale, stale)
home_html = Path("dist/site/index.html").read_text()
order = [home_html.find(s) for s in ('id="work"', 'id="about"', 'id="experience"', 'class="closing')]
check("homepage order: Selected work, About, Experience, closing", -1 not in order and order == sorted(order), order)
about_html = home_html.split('id="about"')[1].split('id="experience"')[0]
banned = [x for x in ("—", "unlock", "bring ideas to life") if x in about_html]
if not AB["portrait"]:
    banned += [x for x in ("<img", "about__portrait", "<figure") if x in about_html]
check("About has no em dash or stock phrases, and no image or empty frame while no portrait is set", not banned, banned)
ml_html = Path("dist/site/work/money-layer/index.html").read_text()
line_sec = ml_html.split('id="line"')[1].split('id="learned"')[0]
series = "The work also supported ZBD’s Series C fundraising, which closed in January 2026."
check("Series C paragraph sits in The line and the framework, after the framework paragraph",
      series in line_sec and line_sec.find("messaging framework around it.") < line_sec.find(series) < line_sec.find("fig__panel--proof"))
zbd = next(r for r in C.EXPERIENCE["roles"] if r["company"] == "ZBD")
check("ZBD keeps the website bullet and adds the demos bullet, no figures", len(zbd["bullets"]) == 3 and "website copy rewrite" in zbd["bullets"][1][0]
      and zbd["bullets"][2][0].startswith("Created interactive demos") and not any(f for _, f in zbd["bullets"]))
for page in ("money-layer", "money-lifecycle"):
    html = Path(f"dist/site/work/{page}/index.html").read_text()
    host = re.search(r'<a class="proof__host" href="https://zbdpay.com/"', html)
    cta = re.search(r'<span class="pill">Final work</span><a class="fig__cta" href="https://zbdpay.com/" target="_blank"', html)
    check(f"{page}: zbdpay.com pill is a link and Final work ends with a zbdpay.com CTA", host and cta, [bool(host), bool(cta)])


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for w, h in ((1440, 900), (768, 1024), (390, 844)):
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
                  navFit: (() => {
                    const n = document.querySelector('.nav__inner'), nr = n.getBoundingClientRect();
                    const items = [...n.querySelectorAll('.nav__brand, .nav__links > a, .tools__btn, .nav__inner > .btn')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect());
                    const inside = items.every(r => r.left >= nr.left && r.right <= nr.right);
                    const apart = items.every((r, i) => i === 0 || r.left >= items[i - 1].right);
                    return n.scrollWidth <= n.clientWidth && inside && apart;
                  })(),
                  aboutLink: (document.querySelector('.nav__links a[data-nav="about"]') || {}).getAttribute?.('href'),
                  closing: (document.querySelector('.closing h2') || {}).textContent,
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
                check(f"nav items fit without overlap {tag}", info["navFit"])
                check(f"nav About links to the homepage section {tag}", info["aboutLink"] == "/#about", info["aboutLink"])
                check(f"closing headline is Let's talk. {tag}", info["closing"] == C.CLOSING["h2"], info["closing"])
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

        # About: the nav link lands below the sticky nav from every page; readable measure; no cards; portrait sizing
        ABOUT_JS = """() => {
          const lines = p => { const t = p.firstChild, r = document.createRange(), out = []; let top = null, line = '';
            for (const m of t.textContent.matchAll(/\\S+/g)) { r.setStart(t, m.index); r.setEnd(t, m.index + m[0].length);
              const y = Math.round(r.getClientRects()[0].top);
              if (top === null || Math.abs(y - top) > 4) { if (line) out.push(line); line = m[0]; top = y } else line += ' ' + m[0] }
            out.push(line); return out };
          const full = [...document.querySelectorAll('.about__prose p')].flatMap(p => lines(p).slice(0, -1)).map(l => l.length);
          const li = [...document.querySelectorAll('.expect li')];
          const slow = document.querySelector('.expect__phrase--slow'), fast = document.querySelector('.expect__phrase--fast');
          const sub = document.querySelector('.hero__sub'), lh = parseFloat(getComputedStyle(sub).lineHeight);
          return {
            avg: Math.round(full.reduce((a, b) => a + b, 0) / full.length), proseFont: parseFloat(getComputedStyle(document.querySelector('.about__prose')).fontSize),
            lead: parseFloat(getComputedStyle(document.querySelector('.about__lead')).fontSize), hero: parseFloat(getComputedStyle(document.querySelector('.hero h1')).fontSize),
            lines: li.length, cards: li.filter(e => getComputedStyle(e).backgroundColor !== 'rgba(0, 0, 0, 0)' || getComputedStyle(e).borderTopWidth !== '0px').length,
            slow: slow && [slow.textContent, getComputedStyle(slow).fontStretch], fast: fast && [fast.textContent, getComputedStyle(fast).fontStretch, getComputedStyle(fast).fontStyle],
            imgs: [...document.querySelectorAll('.about img')].map(i => { const b = i.getBoundingClientRect(); return [!!i.getAttribute('width'), !!i.getAttribute('height'), i.alt.length > 10, Math.abs(b.width / b.height - i.naturalWidth / i.naturalHeight) < 0.02] }),
            anim: [...document.querySelectorAll('.about, .about *')].filter(e => getComputedStyle(e).animationName !== 'none').length,
            h3: [...document.querySelectorAll('.about h3')].map(h => h.textContent),
            subFont: parseFloat(getComputedStyle(sub).fontSize), leadFont: parseFloat(getComputedStyle(document.querySelector('.statement__body')).fontSize),
            subLines: Math.round(sub.getBoundingClientRect().height / lh),
            rows: li.map(e => new Set([...e.querySelectorAll('.expect__phrase')].map(s => Math.round(s.getBoundingClientRect().top))).size),
          } }"""
        for w, h in ((1440, 900), (768, 1024), (390, 844)):
            ctx = await b.new_context(viewport={"width": w, "height": h}, reduced_motion="reduce")
            pg = await ctx.new_page()
            for path in PAGES:
                await pg.goto(BASE + path, wait_until="networkidle")
                await pg.click('.nav__links a[data-nav="about"]')
                await pg.wait_for_url("**/#about")
                await pg.wait_for_load_state("networkidle")
                await pg.wait_for_timeout(300)
                pos = await pg.evaluate("""() => ({ url: location.pathname + location.hash,
                  nav: document.querySelector('.nav__inner').getBoundingClientRect().bottom,
                  top: document.getElementById('about-h').getBoundingClientRect().top })""")
                check(f"About from {path} lands below the sticky nav @{w}", pos["url"] == "/#about" and pos["nav"] < pos["top"] < pos["nav"] + 120, pos)
            m = await pg.evaluate(ABOUT_JS)
            if w == 1440:
                check("About prose holds a 60 to 70 character measure @1440", 60 <= m["avg"] <= 70, m["avg"])
            check(f"About prose stays at reading size @{w}", m["proseFont"] >= 17, m["proseFont"])
            check(f"About opening is smaller than the hero headline @{w}", m["lead"] < m["hero"] * 0.7, [m["lead"], m["hero"]])
            check(f"About subsections and three typographic lines, no cards @{w}", m["h3"] == [AB["beyond_h"], AB["expect_h"]] and m["lines"] == 3 and m["cards"] == 0, m)
            check(f"Long thought processes and Fastest execution set in contrasting widths @{w}",
                  m["slow"] and m["fast"] and m["slow"][0] == "Long thought processes." and m["fast"][0] == "Fastest execution." and m["slow"][1] != m["fast"][1] and m["fast"][2] == "italic", [m["slow"], m["fast"]])
            if w >= 768:
                check(f"each What you can expect line sits on one line @{w}", m["rows"] == [1, 1, 1], m["rows"])
            check(f"About portrait images keep their proportions and carry size and alt @{w}", all(all(x) for x in m["imgs"]), m["imgs"])
            check(f"nothing in About animates under reduced motion @{w}", m["anim"] == 0, m["anim"])
            check(f"hero supporting line keeps lead size and wraps in {7 if w < 600 else 5} lines or fewer @{w}", m["subFont"] == m["leadFont"] and m["subLines"] <= (7 if w < 600 else 5), [m["subFont"], m["leadFont"], m["subLines"]])
            await ctx.close()

        # reduced motion: statement renders lit; keyboard focus on the About nav link is visible
        ctx = await b.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
        pg = await ctx.new_page()
        await pg.goto(BASE + "/", wait_until="networkidle")
        lit = await pg.evaluate("[getComputedStyle(document.querySelector('.reveal span')).color, getComputedStyle(document.body).color, getComputedStyle(document.querySelector('.reveal span')).animationName]")
        check("intro statement fully lit and static under reduced motion", lit[0] == lit[1] and lit[2] == "none", lit)
        for _ in range(4):
            await pg.keyboard.press("Tab")
        foc = await pg.evaluate("[document.activeElement.textContent, getComputedStyle(document.activeElement).outlineStyle, getComputedStyle(document.activeElement).outlineWidth]")
        check("Tab reaches the About nav link with a visible focus ring", foc[0] == C.UI["about"] and foc[1] == "solid" and foc[2] == "2px", foc)
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

        # Money Lifecycle is a finished case study
        ctx = await b.new_context(viewport={"width": 1440, "height": 900})
        pg = await ctx.new_page()
        await pg.goto(BASE + "/work/money-lifecycle/", wait_until="networkidle")
        lc = await pg.evaluate("""() => ({
          rail: document.querySelectorAll('.rail a[data-target]').length,
          status: !!document.querySelector('.status'),
          back: !!document.querySelector('.facts a[href="/work/money-layer/"]'),
          proof: [...document.querySelectorAll('.proof--links a')].map(a => a.href),
          prev: !!document.querySelector('.next .tile--wb'),
        })""")
        check("Lifecycle page has 5 sections, no in-progress label, links back to Money Layer", lc["rail"] == 5 and not lc["status"] and lc["back"] and lc["prev"], lc)
        check("Lifecycle proof links point at zbdpay.com", len(lc["proof"]) == 3 and all(u.startswith("https://zbdpay.com/") for u in lc["proof"]), lc["proof"])
        await pg.goto(BASE + "/work/wirebarley/", wait_until="networkidle")
        wb = await pg.evaluate("""() => ({
          rail: document.querySelectorAll('.rail a[data-target]').length,
          steps: document.querySelectorAll('.board__step').length,
          arrows: document.querySelectorAll('.board__arrow').length,
          iframe: (document.querySelector('.fig__panel--video iframe') || {}).src || '',
          watch: [...document.querySelectorAll('a.fig__cta')].map(a => a.href),
          img: (() => { const i = document.querySelector('.fig__panel--photo img'); return i ? [i.alt.length > 20, i.getAttribute('src')] : null })(),
          lit: [...document.querySelectorAll('.results__item--lead mark.fig')].map(m => m.textContent),
          next: !!document.querySelector('.next .tile--ml'),
          stepRow: (() => { const r = [...document.querySelectorAll('.board__step')].map(e => Math.round(e.getBoundingClientRect().top)); return new Set(r).size })(),
        })""")
        check("WireBarley page: 5 sections, 4 storyboard cards with 3 arrows in one row on desktop", wb["rail"] == 5 and wb["steps"] == 4 and wb["arrows"] == 3 and wb["stepRow"] == 1, wb)
        check("WireBarley video embeds the commercial and keeps the YouTube link", "youtube-nocookie.com/embed/KDBksoj_wu8" in wb["iframe"] and "https://www.youtube.com/watch?v=KDBksoj_wu8" in wb["watch"], [wb["iframe"], wb["watch"]])
        check("WireBarley SBS image has alt text, figures lit, next tile is Money Layer", wb["img"] and wb["img"][0] and wb["lit"] == ["About 20%", "nearly 50%"] and wb["next"], wb)
        await ctx.close()
        ctx = await b.new_context(viewport={"width": 390, "height": 844})
        pg = await ctx.new_page()
        await pg.goto(BASE + "/work/wirebarley/", wait_until="networkidle")
        col = await pg.evaluate("new Set([...document.querySelectorAll('.board__step')].map(e => Math.round(e.getBoundingClientRect().left))).size")
        check("WireBarley storyboard stacks top to bottom on mobile", col == 1, col)
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
