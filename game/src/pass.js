// The pass: the hatch under its warm lamp, the finished plates that land on its shelf, and the beat
// when a dish goes out — the lamp flares, the plate slides under it, and it fades as the room takes
// it away. The pass is the end of every route through the kitchen, so it gets the brightest light.
import { FONT, PALETTE } from './config.js';
import { drawServedDish } from './dishes.js';
import { fillRound, castShadow, lightPool, steamPuff } from './paint.js';

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

  // the shelf's own kit at the near end by the bell: clean plates waiting in a stack, so the pass
  // reads as a working shelf. Drawn before the waiting dishes so a dish sits in front, and cleared
  // away when three dishes are waiting and the shelf is full.
  const nearX = box.x + box.w - 62;
  if (pass.plates.length < 3) {
    castShadow(ctx, nearX, shelfY - 4, 40, 12, 0.45);
    for (let i = 0; i < 3; i += 1) {
      const py = shelfY - 6 - i * 6;
      ctx.fillStyle = 'rgba(96,84,62,0.55)';
      ctx.beginPath();
      ctx.ellipse(nearX, py + 2, 30, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e7ddc6';
      ctx.beginPath();
      ctx.ellipse(nearX, py, 30, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,250,235,0.65)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(nearX, py - 1.5, 21, 4.4, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
    }
  }

  // the docket spike hung on the frame, its tickets still curled from the pass
  ctx.save();
  ctx.translate(box.x + 58, box.y - 4);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(-2, 0, 4, 30);
  ctx.fillStyle = '#b08b46';
  ctx.fillRect(-1.6, 0, 3.2, 28);
  ctx.beginPath();
  ctx.ellipse(0, 28, 5, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  for (const [dx, tilt] of [[-2, -0.16], [7, 0.1]]) {
    ctx.save();
    ctx.translate(dx, 6);
    ctx.rotate(tilt);
    ctx.fillStyle = 'rgba(20,14,8,0.45)';
    ctx.fillRect(1, 2, 24, 28);
    ctx.fillStyle = 'rgba(240,228,200,0.86)';
    ctx.fillRect(0, 0, 24, 28);
    ctx.fillStyle = 'rgba(90,70,44,0.5)';
    for (let i = 0; i < 3; i += 1) ctx.fillRect(4, 9 + i * 6, i === 2 ? 9 : 16, 1.4);
    ctx.fillStyle = 'rgba(58,42,24,0.8)';
    ctx.fillRect(8, -1, 8, 4);
    ctx.restore();
  }
  ctx.restore();

  // every plate waiting under the lamp, spread across the shelf and clear of the clean stack
  const count = pass.plates.length;
  const slot = count > 1 ? Math.min(112, (box.w - 168) / (count - 1)) : 0;
  const startX = count === 1 ? box.x + box.w / 2 : count === 2 ? box.x + 118 : box.x + 84;
  for (let i = 0; i < count; i += 1) {
    const plate = pass.plates[i];
    const age = 1 - plate.life;
    const x = startX + i * slot + age * 14;
    ctx.save();
    ctx.globalAlpha = Math.min(1, plate.life * 2.2);
    castShadow(ctx, x, shelfY - 4, 60, 15, 0.5);
    drawServedDish(ctx, plate.recipe, x, shelfY - 20 - age * 6, 116);
    // the lamp lands on the dish itself — the brightest thing in the room
    const lit = ctx.createRadialGradient(x - 12, shelfY - 40, 4, x - 8, shelfY - 34, 74);
    lit.addColorStop(0, 'rgba(255,226,168,0.16)');
    lit.addColorStop(1, 'rgba(255,226,168,0)');
    ctx.fillStyle = lit;
    ctx.beginPath();
    ctx.ellipse(x, shelfY - 34, 66, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    // a dish still hot enough to steam under the lamp
    for (let w = 0; w < 3; w += 1) {
      steamPuff(ctx, x - 20 + w * 20, shelfY - 52 - w * 9, 7 + w * 2, 0.72 - w * 0.16, w * 1.7 + i);
    }
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