"""Original diagrams drawn for the site (neon edition).

Colors come from CSS classes; gradients come from one shared <defs> block
(defs_svg) placed once per document so ids never collide."""

import math
from html import escape


def _f(v):
    return f"{v:.1f}"


def defs_svg():
    return (
        '<svg class="kp-defs" width="0" height="0" aria-hidden="true" focusable="false">'
        "<defs>"
        '<linearGradient id="kp-grad-h" x1="0" y1="0" x2="1" y2="0">'
        '<stop offset="0" stop-color="#3D7BFF"/><stop offset=".45" stop-color="#8B5CF6"/>'
        '<stop offset=".8" stop-color="#FF3D8B"/><stop offset="1" stop-color="#FFB84D"/></linearGradient>'
        '<linearGradient id="kp-grad-v" x1="0" y1="0" x2="0" y2="1">'
        '<stop offset="0" stop-color="#3D7BFF"/><stop offset=".5" stop-color="#8B5CF6"/>'
        '<stop offset="1" stop-color="#FF3D8B"/></linearGradient>'
        "</defs></svg>"
    )


# ---------------------------------------------------------------------------
# Converging lines: many product details gathered into one line.
# ---------------------------------------------------------------------------
def lines_svg(n=16, w=480, h=300, cx=300):
    cy = h / 2
    paths = []
    for i in range(n):
        y0 = 18 + i * ((h - 36) / (n - 1))
        paths.append(
            f'<path d="M0 {_f(y0)}C{_f(w * 0.25)} {_f(y0)} {_f(w * 0.46)} {_f(cy + (y0 - cy) * 0.16)} {cx} {_f(cy)}"/>'
        )
    return (
        f'<svg class="lines" viewBox="0 0 {w} {h}" aria-hidden="true" focusable="false">'
        f'<g class="lines__thin">{"".join(paths)}</g>'
        f'<path class="lines__main" d="M{cx} {_f(cy)}H{w}"/>'
        f'<circle class="lines__node" cx="{cx}" cy="{_f(cy)}" r="5"/>'
        "</svg>"
    )


# ---------------------------------------------------------------------------
# Money Layer: a boundary that blocks value, then a layer value can cross.
# ---------------------------------------------------------------------------
def _arrowhead(x, y, size=8):
    return f'<path class="dg-head" d="M{_f(x)} {_f(y)}l{_f(-size)} {_f(-size * 0.62)}v{_f(size * 1.24)}z"/>'


def _tokens():
    return (
        '<g class="dg-tokens">'
        '<circle cx="78" cy="118" r="11"/><circle cx="118" cy="186" r="11"/>'
        '<circle cx="70" cy="252" r="11"/>'
        '<rect x="150" y="106" width="20" height="20" rx="3" transform="rotate(45 160 116)"/>'
        '<rect x="160" y="232" width="20" height="20" rx="3" transform="rotate(45 170 242)"/>'
        "</g>"
    )


def _accounts():
    return (
        '<g class="dg-accounts">'
        '<rect x="404" y="98" width="70" height="42" rx="8"/>'
        '<rect x="404" y="166" width="70" height="42" rx="8"/>'
        '<rect x="404" y="234" width="70" height="42" rx="8"/>'
        '<path d="M404 111h70M404 179h70M404 247h70"/>'
        "</g>"
    )


def money_layer_state(state, labels):
    game, fin, zbd = (escape(labels[k]) for k in ("game", "fin", "zbd"))
    parts = [
        f'<text class="dg-label" x="30" y="44">{game}</text>',
        f'<text class="dg-label" x="530" y="44" text-anchor="end">{fin}</text>',
        _tokens(),
        _accounts(),
    ]
    ys = (118, 186, 252)
    if state == "wall":
        parts.append('<rect class="dg-wall" x="264" y="70" width="32" height="228" rx="10"/>')
        for y, sx in zip(ys, (92, 132, 84)):
            parts.append(f'<path class="dg-flow dg-flow--blocked" d="M{sx} {y}H250"/>')
            parts.append(f'<path class="dg-stop" d="M255 {y - 10}v20"/>')
    else:
        parts.append(
            '<g class="dg-layer">'
            '<rect x="264" y="70" width="32" height="30" rx="8"/>'
            '<rect x="264" y="138" width="32" height="30" rx="8"/>'
            '<rect x="264" y="206" width="32" height="30" rx="8"/>'
            '<rect x="264" y="268" width="32" height="30" rx="8"/>'
            "</g>"
        )
        parts.append(f'<text class="dg-label dg-label--layer" x="280" y="336" text-anchor="middle">{zbd}</text>')
        for y, sx in ((118, 92), (186, 132), (252, 84)):
            gy = {118: 119, 186: 187, 252: 252}[y]
            parts.append(f'<path class="dg-flow dg-flow--open" d="M{sx} {y}C200 {y} 230 {gy} 280 {gy}S360 {y} 394 {y}"/>')
            parts.append(_arrowhead(400, y))
    return "".join(parts)


def money_layer_pair(labels):
    a = money_layer_state("wall", labels)
    b = money_layer_state("layer", labels)
    return (
        f'<div class="dg-pair" role="img" aria-label="{escape(labels["pair_alt"])}">'
        f'<div class="dg-state"><svg viewBox="0 0 560 350" aria-hidden="true" focusable="false">{a}</svg>'
        f'<p class="dg-state__cap"><span class="dot dot--stop"></span>{escape(labels["state_a"])}</p></div>'
        f'<div class="dg-state"><svg viewBox="0 0 560 350" aria-hidden="true" focusable="false">{b}</svg>'
        f'<p class="dg-state__cap"><span class="dot dot--go"></span>{escape(labels["state_b"])}</p></div>'
        "</div>"
    )


# ---------------------------------------------------------------------------
# Money Lifecycle: three stages on a loop.
# ---------------------------------------------------------------------------
def lifecycle_svg(aria):
    cx, cy, r = 260, 176, 118
    stages = [(-90, "Money In"), (30, "Money Through"), (150, "Money Out")]
    gap = 16
    parts = [f'<circle class="dg-ring" cx="{cx}" cy="{cy}" r="{r - 36}"/>']
    for idx, (ang, _) in enumerate(stages):
        nxt = stages[(idx + 1) % 3][0]
        if nxt <= ang:
            nxt += 360
        a0, a1 = math.radians(ang + gap), math.radians(nxt - gap)
        x0, y0 = cx + r * math.cos(a0), cy + r * math.sin(a0)
        x1, y1 = cx + r * math.cos(a1), cy + r * math.sin(a1)
        parts.append(f'<path class="dg-arc" d="M{_f(x0)} {_f(y0)}A{r} {r} 0 0 1 {_f(x1)} {_f(y1)}"/>')
        tx, ty = -math.sin(a1), math.cos(a1)
        nx, ny = -ty, tx
        s = 10
        p1 = (x1 + tx * 2, y1 + ty * 2)
        p2 = (x1 - tx * s + nx * s * 0.6, y1 - ty * s + ny * s * 0.6)
        p3 = (x1 - tx * s - nx * s * 0.6, y1 - ty * s - ny * s * 0.6)
        parts.append(f'<path class="dg-head dg-head--arc" d="M{_f(p1[0])} {_f(p1[1])}L{_f(p2[0])} {_f(p2[1])}L{_f(p3[0])} {_f(p3[1])}z"/>')
    for ang, name in stages:
        a = math.radians(ang)
        x, y = cx + r * math.cos(a), cy + r * math.sin(a)
        parts.append(f'<circle class="dg-node" cx="{_f(x)}" cy="{_f(y)}" r="8"/>')
        lx, ly = cx + (r + 26) * math.cos(a), cy + (r + 26) * math.sin(a)
        anchor = "middle"
        if ang == 30:
            anchor, lx, ly = "start", lx - 6, ly + 16
        elif ang == 150:
            anchor, lx, ly = "end", lx + 6, ly + 16
        else:
            ly -= 4
        parts.append(f'<text class="dg-label dg-label--stage" x="{_f(lx)}" y="{_f(ly)}" text-anchor="{anchor}">{name}</text>')
    return f'<svg class="dg-lc" viewBox="-30 0 580 360" role="img" aria-label="{escape(aria)}">' + "".join(parts) + "</svg>"


FAVICON = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3D7BFF"/>'
    '<stop offset=".55" stop-color="#8B5CF6"/><stop offset="1" stop-color="#FF3D8B"/></linearGradient></defs>'
    '<rect width="64" height="64" rx="16" fill="url(#g)"/>'
    '<path d="M12 22C26 22 30 32 38 32M12 42C26 42 30 32 38 32" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3"/>'
    '<path d="M38 32H52" stroke="#fff" stroke-width="5" stroke-linecap="round"/>'
    "</svg>"
)
