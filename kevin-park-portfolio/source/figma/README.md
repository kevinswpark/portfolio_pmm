# Figma file

File: https://www.figma.com/design/6FYrwzZiI54HSDR8ILPYuT

The file is on the Starter plan, so it has three pages, one mode per variable collection, and a cap on MCP tool calls. The v2 rebuild stopped at that cap.

## Already in the file

- Foundations page (0:1)
  - "Neon" variable collection: ink/0 to ink/3, text/primary, secondary, tertiary, accent/blue, violet, pink, amber, lime, line/hairline, line/strong.
  - Ten Mona Sans text styles, Display/Hero down to Label/Small.
  - Foundations board (6:130), the reference sheet for those tokens and styles.
  - Button component set (8:8) with Blue, Ghost, and White variants.
  - Status line component (8:9) and Lit figure component (8:12).
- Home (2:13) and Money Layer article (2:14) pages exist and are empty.

## Left to run

Run each script as the `code` of one `use_figma` call on the file key above, in order. Each one places its output to the right of the Foundations board and below whatever is already there.

1. `02-hero-card.js` builds the Hero card component.
2. `03-tiles.js` builds "Tile / Finished case study" and "Tile / In progress". The site no longer has an in-progress tile: The Money Lifecycle is now a finished tile on a violet field (see DESIGN.md, Tiles). Change the second tile to match before running, or build it by hand.
3. Home and article frames. Compose them from the components above, following the shipped build in `dist/site/` and the screenshots in `.impeccable/review/`.

`01-buttons-status-figure.done.js` is kept as a record of what already ran. `svgs-neon.json` holds the diagram SVGs with colors inlined for `createNodeFromSvg`.

## Known gaps

- Figma's Mona Sans has no width axis, so the expanded display widths used on the site (font-stretch 110 to 120 percent) render at normal width in Figma.
- Raster review screenshots could not be uploaded because the upload endpoint was blocked from the build environment.
