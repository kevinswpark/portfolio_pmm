
await figma.setCurrentPageAsync(await figma.getNodeByIdAsync("0:1"));
for (const st of ["Regular","Medium","SemiBold","Bold","ExtraBold","Bold Italic"]) await figma.loadFontAsync({ family: "Mona Sans", style: st });
const SVG = {"arrow": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\" fill=\"#FFFFFF\"><path d=\"M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z\"/></svg>", "lines": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 480 300\"><defs><linearGradient id=\"gh\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\"><stop offset=\"0\" stop-color=\"#3D7BFF\"/><stop offset=\".45\" stop-color=\"#8B5CF6\"/><stop offset=\".8\" stop-color=\"#FF3D8B\"/><stop offset=\"1\" stop-color=\"#FFB84D\"/></linearGradient><linearGradient id=\"gv\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#3D7BFF\"/><stop offset=\".5\" stop-color=\"#8B5CF6\"/><stop offset=\"1\" stop-color=\"#FF3D8B\"/></linearGradient></defs><g fill=\"none\" stroke=\"#FFFFFF\" stroke-opacity=\"0.55\" stroke-width=\"1.2\"><path d=\"M0 18.0C120.0 18.0 220.8 128.9 300 150.0\"/><path d=\"M0 35.6C120.0 35.6 220.8 131.7 300 150.0\"/><path d=\"M0 53.2C120.0 53.2 220.8 134.5 300 150.0\"/><path d=\"M0 70.8C120.0 70.8 220.8 137.3 300 150.0\"/><path d=\"M0 88.4C120.0 88.4 220.8 140.1 300 150.0\"/><path d=\"M0 106.0C120.0 106.0 220.8 143.0 300 150.0\"/><path d=\"M0 123.6C120.0 123.6 220.8 145.8 300 150.0\"/><path d=\"M0 141.2C120.0 141.2 220.8 148.6 300 150.0\"/><path d=\"M0 158.8C120.0 158.8 220.8 151.4 300 150.0\"/><path d=\"M0 176.4C120.0 176.4 220.8 154.2 300 150.0\"/><path d=\"M0 194.0C120.0 194.0 220.8 157.0 300 150.0\"/><path d=\"M0 211.6C120.0 211.6 220.8 159.9 300 150.0\"/><path d=\"M0 229.2C120.0 229.2 220.8 162.7 300 150.0\"/><path d=\"M0 246.8C120.0 246.8 220.8 165.5 300 150.0\"/><path d=\"M0 264.4C120.0 264.4 220.8 168.3 300 150.0\"/><path d=\"M0 282.0C120.0 282.0 220.8 171.1 300 150.0\"/></g><path fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"3.5\" stroke-linecap=\"round\" d=\"M300 150.0H480\"/><circle fill=\"#FFFFFF\" cx=\"300\" cy=\"150.0\" r=\"5\"/></svg>"};

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

// Hero card
const card = figma.createComponent(); card.name = "Hero card"; card.resize(470, 296); card.cornerRadius = 24; card.clipsContent = true;
card.layoutMode = "VERTICAL"; card.primaryAxisSizingMode = "FIXED"; card.counterAxisSizingMode = "FIXED"; card.paddingLeft = card.paddingRight = card.paddingTop = card.paddingBottom = 26; card.itemSpacing = 6;
card.fills = [
  { type: "GRADIENT_LINEAR", gradientTransform: [[0.5, 0.5, 0], [-0.5, 0.5, 0.5]], gradientStops: [{ position: 0, color: { ...hex("#2F6BFF"), a: 1 } }, { position: 0.55, color: { ...hex("#6C3BF0"), a: 1 } }, { position: 1, color: { ...hex("#B03AD8"), a: 1 } }] },
  rad("#FFB84D", 1, [[1.389, 0, -0.75], [0, 1.235, 0.5]]),
  rad("#FF3D8B", 1, [[1, 0, -0.5], [0, 1.136, -0.636]]),
  rad("#FFFFFF", 0.22, [[0.926, 0, 0.5], [0, 1.235, 0.5]])
];
card.strokes = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.28 }]; card.strokeWeight = 1;
card.effects = [
  { type: "DROP_SHADOW", color: { ...hex("#2F6BFF"), a: 0.6 }, offset: { x: 0, y: 50 }, radius: 90, spread: -40, visible: true, blendMode: "NORMAL" },
  { type: "DROP_SHADOW", color: { ...hex("#FF3D8B"), a: 0.45 }, offset: { x: 0, y: 30 }, radius: 60, spread: -30, visible: true, blendMode: "NORMAL" }
];
const top = figma.createAutoLayout("HORIZONTAL", { name: "Top", counterAxisAlignItems: "CENTER" }); top.fills = []; card.appendChild(top); top.layoutSizingHorizontal = "FILL"; top.primaryAxisAlignItems = "SPACE_BETWEEN";
const brand = await text("ZBD", "Label/Button", WHITE); brand.fontName = { family: "Mona Sans", style: "ExtraBold" }; brand.fontSize = 17; brand.letterSpacing = { unit: "PERCENT", value: 2 }; top.appendChild(brand);
const go = vec(SVG.arrow, 24); go.name = "Arrow up right"; go.opacity = 0.9; top.appendChild(go);
const art = figma.createAutoLayout("HORIZONTAL", { name: "Art", primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER" }); art.fills = []; card.appendChild(art);
art.layoutSizingHorizontal = "FILL"; art.layoutGrow = 1; art.opacity = 0.9;
const lines = vec(SVG.lines, 104); lines.name = "Finding the line"; art.appendChild(lines);
const line = await text("The Money Layer for Games", "Heading/Card", WHITE, 250); line.fontSize = 28; line.lineHeight = { unit: "PERCENT", value: 108 }; line.letterSpacing = { unit: "PERCENT", value: -2 }; card.appendChild(line);
const kick = figma.createAutoLayout("HORIZONTAL", { name: "Case study", paddingLeft: 11, paddingRight: 11, paddingTop: 5, paddingBottom: 5, cornerRadius: 999 });
kick.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.18 }]; kick.appendChild(await text("Case study", "Label/Small", WHITE)); card.appendChild(kick);
card.description = "Hero card, 1.586 ratio. Anatomy: ZBD and arrow, original line drawing, the line, then 'Case study'. No payment-card chip. Rest pose rotateZ -7deg with rotateX 8deg and rotateY -14deg; tilts toward the pointer on hover devices.";
place(card); made.card = card.id; made.nextY = y;
await card.screenshot({ scale: 1 });
return made;