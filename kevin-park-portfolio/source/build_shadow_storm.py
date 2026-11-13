#!/usr/bin/env python3
"""Pack the Shadow Storm demo into one self-contained HTML file that opens from disk.

Reads src/shadow-storm/, bundles the scripts with three.js (vendor/three-0.187.0, MIT) using
esbuild, and inlines the styles, the Mona Sans fonts (OFL), and the hero art, hero video, and item art in assets/. No network requests at runtime.

    python3 build_shadow_storm.py            # writes ../../Claude outputs/Shadow Storm Demo.html
    python3 build_shadow_storm.py out.html   # or a path you choose

Needs Node.js; esbuild is fetched by npx on first run. build.py imports web() from here to place the hosted
version of the demo at /demo/shadow-storm/play/.
"""
import base64
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src" / "shadow-storm"
THREE = ROOT / "vendor" / "three-0.187.0" / "three.module.js"
FONTS = next(p for p in (ROOT / "vendor").glob("fontsource-variable-mona-sans-*") if p.is_dir()) / "package" / "files"
OUT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT.parent.parent / "Claude outputs" / "Shadow Storm Demo.html"
ESBUILD = "esbuild@0.28.2"
NOTICE = ("<!-- Shadow Storm demo. Bundled third-party code: three.js r187 (MIT). Typeface: Mona Sans (SIL OFL 1.1). "
          "The art and animation were generated with AI; the concept, flows, copy, and code are original to this demo. -->")


def bundle():
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "app.js"
        subprocess.run(
            ["npx", "--yes", ESBUILD, str(SRC / "ss-app.js"), "--bundle", "--format=iife", "--minify",
             "--target=es2020", "--legal-comments=inline", f"--alias:three={THREE}", f"--outfile={out}", "--log-level=warning"],
            check=True, cwd=ROOT,
        )
        return out.read_text()


def font_css():
    faces = (("normal", "mona-sans-latin-standard-normal.woff2"), ("italic", "mona-sans-latin-standard-italic.woff2"))
    return "".join(
        f'@font-face{{font-family:"Mona Sans";font-style:{style};font-weight:200 900;font-stretch:75% 125%;font-display:swap;'
        f'src:url(data:font/woff2;base64,{base64.b64encode((FONTS / f).read_bytes()).decode()}) format("woff2")}}'
        for style, f in faces
    )


def single(out=OUT):
    """One self-contained HTML file that opens from disk."""
    html = (SRC / "index.html").read_text()
    drop = ('<link rel="canonical"', '<link rel="icon"', '<link rel="preload"', '<link rel="modulepreload"',
            '<script type="importmap"', '<link rel="stylesheet" href="/assets/fonts/fonts.css">')
    html = "\n".join(line for line in html.split("\n") if not line.strip().startswith(drop))
    css = font_css() + (SRC / "ss.css").read_text()
    html = html.replace('<link rel="stylesheet" href="./ss.css">', f"<style>{css}</style>")
    html = html.replace('href="/"', 'href=""')  # no site to go back to when opened from disk; the stylesheet hides these
    js = bundle().replace("</script", "<\\/script")
    tag = '<script type="module" src="./ss-app.js"></script>'
    assert tag in html
    # Hero art and its looping video ride along as base64 so the file needs nothing else.
    assets = SRC / "assets"
    b64 = lambda f: base64.b64encode((assets / f).read_bytes()).decode()
    inline = {"poster": "data:image/jpeg;base64," + b64("hero.jpg") if (assets / "hero.jpg").exists() else "", "video": ""}
    if (assets / "hero.mp4").exists():
        inline["video64"] = b64("hero.mp4")
    if (assets / "logo.webp").exists():
        inline["logo"] = "data:image/webp;base64," + b64("logo.webp")
        html = html.replace(' src="./assets/logo.webp" data-logo', " data-logo")  # the script fills these in from SS_ASSETS
    inline["items"] = {f.stem: "data:image/webp;base64," + base64.b64encode(f.read_bytes()).decode() for f in sorted((assets / "items").glob("*.webp"))}
    html = html.replace(tag, "<script>window.SS_ASSETS=" + json.dumps(inline) + "</script>\n<script>" + js + "</script>")
    html = html.replace("<head>", "<head>\n" + NOTICE, 1)
    out = Path(out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html)
    return out


def web(out_dir, site_url=""):
    """The hosted version: index.html, ss.css, one bundled app.js, and the art in assets/.
    Fonts and the favicon come from the site's own /assets. build.py calls this for /demo/shadow-storm/play/."""
    out_dir = Path(out_dir)
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True)
    html = (SRC / "index.html").read_text()
    drop = ('<link rel="modulepreload"', '<script type="importmap"') + (() if site_url else ('<link rel="canonical"',))
    html = "\n".join(line for line in html.split("\n") if not line.strip().startswith(drop))
    html = html.replace("__SITE_URL__", site_url)
    tag = '<script type="module" src="./ss-app.js"></script>'
    assert tag in html
    html = html.replace(tag, '<script src="./app.js"></script>')
    html = html.replace("<head>", "<head>\n" + NOTICE, 1)
    if site_url:  # Vercel Web Analytics, production builds only (same tags as build.py's head_static)
        va = ('<script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};</script>\n'
              '<script defer src="/_vercel/insights/script.js"></script>\n')
        html = html.replace('<meta charset="utf-8">\n', '<meta charset="utf-8">\n' + va, 1)
        assert "_vercel/insights" in html
    (out_dir / "index.html").write_text(html)
    (out_dir / "app.js").write_text(bundle())
    shutil.copy(SRC / "ss.css", out_dir / "ss.css")
    shutil.copytree(SRC / "assets", out_dir / "assets")
    return out_dir


if __name__ == "__main__":
    f = single()
    print(f"{f}  {f.stat().st_size / 1024:.0f} KB")
