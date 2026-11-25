// Every ingredient drawn twice over — as it comes from the crate and as it leaves the board or the
// pan — plus the plate that holds them. Each one is built from layered arcs: a shadow under it, a
// shaded body, a warm highlight on the lit side and a garnish stroke on top, so a tomato still reads
// as a tomato on a ticket the size of a stamp and looks worth serving heaped on a plate.
import { INGREDIENTS } from './pantry.js';

/** A soft contact shadow so nothing floats on the counter. */
function shadow(ctx, x, y, rx, ry, alpha = 0.3) {
  ctx.save();
  ctx.translate(x + rx * 0.16, y + ry * 0.26);
  ctx.scale(1, Math.max(0.06, ry / rx));
  const gradient = ctx.createRadialGradient(0, 0, rx * 0.08, 0, 0, rx);
  gradient.addColorStop(0, `rgba(0,0,0,${alpha})`);
  gradient.addColorStop(0.66, `rgba(0,0,0,${alpha * 0.42})`);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, rx, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** The lit side: one pale blob, high and to the left. */
function gloss(ctx, x, y, rx, ry, rot = -0.5, alpha = 0.5) {
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  ctx.fill();
}

/** A darker crescent along the bottom of a round body, clipped to it. */
function underShade(ctx, x, y, r, color) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x + r * 0.2, y + r * 0.55, r * 1.05, r * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// The cut pieces every chopped ingredient is scattered from: a fixed handful, so a board of chopped
// tomato looks the same on every frame and on every ticket.
const CHOP_BITS = [
  [-0.34, -0.2, 0.3], [-0.02, -0.34, 0.26], [0.3, -0.16, 0.28],
  [-0.2, 0.18, 0.27], [0.12, 0.24, 0.3], [0.38, 0.2, 0.22],
];

function cubes(ctx, x, y, s, fill, edge, inner) {
  let n = 0;
  for (const [bx, by, br] of CHOP_BITS) {
    const px = x + bx * s;
    const py = y + by * s;
    const r = br * s * 0.52;
    // every piece landed differently: a fixed tilt per bit, so a heap is a heap and not a grid
    const tilt = (((n * 47) % 11) - 5) * 0.11;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(tilt);
    // the cut piece sits on the plate with a shadow of its own, thrown right and down
    ctx.save();
    ctx.rotate(-tilt);
    shadow(ctx, 0, r * 0.65, r * 0.95, r * 0.32, 0.26);
    ctx.restore();
    const face = ctx.createLinearGradient(-r, -r, r, r);
    face.addColorStop(0, inner || fill);
    face.addColorStop(0.55, fill);
    face.addColorStop(1, edge);
    ctx.fillStyle = face;
    ctx.beginPath();
    ctx.moveTo(-r, -r * 0.7);
    ctx.lineTo(r * 0.82, -r);
    ctx.lineTo(r, r * 0.7);
    ctx.lineTo(-r * 0.7, r);
    ctx.closePath();
    ctx.fill();
    // the wet cut face catches the key along its upper left
    ctx.fillStyle = inner || fill;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.moveTo(-r * 0.72, -r * 0.5);
    ctx.lineTo(r * 0.3, -r * 0.72);
    ctx.lineTo(r * 0.28, -r * 0.28);
    ctx.lineTo(-r * 0.6, -r * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = edge;
    ctx.lineWidth = Math.max(0.9, s * 0.03);
    ctx.beginPath();
    ctx.moveTo(-r, -r * 0.7);
    ctx.lineTo(r * 0.82, -r);
    ctx.lineTo(r, r * 0.7);
    ctx.lineTo(-r * 0.7, r);
    ctx.closePath();
    ctx.stroke();
    // one specular bead so a heap of chopped tomato reads as wet, not painted
    ctx.fillStyle = 'rgba(255,248,236,0.7)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.3, -r * 0.32, r * 0.2, r * 0.12, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    n += 1;
  }
}

function tomato(ctx, x, y, s, state) {
  const c = INGREDIENTS.tomato;
  if (state === 'chopped') {
    cubes(ctx, x, y, s * 1.15, c.flesh, '#8d2a21', '#e8604f');
    ctx.fillStyle = c.seed;
    for (const [bx, by] of [[-0.1, -0.05], [0.18, 0.1], [-0.24, 0.16], [0.02, 0.34]]) {
      ctx.beginPath();
      ctx.arc(x + bx * s, y + by * s, s * 0.04, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }
  const r = s * 0.45;
  shadow(ctx, x, y + r * 0.8, r * 0.9, r * 0.3, 0.32);
  ctx.fillStyle = c.flesh;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  underShade(ctx, x, y, r, 'rgba(120,22,16,0.5)');
  gloss(ctx, x - r * 0.34, y - r * 0.38, r * 0.28, r * 0.17, -0.6, 0.55);
  ctx.strokeStyle = '#2f6b2c';
  ctx.lineWidth = Math.max(1.4, s * 0.05);
  ctx.lineCap = 'round';
  for (let i = 0; i < 5; i += 1) {
    const a = -Math.PI / 2 + (i - 2) * 0.42;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * r * 0.1, y + Math.sin(a) * r * 0.1 - r * 0.72);
    ctx.lineTo(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62 - r * 0.5);
    ctx.stroke();
  }
  ctx.strokeStyle = '#3f7a34';
  ctx.lineWidth = Math.max(1.6, s * 0.06);
  ctx.beginPath();
  ctx.moveTo(x, y - r * 0.85);
  ctx.lineTo(x + s * 0.02, y - r * 1.28);
  ctx.stroke();
  ctx.lineCap = 'butt';
}

function dough(ctx, x, y, s, state) {
  const c = INGREDIENTS.dough;
  const rx = s * 0.47;
  const ry = s * 0.36;
  const seared = state === 'seared';
  shadow(ctx, x, y + ry * 0.85, rx * 0.95, ry * 0.34, 0.32);
  ctx.fillStyle = seared ? '#8a4a1a' : '#cbb388';
  ctx.beginPath();
  ctx.ellipse(x, y + s * 0.012, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = seared ? '#c98a42' : c.flesh;
  ctx.beginPath();
  ctx.ellipse(x, y - s * 0.004, rx * 0.93, ry * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = seared ? '#e2ae66' : c.accent;
  ctx.beginPath();
  ctx.ellipse(x - s * 0.03, y - s * 0.06, rx * 0.82, ry * 0.74, 0, 0, Math.PI * 2);
  ctx.fill();
  if (seared) {
    ctx.fillStyle = 'rgba(96,54,22,0.6)';
    for (const [bx, by, br] of [[-0.2, -0.1, 0.11], [0.14, 0.1, 0.09], [0.02, -0.2, 0.06], [0.24, -0.12, 0.05]]) {
      ctx.beginPath();
      ctx.arc(x + bx * s, y + by * s, br * s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(255,226,170,0.75)';
    ctx.lineWidth = Math.max(1, s * 0.04);
    ctx.beginPath();
    ctx.ellipse(x, y - s * 0.04, rx * 0.5, ry * 0.42, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.fillStyle = 'rgba(255,250,238,0.6)';
    for (const [bx, by, br] of [[-0.24, 0.06, 0.04], [0.1, -0.14, 0.035], [0.22, 0.12, 0.03]]) {
      ctx.beginPath();
      ctx.arc(x + bx * s, y + by * s, br * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  gloss(ctx, x - rx * 0.42, y - ry * 0.44, rx * 0.24, ry * 0.18, -0.5, seared ? 0.3 : 0.45);
}

function egg(ctx, x, y, s, state) {
  const c = INGREDIENTS.egg;
  if (state === 'seared') {
    shadow(ctx, x, y + s * 0.18, s * 0.44, s * 0.16, 0.28);
    ctx.fillStyle = '#fdf8ec';
    ctx.beginPath();
    ctx.moveTo(x - s * 0.5, y + s * 0.16);
    ctx.quadraticCurveTo(x - s * 0.56, y - s * 0.34, x - s * 0.04, y - s * 0.38);
    ctx.quadraticCurveTo(x + s * 0.54, y - s * 0.38, x + s * 0.5, y + s * 0.1);
    ctx.quadraticCurveTo(x + s * 0.14, y + s * 0.46, x - s * 0.5, y + s * 0.16);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#d8a24c';
    ctx.lineWidth = Math.max(1.2, s * 0.055);
    ctx.stroke();
    ctx.fillStyle = '#f7b528';
    ctx.beginPath();
    ctx.arc(x + s * 0.02, y - s * 0.02, s * 0.19, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd75e';
    ctx.beginPath();
    ctx.arc(x - s * 0.03, y - s * 0.08, s * 0.12, 0, Math.PI * 2);
    ctx.fill();
    gloss(ctx, x - s * 0.07, y - s * 0.12, s * 0.05, s * 0.03, -0.6, 0.8);
    ctx.fillStyle = '#5f8f42';
    for (const [bx, by] of [[0.24, 0.02], [-0.2, 0.12], [0.1, 0.24]]) {
      ctx.beginPath();
      ctx.arc(x + bx * s, y + by * s, s * 0.032, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }
  shadow(ctx, x, y + s * 0.16, s * 0.42, s * 0.15, 0.3);
  ctx.fillStyle = '#fdf8ec';
  ctx.beginPath();
  ctx.ellipse(x, y, s * 0.42, s * 0.33, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(214,200,178,0.6)';
  ctx.beginPath();
  ctx.ellipse(x + s * 0.05, y + s * 0.14, s * 0.34, s * 0.14, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = c.seed;
  ctx.beginPath();
  ctx.arc(x, y - s * 0.02, s * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffbf3f';
  ctx.beginPath();
  ctx.arc(x - s * 0.02, y - s * 0.06, s * 0.12, 0, Math.PI * 2);
  ctx.fill();
  gloss(ctx, x - s * 0.07, y - s * 0.1, s * 0.05, s * 0.03, -0.6, 0.9);
}

function herb(ctx, x, y, s, state) {
  const c = INGREDIENTS.herb;
  if (state === 'chopped') {
    for (const [bx, by, br, rot] of [[-0.28, 0.08, 0.11, 0.4], [0.0, -0.16, 0.1, -0.6], [0.26, 0.12, 0.09, 1.1], [-0.02, 0.22, 0.08, 0.2], [0.32, -0.2, 0.07, 0.9], [0.14, 0.0, 0.06, -0.3]]) {
      ctx.save();
      ctx.translate(x + bx * s, y + by * s);
      ctx.rotate(rot);
      ctx.fillStyle = c.flesh;
      ctx.beginPath();
      ctx.ellipse(0, 0, br * s, br * s * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c.accent;
      ctx.beginPath();
      ctx.ellipse(-br * s * 0.2, -br * s * 0.14, br * s * 0.5, br * s * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    return;
  }
  ctx.strokeStyle = c.seed;
  ctx.lineWidth = Math.max(1.4, s * 0.075);
  ctx.beginPath();
  ctx.moveTo(x - s * 0.36, y + s * 0.34);
  ctx.quadraticCurveTo(x, y + s * 0.02, x + s * 0.34, y - s * 0.34);
  ctx.stroke();
  for (let i = 0; i < 6; i += 1) {
    const t = i / 5;
    const px = x - s * 0.3 + t * s * 0.6;
    const py = y + s * 0.28 - t * s * 0.56;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(i % 2 === 0 ? -0.85 : 0.5);
    ctx.fillStyle = i % 2 === 0 ? c.flesh : '#5f8f4a';
    ctx.beginPath();
    ctx.ellipse(s * 0.1, 0, s * 0.15, s * 0.075, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function mushroom(ctx, x, y, s, state) {
  const c = INGREDIENTS.mushroom;
  if (state === 'seared') {
    for (const [bx, by, rot] of [[-0.22, 0.1, -0.5], [0.14, -0.06, 0.3], [0.22, 0.24, 0.9]]) {
      ctx.save();
      ctx.translate(x + bx * s, y + by * s);
      ctx.rotate(rot);
      shadow(ctx, 0, s * 0.09, s * 0.28, s * 0.09, 0.25);
      ctx.fillStyle = c.flesh;
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.28, s * 0.13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = c.seed;
      ctx.lineWidth = Math.max(1, s * 0.045);
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.21, s * 0.085, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(96,54,22,0.45)';
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.04, s * 0.16, s * 0.05, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    return;
  }
  shadow(ctx, x, y + s * 0.3, s * 0.3, s * 0.1, 0.3);
  ctx.fillStyle = '#efe0c4';
  ctx.beginPath();
  ctx.moveTo(x - s * 0.09, y + s * 0.02);
  ctx.lineTo(x + s * 0.09, y + s * 0.02);
  ctx.lineTo(x + s * 0.07, y + s * 0.3);
  ctx.lineTo(x - s * 0.07, y + s * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(150,124,92,0.5)';
  ctx.fillRect(x + s * 0.01, y + s * 0.02, s * 0.08, s * 0.28);
  ctx.fillStyle = c.seed;
  ctx.beginPath();
  ctx.ellipse(x, y, s * 0.38, s * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = c.flesh;
  ctx.beginPath();
  ctx.ellipse(x, y - s * 0.03, s * 0.36, s * 0.28, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = c.accent;
  ctx.beginPath();
  ctx.ellipse(x - s * 0.1, y - s * 0.12, s * 0.12, s * 0.06, -0.35, 0, Math.PI * 2);
  ctx.fill();
  gloss(ctx, x - s * 0.15, y - s * 0.16, s * 0.06, s * 0.035, -0.4, 0.6);
}

function cheese(ctx, x, y, s, state) {
  const c = INGREDIENTS.cheese;
  if (state === 'chopped') {
    cubes(ctx, x, y, s * 1.1, c.flesh, '#a9781f', c.accent);
    return;
  }
  shadow(ctx, x, y + s * 0.27, s * 0.4, s * 0.13, 0.3);
  ctx.fillStyle = c.flesh;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.4, y + s * 0.26);
  ctx.lineTo(x + s * 0.38, y + s * 0.16);
  ctx.lineTo(x + s * 0.24, y - s * 0.32);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = c.accent;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.4, y + s * 0.26);
  ctx.lineTo(x + s * 0.38, y + s * 0.16);
  ctx.lineTo(x + s * 0.3, y + s * 0.02);
  ctx.lineTo(x - s * 0.34, y + s * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#b8842a';
  ctx.beginPath();
  ctx.moveTo(x - s * 0.4, y + s * 0.26);
  ctx.lineTo(x + s * 0.38, y + s * 0.16);
  ctx.lineTo(x + s * 0.37, y + s * 0.22);
  ctx.lineTo(x - s * 0.39, y + s * 0.32);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#c48f24';
  for (const [bx, by, br] of [[-0.08, 0.02, 0.075], [0.16, 0.06, 0.05], [-0.22, 0.1, 0.04]]) {
    ctx.beginPath();
    ctx.arc(x + bx * s, y + by * s, br * s, 0, Math.PI * 2);
    ctx.fill();
  }
}

function bread(ctx, x, y, s, state) {
  const c = INGREDIENTS.bread;
  const seared = state === 'seared';
  const rx = s * 0.44;
  const ry = s * 0.34;
  shadow(ctx, x, y + ry * 0.85, rx * 0.95, ry * 0.34, 0.32);
  // the crust: a dark band round the whole slice, thicker at the near edge
  ctx.fillStyle = seared ? '#6d3a15' : '#b8894f';
  ctx.beginPath();
  ctx.ellipse(x, y + s * 0.012, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = seared ? '#a9622c' : c.flesh;
  ctx.beginPath();
  ctx.ellipse(x, y - s * 0.005, rx * 0.93, ry * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = seared ? '#ddb478' : c.accent;
  ctx.beginPath();
  ctx.ellipse(x, y - s * 0.02, rx * 0.78, ry * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();
  if (seared) {
    ctx.fillStyle = 'rgba(110,58,20,0.55)';
    for (const [bx, by, br] of [[-0.2, -0.1, 0.09], [0.16, 0.12, 0.07]]) {
      ctx.beginPath();
      ctx.arc(x + bx * s, y + by * s, br * s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#7a4a20';
    ctx.lineWidth = Math.max(1, s * 0.05);
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x + i * s * 0.14 - s * 0.05, y - s * 0.2);
      ctx.lineTo(x + i * s * 0.14 + s * 0.05, y + s * 0.2);
      ctx.stroke();
    }
  }
  gloss(ctx, x - rx * 0.4, y - ry * 0.4, rx * 0.24, ry * 0.16, -0.5, 0.4);
}

function broth(ctx, x, y, s, state) {
  const c = INGREDIENTS.broth;
  const seared = state === 'seared';
  shadow(ctx, x, y + s * 0.28, s * 0.36, s * 0.12, 0.3);
  ctx.fillStyle = '#3b2a1c';
  ctx.beginPath();
  ctx.ellipse(x, y + s * 0.02, s * 0.4, s * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5d4630';
  ctx.beginPath();
  ctx.ellipse(x, y - s * 0.02, s * 0.36, s * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = seared ? '#e8ab55' : '#835f34';
  ctx.beginPath();
  ctx.ellipse(x, y - s * 0.03, s * 0.3, s * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = Math.max(1, s * 0.05);
  ctx.beginPath();
  ctx.ellipse(x, y - s * 0.05, s * 0.17, s * 0.13, 0.3, 0.4, 2.6);
  ctx.stroke();
  if (seared) {
    ctx.fillStyle = 'rgba(255,250,238,0.8)';
    for (const [bx, by, br] of [[-0.14, -0.16, 0.055], [0.09, -0.22, 0.04], [0.16, -0.06, 0.035]]) {
      ctx.beginPath();
      ctx.arc(x + bx * s, y + by * s, br * s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(255,246,232,0.5)';
    ctx.lineWidth = Math.max(1.2, s * 0.05);
    for (let i = 0; i < 2; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x - s * 0.12 + i * s * 0.2, y - s * 0.3);
      ctx.quadraticCurveTo(x - s * 0.18 + i * s * 0.2, y - s * 0.44, x - s * 0.1 + i * s * 0.2, y - s * 0.56);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.beginPath();
    ctx.ellipse(x - s * 0.1, y - s * 0.1, s * 0.1, s * 0.05, -0.4, 0, Math.PI * 2);
    ctx.fill();
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
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#241a14';
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.4, size * 0.31, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3f2c1e';
    ctx.beginPath();
    ctx.ellipse(x - size * 0.06, y - size * 0.05, size * 0.22, size * 0.15, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,120,60,0.5)';
    ctx.beginPath();
    ctx.arc(x + size * 0.1, y + size * 0.04, size * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  const key = state === 'chopped' ? 'chopped' : state === 'seared' ? 'seared' : 'raw';
  drawer(ctx, x, y, size, key);
}

/** The plate itself: a warm cream rim with real thickness, a shadowed well and one thin copper line. */
export function drawPlateBase(ctx, x, y, size) {
  const rx = size * 0.5;
  const ry = size * 0.34;
  ctx.save();
  // a plate standing on a counter has a soft, wide shadow, not a sticker under it
  shadow(ctx, x, y + size * 0.1, rx * 1.06, ry * 1.0, 0.4);
  // the thickness of the rim, showing under the near edge
  ctx.fillStyle = '#9e8f76';
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.032, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  const rim = ctx.createLinearGradient(x - rx, y - ry, x + rx, y + ry);
  rim.addColorStop(0, '#fffdf6');
  rim.addColorStop(0.42, '#f4ecdc');
  rim.addColorStop(0.78, '#ded2ba');
  rim.addColorStop(1, '#b9ab92');
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  // the rim's inner wall, in shadow at the bottom where the well cuts down into it
  ctx.strokeStyle = 'rgba(146,128,102,0.5)';
  ctx.lineWidth = Math.max(1, size * 0.016);
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.004, rx * 0.86, ry * 0.84, 0, 0.15, Math.PI - 0.15);
  ctx.stroke();
  const well = ctx.createRadialGradient(x - rx * 0.22, y - ry * 0.34, rx * 0.1, x, y, rx * 0.82);
  well.addColorStop(0, '#fffef9');
  well.addColorStop(0.55, '#f6eedd');
  well.addColorStop(1, '#ded1b8');
  ctx.fillStyle = well;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.005, rx * 0.79, ry * 0.76, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(150,132,104,0.6)';
  ctx.lineWidth = Math.max(1, size * 0.012);
  ctx.beginPath();
  ctx.ellipse(x, y, rx * 0.79, ry * 0.76, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(193,116,66,0.55)';
  ctx.lineWidth = Math.max(1, size * 0.012);
  ctx.beginPath();
  ctx.ellipse(x, y, rx * 0.89, ry * 0.88, 0, 0, Math.PI * 2);
  ctx.stroke();
  // porcelain: one broad sheen over the upper left of the rim, one small hot spot
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = Math.max(1.6, size * 0.036);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.ellipse(x, y, rx * 0.945, ry * 0.93, 0, Math.PI * 1.12, Math.PI * 1.52);
  ctx.stroke();
  ctx.restore();
  gloss(ctx, x - rx * 0.38, y - ry * 0.52, rx * 0.2, ry * 0.09, -0.35, 0.8);
  ctx.restore();
}

const LAYOUTS = {
  1: [[0, 0.02, 1.0]],
  2: [[-0.21, 0.03, 0.98], [0.2, -0.02, 0.94]],
  3: [[-0.23, -0.05, 0.92], [0.22, -0.07, 0.9], [0.0, 0.21, 0.92]],
  4: [[-0.23, -0.13, 0.84], [0.23, -0.13, 0.84], [-0.15, 0.2, 0.84], [0.15, 0.2, 0.84]],
};

/** A smear of sauce in the well, under whatever is laid on it. */
function sauce(ctx, x, y, size, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.075;
  ctx.lineCap = 'round';
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.02, size * 0.22, -0.4, 2.3);
  ctx.stroke();
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = size * 0.03;
  ctx.beginPath();
  ctx.arc(x + size * 0.03, y - size * 0.02, size * 0.3, 2.6, 5.4);
  ctx.stroke();
  ctx.lineCap = 'butt';
  ctx.restore();
}

/**
 * A plate holding whatever components have been laid on it so far, spread so each part reads: the
 * sauce first, then each finished component in its own corner of the well.
 */
export function drawPlate(ctx, parts, x, y, size, sauceColor = '#c2663a') {
  drawPlateBase(ctx, x, y, size);
  const count = Math.min(parts.length, 4);
  if (count > 0) sauce(ctx, x, y, size, sauceColor);
  const layout = LAYOUTS[count] || [];
  for (let index = 0; index < count; index += 1) {
    const part = parts[index];
    const spot = layout[index];
    const state = part.state === 'burnt' ? 'burnt' : part.done ? (part.method === 'chop' ? 'chopped' : 'seared') : 'raw';
    drawIngredient(ctx, part.ingredient, state, x + spot[0] * size, y + spot[1] * size, size * 0.56 * spot[2]);
  }
  if (count === 0) return;
  // the finish: three dots of sauce walked round the rim, and a sprig laid across the top
  ctx.save();
  ctx.fillStyle = sauceColor;
  for (const [dx, dy, r] of [[-0.3, 0.2, 0.03], [-0.19, 0.29, 0.022], [-0.37, 0.06, 0.017]]) {
    ctx.globalAlpha = 0.82;
    ctx.beginPath();
    ctx.arc(x + dx * size, y + dy * size, r * size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = '#5d7f3c';
  ctx.lineWidth = Math.max(1, size * 0.013);
  ctx.beginPath();
  ctx.moveTo(x + size * 0.02, y - size * 0.12);
  ctx.quadraticCurveTo(x + size * 0.12, y - size * 0.2, x + size * 0.24, y - size * 0.11);
  ctx.stroke();
  for (let i = 0; i < 4; i += 1) {
    const px = x + size * (0.05 + i * 0.05);
    const py = y - size * (0.145 + Math.sin(i * 1.1) * 0.03);
    ctx.fillStyle = i % 2 === 0 ? '#7aa055' : '#5c7f3c';
    ctx.beginPath();
    ctx.ellipse(px, py - size * 0.018, size * 0.032, size * 0.016, i % 2 === 0 ? -0.6 : 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** A finished dish plated for a ticket, the pass or the end card: its parts, then its garnish on top. */
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
  drawIngredient(ctx, garnish, garnish === 'herb' ? 'chopped' : 'seared', x + size * 0.04, y - size * 0.14, size * 0.22);
}