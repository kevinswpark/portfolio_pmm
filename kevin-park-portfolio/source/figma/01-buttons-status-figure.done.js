
await figma.setCurrentPageAsync(await figma.getNodeByIdAsync("0:1"));
for (const st of ["Regular","Medium","SemiBold","Bold","ExtraBold","Bold Italic"]) await figma.loadFontAsync({ family: "Mona Sans", style: st });
const SVG = {};

const V = async id => await figma.variables.getVariableByIdAsync(id);
const paint = async id => figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", await V(id));
const styles = await figma.getLocalTextStylesAsync(); const st = n => styles.find(s => s.name === n);
const WHITE = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
const text = async (c, s, fills, w) => { const t = figma.createText(); await t.setTextStyleIdAsync(st(s).id); t.characters = c; t.fills = fills; if (w) { t.resize(w, t.height); t.textAutoResize = "HEIGHT"; } return t; };
const hex = h => ({ r: parseInt(h.slice(1,3),16)/255, g: parseInt(h.slice(3,5),16)/255, b: parseInt(h.slice(5,7),16)/255 });
const lin = (stops, t = [[0.8, 0.6, -0.1], [-0.6, 0.8, 0.35]]) => ({ type: "GRADIENT_LINEAR", gradientTransform: t, gradientStops: stops.map(([p, h, a]) => ({ position: p, color: { ...hex(h), a: a ?? 1 } })) });
const rad = (h, a, t) => ({ type: "GRADIENT_RADIAL", gradientTransform: t, gradientStops: [{ position: 0, color: { ...hex(h), a } }, { position: 1, color: { ...hex(h), a: 0 } }] });
const vec = (svg, h) => { const n = figma.createNodeFromSvg(svg); n.rescale(h / n.height); return n; };
const board = await figma.getNodeByIdAsync("6:130");
const X = board.x + board.width + 120; let y = Math.max(80, ...figma.currentPage.children.filter(n => n.x >= X - 1).map(n => n.y + n.height + 56)); const made = {};
const place = n => { n.x = X; n.y = y; y += n.height + 56; };

// Buttons
const mk = async (variant) => {
  const c = figma.createComponent(); c.name = "Variant=" + variant;
  c.layoutMode = "HORIZONTAL"; c.primaryAxisSizingMode = "AUTO"; c.counterAxisSizingMode = "FIXED"; c.resize(200, 52);
  c.counterAxisAlignItems = "CENTER"; c.itemSpacing = 10; c.paddingLeft = 22; c.paddingRight = 22; c.cornerRadius = 999;
  let tf = WHITE;
  if (variant === "Blue") c.fills = [await paint("VariableID:6:10")];
  else if (variant === "Ghost") { c.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.02 }]; c.strokes = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.14 }]; c.strokeWeight = 1; }
  else { c.fills = WHITE; tf = [await paint("VariableID:6:3")]; }
  c.appendChild(await text(variant === "Blue" ? "Explore the work" : "Connect on LinkedIn", "Label/Button", tf));
  return c;
};
const set = figma.combineAsVariants([await mk("Blue"), await mk("Ghost"), await mk("White")], figma.currentPage);
set.name = "Button"; set.layoutMode = "HORIZONTAL"; set.itemSpacing = 16; set.paddingLeft = set.paddingRight = set.paddingTop = set.paddingBottom = 24;
set.primaryAxisSizingMode = "AUTO"; set.counterAxisSizingMode = "AUTO"; set.fills = [await paint("VariableID:6:4")]; set.cornerRadius = 28;
set.description = "Pill button. Blue: primary action (Coinbase blue). Ghost: 14% white hairline. White: on gradient fields. Press scale 0.97, 160ms ease-out.";
place(set); made.button = set.id;

// Status line + lit figure chip
const status = figma.createComponent(); status.name = "Status line"; status.layoutMode = "HORIZONTAL"; status.primaryAxisSizingMode = "AUTO"; status.counterAxisSizingMode = "AUTO"; status.itemSpacing = 8; status.counterAxisAlignItems = "CENTER"; status.fills = [];
const dot = figma.createEllipse(); dot.resize(7, 7); dot.fills = [await paint("VariableID:6:13")]; dot.effects = [{ type: "DROP_SHADOW", color: { ...hex("#FFB84D"), a: 0.3 }, offset: { x: 0, y: 0 }, radius: 0, spread: 4, visible: true, blendMode: "NORMAL" }];
status.appendChild(dot); status.appendChild(await text("Case study in progress", "Label/Small", [await paint("VariableID:6:8")]));
status.description = "Honest status. Sits after a title or description, never above a heading.";
place(status); made.status = status.id;
const fig = figma.createComponent(); fig.name = "Lit figure"; fig.layoutMode = "HORIZONTAL"; fig.primaryAxisSizingMode = "AUTO"; fig.counterAxisSizingMode = "AUTO";
fig.paddingLeft = fig.paddingRight = 7; fig.paddingTop = fig.paddingBottom = 1; fig.cornerRadius = 7; fig.fills = [{ type: "SOLID", color: hex("#C8FF3D"), opacity: 0.12 }];
fig.effects = [{ type: "DROP_SHADOW", color: { ...hex("#C8FF3D"), a: 0.35 }, offset: { x: 0, y: 2 }, radius: 14, spread: -4, visible: true, blendMode: "NORMAL" }];
fig.appendChild(await text("5M-plus dollars", "Body/Default", [{ type: "SOLID", color: hex("#DFFF8A") }]));
fig.description = "Resume figure lit in signal lime. Words stay verbatim; only the figure is wrapped.";
place(fig); made.figure = fig.id;

await set.screenshot();
return made;