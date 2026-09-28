#!/usr/bin/env python3
"""Build Kevin Park's portfolio (English, dark neon edition) into two outputs.

dist/site/      deployable static site (deploy at a domain root)
dist/artifact/  single-file page for the claude.ai Artifact preview (hash routes)

Set KP_SITE_URL=https://your-domain before building to emit absolute
canonical, Open Graph, and sitemap URLs.
"""

import base64
import json
import os
import re
import shutil
import sys
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / "src"))

import content as C  # noqa: E402
import diagrams  # noqa: E402

SITE_URL = os.environ.get("KP_SITE_URL", "").rstrip("/")
DIST = ROOT / "dist"
VENDOR = ROOT / "vendor"
ICON_DIR = VENDOR / "package" / "assets" / "regular"
FONT_DIR = next(p for p in VENDOR.glob("fontsource-variable-mona-sans-*") if p.is_dir()) / "package" / "files"

LATIN = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
LATIN_EXT = "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF"

PAGES = ("home", "ml", "lc", "nf")
VIEW = {"home": "home", "ml": "money-layer", "lc": "money-lifecycle", "nf": "404"}
PATH = {"home": "/", "ml": "/work/money-layer/", "lc": "/work/money-lifecycle/", "nf": "/404.html"}
TITLE = {"home": C.META["home_title"], "ml": C.META["ml_title"], "lc": C.META["lc_title"], "nf": C.META["nf_title"]}
DESC = {"home": C.META["home_desc"], "ml": C.META["ml_desc"], "lc": C.META["lc_desc"], "nf": C.META["home_desc"]}
U = C.UI


# ---------------------------------------------------------------------------
# icons (Phosphor, regular)
# ---------------------------------------------------------------------------
def _icon_path(name):
    svg = (ICON_DIR / f"{name}.svg").read_text()
    return re.search(r'<path d="([^"]+)"', svg).group(1)


ICON_NAMES = ["arrow-down", "arrow-right", "arrow-left", "arrow-up-right", "linkedin-logo",
              "magnifying-glass-plus", "x"] + [i for i, _ in C.STRENGTHS["items"]]
ICONS = {n: _icon_path(n) for n in ICON_NAMES}


def icon(name, cls=""):
    return (
        f'<svg class="icon {cls}" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false">'
        f'<path d="{ICONS[name]}"/></svg>'
    )


# ---------------------------------------------------------------------------
# routing
# ---------------------------------------------------------------------------
class Ctx:
    def __init__(self, mode, page):
        self.mode, self.page = mode, page

    def url(self, page=None, section=None):
        page = page or self.page
        if self.mode == "spa":
            v = VIEW[page]
            return f"#{v}.{section}" if section else f"#{v}"
        return PATH[page] + (f"#{section}" if section else "")

    def id(self, x):
        return f"{VIEW[self.page]}--{x}" if self.mode == "spa" else x


def abs_url(p):
    return (SITE_URL + p) if SITE_URL else p


def mark_figures(text, figs):
    """Wrap resume figures in <mark> without changing a word."""
    out = escape(text, quote=False)
    for f in sorted(set(figs), key=len, reverse=True):
        out = out.replace(escape(f, quote=False), f'<mark class="fig">{escape(f, quote=False)}</mark>')
    return out


# ---------------------------------------------------------------------------
# shared pieces
# ---------------------------------------------------------------------------
def linkedin_btn(variant, label=None, compact=False):
    label = label or C.HERO["cta_linkedin"]
    cls = f"btn btn--{variant}" + (" btn--compact" if compact else "")
    new_tab = U["new_tab"]
    return (
        f'<a class="{cls}" href="{C.LINKEDIN}" target="_blank" rel="noopener noreferrer">'
        + icon("linkedin-logo", "icon--brand")
        + f'<span class="btn__text">{label}</span>'
        + icon("arrow-up-right", "icon--out")
        + f'<span class="sr-only"> {new_tab}</span></a>'
    )


def mark_logo():
    return (
        '<span class="logo" aria-hidden="true"><svg viewBox="0 0 64 64">'
        '<rect width="64" height="64" rx="16" fill="url(#kp-grad-v)"/>'
        '<path d="M12 22C26 22 30 32 38 32M12 42C26 42 30 32 38 32" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3.5"/>'
        '<path d="M38 32H52" stroke="#fff" stroke-width="5.5" stroke-linecap="round"/></svg></span>'
    )


def nav(ctx):
    skip = ctx.url(section="main") if ctx.mode == "spa" else "#" + ctx.id("main")
    return (
        f'<a class="skip" href="{skip}">{U["skip"]}</a>'
        '<header class="nav"><nav class="nav__inner" aria-label="Main">'
        f'<a class="nav__brand" href="{ctx.url("home")}">{mark_logo()}<span>{U["name"]}</span></a>'
        '<div class="nav__links">'
        f'<a href="{ctx.url("home", "work")}">{U["work"]}</a>'
        f'<a href="{ctx.url("home", "experience")}" data-nav="experience">{U["experience"]}</a>'
        "</div>"
        f"{linkedin_btn('blue', compact=True)}"
        "</nav></header>"
    )


def footer(ctx):
    return (
        '<footer class="foot wrap"><div class="foot__row">'
        f'{mark_logo()}<span>{U["footer"]}</span>'
        f'<a href="{C.LINKEDIN}" target="_blank" rel="noopener noreferrer">{C.LINKEDIN_DISPLAY}<span class="sr-only"> {U["new_tab"]}</span></a>'
        "</div></footer>"
    )


def closing(ctx):
    hid = ctx.id("closing")
    return (
        f'<section class="closing wrap" aria-labelledby="{hid}"><div class="closing__card">'
        '<span class="closing__glow" aria-hidden="true"></span>'
        f'<h2 class="closing__url" id="{hid}">{C.LINKEDIN_DISPLAY.replace("/", "/<wbr>")}</h2>'
        f"{linkedin_btn('white', C.CLOSING['cta'])}"
        "</div></section>"
    )


def tile_ml(ctx, compact=False):
    W = C.WORK["ml"]
    hid = ctx.id("tile-ml")
    return (
        f'<article class="tile tile--ml{" tile--compact" if compact else ""}" aria-labelledby="{hid}">'
        '<div class="tile__text">'
        f'<h3 id="{hid}"><a href="{ctx.url("ml")}">{W["title"]}</a></h3>'
        f'<p class="tile__desc">{W["problem"]}</p>'
        f'<p class="result"><span class="result__chip">{W["result"]}</span></p>'
        f'<p class="tile__impact">{W["impact"]}</p>'
        f'<span class="tile__go" aria-hidden="true">{U["read"]}{icon("arrow-right")}</span>'
        "</div>"
        f'<div class="tile__art panel">{diagrams.money_layer_pair(C.DIAGRAM)}</div>'
        "</article>"
    )


def tile_lc(ctx, compact=False):
    W = C.WORK["lc"]
    hid = ctx.id("tile-lc")
    return (
        f'<article class="tile tile--lc{" tile--compact" if compact else ""}" aria-labelledby="{hid}">'
        '<div class="tile__text">'
        f'<h3 id="{hid}"><a href="{ctx.url("lc")}">{W["title"]}</a></h3>'
        f'<p class="tile__desc">{W["desc"]}</p>'
        f'<p class="status">{U["in_progress"]}</p>'
        f'<span class="tile__go" aria-hidden="true">{icon("arrow-right")}</span>'
        "</div>"
        f'<div class="tile__art">{diagrams.lifecycle_svg(C.DIAGRAM["lc_alt"])}</div>'
        "</article>"
    )


# ---------------------------------------------------------------------------
# pages
# ---------------------------------------------------------------------------
def words(text):
    return " ".join(f"<span>{escape(w, quote=False)}</span>" for w in text.split(" "))


def home_main(ctx):
    H, P = C.HERO, C.PHILOSOPHY
    h1 = ctx.id("hero-h")
    hero = (
        f'<section class="hero" aria-labelledby="{h1}">'
        '<div class="band" aria-hidden="true"></div>'
        '<div class="wrap hero__grid">'
        '<div class="hero__text">'
        f'<h1 id="{h1}" tabindex="-1">{H["h1_before"]}<span class="story">{H["h1_em"]}</span>{H["h1_after"]}</h1>'
        '<div class="hero__lower">'
        f'<p class="hero__sub">{H["sub"]}</p>'
        '<div class="actions">'
        f'<a class="btn btn--blue" href="{ctx.url("home", "work")}"><span class="btn__text">{H["cta_work"]}</span>{icon("arrow-down", "icon--down")}</a>'
        f"{linkedin_btn('ghost')}"
        "</div></div></div>"
        f'<a class="hero__card" href="{ctx.url("ml")}" aria-label="{escape(U["read"])}: {escape(C.WORK["ml"]["title"])}">'
        '<span class="card3d" data-tilt><span class="card3d__face">'
        f'<span class="card3d__top"><span class="card3d__brand">{H["card_brand"]}</span>{icon("arrow-up-right", "card3d__go")}</span>'
        f'<span class="card3d__art">{diagrams.lines_svg()}</span>'
        f'<span class="card3d__line">{H["card_line"]}</span>'
        f'<span class="card3d__bottom"><span class="card3d__kicker">{H["card_kicker"]}</span></span>'
        '<span class="card3d__sheen"></span>'
        "</span></span></a>"
        "</div></section>"
    )
    statement = (
        f'<section class="statement wrap" aria-label="{escape(U["name"])}">'
        f'<p class="statement__lead reveal">{words(P["lead"])}</p>'
        f'<div class="statement__body"><p>{P["body"]}</p><p>{P["context"]}</p></div>'
        "</section>"
    )
    wh = ctx.id("work-h")
    work = (
        f'<section class="work wrap" id="{ctx.id("work")}" aria-labelledby="{wh}">'
        f'<h2 class="h2" id="{wh}">{C.WORK["h2"]}</h2>'
        f'<div class="work__grid">{tile_ml(ctx)}{tile_lc(ctx)}</div>'
        "</section>"
    )
    E = C.EXPERIENCE
    roles = []
    for r in E["roles"]:
        roles.append(
            '<li class="role">'
            f'<p class="role__when"><time>{r["start"]}</time><span class="sr-only"> {U["to"]} </span>{icon("arrow-right", "role__arrow")}<time>{r["end"]}</time></p>'
            '<div class="role__main">'
            f'<h3 class="role__title">{r["title"]}<span class="role__at">{r["company"]}</span></h3>'
            f'<p class="role__place">{r["place"]}</p>'
            '<ul class="tags">' + "".join(f"<li>{t}</li>" for t in r["focus"]) + "</ul>"
            '<ul class="role__bullets">' + "".join(f"<li>{mark_figures(b, figs)}</li>" for b, figs in r["bullets"]) + "</ul>"
            "</div></li>"
        )
    eh = ctx.id("exp-h")
    experience = (
        f'<section class="exp wrap" id="{ctx.id("experience")}" aria-labelledby="{eh}">'
        f'<h2 class="h2" id="{eh}">{E["h2"]}</h2>'
        f'<p class="exp__profile">{E["profile"]}</p>'
        f'<ol class="roles">{"".join(roles)}</ol>'
        '<div class="exp__extra">'
        f'<div class="card"><h3 class="card__h">{U["education"]}</h3>' + "".join(f"<p>{x}</p>" for x in E["education"]) + "</div>"
        f'<div class="card card--wide"><h3 class="card__h">{U["skills"]}</h3><ul class="chips">' + "".join(f"<li>{s}</li>" for s in E["skills"]) + "</ul></div>"
        "</div></section>"
    )
    sh = ctx.id("strengths-h")
    cells = "".join(
        f'<li class="bento__cell bento__cell--{i + 1}"><p>{t}</p></li>'
        for i, (ic, t) in enumerate(C.STRENGTHS["items"])
    )
    strengths = (
        f'<section class="strengths wrap" aria-labelledby="{sh}">'
        f'<h2 class="h2" id="{sh}">{C.STRENGTHS["h2"]}</h2>'
        f'<ul class="bento">{cells}</ul></section>'
    )
    return f'<main id="{ctx.id("main")}" tabindex="-1">{hero}{statement}{work}{experience}{strengths}{closing(ctx)}</main>'


def zoom_btn():
    return (
        f'<button class="zoom-btn" type="button" data-zoom aria-label="{escape(U["enlarge"])}">'
        f'{icon("magnifying-glass-plus")}</button>'
    )


def figure(kind):
    M = C.ML
    if kind == "pair":
        return (
            f'<figure class="fig" data-title="{escape(U["concept"])}">'
            f'<div class="panel fig__panel">{diagrams.money_layer_pair(C.DIAGRAM)}{zoom_btn()}</div>'
            f'<figcaption><span class="pill">{U["concept"]}</span>{U["drawn"]}</figcaption></figure>'
        )
    if kind == "line":
        return (
            '<figure class="fig">'
            f'<div class="fig__panel fig__panel--grad"><p class="specimen">{C.WORK["ml"]["result"]}</p></div>'
            f'<figcaption><span class="pill">{U["final"]}</span>{U["set"]}</figcaption></figure>'
        )
    rows = "".join(f"<div><dt>{k}</dt><dd>{v}</dd></div>" for k, v in M["proof_rows"])
    return (
        '<figure class="fig">'
        '<div class="panel fig__panel fig__panel--proof">'
        f'<a class="proof__host" href="https://zbdpay.com" target="_blank" rel="noopener noreferrer"><span class="proof__dot"></span>zbdpay.com{icon("arrow-up-right")}<span class="sr-only"> {U["new_tab"]}</span></a>'
        f'<dl class="proof">{rows}</dl></div>'
        f'<figcaption><span class="pill">{U["proof"]}</span>{C.WORK["ml"]["impact"]} {M["proof_checked"]}.</figcaption></figure>'
    )


def ml_main(ctx):
    M = C.ML
    rail = (
        f'<aside class="rail" aria-label="{escape(U["on_this_page"])}"><div class="rail__inner">'
        f'<p class="rail__h">{U["on_this_page"]}</p><ol>'
        + "".join(f'<li><a href="{ctx.url("ml", s["id"])}" data-target="{ctx.id(s["id"])}">{s["h2"]}</a></li>' for s in M["sections"])
        + "</ol></div></aside>"
    )
    th = ctx.id("tldr-h")
    flow = [
        f'<section class="tldr" aria-labelledby="{th}"><h2 id="{th}">{M["tldr_h"]}</h2><dl>'
        + "".join(f"<div><dt>{k}</dt><dd>{v}</dd></div>" for k, v in M["tldr"])
        + "</dl></section>"
    ]
    for s in M["sections"]:
        flow.append(f'<h2 id="{ctx.id(s["id"])}">{s["h2"]}</h2>')
        for kind, val in s["blocks"]:
            if kind == "p":
                flow.append(f'<p class="prose">{val}</p>')
            elif kind == "issues":
                flow.append('<ul class="issues">' + "".join(
                    f'<li><span class="issues__k">{k}:</span> {v}</li>' for k, v in val) + "</ul>")
            elif kind == "fig":
                flow.append(figure(val))
            elif kind == "quote":
                flow.append(f'<p class="pull">{val}</p>')
    facts = "".join(
        f'<li><span class="facts__k">{k}</span><span class="facts__v">{v}</span></li>'
        for k, v in M["facts"]
    )
    nh = ctx.id("next-h")
    return (
        f'<main id="{ctx.id("main")}" tabindex="-1"><div class="progress" aria-hidden="true"></div>'
        '<header class="art-head"><div class="band band--article" aria-hidden="true"></div><div class="wrap art-head__in">'
        f'<a class="crumb" href="{ctx.url("home", "work")}">{icon("arrow-left")}{U["all_work"]}</a>'
        f'<h1 id="{ctx.id("title")}" tabindex="-1">{M["h1"]}</h1>'
        f'<p class="deck">{M["deck"]}</p><ul class="facts">{facts}</ul></div></header>'
        f'<div class="art wrap">{rail}<div class="flow">{"".join(flow)}</div></div>'
        f'<section class="next wrap" aria-labelledby="{nh}"><h2 class="h2 h2--sm" id="{nh}">{U["next"]}</h2>{tile_lc(ctx, True)}</section>'
        + closing(ctx) + "</main>"
    )


def lc_main(ctx):
    L = C.LC
    nh = ctx.id("next-h")
    return (
        f'<main id="{ctx.id("main")}" tabindex="-1">'
        '<header class="art-head wrap">'
        f'<a class="crumb" href="{ctx.url("home", "work")}">{icon("arrow-left")}{U["all_work"]}</a>'
        f'<h1 id="{ctx.id("title")}" tabindex="-1">{L["h1"]}</h1>'
        f'<p class="deck">{L["body"][0]}</p>'
        f'<p class="status">{U["in_progress"]}</p></header>'
        '<div class="art art--single wrap"><div class="flow">'
        f'<p class="prose">{L["body"][1]}</p>'
        '<figure class="fig">'
        f'<div class="panel fig__panel fig__panel--lc">{diagrams.lifecycle_svg(C.DIAGRAM["lc_alt"])}</div>'
        f'<figcaption><span class="pill">{U["concept"]}</span>{U["drawn"]} {L["fig_source"]}</figcaption></figure>'
        "</div></div>"
        f'<section class="next wrap" aria-labelledby="{nh}"><h2 class="h2 h2--sm" id="{nh}">{U["finished"]}</h2>{tile_ml(ctx, True)}</section>'
        + closing(ctx) + "</main>"
    )


def nf_main(ctx):
    return (
        f'<main id="{ctx.id("main")}" tabindex="-1"><section class="nf wrap">'
        f'<p class="nf__code" aria-hidden="true">404</p>'
        f'<h1 id="{ctx.id("title")}" tabindex="-1">{C.NF["h1"]}</h1>'
        f'<div class="actions"><a class="btn btn--blue" href="{ctx.url("home")}"><span class="btn__text">{C.NF["home"]}</span>{icon("arrow-right", "icon--next")}</a></div>'
        "</section></main>"
    )


MAINS = {"home": home_main, "ml": ml_main, "lc": lc_main, "nf": nf_main}


def body(ctx):
    return nav(ctx) + MAINS[ctx.page](ctx) + footer(ctx)


def zoom_dialog():
    return (
        '<dialog class="zoom" id="zoom" aria-labelledby="zoom-title">'
        '<div class="zoom__bar"><p class="zoom__title" id="zoom-title"></p>'
        f'<button class="zoom__close" type="button" aria-label="{escape(U["close"])}">{icon("x")}</button></div>'
        '<div class="zoom__body"></div></dialog>'
    )


def person_jsonld():
    data = {
        "@context": "https://schema.org", "@type": "Person", "name": "Kevin Park",
        "jobTitle": "Senior Product Marketing Manager",
        "worksFor": {"@type": "Organization", "name": "ZBD", "url": "https://zbdpay.com"},
        "alumniOf": {"@type": "CollegeOrUniversity", "name": "UBC Sauder School of Business"},
        "sameAs": [C.LINKEDIN],
    }
    return f'<script type="application/ld+json">{json.dumps(data)}</script>'


# ---------------------------------------------------------------------------
# fonts
# ---------------------------------------------------------------------------
FACES = [
    ("normal", "mona-sans-latin-standard-normal.woff2", LATIN),
    ("normal", "mona-sans-latin-ext-standard-normal.woff2", LATIN_EXT),
    ("italic", "mona-sans-latin-standard-italic.woff2", LATIN),
]


def font_css(src_for):
    return "\n".join(
        f'@font-face{{font-family:"Mona Sans";font-style:{style};font-weight:200 900;font-stretch:75% 125%;'
        f'font-display:swap;src:url({src_for(f)}) format("woff2");unicode-range:{rng}}}'
        for style, f, rng in FACES
    )


def font_css_inline():
    def data(f):
        return "data:font/woff2;base64," + base64.b64encode((FONT_DIR / f).read_bytes()).decode()
    return "\n".join(
        f'@font-face{{font-family:"Mona Sans";font-style:{style};font-weight:200 900;font-stretch:75% 125%;'
        f'font-display:swap;src:url({data(f)}) format("woff2");unicode-range:{rng}}}'
        for style, f, rng in FACES if "ext" not in f
    )


# ---------------------------------------------------------------------------
# static site
# ---------------------------------------------------------------------------
def head_static(ctx):
    p = PATH[ctx.page]
    parts = [
        '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
        f"<title>{escape(TITLE[ctx.page])}</title>",
        f'<meta name="description" content="{escape(DESC[ctx.page])}">',
        '<meta name="color-scheme" content="dark">',
        '<meta name="theme-color" content="#08080C">',
        f'<meta property="og:type" content="{"article" if ctx.page in ("ml", "lc") else "website"}">',
        f'<meta property="og:title" content="{escape(TITLE[ctx.page])}">',
        f'<meta property="og:description" content="{escape(DESC[ctx.page])}">',
        '<meta property="og:locale" content="en_US">',
        f'<meta property="og:image" content="{abs_url("/assets/og.png")}">',
        '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">',
        '<meta name="twitter:card" content="summary_large_image">',
        '<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">',
        '<link rel="preload" href="/assets/fonts/mona-sans-latin-standard-normal.woff2" as="font" type="font/woff2" crossorigin>',
        '<link rel="stylesheet" href="/assets/fonts/fonts.css">',
        '<link rel="stylesheet" href="/assets/site.css">',
        '<script src="/assets/site.js" defer></script>',
    ]
    if SITE_URL and ctx.page != "nf":
        parts += [f'<link rel="canonical" href="{abs_url(p)}">', f'<meta property="og:url" content="{abs_url(p)}">']
    if ctx.page == "home":
        parts.append(person_jsonld())
    return "".join(parts)


def build_static():
    out = DIST / "site"
    if out.exists():
        shutil.rmtree(out)
    (out / "assets" / "fonts").mkdir(parents=True)
    for page in PAGES:
        ctx = Ctx("static", page)
        dest = out / ("404.html" if page == "nf" else PATH[page].strip("/") + "/index.html" if page != "home" else "index.html")
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(
            f'<!doctype html><html lang="en" data-mode="static"><head>{head_static(ctx)}</head>'
            f"<body>{diagrams.defs_svg()}{body(ctx)}{zoom_dialog()}</body></html>"
        )
    shutil.copy(ROOT / "src" / "site.css", out / "assets" / "site.css")
    shutil.copy(ROOT / "src" / "site.js", out / "assets" / "site.js")
    (out / "assets" / "favicon.svg").write_text(diagrams.FAVICON)
    for _, f, _ in FACES:
        shutil.copy(FONT_DIR / f, out / "assets" / "fonts" / f)
    (out / "assets" / "fonts" / "fonts.css").write_text(font_css(lambda f: "./" + f))
    og = ROOT / "assets-src" / "og.png"
    if og.exists():
        shutil.copy(og, out / "assets" / "og.png")
    (out / "robots.txt").write_text("User-agent: *\nAllow: /\n" + (f"Sitemap: {SITE_URL}/sitemap.xml\n" if SITE_URL else ""))
    if SITE_URL:
        (out / "sitemap.xml").write_text(
            '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
            + "".join(f"<url><loc>{abs_url(PATH[p])}</loc></url>" for p in ("home", "ml", "lc")) + "</urlset>"
        )
    return out


# ---------------------------------------------------------------------------
# artifact (single file, hash routes)
# ---------------------------------------------------------------------------
def build_artifact():
    out = DIST / "artifact"
    out.mkdir(parents=True, exist_ok=True)
    views = []
    for page in PAGES:
        ctx = Ctx("spa", page)
        hidden = "" if page == "home" else " hidden"
        views.append(f'<div data-view="{VIEW[page]}" data-title="{escape(TITLE[page])}"{hidden}>{body(ctx)}</div>')
    css = (ROOT / "src" / "site.css").read_text()
    js = (ROOT / "src" / "site.js").read_text()
    html = (
        "<title>Kevin Park Portfolio</title>\n"
        f'<meta name="description" content="{escape(C.META["home_desc"])}">\n'
        f"<style>{font_css_inline()}\n{css}</style>\n"
        + diagrams.defs_svg()
        + '<div id="app">' + "".join(views) + "</div>"
        + zoom_dialog()
        + '<script>document.documentElement.setAttribute("data-mode","spa");document.documentElement.setAttribute("lang","en");</script>'
        + f"<script>{js}</script>\n"
    )
    (out / "index.html").write_text(html)
    return out


if __name__ == "__main__":
    s = build_static()
    a = build_artifact()
    print("static:", s)
    print("artifact:", a / "index.html", f"{(a / 'index.html').stat().st_size / 1024:.0f} KB")
