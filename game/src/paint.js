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

/** Wood grain: a base, a few darker streaks at fixed offsets and a lit top edge. */
export function plank(ctx, x, y, w, h, base, dark, light) {
  ctx.fillStyle = base;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = dark;
  for (let i = 0; i < 5; i += 1) {
    const gy = y + h * (0.16 + i * 0.17);
    ctx.fillRect(x + 6, gy, w - 12, Math.max(1, h * 0.012));
  }
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
