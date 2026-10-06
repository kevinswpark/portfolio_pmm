# Kevin Park portfolio

English-only product marketing portfolio built from the Notion brief "Kevin Park Website", the Notion case studies "The Money Layer for Games (EN)" and "The Money Lifecycle", Kevin's WireBarley case study file, and his resume. Version 2 uses the dark neon card direction.

## What's here

- `site/` is the deployable static site. Upload the folder to any static host at the domain root (Netlify, Vercel, Cloudflare Pages, GitHub Pages user site).
  - `/` home: hero, philosophy, selected work, experience, How I work, LinkedIn.
  - `/work/money-layer/` the first case study.
  - `/work/money-lifecycle/` the second case study, on how ZBD's products work together.
  - `/work/wirebarley/` the WireBarley case study on first-transfer conversion among customers aged 50+.
  - `/404.html` for every missing path. The old `/en/` and `/ko/` routes from version 1 no longer exist.
- `source/` rebuilds everything.
  - `src/content.py` holds all copy. Every string is tagged with its source (BRIEF, NOTION, RESUME, ZBD, or UI for added labels and buttons).
  - `src/diagrams.py` draws the original diagrams. `src/site.css` and `src/site.js` hold styles and runtime.
  - `build.py` writes `dist/site/` and the single-file Artifact preview `dist/artifact/index.html`.
  - `og.py` renders the social preview card (needs the local server running).
  - `serve.py`, `verify.py`, `verify_spa.py`, `final_shots.py`: local server, Playwright checks, and review screenshots.
  - `.impeccable/sources/` keeps dated copies of the source text the checks compare against. The resume excerpt has the contact line and ZBD figures removed.
  - `DESIGN.md` and `.impeccable/design.json` document the design system, derived from the shipped build.
  - `figma/` holds the Figma scripts. See `figma/README.md` for what is already in the file and what is left to run.

## Before you deploy

1. Set your domain so canonical, Open Graph, and sitemap URLs become absolute:
   `KP_SITE_URL=https://kevinpark.xyz python3 build.py` (the bundled site/ was built this way)
2. Rebuild the social card if copy changed: `python3 serve.py dist/site 8765 &` then `python3 og.py`.

## Rebuild and check

```
python3 build.py
python3 serve.py dist/site 8765 &
python3 verify.py       # 96 static site checks, including verbatim copy against the sources
python3 verify_spa.py   # Artifact build checks
```

Requires Python 3.11 and Playwright with Chromium. Mona Sans is self-hosted from the npm Fontsource package in `vendor/`. Icons are Phosphor (regular), inlined as SVG.

## Content rules the checks enforce

- LinkedIn is the only contact route. No email, phone, or address appears anywhere.
- ZBD pipeline, attribution, and retention figures stay off the site. Finfare and WireBarley outcomes appear word for word from the resume.
- No Korean text in the build.
