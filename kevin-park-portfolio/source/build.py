#!/usr/bin/env python3
"""Build Kevin Park's portfolio (English, dark neon edition) into two outputs.

dist/site/      deployable static site (deploy at a domain root)
dist/artifact/  single-file page for the claude.ai Artifact preview (hash routes)

Set KP_SITE_URL=https://your-domain before building to emit absolute
canonical, Open Graph, and sitemap URLs.
"""

import hashlib
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

PAGES = ("home", "ml", "lc", "wb", "fp", "nf")
VIEW = {"home": "home", "ml": "money-layer", "lc": "money-lifecycle", "wb": "wirebarley", "fp": "financial-planner", "nf": "404"}
PATH = {"home": "/", "ml": "/work/money-layer/", "lc": "/work/money-lifecycle/", "wb": "/work/wirebarley/", "fp": "/tools/financial-planner/", "nf": "/404.html"}
TITLE = {"home": C.META["home_title"], "ml": C.META["ml_title"], "lc": C.META["lc_title"], "wb": C.META["wb_title"], "fp": C.FP["title"], "nf": C.META["nf_title"]}
DESC = {"home": C.META["home_desc"], "ml": C.META["ml_desc"], "lc": C.META["lc_desc"], "wb": C.META["wb_desc"], "fp": C.FP["meta"], "nf": C.META["home_desc"]}
SBS_IMG = ROOT / "assets-src" / "sbs-evening-news.jpg"
YT = "https://www.youtube.com/watch?v=" + C.WB["video_id"]
U = C.UI


# ---------------------------------------------------------------------------
# icons (Phosphor, regular)
# ---------------------------------------------------------------------------
def _icon_path(name):
    svg = (ICON_DIR / f"{name}.svg").read_text()
    return re.search(r'<path d="([^"]+)"', svg).group(1)


ICON_NAMES = ["arrow-down", "arrow-right", "arrow-left", "arrow-up-right", "linkedin-logo",
              "magnifying-glass-plus", "x", "check", "caret-down", "lock-simple", "download-simple", "plus",
              "calculator", "arrow-counter-clockwise", "sun", "moon"]
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
        '<rect width="64" height="64" rx="16" fill="#0052FF"/>'
        '<path d="M12 22C26 22 30 32 38 32M12 42C26 42 30 32 38 32" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3.5"/>'
        '<path d="M38 32H52" stroke="#fff" stroke-width="5.5" stroke-linecap="round"/></svg></span>'
    )


def tools_menu(ctx):
    T = C.TOOLS
    mid = ctx.id("tools-menu")
    cur = ' aria-current="page"'
    items = "".join(
        f'<li><a class="tools__item" href="{ctx.url(it["key"])}"{cur if ctx.page == it["key"] else ""}>'
        f'<span class="tools__icon" aria-hidden="true">{icon("calculator")}</span>'
        f'<span class="tools__text"><span class="tools__title">{it["title"]}</span>'
        f'<span class="tools__desc">{it["desc"]}</span></span></a></li>'
        for it in T["items"]
    )
    current = " is-current" if ctx.page in [it["key"] for it in T["items"]] else ""
    return (
        f'<div class="tools{current}" data-tools>'
        f'<button class="tools__btn" type="button" aria-expanded="false" aria-controls="{mid}">'
        f'{T["nav"]}{icon("caret-down", "tools__caret")}</button>'
        f'<div class="tools__panel" id="{mid}" hidden><p class="sr-only">{T["menu_label"]}</p>'
        f'<ul class="tools__list">{items}</ul></div></div>'
    )


def theme_button():
    """Light/dark switch. The label names the mode it switches to; site.js keeps it current."""
    return (
        '<button class="theme-btn" type="button" data-theme-toggle aria-label="Switch to dark mode" title="Switch to dark mode">'
        + icon("sun", "theme-btn__sun") + icon("moon", "theme-btn__moon") + "</button>"
    )


# Light is the default (Kevin, 2026-11-10). Runs before first paint so a saved dark choice never flashes light.
THEME_BOOT = (
    "<script>(function(){var t;try{t=localStorage.getItem('kp-theme')}catch(e){}"
    "if(t!=='dark')t='light';"
    "document.documentElement.setAttribute('data-theme',t);})();</script>"
)


def nav(ctx):
    skip = ctx.url(section="main") if ctx.mode == "spa" else "#" + ctx.id("main")
    return (
        f'<a class="skip" href="{skip}">{U["skip"]}</a>'
        '<header class="nav"><nav class="nav__inner" aria-label="Main">'
        f'<a class="nav__brand" href="{ctx.url("home")}">{mark_logo()}<span>{U["name"]}</span></a>'
        '<div class="nav__links">'
        f'<a href="{ctx.url("home", "work")}">{U["work"]}</a>'
        f'<a href="{ctx.url("home", "about")}" data-nav="about">{U["about"]}</a>'
        f'<a href="{ctx.url("home", "experience")}" data-nav="experience">{U["experience"]}</a>'
        f"{tools_menu(ctx)}"
        "</div>"
        f"{theme_button()}"
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
                f'<h2 class="closing__h" id="{hid}">{C.CLOSING["h2"]}</h2>'
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
    chips = "".join(f'<span class="result__chip">{r}</span>' for r in W["result"])
    return (
        f'<article class="tile tile--lc{" tile--compact" if compact else ""}" aria-labelledby="{hid}">'
        '<div class="tile__text">'
        f'<h3 id="{hid}"><a href="{ctx.url("lc")}">{W["title"]}</a></h3>'
        f'<p class="tile__desc">{W["desc"]}</p>'
        f'<p class="result result--row">{chips}</p>'
        f'<p class="tile__impact">{W["impact"]}</p>'
        f'<span class="tile__go" aria-hidden="true">{U["read"]}{icon("arrow-right")}</span>'
        "</div>"
        f'<div class="tile__art panel">{diagrams.lifecycle_svg(C.DIAGRAM["lc_alt"])}</div>'
        "</article>"
    )


def tile_wb(ctx, compact=False):
    W = C.WORK["wb"]
    hid = ctx.id("tile-wb")
    steps = "".join(
        f'<li><span class="mini-board__n">{i}</span><span class="mini-board__t">{t}</span></li>'
        for i, (t, _) in enumerate(C.WB["steps"], 1)
    )
    return (
        f'<article class="tile tile--wb{" tile--compact" if compact else ""}" aria-labelledby="{hid}">'
        '<div class="tile__text">'
        f'<h3 id="{hid}"><a href="{ctx.url("wb")}">{W["title"]}</a></h3>'
        f'<p class="tile__desc">{W["problem"]}</p>'
        f'<p class="result"><span class="result__chip">{W["result"]}</span></p>'
        f'<p class="tile__stat"><span class="tile__stat-v">{W["stat"][0]}</span><span class="tile__stat-k">{W["stat"][1]}</span></p>'
        f'<span class="tile__go" aria-hidden="true">{U["read"]}{icon("arrow-right")}</span>'
        "</div>"
        f'<div class="tile__art"><ol class="mini-story" aria-label="{escape(U["storyboard"])}">{steps}</ol></div>'
        "</article>"
    )


# ---------------------------------------------------------------------------
# pages
# ---------------------------------------------------------------------------
def hero_role(text):
    """Role line above the headline. The middle dot is visual only; each half stays on one line."""
    title, field = text.split(" · ", 1)
    return (
        f'<p class="hero__role"><span class="hero__role-part">{escape(title, quote=False)}'
        '<span class="hero__role-sep" aria-hidden="true">·</span></span>'
        '<span class="sr-only">, </span>'
        f'<span class="hero__role-part">{escape(field, quote=False)}</span></p>'
    )


def about_portrait(ctx, P):
    if not P:
        return ""
    src = portrait_src(ctx, P["file"])
    return (
        '<figure class="about__portrait">'
        f'<img src="{src}" width="{P["width"]}" height="{P["height"]}" alt="{escape(P["alt"])}" loading="lazy" decoding="async">'
        "</figure>"
    )


def about_section(ctx):
    A = C.ABOUT
    ah, bh, xh = ctx.id("about-h"), ctx.id("about-beyond-h"), ctx.id("about-expect-h")
    portrait = about_portrait(ctx, A["portrait"])
    lead = "".join(f'<span class="about__lead-line">{s}</span> ' for s in A["lead"]).strip()
    intro = "".join(f"<p>{p}</p>" for p in A["intro"])
    beyond = "".join(f"<p>{p}</p>" for p in A["beyond"])

    def phrase(s):
        style = A["contrast"].get(s)
        cls = f"expect__phrase expect__phrase--{style}" if style else "expect__phrase"
        return f'<span class="{cls}">{s}</span>'

    lines = "".join("<li>" + " ".join(phrase(s) for s in line) + "</li>" for line in A["expect"])
    return (
        f'<section class="about wrap" id="{ctx.id("about")}" aria-labelledby="{ah}">'
        '<div class="about__row about__row--open">'
        f'<div class="about__side"><h2 class="h2 about__h" id="{ah}">{A["h2"]}</h2>{portrait}</div>'
        '<div class="about__main">'
        f'<p class="about__lead">{lead}</p>'
        f'<div class="about__prose">{intro}</div>'
        "</div></div>"
        '<div class="about__row">'
        f'<div class="about__side"><h3 class="about__sub" id="{bh}">{A["beyond_h"]}</h3></div>'
        f'<div class="about__main"><div class="about__prose">{beyond}</div></div>'
        "</div>"
        '<div class="about__row">'
        f'<div class="about__side"><h3 class="about__sub" id="{xh}">{A["expect_h"]}</h3></div>'
        f'<div class="about__main about__main--expect"><ul class="expect" aria-labelledby="{xh}">{lines}</ul></div>'
        "</div>"
        "</section>"
    )


def home_main(ctx):
    H, P = C.HERO, C.PROOF
    h1 = ctx.id("hero-h")
    hero = (
        f'<section class="hero" aria-labelledby="{h1}"><div class="sg" data-sg aria-hidden="true"></div>'
        '<div class="wrap hero__grid">'
        '<div class="hero__text">'
        f'{hero_role(H["role"])}'
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
        f'<span class="card3d__art"><span class="card3d__chip"></span>{diagrams.lines_svg()}</span>'
        f'<span class="card3d__line">{H["card_line"]}</span>'
        f'<span class="card3d__bottom"><span class="card3d__kicker">{H["card_kicker"]}</span></span>'
        '<span class="card3d__sheen" aria-hidden="true"></span>'
        "</span></span></a>"
        "</div></section>"
    )
    stats = "".join(
        f'<div class="stats__item"><dt class="stats__v">{v}</dt><dd class="stats__k">{k}</dd><dd class="stats__co">{co}</dd></div>'
        for v, k, co in P["stats"]
    )
    proof = (
        f'<section class="stats wrap" aria-label="{escape(P["label"])}">'
        f'<dl class="stats__grid">{stats}</dl>'
        "</section>"
    )
    wh = ctx.id("work-h")
    work = (
        f'<section class="work wrap" id="{ctx.id("work")}" aria-labelledby="{wh}">'
        f'<h2 class="h2" id="{wh}">{C.WORK["h2"]}</h2>'
        f'<div class="work__grid">{tile_ml(ctx)}{tile_lc(ctx)}{tile_wb(ctx)}</div>'
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
            f'<p class="role__focus">{r["focus"]}</p>'
            '<ul class="role__bullets">' + "".join(f"<li>{mark_figures(b, figs)}</li>" for b, figs in r["bullets"]) + "</ul>"
            "</div></li>"
        )
    eh = ctx.id("exp-h")
    experience = (
        f'<section class="exp wrap" id="{ctx.id("experience")}" aria-labelledby="{eh}">'
        f'<h2 class="h2" id="{eh}">{E["h2"]}</h2>'
        f'<ol class="roles">{"".join(roles)}</ol>'
        '<dl class="exp__extra">'
        f'<div><dt>{U["education"]}</dt>' + "".join(f"<dd>{x}</dd>" for x in E["education"]) + "</div>"
        f'<div><dt>{U["skills"]}</dt><dd>' + " · ".join(E["skills"]) + "</dd></div>"
        "</dl></section>"
    )
    return f'<main id="{ctx.id("main")}" tabindex="-1">{hero}{proof}{work}{experience}{about_section(ctx)}{closing(ctx)}</main>'


def zbd_cta():
    return (
        f'<a class="fig__cta" href="https://zbdpay.com/" target="_blank" rel="noopener noreferrer">{U["view_zbd"]}'
        f'{icon("arrow-up-right")}<span class="sr-only"> {U["new_tab"]}</span></a>'
    )


def zbd_host():
    return (
        '<a class="proof__host" href="https://zbdpay.com/" target="_blank" rel="noopener noreferrer"><span class="proof__dot"></span>'
        f'zbdpay.com{icon("arrow-up-right")}<span class="sr-only"> {U["new_tab"]}</span></a>'
    )


def zoom_btn():
    return (
        f'<button class="zoom-btn" type="button" data-zoom aria-label="{escape(U["enlarge"])}">'
        f'{icon("magnifying-glass-plus")}</button>'
    )


PLAY = '<svg class="play" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M24 18v28l22-14z"/></svg>'


def sbs_src(ctx):
    if ctx.mode == "spa":
        return "data:image/jpeg;base64," + base64.b64encode(SBS_IMG.read_bytes()).decode()
    return "/assets/sbs-evening-news.jpg"


MIME = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif"}


def portrait_src(ctx, name):
    f = ROOT / "assets-src" / name
    if ctx.mode == "spa":
        return f"data:{MIME[f.suffix.lower()]};base64," + base64.b64encode(f.read_bytes()).decode()
    return "/assets/" + name


def figure(kind, ctx):
    M, L = C.ML, C.LC
    if kind == "storyboard":
        last = len(C.WB["steps"])
        steps = "".join(
            f'<li class="board__step{" board__step--end" if i == last else ""}"><span class="board__n">{i}</span>'
            f'<p class="board__t">{t}</p><p class="board__d">{d}</p>'
            + ("" if i == last else f'<span class="board__arrow" aria-hidden="true">{icon("arrow-right")}</span>')
            + "</li>"
            for i, (t, d) in enumerate(C.WB["steps"], 1)
        )
        return (
            '<figure class="fig">'
            f'<div class="panel fig__panel fig__panel--story"><ol class="board">{steps}</ol></div>'
            f'<figcaption><span class="pill">{U["storyboard"]}</span>{U["storyboard_cap"]}</figcaption></figure>'
        )
    if kind == "video":
        watch = (
            f'<a class="fig__cta" href="{YT}" target="_blank" rel="noopener noreferrer">{U["watch"]}'
            f'{icon("arrow-up-right")}<span class="sr-only"> {U["new_tab"]}</span></a>'
        )
        if ctx.mode == "spa":
            player = (
                f'<a class="video-card" href="{YT}" target="_blank" rel="noopener noreferrer">'
                f'<span class="video-card__play">{PLAY}</span>'
                f'<span class="video-card__t">{U["video_title"]}</span>'
                f'<span class="video-card__s">YouTube{icon("arrow-up-right")}</span>'
                f'<span class="sr-only"> {U["new_tab"]}</span></a>'
            )
        else:
            player = (
                f'<iframe src="https://www.youtube-nocookie.com/embed/{C.WB["video_id"]}?rel=0" title="{escape(U["video_title"])}" '
                'loading="lazy" referrerpolicy="strict-origin-when-cross-origin" '
                'allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>'
            )
        return (
            '<figure class="fig">'
            f'<div class="fig__panel fig__panel--video">{player}</div>'
            f'<figcaption><span class="pill">{U["commercial"]}</span>{watch}</figcaption></figure>'
        )
    if kind == "platform_video":
        V = L["video"]
        src = abs_url("/assets/" + V["file"]) if ctx.mode == "spa" else "/assets/" + V["file"]
        if ctx.mode == "spa":  # the single-file Artifact cannot carry the video; link to the hosted file when a domain is set
            if not SITE_URL:
                return ""
            player = (
                f'<a class="video-card" href="{src}" target="_blank" rel="noopener noreferrer">'
                f'<span class="video-card__play">{PLAY}</span>'
                f'<span class="video-card__t">{U["platform_video_title"]}</span>'
                f'<span class="video-card__s">{U["platform_video_open"]}{icon("arrow-up-right")}</span>'
                f'<span class="sr-only"> {U["new_tab"]}</span></a>'
            )
        else:
            player = (
                f'<video controls playsinline preload="none" poster="/assets/{V["poster"]}" width="{V["width"]}" height="{V["height"]}" '
                f'aria-label="{escape(U["platform_video_title"])}"><source src="{src}" type="video/mp4">'
                f'<a href="{src}">{U["platform_video_open"]}</a></video>'
            )
        return (
            '<figure class="fig">'
            f'<div class="fig__panel fig__panel--video">{player}</div>'
            f'<figcaption><span class="pill">{U["platform_video"]}</span>{U["platform_video_cap"]}</figcaption></figure>'
        )
    if kind == "sbs":
        return (
            '<figure class="fig">'
            f'<div class="fig__panel fig__panel--photo"><img src="{sbs_src(ctx)}" width="1400" height="721" alt="{escape(U["sbs_alt"])}" loading="lazy" decoding="async"></div>'
            f'<figcaption><span class="pill">{U["media"]}</span>{U["sbs_cap"]}</figcaption></figure>'
        )
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
            f'<figcaption><span class="pill">{U["final"]}</span>{zbd_cta()}</figcaption></figure>'
        )
    if kind == "step":
        return (
            f'<figure class="fig" data-title="{escape(U["concept"])}">'
            f'<div class="panel fig__panel fig__panel--step">{diagrams.step_svg(C.DIAGRAM["step"], C.DIAGRAM["step_alt"])}{zoom_btn()}</div>'
            f'<figcaption><span class="pill">{U["concept"]}</span>{U["drawn"]}</figcaption></figure>'
        )
    if kind == "naming":
        sep = '<span class="terms__sep" aria-hidden="true">/</span>'
        def row(cls, label, terms, joiner):
            return (
                f'<div class="terms terms--{cls}"><p class="terms__k">{label}</p>'
                f'<p class="terms__v">{joiner.join(f"<span>{t}</span>" for t in terms)}</p></div>'
            )
        return (
            '<figure class="fig">'
            '<div class="fig__panel fig__panel--grad fig__panel--terms">'
            + row("tried", U["first_try"], L["naming"]["tried"], sep)
            + row("final", U["final_row"], L["naming"]["final"], '<span class="sr-only">, </span>')
            + "</div>"
            f'<figcaption><span class="pill">{U["final"]}</span>{zbd_cta()}</figcaption></figure>'
        )
    if kind == "loop":
        return (
            f'<figure class="fig" data-title="{escape(U["concept"])}">'
            f'<div class="panel fig__panel">{diagrams.loop_pair(C.DIAGRAM)}{zoom_btn()}</div>'
            f'<figcaption><span class="pill">{U["concept"]}</span>{U["drawn"]} {L["fig_source"]}</figcaption></figure>'
        )
    if kind == "proof" and ctx.page == "lc":
        out = icon("arrow-up-right")
        rows = "".join(
            f'<div><dt><a href="{url}" target="_blank" rel="noopener noreferrer">{k}{out}<span class="sr-only"> {U["new_tab"]}</span></a></dt><dd>{v}</dd></div>'
            for k, url, v in L["proof_rows"]
        )
        return (
            '<figure class="fig">'
            '<div class="panel fig__panel fig__panel--proof">'
            f'{zbd_host()}'
            f'<dl class="proof proof--links">{rows}</dl></div>'
            f'<figcaption><span class="pill">{U["proof"]}</span></figcaption></figure>'
        )
    rows = "".join(f"<div><dt>{k}</dt><dd>{v}</dd></div>" for k, v in M["proof_rows"])
    return (
        '<figure class="fig">'
        '<div class="panel fig__panel fig__panel--proof">'
        f'{zbd_host()}'
        f'<dl class="proof">{rows}</dl></div>'
        f'<figcaption><span class="pill">{U["proof"]}</span>{C.WORK["ml"]["impact"]}</figcaption></figure>'
    )


def article_main(ctx, A, next_label, next_tile):
    rail = (
        f'<aside class="rail" aria-label="{escape(U["on_this_page"])}"><div class="rail__inner">'
        f'<p class="rail__h">{U["on_this_page"]}</p><ol>'
        + "".join(f'<li><a href="{ctx.url(section=s["id"])}" data-target="{ctx.id(s["id"])}">{s["h2"]}</a></li>' for s in A["sections"])
        + "</ol></div></aside>"
    )
    th = ctx.id("tldr-h")
    flow = [
        f'<section class="tldr" aria-labelledby="{th}"><h2 id="{th}">{A["tldr_h"]}</h2><dl>'
        + "".join(f"<div><dt>{k}</dt><dd>{v}</dd></div>" for k, v in A["tldr"])
        + "</dl></section>"
    ]
    ml_link = f'<a class="inline" href="{ctx.url("ml")}">“{C.WORK["ml"]["result"]}”</a>'
    for s in A["sections"]:
        flow.append(f'<h2 id="{ctx.id(s["id"])}">{s["h2"]}</h2>')
        for kind, val in s["blocks"]:
            if kind == "p":
                flow.append(f'<p class="prose">{val.replace("{ML_LINK}", ml_link)}</p>')
            elif kind == "issues":
                flow.append('<ul class="issues">' + "".join(
                    f'<li><span class="issues__k">{k}:</span> {v}</li>' for k, v in val) + "</ul>")
            elif kind == "fig":
                flow.append(figure(val, ctx))
            elif kind == "quote":
                flow.append(f'<p class="pull">{val}</p>')
            elif kind == "h3":
                flow.append(f"<h3>{val}</h3>")
            elif kind == "bullets":
                role = next(r for r in C.EXPERIENCE["roles"] if r["company"] == "WireBarley")
                flow.append('<ul class="role__bullets">' + "".join(f"<li>{mark_figures(b, figs)}</li>" for b, figs in role["bullets"]) + "</ul>")
            elif kind == "results":
                flow.append('<ul class="results">' + "".join(
                    f'<li class="results__item{" results__item--lead" if i == 0 else ""}"><span class="results__k">{k}</span>'
                    f'<span class="results__v">{mark_figures(v, figs)}</span></li>'
                    for i, (k, v, figs) in enumerate(val)) + "</ul>")
    facts = "".join(
        f'<li><span class="facts__k">{k}</span><span class="facts__v">{v}</span></li>'
        for k, v in A["facts"]
    )
    if A.get("follows"):
        facts += (
            f'<li><span class="facts__k">{U["follows"]}</span>'
            f'<a class="facts__v facts__v--grad" href="{ctx.url("ml")}">{A["follows"]}</a></li>'
        )
    nh = ctx.id("next-h")
    return (
        f'<main id="{ctx.id("main")}" tabindex="-1"><div class="progress" aria-hidden="true"></div>'
        '<header class="art-head"><div class="sg" data-sg aria-hidden="true"></div><div class="wrap art-head__in">'
        f'<a class="crumb" href="{ctx.url("home", "work")}">{icon("arrow-left")}{U["all_work"]}</a>'
        f'<h1 id="{ctx.id("title")}" tabindex="-1">{A["h1"]}</h1>'
        f'<p class="deck">{A["deck"]}</p><ul class="facts">{facts}</ul></div></header>'
        f'<div class="art wrap">{rail}<div class="flow">{"".join(flow)}</div></div>'
        f'<section class="next wrap" aria-labelledby="{nh}"><h2 class="h2 h2--sm" id="{nh}">{next_label}</h2>{next_tile}</section>'
        + closing(ctx) + "</main>"
    )


def ml_main(ctx):
    return article_main(ctx, C.ML, U["next"], tile_lc(ctx, True))


def lc_main(ctx):
    return article_main(ctx, C.LC, U["next"], tile_wb(ctx, True))


def wb_main(ctx):
    return article_main(ctx, C.WB, U["next"], tile_ml(ctx, True))


def nf_main(ctx):
    return (
        f'<main id="{ctx.id("main")}" tabindex="-1"><section class="nf wrap">'
        f'<p class="nf__code" aria-hidden="true">404</p>'
        f'<h1 id="{ctx.id("title")}" tabindex="-1">{C.NF["h1"]}</h1>'
        f'<div class="actions"><a class="btn btn--blue" href="{ctx.url("home")}"><span class="btn__text">{C.NF["home"]}</span>{icon("arrow-right", "icon--next")}</a></div>'
        "</section></main>"
    )


# ---------------------------------------------------------------------------
# tools: financial planner
# ---------------------------------------------------------------------------
def _help(text, hid):
    return f'<p class="fp-help" id="{hid}">{text}</p>' if text else ""


def fp_money(ctx, name, label, help_text="", optional=False, cls=""):
    fid, hid = ctx.id(f"fp-{name}"), ctx.id(f"fp-{name}-help")
    desc = f' aria-describedby="{hid}"' if help_text else ""
    return (
        f'<div class="fp-field {cls}">'
        f'<label class="fp-label" for="{fid}">{label}</label>{_help(help_text, hid)}'
        f'<div class="fp-money"><span class="fp-money__sign" aria-hidden="true">$</span>'
        f'<input class="fp-input" id="{fid}" name="{name}" type="text" inputmode="decimal" autocomplete="off"{desc}'
        f'{"" if optional else ""} data-money></div></div>'
    )


def fp_number(ctx, name, label, help_text="", suffix="", maxlength=None, mode="numeric", auto="off", cls=""):
    fid, hid = ctx.id(f"fp-{name}"), ctx.id(f"fp-{name}-help")
    desc = f' aria-describedby="{hid}"' if help_text else ""
    ml = f' maxlength="{maxlength}"' if maxlength else ""
    suf = f'<span class="fp-money__suffix" aria-hidden="true">{suffix}</span>' if suffix else ""
    return (
        f'<div class="fp-field {cls}">'
        f'<label class="fp-label" for="{fid}">{label}</label>{_help(help_text, hid)}'
        f'<div class="fp-money{" fp-money--suffix" if suffix else " fp-money--plain"}">'
        f'<input class="fp-input" id="{fid}" name="{name}" type="text" inputmode="{mode}" autocomplete="{auto}"{ml}{desc}>{suf}</div></div>'
    )


def fp_choice(ctx, name, label, opts, help_text="", stack=False):
    hid = ctx.id(f"fp-{name}-help")
    desc = f' aria-describedby="{hid}"' if help_text else ""
    chips = "".join(
        f'<label class="fp-chip"><input type="radio" name="{name}" value="{v}"><span>{t}</span></label>'
        for v, t in opts
    )
    return (
        f'<fieldset class="fp-field"{desc}><legend class="fp-label">{label}</legend>{_help(help_text, hid)}'
        f'<div class="fp-chips{" fp-chips--stack" if stack else ""}">{chips}</div></fieldset>'
    )


def fp_step_pay(ctx, Q):
    return (
        fp_money(ctx, "take_home", *Q["take_home"])
        + fp_choice(ctx, "pay_type", Q["pay_type"][0], Q["pay_types"], stack=True)
        + fp_money(ctx, "gross", *Q["gross"], optional=True)
        + fp_choice(ctx, "filing", Q["filing"][0], Q["filings"])
        + fp_number(ctx, "zip", Q["zip"][0], Q["zip"][1], maxlength=5, auto="postal-code", cls="fp-field--zip")
        + '<div class="fp-out" data-out="area" aria-live="polite"></div>'
        + fp_choice(ctx, "tier", Q["tier"][0], Q["tiers"], Q["tier"][1])
    )


def fp_step_bills(ctx, Q):
    rows = "".join(
        f'<div class="fp-bill"><label class="fp-bill__k" for="{ctx.id("fp-b-" + k)}">{t}'
        + (f'<span class="fp-bill__hint">{h}</span>' if h else "")
        + f'</label><div class="fp-money fp-money--sm"><span class="fp-money__sign" aria-hidden="true">$</span>'
        f'<input class="fp-input" id="{ctx.id("fp-b-" + k)}" name="b_{k}" type="text" inputmode="decimal" autocomplete="off" data-money></div></div>'
        for k, t, h in Q["bill_rows"]
    )
    card = (
        fp_choice(ctx, "card", Q["card"][0], Q["yes_no"])
        + '<div class="fp-pair" data-show="card=yes" hidden>'
        + fp_money(ctx, "card_balance", Q["card_balance"][0])
        + fp_number(ctx, "card_apr", Q["card_apr"][0], Q["card_apr"][1], suffix="%", mode="decimal")
        + "</div>"
    )
    return (
        f'<fieldset class="fp-field"><legend class="fp-label">{Q["bills"][0]}</legend>{_help(Q["bills"][1], ctx.id("fp-bills-help"))}'
        f'<div class="fp-bills">{rows}</div></fieldset>'
        '<div class="fp-out" data-out="bills" aria-live="polite"></div>'
        + card
    )


def fp_step_budget(ctx, Q):
    sliders = "".join(
        f'<div class="fp-slider fp-slider--{k}"><label for="{ctx.id("fp-s-" + k)}"><span class="fp-slider__dot" aria-hidden="true"></span>{t}'
        f'<output class="fp-slider__v" data-split="{k}"></output></label>'
        f'<input type="range" id="{ctx.id("fp-s-" + k)}" name="s_{k}" min="0" max="100" step="1"></div>'
        for k, t in (("needs", "Needs"), ("wants", "Wants"), ("save", "Savings and extra debt payments"))
    )
    return (
        '<div class="fp-out" data-out="split" aria-live="polite"></div>'
        f'<fieldset class="fp-field"><legend class="fp-label">{Q["split"][0]}</legend>{_help(Q["split"][1], ctx.id("fp-split-help"))}'
        f'<div class="fp-sliders">{sliders}</div>'
        f'<button class="fp-link" type="button" data-reset-split>{icon("arrow-counter-clockwise")}<span data-reset-label></span></button></fieldset>'
        '<div class="fp-out" data-out="budget-check" aria-live="polite"></div>'
    )


def fp_step_safety(ctx, Q, F):
    D = F["data"]
    rows = "".join(
        f'<tr><th scope="row">{r[0]}</th><td class="fp-apy">{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>' for r in D["hysa"]
    )
    cols = "".join(f'<th scope="col">{c}</th>' for c in F["hysa_cols"])
    checks = "".join(f"<li>{icon('check')}<span>{c}</span></li>" for c in F["hysa_check"])
    return (
        fp_choice(ctx, "incomes", Q["incomes"][0], Q["income_opts"])
        + fp_choice(ctx, "dependents", Q["dependents"][0], Q["yes_no"], Q["dependents"][1])
        + fp_choice(ctx, "own", Q["own"][0], Q["yes_no"], Q["own"][1])
        + fp_choice(ctx, "risk_job", Q["risk_job"][0], Q["yes_no"], Q["risk_job"][1])
        + '<div class="fp-out" data-out="target" aria-live="polite"></div>'
        + fp_money(ctx, "saved", *Q["saved"])
        + fp_money(ctx, "monthly_save", *Q["monthly_save"])
        + '<div class="fp-out" data-out="progress" aria-live="polite"></div>'
        + f'<div class="fp-sub"><h3 class="fp-h3">{F["hysa_h"]}</h3><p class="fp-p">{F["hysa_lead"]}</p>'
        f'<ul class="fp-checks">{checks}</ul>'
        f'<div class="fp-table-wrap"><table class="fp-table"><caption>{F["hysa_table_cap"]} '
        f'<a href="{F["sources"][4][2]}" target="_blank" rel="noopener noreferrer">{F["sources"][4][1]}<span class="sr-only"> {U["new_tab"]}</span></a></caption>'
        f'<thead><tr>{cols}</tr></thead><tbody>{rows}</tbody></table></div></div>'
    )


def fp_step_goals(ctx, Q):
    adds = "".join(
        f'<button class="fp-add" type="button" data-add-goal="{escape(g)}">{icon("plus")}<span>{g}</span></button>' for g in Q["goal_types"]
    )
    risk = "".join(
        f'<fieldset class="fp-field fp-q"><legend class="fp-label"><span class="fp-q__n">{i}</span>{q}</legend>'
        '<div class="fp-chips fp-chips--stack">'
        + "".join(f'<label class="fp-chip"><input type="radio" name="r{i}" value="{j}"><span>{a}</span></label>' for j, a in enumerate(opts, 1))
        + "</div></fieldset>"
        for i, (q, opts) in enumerate(Q["risk"], 1)
    )
    return (
        f'<div class="fp-field"><p class="fp-label" id="{ctx.id("fp-goals-l")}">{Q["goal_add"][0]}</p>{_help(Q["goal_add"][1], ctx.id("fp-goals-help"))}'
        f'<div class="fp-adds" role="group" aria-labelledby="{ctx.id("fp-goals-l")}">{adds}</div></div>'
        '<ul class="fp-goals" data-goals></ul>'
        '<div class="fp-out" data-out="goals" aria-live="polite"></div>'
        f'<div class="fp-sub"><h3 class="fp-h3">{Q["risk_h"]}</h3><p class="fp-p">{Q["risk_lead"]}</p>{risk}</div>'
        '<div class="fp-out" data-out="risk" aria-live="polite"></div>'
    )


def fp_step_retire(ctx, Q):
    return (
        fp_choice(ctx, "plan_offered", Q["plan_offered"][0], Q["plan_opts"], Q["plan_offered"][1])
        + '<div data-show="plan_offered=yes" hidden>'
        + fp_choice(ctx, "match", Q["match"][0], [(v, t) for v, t, _, _ in Q["match_opts"]], Q["match"][1], stack=True)
        + fp_number(ctx, "contrib", Q["contrib"][0], Q["contrib"][1], suffix="%", mode="decimal")
        + fp_choice(ctx, "vesting", Q["vesting"][0], Q["vest_opts"], Q["vesting"][1])
        + fp_choice(ctx, "roth401k", Q["roth401k"][0], Q["plan_opts"])
        + "</div>"
        + fp_choice(ctx, "hsa", Q["hsa"][0], Q["plan_opts"])
        + '<div class="fp-out" data-out="match" aria-live="polite"></div>'
        + '<div class="fp-out" data-out="order" aria-live="polite"></div>'
    )


def fp_step_invest(ctx, Q, F):
    learn = "".join(
        f'<details class="fp-learn"><summary><span class="fp-learn__t">{t}</span>{icon("caret-down", "fp-learn__caret")}</summary>'
        f'<div class="fp-learn__b"><p>{d}</p><p class="fp-learn__fit">{fit}</p></div></details>'
        for t, d, fit in F["learn"]
    )
    more = "".join(f'<div class="fp-more__item"><h4>{t}</h4><p>{d}</p></div>' for t, d in F["learn_more"])
    return (
        '<div class="fp-out" data-out="invest" aria-live="polite"></div>'
        '<div class="fp-out" data-out="mix" aria-live="polite"></div>'
        f'<div class="fp-sub"><h3 class="fp-h3">{Q["learn_h"]}</h3><p class="fp-p">{Q["learn_lead"]}</p>'
        f'<div class="fp-learns">{learn}</div><div class="fp-more">{more}</div></div>'
    )


def fp_step_plan(ctx, F):
    fid = ctx.id("fp-email")
    # Without JavaScript the form still posts the email to Formspree instead of putting it in the page URL.
    fs = F["data"]["formspree"]
    action = f' action="https://formspree.io/f/{fs}" method="POST"' if fs else ' method="POST"'
    return (
        '<div class="fp-out" data-out="actions"></div>'
        '<div class="fp-out" data-out="numbers"></div>'
        f'<form class="fp-gate" data-gate novalidate{action}>'
        f'<h3 class="fp-gate__h">{F["email_h"]}</h3><p class="fp-gate__p">{F["email_lead"]}</p>'
        f'<div class="fp-gate__row"><label class="sr-only" for="{fid}">{F["email_label"]}</label>'
        f'<input class="fp-gate__input" id="{fid}" name="email" type="email" autocomplete="email" inputmode="email" required placeholder="{F["email_label"]}">'
        f'<button class="btn btn--white fp-gate__btn" type="submit">{icon("download-simple")}<span class="btn__text">{F["email_cta"]}</span></button></div>'
        '<p class="fp-gate__trap" aria-hidden="true"><label>Leave this empty <input type="text" name="_gotcha" tabindex="-1" autocomplete="off"></label></p>'
        f'<p class="fp-gate__status" data-gate-status role="status"></p>'
        f'<p class="fp-gate__note">{icon("lock-simple")}<span>{F["email_privacy"]}</span></p>'
        f'<button class="fp-link fp-link--light" type="button" data-again hidden>{icon("download-simple")}<span>{F["email_again"]}</span></button>'
        "</form>"
    )


def fp_main(ctx):
    F, Q = C.FP, C.FP["q"]
    hid = ctx.id("title")
    steps_html = {
        "pay": fp_step_pay(ctx, Q), "bills": fp_step_bills(ctx, Q), "budget": fp_step_budget(ctx, Q),
        "safety": fp_step_safety(ctx, Q, F), "goals": fp_step_goals(ctx, Q), "retire": fp_step_retire(ctx, Q),
        "invest": fp_step_invest(ctx, Q, F), "plan": fp_step_plan(ctx, F),
    }
    total = len(F["steps"])
    rail = "".join(
        f'<li><button class="fp-rail__btn" type="button" data-go="{s["key"]}"{"" if i == 0 else " disabled"}>'
        f'<span class="fp-rail__n" aria-hidden="true"><span class="fp-rail__num">{i}</span>{icon("check", "fp-rail__check")}</span>'
        f'<span class="fp-rail__t">{s["nav"]}</span></button></li>'
        for i, s in enumerate(F["steps"], 1)
    )
    panels = []
    for i, s in enumerate(F["steps"], 1):
        sid = ctx.id(f"fp-step-{s['key']}")
        last = i == total
        nav_row = (
            '<div class="fp-nav">'
            + (f'<button class="btn btn--ghost" type="button" data-back>{icon("arrow-left", "icon--back")}<span class="btn__text">{F["back"]}</span></button>' if i > 1 else "")
            + f'<span class="fp-nav__count">{F["step_of"].format(n=i, total=total)}</span>'
            + ("" if last else f'<button class="btn btn--blue" type="button" data-next><span class="btn__text">{F["next"]}</span>{icon("arrow-right", "icon--next")}</button>')
            + "</div>"
        )
        panels.append(
            f'<section class="fp-step" id="{sid}" data-step="{s["key"]}" aria-labelledby="{sid}-h">'
            f'<h2 class="fp-step__h" id="{sid}-h" tabindex="-1">{s["h"]}</h2>'
            f'<p class="fp-step__lead">{s["lead"]}</p>'
            f'<div class="fp-step__body">{steps_html[s["key"]]}</div>{nav_row}</section>'
        )
    facts = "".join(f'<li><span class="facts__k">{k}</span><span class="facts__v">{v}</span></li>' for k, v in F["facts"])
    sources = "".join(
        f'<li><span class="fp-src__k">{k}</span><a href="{u}" target="_blank" rel="noopener noreferrer">{t}<span class="sr-only"> {U["new_tab"]}</span></a></li>'
        for k, t, u in F["sources"]
    )
    data = dict(F["data"])
    data["site_url"] = abs_url(PATH["fp"]) if SITE_URL else ""
    cfg = {"data": data, "steps": [s["key"] for s in F["steps"]], "copy": {
        k: F[k] for k in ("email_busy", "email_done", "email_error", "summary_empty", "disclaimer", "title", "hysa_check", "learn")
    }, "q": {"match_opts": Q["match_opts"], "risk": Q["risk"], "goal_types": Q["goal_types"], "bill_rows": Q["bill_rows"],
             "goal_amount": Q["goal_amount"], "goal_year": Q["goal_year"], "goal_saved": Q["goal_saved"], "goal_remove": Q["goal_remove"]},
        "sources": F["sources"], "pdf": {"lib": "/assets/tools/jspdf.umd.min.js", "regular": "/assets/tools/MonaSans-Regular.ttf", "bold": "/assets/tools/MonaSans-Bold.ttf"}}
    cfg_json = json.dumps(cfg, ensure_ascii=False).replace("</", "<" + chr(92) + "/")
    return (
        f'<main id="{ctx.id("main")}" tabindex="-1" class="fp-page">'
        '<header class="art-head"><div class="sg" data-sg aria-hidden="true"></div>'
        '<div class="wrap art-head__in">'
        f'<h1 id="{hid}" tabindex="-1">{F["h1"]}</h1>'
        f'<p class="deck">{F["deck"]}</p>'
        f'<ul class="facts">{facts}</ul>'
        "</div></header>"
        '<div class="wrap fp" data-fp>'
        f'<nav class="fp-rail" aria-label="{F["rail_h"]}"><p class="rail__h">{F["rail_h"]}</p><ol>{rail}</ol>'
        f'<button class="fp-link fp-rail__reset" type="button" data-reset>{icon("arrow-counter-clockwise")}<span>{F["start_over"]}</span></button></nav>'
        f'<div class="fp-flow"><p class="fp-note">{F["note"]}</p>{"".join(panels)}</div>'
        f'<aside class="fp-sum" aria-labelledby="{ctx.id("fp-sum-h")}"><div class="fp-sum__card">'
        f'<h2 class="fp-sum__h" id="{ctx.id("fp-sum-h")}">{F["summary_h"]}</h2>'
        f'<div data-summary><p class="fp-sum__empty">{F["summary_empty"]}</p></div></div></aside>'
        "</div>"
        '<section class="wrap fp-foot">'
        f'<p class="fp-disclaimer">{F["disclaimer"]}</p>'
        f'<h2 class="fp-foot__h">{F["sources_h"]}</h2><ul class="fp-src">{sources}</ul>'
        "</section>"
        f"{closing(ctx)}"
        f'<script type="application/json" id="fp-config">{cfg_json}</script>'
        "</main>"
    )


MAINS = {"home": home_main, "ml": ml_main, "lc": lc_main, "wb": wb_main, "fp": fp_main, "nf": nf_main}


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
def _og_version():
    """A short hash of the social card, added to its URL so link previews refetch it when it changes."""
    og = ROOT / "assets-src" / "og.png"
    return "?v=" + hashlib.md5(og.read_bytes()).hexdigest()[:8] if og.exists() else ""


OG_VERSION = _og_version()


def head_static(ctx):
    p = PATH[ctx.page]
    parts = [
        '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
        f"<title>{escape(TITLE[ctx.page])}</title>",
        f'<meta name="description" content="{escape(DESC[ctx.page])}">',
        '<meta name="color-scheme" content="light dark">',
        '<meta name="theme-color" content="#FFFFFA">',
        THEME_BOOT,
        f'<meta property="og:type" content="{"article" if ctx.page in ("ml", "lc", "wb") else "website"}">',
        f'<meta property="og:title" content="{escape(TITLE[ctx.page])}">',
        f'<meta property="og:description" content="{escape(DESC[ctx.page])}">',
        '<meta property="og:locale" content="en_US">',
        f'<meta property="og:image" content="{abs_url("/assets/og.png")}{OG_VERSION}">',
        '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">',
        '<meta name="twitter:card" content="summary_large_image">',
        '<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">',
        '<link rel="preload" href="/assets/fonts/mona-sans-latin-standard-normal.woff2" as="font" type="font/woff2" crossorigin>',
        '<link rel="stylesheet" href="/assets/fonts/fonts.css">',
        '<link rel="stylesheet" href="/assets/site.css">',
        '<script src="/assets/site.js" defer></script>',
        '<script src="/assets/header-gradient.js" defer></script>',
    ]
    if SITE_URL and ctx.page != "nf":
        parts += [f'<link rel="canonical" href="{abs_url(p)}">', f'<meta property="og:url" content="{abs_url(p)}">']
    if ctx.page == "home":
        parts.append(person_jsonld())
    if ctx.page == "fp":
        parts += ['<script src="/assets/tools/col-data.js" defer></script>', '<script src="/assets/tools/planner.js" defer></script>']
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
            f'<!doctype html><html lang="en" data-mode="static" data-theme="light"><head>{head_static(ctx)}</head>'
            f"<body>{diagrams.defs_svg()}{body(ctx)}{zoom_dialog()}</body></html>"
        )
    shutil.copy(ROOT / "src" / "site.css", out / "assets" / "site.css")
    shutil.copy(ROOT / "src" / "site.js", out / "assets" / "site.js")
    shutil.copy(ROOT / "src" / "header-gradient.js", out / "assets" / "header-gradient.js")
    (out / "assets" / "favicon.svg").write_text(diagrams.FAVICON)
    for _, f, _ in FACES:
        shutil.copy(FONT_DIR / f, out / "assets" / "fonts" / f)
    (out / "assets" / "fonts" / "fonts.css").write_text(font_css(lambda f: "./" + f))
    shutil.copy(SBS_IMG, out / "assets" / "sbs-evening-news.jpg")
    for f in (C.LC["video"]["file"], C.LC["video"]["poster"]):
        shutil.copy(ROOT / "assets-src" / f, out / "assets" / f)
    # Liquid glass on the nav (static build only; site.js loads these lazily on capable desktops).
    glass = out / "assets" / "vendor"
    glass.mkdir(parents=True, exist_ok=True)
    shutil.copy(VENDOR / "html2canvas-1.4.1" / "html2canvas.min.js", glass / "html2canvas.min.js")
    shutil.copy(VENDOR / "liquid-glass-js-78cb6cc" / "container.js", glass / "liquid-glass-container.js")
    tools = out / "assets" / "tools"
    tools.mkdir(parents=True, exist_ok=True)
    shutil.copy(ROOT / "src" / "planner.js", tools / "planner.js")
    shutil.copy(ROOT / "src" / "col-data.js", tools / "col-data.js")
    shutil.copy(VENDOR / "jspdf-2.5.2" / "jspdf.umd.min.js", tools / "jspdf.umd.min.js")
    for f in ("MonaSans-Regular.ttf", "MonaSans-Bold.ttf"):
        shutil.copy(VENDOR / "tools" / f, tools / f)
    if C.ABOUT["portrait"]:
        name = C.ABOUT["portrait"]["file"]
        shutil.copy(ROOT / "assets-src" / name, out / "assets" / name)
    og = ROOT / "assets-src" / "og.png"
    if og.exists():
        shutil.copy(og, out / "assets" / "og.png")
    (out / "robots.txt").write_text("User-agent: *\nAllow: /\n" + (f"Sitemap: {SITE_URL}/sitemap.xml\n" if SITE_URL else ""))
    if SITE_URL:
        (out / "sitemap.xml").write_text(
            '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
            + "".join(f"<url><loc>{abs_url(PATH[p])}</loc></url>" for p in ("home", "ml", "lc", "wb", "fp")) + "</urlset>"
        )
    return out


# ---------------------------------------------------------------------------
# artifact (single file, hash routes)
# ---------------------------------------------------------------------------
def artifact_tools():
    """The planner, its ZIP data, jsPDF, and the PDF fonts, inlined (the Artifact cannot load files)."""
    b64 = lambda f: base64.b64encode((VENDOR / "tools" / f).read_bytes()).decode()
    fonts = f'window.KP_PDF_FONTS={{regular:"{b64("MonaSans-Regular.ttf")}",bold:"{b64("MonaSans-Bold.ttf")}"}};'
    return (
        f"<script>{(ROOT / 'src' / 'col-data.js').read_text()}</script>\n"
        f"<script>{fonts}</script>\n"
        f"<script>{(VENDOR / 'jspdf-2.5.2' / 'jspdf.umd.min.js').read_text()}</script>\n"
        f"<script>{(ROOT / 'src' / 'planner.js').read_text()}</script>\n"
    )


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
        + THEME_BOOT + "\n"
        f'<meta name="description" content="{escape(C.META["home_desc"])}">\n'
        f"<style>{font_css_inline()}\n{css}</style>\n"
        + diagrams.defs_svg()
        + '<div id="app">' + "".join(views) + "</div>"
        + zoom_dialog()
        + '<script>document.documentElement.setAttribute("data-mode","spa");document.documentElement.setAttribute("lang","en");</script>'
        + f"<script>{js}</script>\n"
        + f"<script>{(ROOT / 'src' / 'header-gradient.js').read_text()}</script>\n"
        + artifact_tools()
    )
    (out / "index.html").write_text(html)
    return out


if __name__ == "__main__":
    s = build_static()
    a = build_artifact()
    print("static:", s)
    print("artifact:", a / "index.html", f"{(a / 'index.html').stat().st_size / 1024:.0f} KB")
