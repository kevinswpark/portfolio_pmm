# Shadow Storm

A fictional game store with an embedded wallet, built as a portfolio demo. The game, its clans, players, prices, fees, and balances are invented.

- `assets/hero.jpg` and `assets/hero.mp4` are the home-screen key art and its 5-second looping animation, generated with Higgsfield (see below).
- `assets/items/*.webp` are the 28 item icons (384 px, transparent), also generated with Higgsfield and sliced from seven 2x2 sheets.
- `ss-gfx.js` is the fallback: it builds the same 28 items and a real-time hero scene in code with three.js, used only when the art files are missing.
- `ss-data.js` holds the sample catalog and copy. `ss-app.js` runs the store, inventory, marketplace, training round, and wallet. `ss.css` is the styling.
- Pack it into one file that opens from disk: `python3 ../../build_shadow_storm.py` (from this folder), or `python3 build_shadow_storm.py` from `source/`.

## What it uses

| Part | Source | License |
|---|---|---|
| Code, fallback 3D models, UI icons, copy | Written for this demo | Kevin's own |
| Item icons (`assets/items/`) | AI-generated on Kevin's Higgsfield account, 2026-11-12, model GPT Image 2.6 with a transparent background, seven sheets of four. Jobs `20eea7dd`, `c8b4f58a`, `cc6cf5cd`, `5643ba56`, `4e2dcc98`, `c1314023`, `5da5c66e` | Per Higgsfield's terms for the account's plan |
| Hero key art (`hero.jpg`) | AI-generated on Kevin's Higgsfield account, 2026-11-12, model GPT Image 2.6, job `8011215d-8f34-484b-93e7-644edf055af7` | Per Higgsfield's terms for the account's plan |
| Hero animation (`hero.mp4`) | AI-generated from the key art on the same account, model Seedance 2.0 Mini, 5 s, 720p, no audio, job `88ec6e10-a21f-4379-9ea2-f8b921dec586` | Per Higgsfield's terms for the account's plan |
| three.js r187 | `vendor/three-0.187.0` (npm `three@0.187.0`) | MIT |
| Mona Sans | `vendor/fontsource-variable-mona-sans-5.3.0` | SIL OFL 1.1 |

Nothing from the original trade-show demo is reused: no code, images, logos, fonts, names, or copy.

## Hero art prompt

The key art prompt asked for an original adult ninja in a dark indigo outfit with a plain red headband and scarf, crouched on a tiled rooftop under a full moon, in a modern TV-anime cel-shaded style, with the left of the frame kept dark for the UI. It named no artist, studio, franchise, or existing character, and excluded text, logos, emblems, and facial markings. The animation prompt asked for a locked camera with only the scarf, leaves, clouds, and mist moving, ending on the first frame.
