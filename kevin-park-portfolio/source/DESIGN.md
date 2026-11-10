---
name: Kevin Park, product marketing portfolio
description: A ledger read at night. Quiet ink chrome, blue for what you do, amber for where you are, a liquid glass nav, and color kept for the hero payment card and the case study diagrams.
colors:
  ink-0: "#0B0D14"
  ink-1: "#11141C"
  ink-2: "#1A1E28"
  ink-3: "#252A36"
  line: "rgb(238 240 245 / .08)"
  line-2: "rgb(238 240 245 / .14)"
  fg: "#EEF0F5"
  fg-2: "#A3A9B8"
  fg-3: "#858C9E"
  prose: "#D3D7E0"
  blue: "#0052FF"
  blue-hover: "#1F66FF"
  blue-ink: "#8FB0FF"
  lime: "#C8FF3D"
  lime-text: "#DFFF8A"
  pink: "#F2557F"
  amber: "#FFB547"
  amber-ink: "#2A1A00"
typography:
  hero: { fontFamily: "Mona Sans", fontSize: "clamp(2.5rem, 1rem + 4.4vw, 4.5rem)", fontWeight: 500, lineHeight: 1.04, letterSpacing: "-0.03em", fontStretch: "106%" }
  display: { fontFamily: "Mona Sans", fontSize: "clamp(2.25rem, 1.2rem + 3vw, 3.75rem)", fontWeight: 500, letterSpacing: "-0.025em", fontStretch: "106%" }
  headline: { fontFamily: "Mona Sans", fontSize: "clamp(2rem, 1.3rem + 2vw, 3rem)", fontWeight: 500, fontStretch: "106%" }
  title: { fontFamily: "Mona Sans", fontSize: "clamp(1.375rem, 1.1rem + .8vw, 1.75rem)", fontWeight: 500 }
  lead: { fontFamily: "Mona Sans", fontSize: "clamp(1.125rem, 1.05rem + .4vw, 1.3125rem)", fontWeight: 400, lineHeight: 1.45 }
  body: { fontFamily: "Mona Sans", fontSize: "1.0625rem", fontWeight: 400, lineHeight: 1.6 }
  prose: { fontFamily: "Mona Sans", fontSize: "1.125rem", fontWeight: 400, lineHeight: 1.72 }
  label: { fontFamily: "Mona Sans", fontSize: "0.8125rem", fontWeight: 500 }
rounded:
  tag: "6px"
  sm: "8px"
  control: "10px"
  inner: "12px"
  card: "16px"
  panel: "16px"
  payment-card: "20px"
spacing:
  grid: "4px"
  gutter: "clamp(16px, 4vw, 56px)"
  gap: "clamp(16px, 2vw, 28px)"
  section: "clamp(5rem, 11vw, 9rem)"
  nav-h: "56px"
  container: "1280px"
  measure: "38rem"
motion:
  ease: "cubic-bezier(0.22, 1, 0.36, 1)"
  feedback: "160ms"
  menus: "180ms"
  enter: "240ms"
---

# Design System: Kevin Park, product marketing portfolio

Unslopped on 2026-11-10. This replaces the "dark neon cards" direction from 2026-09-27: the four-hue gradient, the skewed band, glows, gradient tiles, pills everywhere and 700 to 820 weight headings are gone.

## Direction

- **Product.** A portfolio that shows fintech, payments and gaming hiring managers how Kevin turns complex money products into stories people remember.
- **Character.** Exact, warm, a little playful.
- **World.** Money in motion: payment cards, ledgers and transfer receipts, read at night.
- **Moments.** The hero payment card (matte blue, gold EMV chip, soft neutral shadow), and the case study diagrams, where lime means value moving and pink means a stop.
- **Signature.** Outcomes are set like ledger entries: lime figures with tabular numbers and a small lime dot where value moved (`mark.fig`).

## Color

- One dark theme on a faintly blue ink ramp (`ink-0` to `ink-3`). Hairlines are the primary text color at 8 and 14 percent.
- **Two themes** (added 2026-11-10, user). Dark is the ink ramp above. Light is an off-white page `#FFFFFA` with warm paper steps (`#F8F7F0`, `#F0EEE5`, `#E3E0D5`) and ink text `#1A1915` / `#55524A` / `#6C685E`. Both share every role: each theme remaps the tokens in `site.css` (`:root` and `:root[data-theme="light"]`), including `--fg-rgb` and `--bg-rgb` for hairlines and overlays. Where a color is used as text it gets a readable shade per theme: `--amber-text` is `#FFB547` on dark and `#8F5200` on light; lime text is `#3A5C00` on light; blue links are `#0040C9` on light.
- **Choosing a theme.** A boot script in `<head>` sets `data-theme` before paint: a saved choice (`localStorage` key `kp-theme`), else the system setting. The nav's sun/moon button switches it, saves the choice, and reveals the new theme in a circle that grows from the button (View Transitions, 560ms; instant under reduced motion).
- Three text roles: `fg`, `fg-2`, `fg-3`, plus `prose` for long reading.
- **Blue is what you do.** Coinbase blue `#0052FF` marks actions, done states and the field of finished work (the "Final work" specimen and naming lockup). White text on it holds 6.2:1.
- **Amber is where you are and what to notice** (added 2026-11-10, user: "use amber #FFB547 as a contrast to the page"). The word "story" in the hero, text selection and the caret, the reading progress bar, the current rail section and planner step, the dot on the current role, the tile link on hover, the pull-quote rule, and the closing card, which is a full amber field with ink text and an ink button (ink on amber holds 11:1). Amber also keeps its warning role in the planner, always with a text label.
- **Meaning colors** live only inside diagrams, figures and the planner: lime for value moving and savings, pink for a stop or an error.
- No hue gradients, gradient text, glows or colored shadows. The only gradients left are the payment card's light falloff, the chip's brushed gold, the 5 percent dot grid on diagram panels, and the slider fill.
- **The header gradient** (added 2026-11-10, user: "apply the gradient on the main headers"). The hero and every article header (case studies and planner) carry a moving 3D gradient: `src/header-gradient.js`, a dependency-free WebGL port of ShaderGradient's default plane (github.com/ruucm/shadergradient, MIT). It keeps the source's Perlin displacement and its `mix(mix(c1, c2, smoothstep(-3, 3, x)), c3, z)` color rule, and replaces three.js lighting with one key light and a soft highlight. Colors are tokens: dark `--sg-1 #0A2A93` (deep blue), `--sg-2 #FFB547` (amber), `--sg-3 #4F86FF` (lit ridges); light `#8DB0FF`, `#FFC46A`, `#FFFFFA`. A scrim in the page color covers the text side and fades the bottom into the page, so the color lives behind the payment card. It renders at 60 percent resolution, pauses offscreen and in background tabs, draws one still frame under reduced motion, and falls back to a static CSS gradient without WebGL.

## Type

- Mona Sans throughout. Display text at weight 500 and width 106 percent, body at 400 and normal width. Weights are 400 and 500 only.
- Tracking is 0 below display sizes; display text goes to -0.02 to -0.03em.
- No italic for emphasis.
- The hero word "story" carries a blue underline, the one marked word on the site.

## Shape and spacing

- Radii by size: tags 6, small rows 8, controls 10, inner items 12, cards and panels 16, the payment card 20. Inner radius follows outer minus padding.
- Padding, margins and gaps sit on a 4px grid.
- Buttons are 48px tall (36px in the nav), 20px side padding. Primary is blue with a soft top highlight; secondary is ink 1 with a hairline; on dark cards the primary can be the off-white `fg` with ink text.

## Components

- **Nav.** A floating 56px bar with a 12px radius. On static pages with a fine pointer it becomes liquid glass: liquid-glass-js (MIT, `vendor/liquid-glass-js-78cb6cc`) refracts a one-time html2canvas snapshot (`vendor/html2canvas-1.4.1`) of the page through WebGL, darkened with `brightness(.62)` so the links stay legible. Both scripts load lazily after the hero entrance. It is skipped on the planner (its content changes after load), in the Artifact build, under reduced motion or transparency, without WebGL, and on pages taller than one texture; after a width change it falls back. The fallback is ink at 88 percent with a 12px blur. The nav holds logo (a flat blue tile with the converging-lines mark), links on 36px rows, and a compact blue LinkedIn button. The Tools menu is a 16px ink 1 panel with a neutral shadow; item icons sit on ink 2 tiles.
- **Hero.** Role line, headline, sub and two actions on the left; the payment card on the right at rest tilt (no pointer tracking). Below 480px the card's line drawing hides so the chip and text have room.
- **Work tiles.** Ink 1 cards with a hairline; widths vary (7 and 5 columns, then full width for WireBarley). The diagram inside each tile is the color. Result chips are ink 2 with a hairline. Hover lifts the surface one step, no movement.
- **Experience.** Role cards on ink 1, the current one with a stronger hairline. Company badge and tags are 6px-radius ink 2 tags. Bullets are small muted squares.
- **Article.** Fact rows are 10px containers holding 6px tags. TL;DR is an ink 1 card with a stronger hairline. Figures sit on ink 0 dot-grid panels. The reading progress bar is a 2px blue line. Pull quotes and the planner note use a 2px `line-2` rule.
- **Storyboards** (WireBarley). Numbered steps on ink cards; the final step's number disc is blue.
- **Closing.** "Let's talk." in ink display type on the amber card with an ink LinkedIn button: the warm bookend to the blue card at the top.
- **Planner.** Same chrome. The budget bar leads with lime savings; needs and wants are neutral steps. The first action and the next account are outlined in blue. The email gate is an ink 1 card with an ink 2 input and an off-white button. The PDF's top strip is solid blue.

## Motion

- One curve, `cubic-bezier(0.22, 1, 0.36, 1)`. Color and surface changes at 160ms, menus at 180ms, the planner step enters with an 8px rise and fade over 240ms.
- **The one authored moment:** on load the hero assembles. Role line, headline and sub rise 12px out of a 4px blur over 560ms with a 70ms stagger, then the payment card lands from 32px below and 4 degrees off over 820ms.
- **The card answers the pointer.** On fine pointers it tilts up to 7 and 5 degrees toward the cursor on a small damped spring, with a neutral soft-light sheen following it, and settles back when the pointer leaves.
- Kept: small icon nudges on hover, a 0.97 press scale, the amber color change on tile links.
- **Value moves.** In the diagrams, the lime flows that cross the Money Layer and the Lifecycle loop march as dashes in the direction money travels (1.4s loop). They explain the diagram, so they loop; reduced motion stops them.
- **The header gradient drifts** slowly (ShaderGradient speed 0.12, about a third of its default).
- Removed for good: the drifting band, the closing card's gradient drift, tile lift on hover, the play button grow.
- Reduced motion turns off transitions, smooth scroll and view transitions.

## Don't

- Don't bring back hue gradients outside the header gradient, glows, pills on every control, or 700+ weights.
- Don't use lime or pink in the chrome; they mean something inside figures. Don't spend amber on decoration: it marks place and emphasis.
- Don't put liquid glass anywhere but the nav, or on content that changes after load.
- Don't hard-code colors: every surface, line and text color comes from a theme token so both themes stay whole.
