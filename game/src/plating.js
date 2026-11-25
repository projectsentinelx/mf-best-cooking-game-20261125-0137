// The plate under construction: how many of a called dish's components are already down, which one
// has to go on next, and the "2 of 3" chip and ghost ingredient that say both at a glance. The
// rules live in recipes.js; this module only turns them into something the cook can read mid-rush.
import { FONT, PALETTE } from './config.js';
import { INGREDIENTS, METHOD_LABEL } from './pantry.js';
import { partKey } from './recipes.js';
import { drawIngredient, drawPlate } from './food.js';
import { fillRound, roundRect } from './paint.js';

/**
 * What the plate in play is becoming. Picks the called dish whose components match most of what is
 * already down, and reports the first component it still wants — or none, when the plate is done.
 */
export function assemblySummary(plateParts, recipes) {
  let best = { placed: 0, total: 0, next: null, recipe: null, colour: PALETTE.muted };
  for (const recipe of recipes) {
    const left = recipe.parts.slice();
    let placed = 0;
    for (const part of plateParts) {
      if (!part.done) continue;
      const index = left.findIndex((wanted) => partKey(wanted) === partKey(part));
      if (index === -1) continue;
      left.splice(index, 1);
      placed += 1;
    }
    if (placed > best.placed && placed > 0) {
      best = {
        placed,
        total: recipe.parts.length,
        next: left.length > 0 ? left[0] : null,
        recipe,
        colour: PALETTE.ok,
      };
    }
  }
  if (best.placed === 0 && recipes.length > 0) {
    best = { placed: 0, total: recipes[0].parts.length, next: recipes[0].parts[0], recipe: recipes[0], colour: PALETTE.muted };
  }
  return best;
}

/** The next component as a short line: "Thyme · Chop". */
export function nextLabel(summary) {
  if (!summary.next) return 'ready for the pass';
  return `${INGREDIENTS[summary.next.ingredient].name} · ${METHOD_LABEL[summary.next.method]}`;
}

/**
 * The plate being built: the finished parts already laid down, then the one that is still to go,
 * held as a ghost above the rim so the cook can see the gap it has to fill.
 */
export function drawPlateInProgress(ctx, parts, x, y, size, summary) {
  drawPlate(ctx, parts, x, y, size);
  if (!summary.next) return;
  const gx = x + size * 0.3;
  const gy = y - size * 0.2;
  ctx.save();
  // the empty spot, waiting
  ctx.setLineDash([size * 0.045, size * 0.035]);
  ctx.strokeStyle = 'rgba(242,192,105,0.85)';
  ctx.lineWidth = Math.max(1.2, size * 0.014);
  ctx.beginPath();
  ctx.arc(gx, gy, size * 0.17, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  // the ghost of the component, half-lit, drifting up as if it is about to be set down
  ctx.globalAlpha = 0.72;
  drawIngredient(ctx, summary.next.ingredient, summary.next.method === 'chop' ? 'chopped' : 'seared', gx, gy - size * 0.05, size * 0.3);
  ctx.globalAlpha = 1;
  // a small arrow from the ghost down onto the plate
  ctx.fillStyle = 'rgba(242,192,105,0.9)';
  ctx.beginPath();
  ctx.moveTo(gx - size * 0.02, gy + size * 0.15);
  ctx.lineTo(gx + size * 0.02, gy + size * 0.15);
  ctx.lineTo(gx, gy + size * 0.21);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** The chip under a plate: "2 of 3" plus the name of the component still wanted. */
export function drawAssemblyBadge(ctx, x, y, summary) {
  const done = summary.placed >= summary.total && summary.total > 0;
  const text = summary.total > 0 ? `${summary.placed} of ${summary.total}` : 'empty plate';
  ctx.save();
  ctx.font = `700 12px ${FONT}`;
  const chipW = ctx.measureText(text).width + 20;
  const w = chipW + 10;
  fillRound(ctx, x - w / 2, y - 13, w, 24, 12, done ? 'rgba(60,110,62,0.92)' : 'rgba(12,17,21,0.88)');
  ctx.strokeStyle = done ? 'rgba(126,208,138,0.9)' : 'rgba(242,192,105,0.75)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, x - w / 2, y - 13, w, 24, 12);
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = done ? '#eaffe6' : PALETTE.cream;
  ctx.fillText(text, x, y);
  ctx.textBaseline = 'alphabetic';
  ctx.restore();
}