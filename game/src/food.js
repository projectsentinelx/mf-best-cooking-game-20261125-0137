// Every ingredient drawn twice over — as it comes from the crate and as it leaves the board or the
// pan — plus the plate that holds them. Shapes are built from arcs and paths so the food stays sharp
// at any size: on the counter, on a ticket the size of a stamp, and heaped on a plate.
import { INGREDIENTS } from './pantry.js';

const CHOP_BITS = [
  [-0.34, -0.2, 0.3], [-0.02, -0.34, 0.26], [0.3, -0.16, 0.28],
  [-0.2, 0.18, 0.27], [0.12, 0.24, 0.3], [0.38, 0.2, 0.22],
];

function bits(ctx, x, y, s, fill, edge) {
  for (const [bx, by, br] of CHOP_BITS) {
    ctx.fillStyle = fill;
    ctx.strokeStyle = edge;
    ctx.lineWidth = Math.max(1, s * 0.04);
    const px = x + bx * s;
    const py = y + by * s;
    const r = br * s * 0.5;
    ctx.beginPath();
    ctx.moveTo(px - r, py - r * 0.7);
    ctx.lineTo(px + r * 0.8, py - r);
    ctx.lineTo(px + r, py + r * 0.7);
    ctx.lineTo(px - r * 0.7, py + r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

function tomato(ctx, x, y, s, state) {
  const c = INGREDIENTS.tomato;
  if (state === 'chopped') {
    bits(ctx, x, y, s * 1.1, c.flesh, '#8d2a21');
    ctx.fillStyle = c.seed;
    for (const [bx, by] of [[-0.1, -0.05], [0.18, 0.1], [-0.24, 0.16]]) {
      ctx.beginPath();
      ctx.arc(x + bx * s, y + by * s, s * 0.035, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }
  ctx.fillStyle = c.flesh;
  ctx.beginPath();
  ctx.arc(x, y, s * 0.44, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = c.accent;
  ctx.beginPath();
  ctx.arc(x - s * 0.12, y - s * 0.13, s * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2f6b2c';
  ctx.lineWidth = s * 0.1;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.2, y - s * 0.42);
  ctx.lineTo(x + s * 0.16, y - s * 0.46);
  ctx.moveTo(x, y - s * 0.44);
  ctx.lineTo(x - s * 0.06, y - s * 0.62);
  ctx.stroke();
}

function dough(ctx, x, y, s, state) {
  const c = INGREDIENTS.dough;
  ctx.fillStyle = state === 'seared' ? '#d9a15c' : c.flesh;
  ctx.beginPath();
  ctx.ellipse(x, y, s * 0.46, s * 0.36, 0, 0, Math.PI * 2);
  ctx.fill();
  if (state === 'seared') {
    ctx.fillStyle = '#8d5a2c';
    for (const [bx, by, br] of [[-0.18, -0.1, 0.09], [0.14, 0.08, 0.07], [0.02, -0.18, 0.05]]) {
      ctx.beginPath();
      ctx.arc(x + bx * s, y + by * s, br * s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#f0cf96';
    ctx.lineWidth = s * 0.04;
    ctx.beginPath();
    ctx.ellipse(x, y, s * 0.36, s * 0.27, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.fillStyle = c.accent;
    ctx.beginPath();
    ctx.ellipse(x - s * 0.12, y - s * 0.1, s * 0.2, s * 0.13, -0.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function egg(ctx, x, y, s, state) {
  const c = INGREDIENTS.egg;
  if (state === 'seared') {
    ctx.fillStyle = '#f0c94b';
    ctx.beginPath();
    ctx.moveTo(x - s * 0.46, y + s * 0.22);
    ctx.quadraticCurveTo(x - s * 0.5, y - s * 0.3, x - s * 0.02, y - s * 0.34);
    ctx.quadraticCurveTo(x + s * 0.5, y - s * 0.34, x + s * 0.46, y + s * 0.14);
    ctx.quadraticCurveTo(x + s * 0.1, y + s * 0.44, x - s * 0.46, y + s * 0.22);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#c99a29';
    ctx.lineWidth = s * 0.05;
    ctx.stroke();
    ctx.fillStyle = '#5f8f42';
    ctx.beginPath();
    ctx.arc(x + s * 0.06, y - s * 0.04, s * 0.06, 0, Math.PI * 2);
    ctx.arc(x - s * 0.16, y + s * 0.1, s * 0.045, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.fillStyle = '#fdf8ec';
  ctx.beginPath();
  ctx.ellipse(x, y, s * 0.4, s * 0.32, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = c.seed;
  ctx.beginPath();
  ctx.arc(x + s * 0.06, y - s * 0.02, s * 0.17, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath();
  ctx.arc(x + s * 0.02, y - s * 0.07, s * 0.06, 0, Math.PI * 2);
  ctx.fill();
}

function herb(ctx, x, y, s, state) {
  const c = INGREDIENTS.herb;
  if (state === 'chopped') {
    ctx.fillStyle = c.flesh;
    for (const [bx, by, br, rot] of [[-0.26, 0.06, 0.1, 0.4], [0.02, -0.14, 0.09, -0.6], [0.24, 0.12, 0.08, 1.1], [-0.02, 0.2, 0.07, 0.2], [0.3, -0.22, 0.06, 0.9]]) {
      ctx.save();
      ctx.translate(x + bx * s, y + by * s);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, br * s, br * s * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    return;
  }
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = s * 0.06;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.32, y + s * 0.3);
  ctx.quadraticCurveTo(x, y + s * 0.02, x + s * 0.3, y - s * 0.3);
  ctx.stroke();
  ctx.fillStyle = c.flesh;
  for (let i = 0; i < 5; i += 1) {
    const t = i / 4;
    const px = x - s * 0.24 + t * s * 0.52;
    const py = y + s * 0.24 - t * s * 0.5;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(i % 2 === 0 ? -0.7 : 0.7);
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.13, s * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function mushroom(ctx, x, y, s, state) {
  const c = INGREDIENTS.mushroom;
  if (state === 'seared') {
    for (const [bx, by, rot] of [[-0.2, 0.1, -0.5], [0.12, -0.06, 0.3], [0.2, 0.22, 0.9]]) {
      ctx.save();
      ctx.translate(x + bx * s, y + by * s);
      ctx.rotate(rot);
      ctx.fillStyle = c.flesh;
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.26, s * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = c.seed;
      ctx.lineWidth = s * 0.05;
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.2, s * 0.08, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    return;
  }
  ctx.fillStyle = c.seed;
  ctx.fillRect(x - s * 0.07, y, s * 0.14, s * 0.26);
  ctx.fillStyle = c.flesh;
  ctx.beginPath();
  ctx.ellipse(x, y - s * 0.02, s * 0.36, s * 0.25, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = c.accent;
  ctx.beginPath();
  ctx.ellipse(x - s * 0.1, y - s * 0.12, s * 0.1, s * 0.05, -0.4, 0, Math.PI * 2);
  ctx.fill();
}

function cheese(ctx, x, y, s, state) {
  const c = INGREDIENTS.cheese;
  if (state === 'chopped') {
    bits(ctx, x, y, s * 1.05, c.flesh, '#a9781f');
    return;
  }
  ctx.fillStyle = c.flesh;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.38, y + s * 0.28);
  ctx.lineTo(x + s * 0.36, y + s * 0.18);
  ctx.lineTo(x + s * 0.24, y - s * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = c.accent;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.38, y + s * 0.28);
  ctx.lineTo(x + s * 0.36, y + s * 0.18);
  ctx.lineTo(x + s * 0.28, y + s * 0.06);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#c48f24';
  for (const [bx, by, br] of [[-0.05, 0.04, 0.07], [0.14, 0.08, 0.045]]) {
    ctx.beginPath();
    ctx.arc(x + bx * s, y + by * s, br * s, 0, Math.PI * 2);
    ctx.fill();
  }
}

function bread(ctx, x, y, s, state) {
  const c = INGREDIENTS.bread;
  ctx.fillStyle = state === 'seared' ? '#c27f3f' : c.flesh;
  ctx.beginPath();
  ctx.ellipse(x, y, s * 0.42, s * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = state === 'seared' ? '#e8c186' : c.accent;
  ctx.beginPath();
  ctx.ellipse(x, y, s * 0.33, s * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();
  if (state === 'seared') {
    ctx.strokeStyle = '#7a4a20';
    ctx.lineWidth = s * 0.05;
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x + i * s * 0.13 - s * 0.05, y - s * 0.2);
      ctx.lineTo(x + i * s * 0.13 + s * 0.05, y + s * 0.2);
      ctx.stroke();
    }
  }
}

function broth(ctx, x, y, s, state) {
  const c = INGREDIENTS.broth;
  ctx.fillStyle = '#3b2a1c';
  ctx.beginPath();
  ctx.arc(x, y, s * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = state === 'seared' ? '#e0a95c' : '#7d5c33';
  ctx.beginPath();
  ctx.arc(x, y - s * 0.03, s * 0.29, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = s * 0.05;
  ctx.beginPath();
  ctx.arc(x, y - s * 0.05, s * 0.16, 0.4, 2.4);
  ctx.stroke();
  if (state === 'seared') {
    ctx.fillStyle = 'rgba(255,250,238,0.7)';
    for (const [bx, by, br] of [[-0.14, -0.18, 0.05], [0.08, -0.24, 0.04]]) {
      ctx.beginPath();
      ctx.arc(x + bx * s, y + by * s, br * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

const DRAWERS = { tomato, dough, egg, herb, mushroom, cheese, bread, broth };

/**
 * Draw one ingredient at (x, y) filling about `size` pixels, in the state it is in: whole from the
 * crate, chopped on the board, seared in the pan, or burnt black at the edge of the pan.
 */
export function drawIngredient(ctx, ingredientId, state, x, y, size) {
  const drawer = DRAWERS[ingredientId];
  if (!drawer) return;
  if (state === 'burnt') {
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = '#241a14';
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.38, size * 0.3, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a2a1e';
    ctx.beginPath();
    ctx.ellipse(x - size * 0.06, y - size * 0.05, size * 0.2, size * 0.14, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  const key = state === 'chopped' ? 'chopped' : state === 'seared' ? 'seared' : 'raw';
  drawer(ctx, x, y, size, key);
}

/** The plate itself: a warm rim, a shadow and a well. */
export function drawPlateBase(ctx, x, y, size) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.07, size * 0.5, size * 0.33, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f2ece0';
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.5, size * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ddd3c2';
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.42, size * 0.27, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fbf7ee';
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.01, size * 0.37, size * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9bda8';
  ctx.lineWidth = Math.max(1, size * 0.008);
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.46, size * 0.3, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

const LAYOUTS = {
  1: [[0, 0.02, 1]],
  2: [[-0.19, 0.01, 0.95], [0.19, -0.03, 0.92]],
  3: [[-0.21, -0.08, 0.9], [0.2, -0.1, 0.88], [0.0, 0.2, 0.9]],
  4: [[-0.2, -0.14, 0.82], [0.2, -0.14, 0.82], [-0.14, 0.2, 0.82], [0.14, 0.2, 0.82]],
};

/** A plate holding whatever components have been laid on it so far, spread so each part reads. */
export function drawPlate(ctx, parts, x, y, size) {
  drawPlateBase(ctx, x, y, size);
  const count = Math.min(parts.length, 4);
  const layout = LAYOUTS[count] || [];
  for (let index = 0; index < count; index += 1) {
    const part = parts[index];
    const spot = layout[index];
    const state = part.state === 'burnt' ? 'burnt' : part.done ? (part.method === 'chop' ? 'chopped' : 'seared') : 'raw';
    drawIngredient(ctx, part.ingredient, state, x + spot[0] * size, y + spot[1] * size, size * 0.42 * spot[2]);
  }
}

/** A finished dish plated for a ticket or the end card: its parts, then its garnish on top. */
export function drawDish(ctx, recipe, x, y, size) {
  const parts = recipe.parts.map((part, index) => ({
    ingredient: part.ingredient,
    method: part.method,
    done: true,
    state: part.method === 'chop' ? 'chopped' : 'seared',
    index,
  }));
  drawPlate(ctx, parts, x, y, size);
  const garnish = { thyme: 'herb', herb: 'herb', mushroom: 'mushroom', cheese: 'cheese' }[recipe.garnish] || 'herb';
  drawIngredient(ctx, garnish, garnish === 'herb' ? 'chopped' : 'seared', x + size * 0.06, y - size * 0.12, size * 0.18);
}
