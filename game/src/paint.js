// Canvas primitives shared by the room, the food and the rail: rounded rectangles, wood and tile
// fills, light pools and steam. No game state is read here, only numbers.
export function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export function fillRound(ctx, x, y, w, h, r, color) {
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = color;
  ctx.fill();
}

/** A vertical gradient inside a rectangle, from the top colour to the bottom one. */
export function vGradient(ctx, x, y, w, h, top, bottom) {
  const gradient = ctx.createLinearGradient(0, y, 0, y + h);
  gradient.addColorStop(0, top);
  gradient.addColorStop(1, bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, w, h);
}

/** Wood: lit from the upper left, long grain, a bright lip where the key catches the far edge and a
 *  darker band along the near edge where the surface turns down into a face. */
export function plank(ctx, x, y, w, h, base, dark, light) {
  litSurface(ctx, x, y, w, h, light, base);
  grain(ctx, x, y, w, h, dark, 'rgba(255,232,186,0.13)');
  ctx.fillStyle = dark;
  ctx.globalAlpha = 0.5;
  ctx.fillRect(x, y + h - Math.max(2, h * 0.09), w, Math.max(2, h * 0.09));
  ctx.globalAlpha = 1;
  ctx.fillStyle = light;
  ctx.fillRect(x, y, w, Math.max(1.5, h * 0.035));
}

/** A soft radial pool of lamp light. */
export function lightPool(ctx, x, y, radius, color, strength) {
  const gradient = ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalAlpha = strength;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** One curl of steam: a wobbling blob that fades as it rises. `life` runs 1 (fresh) down to 0. */
export function steamPuff(ctx, x, y, size, life, drift) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, life) * 0.5;
  ctx.fillStyle = 'rgba(255,247,235,0.9)';
  ctx.beginPath();
  ctx.ellipse(x + Math.sin(life * 7 + drift) * 5, y, size * (1.5 - life * 0.5), size * (1.1 - life * 0.3), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ------------------------------------------------------------------ light and material
//
// The room is lit from one warm key high and to the left — the window over the sink and the pass
// lamp — with a cool fill off the right-hand wall. Everything below obeys that: a shadow falls down
// and to the right of the thing casting it, a horizontal surface is brightest toward the upper left,
// and a vertical face is a stop darker than the surface that meets it.

/** A soft cast shadow, centred under `x, y+…`, thrown down and to the right of the key. */
export function castShadow(ctx, x, y, rx, ry, alpha = 0.34) {
  ctx.save();
  ctx.translate(x + rx * 0.24, y + ry * 0.42);
  ctx.scale(1, Math.max(0.08, ry / rx));
  const gradient = ctx.createRadialGradient(0, 0, rx * 0.12, 0, 0, rx);
  gradient.addColorStop(0, `rgba(0,0,0,${alpha})`);
  gradient.addColorStop(0.58, `rgba(0,0,0,${alpha * 0.5})`);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, rx, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** A surface lit from the upper left: brightest at the near corner, falling into shadow far right. */
export function litSurface(ctx, x, y, w, h, light, dark) {
  const gradient = ctx.createLinearGradient(x, y, x + w * 0.85, y + h * 1.25);
  gradient.addColorStop(0, light);
  gradient.addColorStop(0.42, light);
  gradient.addColorStop(1, dark);
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, w, h);
}

/** Grain lines and a specular sheen along a work surface — wood, not a colour block. */
export function grain(ctx, x, y, w, h, line, sheen) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  // long boards, wavering a little so the grain is not a barcode
  for (let i = 0; i < 7; i += 1) {
    const gy = y + h * (0.1 + i * 0.135);
    const bend = ((i * 37) % 9) - 4;
    ctx.strokeStyle = line;
    ctx.globalAlpha = 0.16 + (i % 3) * 0.06;
    ctx.lineWidth = Math.max(1, h * 0.006);
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.quadraticCurveTo(x + w * 0.5, gy + bend, x + w, gy + bend * 0.4);
    ctx.stroke();
  }
  // the sheen where the key lands, up near the left of the surface
  const glow = ctx.createLinearGradient(x, y, x + w * 0.55, y);
  glow.addColorStop(0, sheen);
  glow.addColorStop(0.5, 'rgba(255,255,255,0)');
  ctx.globalAlpha = 1;
  ctx.fillStyle = glow;
  ctx.fillRect(x, y, w * 0.55, h);
  ctx.restore();
}

/** A vertical face under a lit edge: darker than the top, with one bright line where they meet. */
export function fascia(ctx, x, y, w, h, dark, lip) {
  ctx.fillStyle = dark;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = lip;
  ctx.fillRect(x, y, w, Math.max(1.5, h * 0.14));
}

/** A cool fill from the right and a warm key from the upper left, laid over a whole band. */
export function keyWash(ctx, x, y, w, h, warm = 0.07, cool = 0.1) {
  const key = ctx.createRadialGradient(x + w * 0.18, y, 0, x + w * 0.18, y, w * 0.9);
  key.addColorStop(0, `rgba(255,214,150,${warm})`);
  key.addColorStop(0.55, 'rgba(255,214,150,0)');
  ctx.fillStyle = key;
  ctx.fillRect(x, y, w, h);
  const fill = ctx.createLinearGradient(x, 0, x + w, 0);
  fill.addColorStop(0, 'rgba(52,80,110,0)');
  fill.addColorStop(0.62, 'rgba(52,80,110,0)');
  fill.addColorStop(1, `rgba(40,66,96,${cool})`);
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

/** A ring gauge: an arc from the top, clockwise, over a faint track. */
export function ring(ctx, x, y, radius, width, fraction, color, track) {
  ctx.lineWidth = width;
  ctx.strokeStyle = track;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
  if (fraction <= 0) return;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, fraction));
  ctx.stroke();
  ctx.lineCap = 'butt';
}

export function star(ctx, x, y, radius, color) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 === 0 ? radius : radius * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}
