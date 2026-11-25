// The pass: the hatch under its warm lamp, the finished plates that land on its shelf, and the beat
// when a dish goes out — the lamp flares, the plate slides under it, and it fades as the room takes
// it away. The pass is the end of every route through the kitchen, so it gets the brightest light.
import { FONT, PALETTE } from './config.js';
import { drawDish } from './food.js';
import { fillRound, lightPool } from './paint.js';

const PLATE_LIFE = 9;

/** A finished dish lands on the pass shelf: the lamp flares and the plate starts its fade. */
export function sendToPass(pass, recipe, t = 0) {
  pass.plates.push({ recipe, born: t, life: 1 });
  if (pass.plates.length > 3) pass.plates.shift();
  pass.ring = 1;
}

/** Age the plates waiting under the lamp; each one is taken away after a few seconds. */
export function tickPass(pass, dt) {
  for (const plate of pass.plates) plate.life -= dt / PLATE_LIFE;
  pass.plates = pass.plates.filter((plate) => plate.life > 0);
}

/** The lamp over the pass, and the wedge of warm light it throws down onto the shelf. */
function drawLamp(ctx, box, t) {
  const cx = box.x + box.w * 0.5;
  const flicker = 0.92 + 0.08 * Math.sin(t * 3.1);
  const shade = ctx.createLinearGradient(0, box.y - 4, 0, box.y + 66);
  shade.addColorStop(0, 'rgba(255,222,158,0.34)');
  shade.addColorStop(1, 'rgba(255,203,120,0)');
  ctx.save();
  ctx.globalAlpha = flicker;
  ctx.fillStyle = shade;
  ctx.beginPath();
  ctx.moveTo(cx - 30, box.y + 4);
  ctx.lineTo(cx + 30, box.y + 4);
  ctx.lineTo(cx + 128, box.y + box.h + 14);
  ctx.lineTo(cx - 128, box.y + box.h + 14);
  ctx.closePath();
  ctx.fill();
  // the enamel shade
  ctx.fillStyle = '#2c3a3d';
  ctx.beginPath();
  ctx.moveTo(cx - 40, box.y + 2);
  ctx.lineTo(cx + 40, box.y + 2);
  ctx.lineTo(cx + 20, box.y - 20);
  ctx.lineTo(cx - 20, box.y - 20);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#3d5154';
  ctx.beginPath();
  ctx.moveTo(cx - 40, box.y + 2);
  ctx.lineTo(cx + 40, box.y + 2);
  ctx.lineTo(cx + 36, box.y - 3);
  ctx.lineTo(cx - 36, box.y - 3);
  ctx.closePath();
  ctx.fill();
  // the bulb
  ctx.fillStyle = 'rgba(255,238,196,0.98)';
  ctx.beginPath();
  ctx.ellipse(cx, box.y + 4, 24, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  lightPool(ctx, cx, box.y + 30, 96, 'rgba(255,214,140,0.65)', 0.7);
  ctx.restore();
}

/** Draw the hatch, its lamp, its bell and every plate waiting on the shelf. */
export function drawPass(ctx, pass, t) {
  const { box } = pass;
  // the frame in dark wood, then the opening
  fillRound(ctx, box.x - 8, box.y - 26, box.w + 16, box.h + 30, 10, '#3c2716');
  fillRound(ctx, box.x - 4, box.y - 22, box.w + 8, box.h + 22, 8, '#54371f');
  const glow = 0.72 + 0.1 * Math.sin(t * 2) + pass.ring * 0.5;
  const beyond = ctx.createLinearGradient(0, box.y, 0, box.y + box.h);
  beyond.addColorStop(0, '#2a1d10');
  beyond.addColorStop(1, '#6b4a1e');
  ctx.save();
  ctx.globalAlpha = Math.min(1, glow);
  ctx.fillStyle = beyond;
  fillRound(ctx, box.x, box.y, box.w, box.h, 6, beyond);
  ctx.restore();
  // the dining room beyond, a warm blur with table lamps
  ctx.fillStyle = 'rgba(255,208,138,0.5)';
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.arc(box.x + 46 + i * 92, box.y + 34 + (i % 2) * 16, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,236,196,0.28)';
  ctx.fillRect(box.x + 8, box.y + 6, box.w - 16, 5);

  drawLamp(ctx, box, t);

  // the shelf the plates rest on, and the brass bell on its right
  ctx.fillStyle = '#7a4f2a';
  ctx.fillRect(box.x - 6, box.y + box.h - 10, box.w + 12, 16);
  ctx.fillStyle = '#a06a38';
  ctx.fillRect(box.x - 6, box.y + box.h - 10, box.w + 12, 4);
  ctx.fillStyle = PALETTE.brass;
  ctx.beginPath();
  ctx.arc(box.x + box.w - 34, box.y + box.h - 22, 12, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(box.x + box.w - 47, box.y + box.h - 22, 26, 4);
  ctx.fillStyle = '#fff4d4';
  ctx.beginPath();
  ctx.arc(box.x + box.w - 34, box.y + box.h - 30, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // PASS lettered on the frame
  ctx.font = `700 13px ${FONT}`;
  ctx.fillStyle = PALETTE.brass;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('PASS', box.x + 10, box.y - 10);
  ctx.textAlign = 'right';
  ctx.font = `600 10px ${FONT}`;
  ctx.fillStyle = 'rgba(242,192,105,0.7)';
  ctx.fillText('PLATES OUT', box.x + box.w - 12, box.y - 10);

  // every plate waiting under the lamp, newest nearest the middle
  const shelfY = box.y + box.h - 12;
  for (let i = 0; i < pass.plates.length; i += 1) {
    const plate = pass.plates[i];
    const age = 1 - plate.life;
    const x = box.x + 108 + i * 100 + age * 20;
    ctx.save();
    ctx.globalAlpha = Math.min(1, plate.life * 2.2);
    drawDish(ctx, plate.recipe, x, shelfY - 18 - age * 6, 108);
    ctx.restore();
  }

  // the lamp flares when a plate goes out
  if (pass.ring > 0) {
    ctx.save();
    ctx.globalAlpha = pass.ring * 0.8;
    const flare = ctx.createLinearGradient(0, box.y - 20, 0, box.y + box.h);
    flare.addColorStop(0, 'rgba(255,224,150,0)');
    flare.addColorStop(0.4, 'rgba(255,224,150,0.9)');
    flare.addColorStop(1, 'rgba(255,224,150,0)');
    ctx.fillStyle = flare;
    ctx.fillRect(box.x - 4, box.y - 20, box.w + 8, box.h + 20);
    ctx.restore();
  }
}