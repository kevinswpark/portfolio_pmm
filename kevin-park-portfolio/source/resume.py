#!/usr/bin/env python3
"""Render the one-page resume the site hands out: assets-src/Kevin-Park-Resume.pdf.

Condensed from "Kevin Park Master Resume (Extended)" (2026-11-06). The PDF sits at a public URL
behind a form, so it follows the site's content rules: no phone number, and no ZBD pipeline,
attribution, or retention figures. Edit R below, run `python3 resume.py`, then rebuild the site.
Needs Google Chrome (headless print). Text stays selectable, so applicant tracking systems can read it.
"""
import subprocess
import sys
import tempfile
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent
FONT_DIR = next(p for p in (ROOT / "vendor").glob("fontsource-variable-mona-sans-*") if p.is_dir()) / "package" / "files"
OUT = ROOT / "assets-src" / "Kevin-Park-Resume.pdf"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

R = {
    "name": "Kevin Park",
    "contact": [
        ("kevinpark37@gmail.com", "mailto:kevinpark37@gmail.com"),
        ("linkedin.com/in/kevinswpark", "https://www.linkedin.com/in/kevinswpark"),
        ("kevinpark.xyz", "https://kevinpark.xyz"),
    ],
    "summary": (
        "Senior Product Marketing Manager with 6+ years across payments, digital banking, remittances, and gaming fintech. "
        "Founding product marketer at three fintech startups. I turn complex products into clear positioning and messaging, "
        "then build the websites, sales materials, videos, and demos that help people understand them."
    ),
    "roles": [
        {
            "company": "ZBD", "kind": "B2B fintech", "place": "Remote",
            "title": "Senior Product Marketing Manager", "dates": "May 2025 – Present",
            "note": "Licensed fintech providing payments, payouts, and rewards infrastructure for game studios and publishers.",
            "bullets": [
                "Repositioned ZBD from consumer Bitcoin branding to premium B2B fintech, supporting its $40M Series C. Created “The Money Layer for Games” positioning, now the headline on ZBD’s homepage.",
                "Built ZBD’s first company-wide messaging system across four products, aligning Marketing, Business Development, Product, and Compliance on one set of positioning, naming, tone of voice, and commercial claims.",
                "Created the Money In, Money Through, Money Out lifecycle to explain how ZBD’s products work together; leadership adopted it across sales decks, the homepage, and the August 2026 platform launch.",
                "Developed a 15-segment ideal customer profile framework and turned research from 195 game studios into case studies and sales proof points.",
                "Led Gamescom 2026 marketing across four product pages, a product video, and a playable demo of pre-launch payment flows used in live sales conversations.",
                "Built a Claude-powered intelligence system tracking 29 competitors and 90+ target accounts, turning market news and HubSpot data into automated executive briefings for sales prioritization.",
            ],
        },
        {
            "company": "Finfare", "kind": "B2B and B2C digital banking and investments", "place": "Irvine, CA",
            "title": "Product Marketing Manager", "dates": "Feb 2024 – Jan 2025",
            "note": "",
            "bullets": [
                "Led go-to-market for two products, digital banking and automated investing, translating 30+ customer interviews and six personas into positioning, messaging, and launch plans.",
                "Increased website engagement 36% and conversion 24% by leading a 20-page redesign with Product and UX.",
                "Built messaging and sales enablement for Finfare Rewards, supporting a network of 3,000+ merchant partners.",
                "Helped secure The Bank of Missouri’s first fintech partnership by positioning Finfare’s platform security and stability for banking partners.",
            ],
        },
        {
            "company": "WireBarley", "kind": "B2B2C cross-border payments", "place": "Los Angeles, CA and Vancouver, BC",
            "title": "Product Marketing Manager", "dates": "Jun 2020 – Jan 2024",
            "note": "First US marketing hire. Joined as Marketing Analyst; promoted to Lead Marketing Analyst, then Product Marketing Manager.",
            "bullets": [
                "Generated $40M in holiday remittance volume with English and Korean campaigns, helping make WireBarley the Korean American market leader.",
                "Lifted first-transfer conversion among customers aged 50+, the most profitable segment, from 20% to nearly 50% with a Korean-language TV commercial built from support call insights.",
                "Delivered 300% year-over-year US growth on 40% of the previous year’s North American marketing budget.",
                "Improved conversion to first transfer 43% and cut customer acquisition costs 45% year over year through A/B testing and AI-assisted copy across email, social, ads, and product.",
                "Scaled the Nepal corridor to $5M in peak weekly remittance volume and 300% year-over-year transaction growth through product improvements and partnerships.",
            ],
        },
    ],
    "work_h": "Selected work",
    "work": [
        ("The Money Layer for Games (ZBD)", "How I developed ZBD’s positioning from a visual metaphor.", "https://kevinpark.xyz/work/money-layer/"),
        ("The Money Lifecycle (ZBD)", "Explaining how ZBD’s products work together by following money into, through, and out of a game.", "https://kevinpark.xyz/work/money-lifecycle/"),
        ("Driving tech adoption (WireBarley)", "Helping Korean American customers aged 50+ make their first digital transfer.", "https://kevinpark.xyz/work/wirebarley/"),
    ],
    "skills": [
        ("Product marketing", "Go-to-market strategy, positioning and messaging, product naming, product launches, sales enablement"),
        ("Research and analytics", "Customer interviews, personas, ICP segmentation, competitive intelligence, A/B testing"),
        ("Tools", "Tableau, Excel, R, Google Analytics, HubSpot, Figma, Notion, Claude Code"),
        ("Languages", "English and Korean, bilingual"),
    ],
    "education": ("Bachelor of Commerce, UBC Sauder School of Business", "Vancouver, BC", "Marketing, with a Business Analytics concentration"),
}

CSS = """
@font-face{font-family:"Mona Sans";font-style:normal;font-weight:200 900;font-stretch:75%% 125%%;src:url("%(font)s") format("woff2")}
@font-face{font-family:"Mona Sans";font-style:italic;font-weight:200 900;font-stretch:75%% 125%%;src:url("%(italic)s") format("woff2")}
@page{size:Letter;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html{font-family:"Mona Sans",Helvetica,Arial,sans-serif;font-size:9pt;line-height:1.33;color:#1A1915;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{width:8.5in;height:11in;padding:.4in .55in .36in;overflow:hidden}
a{color:inherit;text-decoration:none}
header{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;padding-bottom:9px;border-bottom:1.5px solid #1A1915}
h1{font-size:23pt;line-height:1;font-weight:600;font-stretch:106%%;letter-spacing:-.02em}
.role{margin-top:5px;font-size:9.6pt;font-weight:500;color:#0040C9}
.contact{text-align:right;font-size:8.7pt;line-height:1.5;color:#2B2A25}
h2{margin:10px 0 4px;font-size:8.2pt;font-weight:650;letter-spacing:.09em;text-transform:uppercase;color:#0040C9}
.summary{color:#2B2A25}
.job{margin-top:7px}
.job:first-of-type{margin-top:0}
.job__top{display:flex;justify-content:space-between;align-items:baseline;gap:16px}
.job__co{font-size:10.2pt;font-weight:650}
.job__kind{font-weight:400;color:#55524A;font-size:9.1pt}
.job__dates{font-weight:500;white-space:nowrap;font-variant-numeric:tabular-nums}
.job__title{font-weight:550}
.job__note{font-style:italic;color:#55524A}
ul{margin-top:2px;padding-left:13px;list-style:disc}
li{margin-top:1.5px;padding-left:1px}
li::marker{font-size:.85em}
.rows p{margin-top:1.6px}
.rows b{font-weight:600}
.nb{white-space:nowrap}
.edu b{font-weight:600}
.edu span{color:#55524A}
"""


def keep(text):
    """Stop a line from breaking inside a hyphenated term, which would garble copied text."""
    return text.replace("AI-assisted", '<span class="nb">AI-assisted</span>')


def html():
    e = escape
    uri = lambda f: (FONT_DIR / f).resolve().as_uri()
    css = CSS % {"font": uri("mona-sans-latin-standard-normal.woff2"), "italic": uri("mona-sans-latin-standard-italic.woff2")}
    contact = "<br>".join(f'<a href="{u}">{e(t)}</a>' for t, u in R["contact"])
    jobs = ""
    for j in R["roles"]:
        note = f'<p class="job__note">{e(j["note"])}</p>' if j["note"] else ""
        jobs += (
            '<section class="job">'
            f'<div class="job__top"><p class="job__co">{e(j["company"])} <span class="job__kind">| {e(j["kind"])} | {e(j["place"])}</span></p>'
            f'<p class="job__dates">{e(j["dates"])}</p></div>'
            f'<p class="job__title">{e(j["title"])}</p>{note}'
            "<ul>" + "".join(f"<li>{keep(e(b))}</li>" for b in j["bullets"]) + "</ul></section>"
        )
    work = "".join(f'<p><a href="{u}"><b>{e(t)}:</b></a> {e(d)}</p>' for t, d, u in R["work"])
    skills = "".join(f"<p><b>{e(k)}:</b> {e(v)}</p>" for k, v in R["skills"])
    ed = R["education"]
    return (
        '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Kevin Park, Senior Product Marketing Manager</title>'
        f"<style>{css}</style></head><body>"
        f'<header><div><h1>{e(R["name"])}</h1><p class="role">Senior Product Marketing Manager</p></div><p class="contact">{contact}</p></header>'
        f'<h2>Summary</h2><p class="summary">{e(R["summary"])}</p>'
        f"<h2>Experience</h2>{jobs}"
        f'<h2>{e(R["work_h"])}</h2><div class="rows">{work}</div>'
        f'<h2>Skills</h2><div class="rows">{skills}</div>'
        f'<h2>Education</h2><p class="edu"><b>{e(ed[0])}</b> <span>| {e(ed[1])}</span> | {e(ed[2])}</p>'
        "</body></html>"
    )


def main():
    if not Path(CHROME).exists():
        sys.exit("Google Chrome is needed to print the resume PDF.")
    with tempfile.TemporaryDirectory() as tmp:
        src = Path(tmp) / "resume.html"
        src.write_text(html(), encoding="utf-8")
        subprocess.run(
            [CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--virtual-time-budget=4000",
             f"--user-data-dir={tmp}/profile", f"--print-to-pdf={OUT}", src.as_uri()],
            check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
    print("resume:", OUT, f"{OUT.stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    main()
