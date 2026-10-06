---
name: Kevin Park, product marketing portfolio
description: Dark neon cards. A modern money app's vocabulary (card, chip, pill, glowing figure) with a Stripe-style gradient band and Coinbase-blue actions.
colors:
  ink-0: "#08080C"
  ink-1: "#111117"
  ink-2: "#191922"
  ink-3: "#22222E"
  panel-ink: "#0C0C12"
  line: "rgb(255 255 255 / .08)"
  line-2: "rgb(255 255 255 / .14)"
  fg: "#F4F4F7"
  fg-2: "#B6B6C8"
  fg-3: "#8C8CA2"
  prose: "#DADAE4"
  white: "#FFFFFF"
  white-hover: "#E9E9F2"
  blue: "#0052FF"
  blue-hover: "#1F66FF"
  blue-ink: "#8FB0FF"
  grad-blue: "#2F6BFF"
  grad-violet: "#7B3FF2"
  tile-violet: "#5B45F5"
  violet: "#8B5CF6"
  violet-soft: "#A78BFA"
  pink: "#FF3D8B"
  amber: "#FFB84D"
  lime: "#C8FF3D"
  lime-text: "#DFFF8A"
  lime-ink: "#0B0D05"
  cyan: "#2DE2E6"
typography:
  hero:
    fontFamily: "Mona Sans, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(2.75rem, 1rem + 5.4vw, 6rem)"
    fontWeight: 720
    lineHeight: 0.98
    letterSpacing: "-0.04em"
    fontVariation: "'wdth' 116"
  display:
    fontFamily: "Mona Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.375rem, 1.3rem + 3.8vw, 4.75rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.035em"
    fontVariation: "'wdth' 112"
  headline:
    fontFamily: "Mona Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.3rem + 2.6vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.035em"
    fontVariation: "'wdth' 114"
  article-heading:
    fontFamily: "Mona Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.625rem, 1.2rem + 1.4vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.03em"
    fontVariation: "'wdth' 110"
  title:
    fontFamily: "Mona Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.375rem, 1.1rem + 0.9vw, 1.875rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 108"
  lead:
    fontFamily: "Mona Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.1875rem, 1.05rem + 0.5vw, 1.4375rem)"
    fontWeight: 400
    lineHeight: 1.45
    fontVariation: "'wdth' 100"
  body:
    fontFamily: "Mona Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
    fontVariation: "'wdth' 100"
  prose:
    fontFamily: "Mona Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.72
    fontVariation: "'wdth' 100"
  small:
    fontFamily: "Mona Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  label:
    fontFamily: "Mona Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.005em"
rounded:
  pill: "999px"
  closing: "36px"
  card: "28px"
  hero-card: "24px"
  dialog: "24px"
  panel: "20px"
  list-card: "16px"
  sm: "12px"
  figure-chip: "7px"
spacing:
  gutter: "clamp(16px, 4.2vw, 56px)"
  gap: "clamp(16px, 2vw, 28px)"
  section: "clamp(5.5rem, 12vw, 10rem)"
  stack: "14px"
  actions: "12px"
  nav-h: "60px"
  container: "1280px"
  measure: "38rem"
  flow-max: "54rem"
  rail: "15rem"
components:
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.blue-hover}"
  button-ghost:
    backgroundColor: "rgb(255 255 255 / .02)"
    textColor: "{colors.fg}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "52px"
  button-white:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink-0}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "52px"
  button-white-hover:
    backgroundColor: "{colors.white-hover}"
  button-compact:
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "44px"
  pill:
    backgroundColor: "rgb(255 255 255 / .07)"
    textColor: "{colors.fg}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "28px"
  figure-chip:
    backgroundColor: "rgb(200 255 61 / .12)"
    textColor: "{colors.lime-text}"
    rounded: "{rounded.figure-chip}"
    padding: "1px 7px"
  result-chip:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink-0}"
    rounded: "{rounded.pill}"
    padding: "6px 16px"
    height: "40px"
  tile-finished:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.white}"
    rounded: "{rounded.card}"
    padding: "clamp(22px, 3vw, 40px)"
  tile-in-progress:
    backgroundColor: "{colors.ink-1}"
    textColor: "{colors.fg}"
    rounded: "{rounded.card}"
    padding: "clamp(22px, 3vw, 40px)"
  card:
    backgroundColor: "{colors.ink-1}"
    textColor: "{colors.fg-2}"
    rounded: "{rounded.card}"
    padding: "clamp(20px, 2.6vw, 30px)"
  panel:
    backgroundColor: "{colors.panel-ink}"
    rounded: "{rounded.panel}"
    padding: "clamp(14px, 2.4vw, 28px)"
  bento-cell:
    backgroundColor: "{colors.ink-1}"
    textColor: "{colors.fg}"
    rounded: "{rounded.card}"
    padding: "clamp(22px, 2.6vw, 32px)"
  bento-cell-lime:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.lime-ink}"
    rounded: "{rounded.card}"
  closing-card:
    textColor: "{colors.white}"
    rounded: "{rounded.closing}"
    padding: "clamp(2.5rem, 7vw, 6rem) clamp(1.5rem, 6vw, 5rem)"
  nav:
    backgroundColor: "rgb(17 17 23 / .72)"
    rounded: "{rounded.pill}"
    height: "{spacing.nav-h}"
---

# Design System: Kevin Park, product marketing portfolio

## Overview

**Creative North Star: "The Card You Want to Pick Up"**

The work is presented the way a modern money app presents a product: one vivid card, figures that glow, and a calm near-black ground that lets color do the selling. The vocabulary is fintech app hardware (card, chip, pill, glowing figure) with two borrowed signatures: a Stripe-style skewed gradient band and Coinbase-blue actions. It refuses the light editorial portfolio with thumbnails and an about blurb.

Density is generous. Sections breathe on a large vertical rhythm, cards are big and rounded, and color arrives in a few saturated fields rather than scattered accents. Motion is slow and physical: a band that drifts, a card that tilts toward the pointer and settles back, a statement that brightens as it scrolls in.

The site ships one theme, dark, on purpose. There is no light mode and no theme toggle; `color-scheme: dark` is declared at the root.

**Key Characteristics:**
- Single deliberate dark theme on a four-step ink ladder.
- One brand gradient, with a cool variant for every text-bearing surface.
- Coinbase blue for actions and for finished work.
- Signal lime only where value is moving or a figure is lit.
- Pills for controls, 28px cards, 20px panels, one 36px closing card.
- Mona Sans throughout: expanded bold display, normal-width body.

## Colors

A near-black ink ladder carries saturated fields of blue, gradient, and lime; everything else is hairline white.

### Primary
- **Coinbase Blue** (`blue`): The action color. Primary buttons, the nav "Connect on LinkedIn" pill, the skip link, text selection, and the field of finished work (the Money Layer tile). Hover lifts to **Bright Blue** (`blue-hover`). **Pale Blue** (`blue-ink`) is the focus ring and caret.

### Secondary
- **The Brand Gradient** (`linear-gradient(115deg, #2F6BFF 0%, #7B3FF2 38%, #FF3D8B 72%, #FFB84D 100%)`): blue to violet to pink to amber. Used where no text sits on it: the TL;DR border, the article reading-progress bar, and (as a flowing multi-stop variant) the skewed band.
- **The Cool Gradient** (`linear-gradient(115deg, #2F6BFF 0%, #7B3FF2 55%, #FF3D8B 100%)`): the same sweep without amber. Used on every gradient surface that carries text: the "story" pill in the hero headline, the closing card, the gradient bento cell, the "Final work" specimen panel, the gradient fact value, and the gradient hairline borders on the in-progress tile and the current role card.

### Tertiary
- **Signal Lime** (`lime`): value in motion. Open flows and arrowheads in diagrams, the "go" legend dot, the proof status dot, and one How I work cell. On a dark ground it appears as the lit figure chip: **Lime Text** (`lime-text`) on lime at 12 percent. On a lime field, text is **Lime Ink** (`lime-ink`).
- **Amber** (`amber`): the status dot only, with a 16 percent amber halo.
- **Signal Pink** (`pink`): blockage in diagrams (the wall, stop marks, "stop" dot).
- **Diagram Cyan** (`cyan`) and **Soft Violet** (`violet-soft`): token and account shapes inside diagrams only.
- **Violet** (`violet`): the pull-quote rule and the 404 numeral.

### Neutral
- **Ink 0** (`ink-0`): page ground, html background, scrollbar track.
- **Ink 1** (`ink-1`): raised cards, role cards, bento cells, issue cards, zoom dialog.
- **Ink 2** (`ink-2`): nested fills inside cards (fact values, chips, active rail link, round arrow button).
- **Ink 3** (`ink-3`): hover lift on nested fills, scrollbar thumb.
- **Panel Ink** (`panel-ink`): diagram panels, under an 18px dot grid at 7 percent white.
- **Hairlines** (`line`, `line-2`): 8 percent white for resting borders and dividers, 14 percent for control borders and emphasis.
- **Text** (`fg`, `fg-2`, `fg-3`, `prose`): primary, secondary, tertiary, and the slightly dimmed long-form reading color.

### Named Rules
**The One Dark Theme Rule.** There is one theme and it is dark. Do not add a light mode, a toggle, or light-ground sections.

**The Cool Text Rule.** Any gradient surface that carries text uses the cool gradient. The full gradient, with amber, is reserved for surfaces with no text on them (borders, the progress bar, the band).

**The Blue Means Done Rule.** Coinbase blue is the action color and the field of finished work. In-progress work never sits on a blue field.

**The Lime Moves Rule.** Lime marks value that moves or a figure worth lighting. It never becomes a general accent, a link color, or a heading color.

## Typography

**Display Font:** Mona Sans (variable, weight 200 to 900, width 75 to 125 percent), with ui-sans-serif, system-ui fallbacks
**Body Font:** Mona Sans at normal width (100 percent)

**Character:** One family doing two jobs. Width is set with `font-stretch` (the frontmatter `wdth` values are the same numbers: `font-stretch: 116%` equals `'wdth' 116`). Display type is set bold and expanded, 106 to 125 percent wide, with tight negative tracking; body type returns to normal width so reading stays easy.

### Hierarchy
- **Hero** (720, `hero` clamp, 0.98, width 116): the homepage headline only, max 16ch.
- **Display** (700 to 720, `display` clamp, 1.02 to 1.04, width 112 to 114): the philosophy statement (max 20ch) and article titles (max 16ch).
- **Headline** (700, `headline` clamp, 1.02, width 114): section headings on the homepage; 404 heading at width 112.
- **Article heading** (700, 1.12, width 110): section heads inside the case study flow, max 36rem.
- **Title** (700, `title` clamp, 1.12 to 1.15, width 106 to 108): tile headings and role titles.
- **Strength line** (600, clamp(1.125rem, 1rem + .4vw, 1.375rem), 1.3, width 104): How I work cells.
- **Lead** (400, `lead` clamp, 1.45 to 1.5): hero sub, deck, profile, statement body, in secondary text color.
- **Body** (400, 1.0625rem, 1.6) and **Prose** (400, 1.125rem, 1.72, 38rem measure).
- **Small** (0.875rem) and **Label** (600, 0.8125rem): status lines, captions, pills, facts keys.
- **Brand marks** (800, width 120 to 125): the ZBD mark on the hero card and the 404 numeral.

### Named Rules
**The Wide Display Rule.** Headings are expanded (width 106 or more) and bold (650 or more). Body text is never expanded.

**The Sentence Case Rule.** No uppercase labels. Headings, labels, and pills are sentence case; letter-spacing on labels stays at or below 0.04em.

## Layout

A 1280px container with a fluid gutter (`gutter`) and a 12-column grid with a fluid gap (`gap`). Sections are separated by `section` spacing. Card stacks (roles, bento, extras) use a fixed 14px gap.

The hero spans the headline across all 12 columns, with the supporting text in columns 1 to 6 and the tilted card in columns 8 to 12. Below 900px the card moves under the text, centered at up to 400px. The selected work grid puts the finished tile in 7 columns and the in-progress tile in 5; both go full width below 1080px. The bento is a 6-column grid (two cells of 3 over three cells of 2), then 2 columns below 900px with the lime cell spanning, then 1 column below 640px.

The article is a two-column grid: a 15rem sticky section rail and a flow column capped at 54rem. Prose, issue lists, and the pull quote hold a 38rem measure; figures break out to the full 54rem flow width. The rail hides below 1080px. All three case studies use this article.

The nav is a floating pill 12px below the safe area, 60px tall, max 1180px wide. Scroll padding accounts for it.

## Elevation & Depth

Depth comes from the ink ladder and hairlines first. Shadows are soft, colored, and reserved for things that glow or float; there are no hard offset shadows.

### Shadow Vocabulary
- **Floating glass** (`inset 0 1px 0 rgb(255 255 255 / .06), 0 16px 40px -20px rgb(0 0 0 / .8)` plus `blur(20px) saturate(160%)`): the nav only. Falls back to solid ink 1 without backdrop-filter support or under reduced transparency.
- **Card glow** (`0 50px 90px -40px rgb(47 107 255 / .6), 0 30px 60px -30px rgb(255 61 139 / .45)`): the hero card only.
- **Story glow** (`0 10px 40px -12px rgb(123 63 242 / .7)`): the story pill in the headline.
- **Figure glow** (`0 2px 14px -4px rgb(200 255 61 / .35)`): the lit figure chip.
- **Dot halo** (`0 0 0 4px` at 16 to 18 percent of the dot color): status, go, stop, and proof dots.
- **Dialog** (`0 40px 100px -30px rgb(0 0 0 / .9)`): the zoom dialog, over an ink backdrop at 72 percent with 6px blur.

### Named Rules
**The Glow Not Drop Rule.** Shadows are colored light, large and negative-spread. No hard edges, no offset drops.

## Shapes

**The Shape Rule.** Controls are pills (999px): buttons, nav, nav links, pills, tags, chips, facts, the result chip. Cards are 28px: tiles, role cards, extras cards, bento cells, TL;DR, the gradient specimen panel. Panels are 20px: diagram panels and evidence cards. The closing card alone is 36px. Circular 44 to 48px buttons carry icon-only actions (zoom, close, tile arrow). Smaller radii are for small nested things: 24px hero card and dialog, 16px issue cards, 12px rail links, 7px figure chips.

**The Hard Band Rule.** The skewed band is the one shape with hard edges: a strip skewed -11deg with crisp diagonal top and bottom, a thin 10 percent white stripe near its left end, and a mask that fades it only toward the left edge. It never gets rounded corners or soft top and bottom edges.

Gradient hairline borders are drawn with a padding-box ink fill over a border-box gradient on a 1px transparent border.

## Components

### Buttons
Confident, round, and quiet on hover.
- **Shape:** full pill (999px), 52px tall, 22px side padding; compact 44px tall, 16px padding.
- **Primary:** Coinbase blue with white text, weight 600. Hover to bright blue.
- **Ghost:** 2 percent white fill, 14 percent border; hover to 7 percent fill and 24 percent border.
- **White:** white with ink text, used on the gradient closing card; hover to `white-hover`.
- **States:** 160ms color transitions; press scales to 0.97. Trailing icons nudge on hover (down 2px, out 2px diagonal, next 3px). Focus is a 2px pale-blue outline at 3px offset. Hover effects apply only on hover-capable fine pointers.
- **Mobile:** below 620px the nav button collapses to a 44px round icon button with its text kept for screen readers.

### Pills and status lines
- **Pill:** 28px tall, label type, 7 percent white fill, 14 percent border. Used as figure caption labels and fact keys, never above a heading.
- **Status line:** in place of a pill above a heading, state is a plain line of small text in secondary color led by a 7px amber dot with a 4px halo ("Case study in progress"). It sits after the tile's description. No page uses it right now; it is kept for unfinished work.

### The lit figure chip
Resume figures are marked, not bolded: lime text on lime at 12 percent, weight 650, 7px radius, soft lime glow, no wrapping. Used only on quantified outcomes in prior roles.

### Tiles
- **Finished tile:** a blue field (`linear-gradient(150deg, #0052FF 0%, #2F6BFF 55%, #5B45F5 100%)`), white text, descriptions at 86 percent white, a white result chip, and an impact line with a 40 percent white left rule. Its diagram sits directly on the blue field on a 16 percent white dot grid; it is never nested inside a dark panel.
- **Second finished tile:** The Money Lifecycle sits on a violet field (`linear-gradient(150deg, #5B45F5 0%, #7B3FF2 50%, #A8329E 100%)`) with the same anatomy as the blue tile. Its result is three white chips in a row (Money In, Money Through, Money Out), and its loop diagram is drawn in white on the same dot grid. The magenta end stops at #A8329E so white text holds 5.8:1.
- **WireBarley tile:** full width below the two ZBD tiles, text left and art right (stacking below 900px). A warm field (`linear-gradient(150deg, #FFB84D 0%, #FF7A6B 48%, #FF3D8B 100%)`) carries ink text, an ink result chip with white text, and an ink impact rule. Ink on the pink end holds 6:1; white text is never used on this field. The art is a vertical four-step list on 34 percent white rows, the last step inverted to ink. Warm marks the earlier company; blue and violet mark ZBD.
- **In-progress tile (reserved):** ink 1 fill with a cool-gradient hairline border, a status line, and a 48px round arrow button in the top right. Not in use.
- **Shared:** 28px radius, whole tile clickable through the heading link, focus ring on the tile, hover lifts 4px (300ms) and slides the arrow 4px.
- **Compact:** on "Next case study" and "Previous case study" rows the tile spans full width in two columns, stacking below 900px.

### Bento
The How I work section: three statements as equal cells, no icons, no numbering, one column below 900px. Cells are ink 1, the cool gradient, and signal lime (lime ink text), in that order. Text is bottom-aligned at strength-line size, minimum height 190px.

### Role cards
28px ink 1 cards with a 13rem date column and a main column; the current role gets a cool-gradient hairline. The company sits in a small pill beside the title. Bullets use an 8px cool-gradient square marker (3px radius). Skill and area tags are pills.

### Hero card
A 1.586 ratio card (payment-card proportions), up to 470px wide, 24px radius, resting at rotateZ(-7deg) rotateX(8deg) rotateY(-14deg) (softened to -4, 6, -8 below 900px).
- **Anatomy, top to bottom:** brand row (ZBD mark at weight 800, width 120, with an out-arrow at the right); the drawing (converging thin lines into one bright line and node); the line ("The Money Layer for Games", weight 700, width 110, max 12ch); then the "Case study" label after the line. Nothing sits above the brand row.
- **Face:** blue to violet to magenta base, a pink glow bottom right, an amber glow confined to the top right corner away from the line, a white highlight top left, and a 28 percent white edge.
- **Tilt:** on hover-capable fine pointers the card tilts up to 11deg and 8deg toward the pointer and a sheen follows it, lerped at 0.14 per frame. On leave it settles back over 700ms.

### Skewed band
Behind the hero and the article header. A flowing multi-stop gradient (blue, violet, pink, amber, back to blue) drifting over 26s. The article header version is shorter, at the top, at 55 percent opacity.

### Closing card
36px radius, cool gradient at 180 percent size shifting slowly over 16s, a blurred white glow bottom right, the LinkedIn URL in display type (weight 750, width 112), and a white button.

### Navigation
Floating glass pill: logo and name (weight 650, width 108), text links in secondary color on 40px pill targets (hover to 6 percent white fill), and a compact blue button.

### Article
- **Header:** crumb link with a back arrow that nudges left on hover, display title, deck in lead type, and a row of fact pills (key in tertiary label type, value in an ink 2 inner pill). The Lifecycle header ends with a "Follows" pill whose value is a blue-to-violet link back to the Money Layer case study.
- **Rail:** "On this page" label and links in tertiary text on 12px rounded rows; the current section gets ink 2 and primary text.
- **TL;DR:** 28px card with a full brand-gradient hairline border, a small label heading, and a key and value list split by hairlines.
- **Figures:** break out to the flow width, sit in 20px dot-grid panels, and carry a 44px round glass zoom button. Captions are a pill ("Concept diagram", "Final work", "Published on zbdpay.com") followed by a plain sentence. After "Final work" the sentence is replaced by a small outlined link pill, "View on zbdpay.com", with an out-arrow. Captions carry no checked-on dates.
- **Proof panel:** ink 1 panel with a host pill led by a lime dot, then key and value rows split by hairlines. On the Lifecycle page each key links to the page it quotes, with a small out-arrow.
- **Naming lockup:** a cool-gradient panel. The rejected terms sit on top, struck through at 62 percent white and separated by slashes; the final stage names stack below in display type. Caption: "Final work" and the zbdpay.com link pill.
- **Storyboard cards:** four numbered ink 1 cards (16px radius) in a dot-grid panel, warm-gradient number discs, arrows between cards. Four across when the panel is at least 720px wide (container query), stacked with down arrows below that. The final card gets the warm gradient hairline.
- **Video:** a 16:9 panel with the YouTube embed (youtube-nocookie, no autoplay) on the static site. The Artifact cannot embed other sites, so it shows a warm-field card with an ink play disc that links to YouTube. Both carry a caption link to the video.
- **Results:** the headline result spans the full row in larger type with lit figures; the other results sit two across as ink 1 cards with a tertiary label above the value, one column on phones. Results from the wider role follow under a small heading as the same gradient-square bullets used in Experience, with the same wording.
- **Photo:** a 20px-radius panel with a hairline border; the image fills it edge to edge.
- **Lifecycle diagrams:** STEP drawn as four columns with Earn outlined in the vertical gradient and one lime path of value crossing the others; and a pair showing a straight line that stops at a pink bar beside the loop. Lime means value moving, pink means a stop, same as the Money Layer pair.
- **Pull quote:** 650 weight, width 106, with a 1px violet left rule.
- **Progress:** a 3px full-gradient bar scaled by scroll position, where scroll timelines are supported.
- **Zoom dialog:** 24px ink 1 dialog that scales in from the trigger over 240ms, with a sticky title bar and a round close button.

### Motion
Curves: `ease-out` cubic-bezier(0.23, 1, 0.32, 1) for nearly everything, `ease-in-out` cubic-bezier(0.77, 0, 0.175, 1) for the closing card drift. State changes 160ms; icon nudges 220 to 240ms; tile lift 300ms; hero card settle 700ms; page view transitions 220ms. The philosophy statement lights word by word from tertiary to primary text across its scroll entry.

**The Reduced Motion Rule.** Under reduced motion the band and closing card stop, the hero card does not tilt or transition, all transitions drop to 0.01ms, smooth scrolling and view transitions are off, the statement renders fully lit, and the zoom dialog fades in over 120ms instead of scaling.

## Do's and Don'ts

### Do:
- **Do** keep the page on ink 0 with raised surfaces on ink 1 and ink 2 and hairlines at 8 or 14 percent white.
- **Do** use the cool gradient for every gradient surface that carries text.
- **Do** use Coinbase blue for actions and for the field of finished work.
- **Do** keep lime for moving value and lit figures, with lime ink text on a lime field.
- **Do** follow the shape rule: pills for controls, 28px cards, 20px panels, 36px for the closing card only.
- **Do** set headings in expanded bold Mona Sans and body at normal width.
- **Do** mark state with a status line after the description.
- **Do** caption figures with a pill label and a plain sentence.
- **Do** gate hover effects to hover-capable fine pointers and honor reduced motion as specified.

### Don't:
- **Don't** add a light theme or light-ground sections.
- **Don't** put text on the full gradient with amber.
- **Don't** place pills, kickers, or eyebrow labels above headings.
- **Don't** add icons or numbers to bento cells.
- **Don't** nest a dark panel inside the blue finished tile.
- **Don't** put in-progress work on a blue field.
- **Don't** round or soften the band's diagonal edges.
- **Don't** use hard offset shadows or uppercase tracked labels.
