// The five plates, drawn as dishes rather than as their parts: a tart in its blistered crust, a
// folded omelette, mushrooms heaped on toast, cheese running off the melt, a bowl of soup with the
// tomato still floating. Each one is a silhouette first — at the size the pass and the contact sheet
// show it, the shape has to say which plate it is before any detail does. A recipe with no art of
// its own falls back to its finished components laid round the well of a plate.
import { fillRound, roundRect } from './paint.js';
import { drawIngredient, drawPlate, drawPlateBase } from './food.js';

const TAU = Math.PI * 2;

/** Contact shadow under a dish — down and to the right of the key, like everything else. */
function drop(ctx, x, y, rx, ry, alpha) {
  ctx.save();
  ctx.translate(x + rx * 0.18, y);
  ctx.scale(1, Math.max(0.08, ry / rx));
  const gradient = ctx.createRadialGradient(0, 0, rx * 0.15, 0, 0, rx);
  gradient.addColorStop(0, `rgba(0,0,0,${alpha})`);
  gradient.addColorStop(0.6, `rgba(0,0,0,${alpha * 0.45})`);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, rx, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/** The wet highlight that makes a sauce or a glaze look cooked. */
function sheen(ctx, x, y, rx, ry, rot, alpha = 0.6) {
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, TAU);
  ctx.fill();
}

/** Three dots of sauce and a sprig of thyme: every plate is finished the same way. */
function finish(ctx, x, y, size, sauceColor = '#c2663a') {
  ctx.save();
  ctx.fillStyle = sauceColor;
  for (const [dx, dy, r] of [[-0.3, 0.19, 0.028], [-0.2, 0.27, 0.02], [-0.36, 0.05, 0.015]]) {
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(x + dx * size, y + dy * size, r * size, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 0.95;
  drawIngredient(ctx, 'herb', 'chopped', x + size * 0.06, y - size * 0.15, size * 0.26);
  ctx.restore();
}

/** Tomato Tart: a round of blistered dough, golden at the rim, the tomato heaped in the well. */
function tomatoTart(ctx, x, y, size) {
  const r = size * 0.39;
  // the crust: a golden ring standing proud of the well
  ctx.fillStyle = '#8d5a24';
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.1, r, r * 0.72, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#d99a4c';
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.7, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#f0c070';
  ctx.beginPath();
  ctx.ellipse(x, y - r * 0.03, r * 0.94, r * 0.64, 0, 0, TAU);
  ctx.fill();
  const well = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r * 0.8);
  well.addColorStop(0, '#e8b566');
  well.addColorStop(1, '#b97e35');
  ctx.fillStyle = well;
  ctx.beginPath();
  ctx.ellipse(x, y - r * 0.04, r * 0.7, r * 0.46, 0, 0, TAU);
  ctx.fill();
  // blisters along the rim, darker where the crust caught
  for (const [bx, by, br] of [[-0.62, -0.05, 0.075], [0.58, 0.1, 0.06], [0.1, -0.5, 0.05], [-0.3, 0.44, 0.045]]) {
    ctx.fillStyle = 'rgba(122,68,24,0.5)';
    ctx.beginPath();
    ctx.ellipse(x + bx * r, y + by * r * 0.7, br * r, br * r * 0.7, 0.3, 0, TAU);
    ctx.fill();
  }
  // the tomato, heaped in the middle and glazed
  ctx.fillStyle = '#c5342a';
  ctx.beginPath();
  ctx.ellipse(x, y - r * 0.1, r * 0.44, r * 0.26, 0, 0, TAU);
  ctx.fill();
  for (const [bx, by, br, rot] of [[-0.16, -0.06, 0.075, 0.3], [0.04, -0.12, 0.065, -0.2], [0.16, 0.0, 0.07, 0.5], [-0.05, 0.06, 0.07, -0.4], [0.03, -0.02, 0.06, 0.1]]) {
    ctx.save();
    ctx.translate(x + bx * size, y + by * size + r * 0.02);
    ctx.rotate(rot);
    ctx.fillStyle = '#d9483a';
    ctx.fillRect(-br * size, -br * size * 0.75, br * size * 2, br * size * 1.5);
    ctx.fillStyle = '#f07a63';
    ctx.fillRect(-br * size * 0.55, -br * size * 0.45, br * size * 1.1, br * size * 0.65);
    ctx.restore();
  }
  sheen(ctx, x - size * 0.06, y - size * 0.05, size * 0.1, size * 0.028, -0.3, 0.45);
  finish(ctx, x, y, size);
}

/** Herb Omelette: a soft yellow fold on the plate, thyme flecked through it. */
function herbOmelette(ctx, x, y, size) {
  const w = size * 0.44;
  const h = size * 0.26;
  ctx.fillStyle = '#f2c04a';
  ctx.beginPath();
  ctx.moveTo(x - w, y + h * 0.35);
  ctx.quadraticCurveTo(x - w * 0.92, y - h * 0.95, x - w * 0.1, y - h * 0.72);
  ctx.quadraticCurveTo(x + w * 0.8, y - h * 0.55, x + w, y + h * 0.22);
  ctx.quadraticCurveTo(x + w * 0.2, y + h * 0.95, x - w, y + h * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fbd873';
  ctx.beginPath();
  ctx.moveTo(x - w * 0.72, y + h * 0.24);
  ctx.quadraticCurveTo(x - w * 0.1, y - h * 0.42, x + w * 0.66, y - h * 0.1);
  ctx.quadraticCurveTo(x + w * 0.18, y + h * 0.42, x - w * 0.72, y + h * 0.24);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(190,124,32,0.7)';
  ctx.lineWidth = Math.max(1.2, size * 0.014);
  ctx.beginPath();
  ctx.moveTo(x - w * 0.66, y + h * 0.1);
  ctx.quadraticCurveTo(x - w * 0.05, y + h * 0.42, x + w * 0.66, y - h * 0.02);
  ctx.stroke();
  ctx.fillStyle = 'rgba(196,120,38,0.5)';
  for (const [bx, by, br] of [[-0.6, 0.28, 0.05], [0.5, 0.16, 0.04], [0.16, -0.02, 0.03]]) {
    ctx.beginPath();
    ctx.ellipse(x + bx * w, y + by * h, br * size, br * size * 0.5, 0.3, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = '#4f7a3c';
  for (const [bx, by] of [[-0.34, -0.16], [-0.04, 0.02], [0.26, -0.2], [0.4, 0.06], [0.02, 0.26]]) {
    ctx.beginPath();
    ctx.ellipse(x + bx * w, y + by * h, size * 0.026, size * 0.012, -0.5, 0, TAU);
    ctx.fill();
  }
  sheen(ctx, x - w * 0.36, y - h * 0.4, w * 0.22, h * 0.16, -0.35, 0.5);
  finish(ctx, x, y, size, '#a8522f');
}

/** A thick slice of seared bread: dark crust, warm crumb, a couple of toasted spots. */
function toastSlice(ctx, x, y, w, h, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  fillRound(ctx, -w / 2, -h / 2, w, h, h * 0.26, '#7a4620');
  fillRound(ctx, -w / 2 + h * 0.08, -h / 2 + h * 0.08, w - h * 0.16, h - h * 0.16, h * 0.2, '#c9873f');
  fillRound(ctx, -w / 2 + h * 0.18, -h / 2 + h * 0.18, w - h * 0.36, h - h * 0.36, h * 0.16, '#edbd7e');
  // the grilled edge, so the slice reads as bread and not as a pale slab
  ctx.strokeStyle = 'rgba(74,40,16,0.6)';
  ctx.lineWidth = Math.max(1.2, h * 0.07);
  roundRect(ctx, -w / 2 + h * 0.07, -h / 2 + h * 0.07, w - h * 0.14, h - h * 0.14, h * 0.2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(132,74,26,0.5)';
  for (const [bx, by, br] of [[-0.3, 0.1, 0.06], [0.12, -0.16, 0.045], [0.28, 0.18, 0.035]]) {
    ctx.beginPath();
    ctx.ellipse(bx * w, by * h, br * w, br * h * 0.8, 0.2, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,226,180,0.22)';
  ctx.fillRect(-w / 2 + h * 0.1, -h / 2 + h * 0.1, w - h * 0.2, 2);
  ctx.restore();
}

/** Mushroom Toast: a thick slice under a heap of sliced, browned mushrooms. */
function mushroomToast(ctx, x, y, size) {
  toastSlice(ctx, x - size * 0.02, y + size * 0.05, size * 0.74, size * 0.4, -0.07);
  for (const [bx, by, sc, rot] of [[-0.14, -0.06, 0.34, -0.5], [0.1, -0.02, 0.3, 0.4], [-0.02, 0.1, 0.28, 0.1], [0.16, 0.1, 0.24, -0.3]]) {
    ctx.save();
    ctx.translate(x + bx * size, y + by * size + size * 0.04);
    ctx.rotate(rot);
    drawIngredient(ctx, 'mushroom', 'seared', 0, 0, size * sc * 1.35);
    ctx.restore();
  }
  finish(ctx, x, y, size);
}

/** Copper Melt: seared bread with the cheese melted over it and running at the front edge. */
function copperMelt(ctx, x, y, size) {
  toastSlice(ctx, x - size * 0.03, y + size * 0.02, size * 0.72, size * 0.4, -0.05);
  ctx.save();
  ctx.fillStyle = '#efb02f';
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y - size * 0.1);
  ctx.quadraticCurveTo(x - size * 0.24, y - size * 0.2, x - size * 0.02, y - size * 0.18);
  ctx.quadraticCurveTo(x + size * 0.26, y - size * 0.16, x + size * 0.29, y + size * 0.02);
  ctx.quadraticCurveTo(x + size * 0.26, y + size * 0.14, x + size * 0.16, y + size * 0.12);
  ctx.quadraticCurveTo(x + size * 0.13, y + size * 0.26, x + size * 0.05, y + size * 0.12);
  ctx.quadraticCurveTo(x - size * 0.08, y + size * 0.22, x - size * 0.12, y + size * 0.1);
  ctx.quadraticCurveTo(x - size * 0.3, y + size * 0.13, x - size * 0.3, y - size * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffd867';
  ctx.beginPath();
  ctx.ellipse(x - size * 0.08, y - size * 0.11, size * 0.16, size * 0.05, -0.12, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(190,132,26,0.6)';
  ctx.lineWidth = Math.max(1, size * 0.012);
  ctx.beginPath();
  ctx.moveTo(x - size * 0.26, y + size * 0.02);
  ctx.quadraticCurveTo(x, y + size * 0.1, x + size * 0.26, y - size * 0.02);
  ctx.stroke();
  ctx.restore();
  sheen(ctx, x - size * 0.06, y - size * 0.13, size * 0.07, size * 0.022, -0.2, 0.7);
  finish(ctx, x, y, size, '#a8522f');
}

/** Garden Soup: a deep bowl of broth, the tomato and thyme still on the surface. */
function gardenSoup(ctx, x, y, size) {
  const rx = size * 0.4;
  const ry = size * 0.29;
  // the bowl: a body under the rim, bright where the key hits its left flank
  const body = ctx.createLinearGradient(x - rx, y, x + rx, y);
  body.addColorStop(0, '#fffaf0');
  body.addColorStop(0.55, '#f1e6d2');
  body.addColorStop(1, '#b8a992');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(x - rx, y);
  ctx.bezierCurveTo(x - rx, y + ry * 1.95, x + rx, y + ry * 1.95, x + rx, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fffdf6';
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  ctx.fill();
  const broth = ctx.createRadialGradient(x - rx * 0.3, y - ry * 0.4, rx * 0.1, x, y, rx * 0.95);
  broth.addColorStop(0, '#e0a044');
  broth.addColorStop(0.7, '#b96f24');
  broth.addColorStop(1, '#8d4d15');
  ctx.fillStyle = broth;
  ctx.beginPath();
  ctx.ellipse(x, y + ry * 0.04, rx * 0.86, ry * 0.84, 0, 0, TAU);
  ctx.fill();
  // a swirl of cream, the chopped tomato, thyme floating
  ctx.strokeStyle = 'rgba(255,246,226,0.8)';
  ctx.lineWidth = Math.max(1.4, size * 0.018);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(x, y + ry * 0.02, rx * 0.42, 2.1, 4.9);
  ctx.stroke();
  ctx.lineCap = 'butt';
  ctx.fillStyle = '#d9483a';
  for (const [bx, by, r] of [[-0.3, -0.1, 0.07], [-0.02, 0.24, 0.055], [0.28, -0.2, 0.045]]) {
    ctx.fillRect(x + bx * size - r * size, y + by * size - r * size * 0.6, r * size * 1.8, r * size * 1.2);
  }
  drawIngredient(ctx, 'herb', 'chopped', x + size * 0.02, y - ry * 0.5, size * 0.26);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = Math.max(1.6, size * 0.03);
  ctx.beginPath();
  ctx.ellipse(x, y, rx * 0.96, ry * 0.94, 0, Math.PI * 1.08, Math.PI * 1.55);
  ctx.stroke();
  // steam: the one plate that always looks hot
  for (let i = 0; i < 3; i += 1) {
    ctx.save();
    ctx.globalAlpha = 0.34 - i * 0.07;
    ctx.strokeStyle = '#fff8ec';
    ctx.lineWidth = Math.max(1.2, size * 0.016);
    ctx.beginPath();
    ctx.moveTo(x - size * 0.1 + i * size * 0.1, y - ry * 0.8);
    ctx.quadraticCurveTo(x - size * 0.14 + i * size * 0.1, y - ry * 1.6, x - size * 0.06 + i * size * 0.1, y - ry * 2.3);
    ctx.stroke();
    ctx.restore();
  }
  finish(ctx, x, y, size);
}

const ART = {
  tart: tomatoTart,
  omelette: herbOmelette,
  toast: mushroomToast,
  melt: copperMelt,
  soup: gardenSoup,
};

/**
 * A finished dish for a ticket, the pass or the end card: the dish itself on its plate, the plate's
 * own contact shadow under it, and the garnish on top. A recipe without art of its own falls back to
 * its finished components laid out round the well.
 */
export function drawServedDish(ctx, recipe, x, y, size) {
  const art = ART[recipe.id];
  const bowl = recipe.id === 'soup';
  if (!art) {
    const parts = recipe.parts.map((part, index) => ({
      ingredient: part.ingredient,
      method: part.method,
      done: true,
      state: part.method === 'chop' ? 'chopped' : 'seared',
      index,
    }));
    drawPlate(ctx, parts, x, y, size);
    return;
  }
  drop(ctx, x, y + size * (bowl ? 0.14 : 0.1), size * (bowl ? 0.42 : 0.46), size * 0.1, 0.36);
  if (!bowl) drawPlateBase(ctx, x, y, size);
  art(ctx, x, y, size);
}
