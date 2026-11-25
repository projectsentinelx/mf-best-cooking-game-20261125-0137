// The room itself: the cool tiled wall with the house chalkboard and its hanging copper, the far
// counter, the narrow aisle, the pantry counter under its warm lamp and the bar front below. Nothing
// here is state — it is the same kitchen every shift, painted once a frame so the lamps can breathe
// and the steam can cross it. Every band comes from config.js, so the room and the stations agree.
import { BACK, FIELD, FOREGROUND, FRONT, PALETTE, WALL } from './config.js';
import { fillRound, lightPool, plank, vGradient } from './paint.js';
import { RECIPES } from './recipes.js';

const FONT = '"Trebuchet MS", "Segoe UI", Verdana, sans-serif';

function tileWall(ctx) {
  const top = WALL.top;
  const height = WALL.bottom - top;
  vGradient(ctx, 0, top, FIELD.width, height, '#2a5a58', '#152c2e');
  const tileW = 62;
  const tileH = 40;
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(86,150,144,0.55)';
  for (let row = 0; row * tileH <= height; row += 1) {
    const y = top + row * tileH;
    const offset = row % 2 === 0 ? 0 : -tileW / 2;
    for (let col = -1; col * tileW < FIELD.width + tileW; col += 1) {
      const x = col * tileW + offset;
      ctx.fillStyle = (row + col) % 4 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
      ctx.fillRect(x + 1, y + 1, tileW - 2, tileH - 2);
      ctx.strokeRect(x, y, tileW, tileH);
    }
  }
  // the grout catches the lamps: a lit line along each row
  ctx.strokeStyle = 'rgba(190,238,230,0.12)';
  ctx.lineWidth = 1;
  for (let row = 0; row * tileH <= height; row += 1) {
    ctx.beginPath();
    ctx.moveTo(0, top + row * tileH + 1);
    ctx.lineTo(FIELD.width, top + row * tileH + 1);
    ctx.stroke();
  }
  const shade = ctx.createLinearGradient(0, top, 0, WALL.bottom);
  shade.addColorStop(0, 'rgba(0,0,0,0.4)');
  shade.addColorStop(0.45, 'rgba(0,0,0,0.06)');
  shade.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, top, FIELD.width, height);
}

/** The house menu, chalked on the wall: the five plates the kitchen cooks, and what they pay. */
function chalkboard(ctx) {
  const x = 34;
  const y = 150;
  const w = 392;
  const h = 104;
  fillRound(ctx, x - 8, y - 8, w + 16, h + 16, 7, '#43290f');
  fillRound(ctx, x - 4, y - 4, w + 8, h + 8, 5, '#6b4522');
  const slate = ctx.createLinearGradient(x, y, x, y + h);
  slate.addColorStop(0, '#1e2b29');
  slate.addColorStop(1, '#16211f');
  fillRound(ctx, x, y, w, h, 3, slate);
  ctx.strokeStyle = 'rgba(242,192,105,0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 5, y + 5, w - 10, h - 10);

  ctx.textAlign = 'left';
  ctx.font = `700 15px ${FONT}`;
  ctx.fillStyle = PALETTE.brass;
  ctx.fillText('COPPER & THYME', x + 16, y + 24);
  ctx.font = `600 9px ${FONT}`;
  ctx.fillStyle = 'rgba(246,231,205,0.62)';
  ctx.textAlign = 'right';
  ctx.fillText('BISTRO · OPEN LATE', x + w - 16, y + 24);
  ctx.fillStyle = 'rgba(242,192,105,0.35)';
  ctx.fillRect(x + 16, y + 31, w - 32, 1);

  const rows = RECIPES.length;
  for (let index = 0; index < rows; index += 1) {
    const recipe = RECIPES[index];
    const col = index < 3 ? 0 : 1;
    const row = col === 0 ? index : index - 3;
    const cx = x + 18 + col * 188;
    const cy = y + 50 + row * 18;
    ctx.textAlign = 'left';
    ctx.font = `600 11px ${FONT}`;
    ctx.fillStyle = 'rgba(246,231,205,0.9)';
    ctx.fillText(recipe.name, cx, cy);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(242,192,105,0.95)';
    ctx.fillText(`$${recipe.price}`, cx + 168, cy);
    ctx.fillStyle = 'rgba(246,231,205,0.18)';
    const width = ctx.measureText(recipe.name).width;
    ctx.fillRect(cx + width + 6, cy - 3, Math.max(4, 162 - width - 22), 1);
  }
}

/** The shelf of dry goods, and the sprig of thyme hung at its end. */
function shelf(ctx) {
  const y = 244;
  ctx.fillStyle = '#4d3019';
  ctx.fillRect(440, y, 384, 10);
  ctx.fillStyle = '#8a5c33';
  ctx.fillRect(440, y, 384, 4);
  const jars = [
    [456, 30, '#c9a04b', 'OIL'], [492, 34, '#7d8f4a', 'HERB'], [528, 28, '#b5563a', 'PEPP'],
    [562, 36, '#e6d6ae', 'SALT'], [600, 30, '#8a5a33', 'STOCK'], [636, 34, '#a8477a', 'BEET'],
    [674, 28, '#c98a3c', 'HONEY'], [710, 32, '#5b7a8a', 'VINEG'], [746, 30, '#8b6ea8', 'PLUM'],
    [782, 26, '#6f8f4a', 'THYM'],
  ];
  for (const [jx, jh, color, label] of jars) {
    fillRound(ctx, jx, y - jh, 28, jh, 4, color);
    fillRound(ctx, jx, y - jh, 9, jh, 4, 'rgba(255,255,255,0.22)');
    fillRound(ctx, jx + 1, y - jh - 4, 26, 7, 3, '#3c2716');
    ctx.fillStyle = 'rgba(18,12,8,0.5)';
    ctx.fillRect(jx + 3, y - jh + 16, 22, 9);
    ctx.font = `700 6px ${FONT}`;
    ctx.fillStyle = 'rgba(246,231,205,0.85)';
    ctx.textAlign = 'center';
    ctx.fillText(label, jx + 14, y - jh + 23);
  }
  ctx.strokeStyle = '#5f8f4a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(832, y + 4);
  ctx.lineTo(826, y + 40);
  ctx.stroke();
  for (let i = 0; i < 6; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? '#7aa055' : '#5c7f3c';
    ctx.beginPath();
    ctx.ellipse(829 + (i % 2 === 0 ? -5 : 5), y + 12 + i * 5, 6, 3, i % 2 === 0 ? -0.5 : 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function hangingPans(ctx, t) {
  const swing = Math.sin(t * 0.9) * 0.012;
  const pans = [[912, 62, 34], [986, 50, 27], [1052, 66, 32], [1130, 54, 25], [1198, 64, 30]];
  for (const [px, drop, r] of pans) {
    ctx.save();
    ctx.translate(px, WALL.top + 6);
    ctx.rotate(swing);
    ctx.strokeStyle = '#7d5a34';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, drop - 30);
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.arc(2, drop - 8, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a9582c';
    ctx.beginPath();
    ctx.arc(0, drop - 10, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d0803f';
    ctx.beginPath();
    ctx.arc(-r * 0.2, drop - 15, r * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,214,160,0.45)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.35, drop - r * 0.6, r * 0.3, r * 0.14, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6f4222';
    ctx.fillRect(r - 3, drop - 16, 18, 6);
    ctx.restore();
  }
}

/** The far counter: the hot line, the stock pot and the shelf under it. */
function backCounter(ctx, t) {
  plank(ctx, 0, BACK.top, FIELD.width, BACK.bottom - BACK.top, PALETTE.counter, '#6b4526', PALETTE.counterTop);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(0, BACK.top, FIELD.width, 10);
  ctx.fillStyle = 'rgba(255,214,150,0.14)';
  ctx.fillRect(0, BACK.top + 10, FIELD.width, 4);
  ctx.fillStyle = '#4d3019';
  ctx.fillRect(0, BACK.bottom - 14, FIELD.width, 14);

  // the stock pot, simmering between the pans and the pass
  const px = 786;
  ctx.fillStyle = 'rgba(0,0,0,0.34)';
  ctx.beginPath();
  ctx.ellipse(px, 384, 52, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  fillRound(ctx, px - 48, 300, 96, 84, 12, '#8c4c26');
  fillRound(ctx, px - 42, 304, 34, 70, 10, '#b0663a');
  fillRound(ctx, px - 56, 290, 112, 16, 8, '#6b3720');
  fillRound(ctx, px - 48, 292, 96, 6, 3, '#c98551');
  ctx.fillStyle = 'rgba(255,246,232,0.4)';
  for (let i = 0; i < 4; i += 1) {
    const w = 2 + (i % 2);
    ctx.beginPath();
    ctx.moveTo(px - 28 + i * 20, 286 - (t * 8 + i * 5) % 26);
    ctx.quadraticCurveTo(px - 36 + i * 20, 272 - (t * 8 + i * 5) % 26, px - 26 + i * 20, 258 - (t * 8 + i * 5) % 26);
    ctx.lineWidth = w;
    ctx.strokeStyle = 'rgba(255,246,232,0.3)';
    ctx.stroke();
  }
  ctx.font = `700 9px ${FONT}`;
  ctx.fillStyle = 'rgba(246,231,205,0.5)';
  ctx.textAlign = 'center';
  ctx.fillText('STOCK', px, 396);
}

/** The aisle: a worn floor between the two counters, lit in pools from the lamps above. */
function aisle(ctx) {
  vGradient(ctx, 0, 398, FIELD.width, FRONT.top - 398, '#37271c', '#241811');
  ctx.strokeStyle = 'rgba(0,0,0,0.32)';
  ctx.lineWidth = 2;
  for (let y = 412; y < FRONT.top; y += 18) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(FIELD.width, y);
    ctx.stroke();
  }
  for (let x = 12; x < FIELD.width; x += 84) {
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.moveTo(x, 398);
    ctx.lineTo(x - 12, FRONT.top);
    ctx.stroke();
  }
  for (const lx of [300, 640, 980]) lightPool(ctx, lx, 440, 200, 'rgba(255,203,126,0.5)', 0.42);
  // the runner mat along the pass end of the aisle
  ctx.fillStyle = 'rgba(112,44,40,0.6)';
  ctx.fillRect(900, 420, 330, 40);
  ctx.strokeStyle = 'rgba(242,192,105,0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(906, 425, 318, 30);
  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  for (let x = 914; x < 1216; x += 20) ctx.fillRect(x, 425, 2, 30);
}

/** The pantry counter the cook works along, under the warmest lamp in the room. */
function frontCounter(ctx) {
  plank(ctx, 0, FRONT.top, FIELD.width, FRONT.bottom - FRONT.top, '#96663c', '#7a4f28', '#c08a4a');
  ctx.fillStyle = 'rgba(0,0,0,0.34)';
  ctx.fillRect(0, FRONT.top, FIELD.width, 8);
  ctx.fillStyle = 'rgba(255,214,150,0.16)';
  ctx.fillRect(0, FRONT.top + 8, FIELD.width, 3);
  // a pool of lamp light across the work surface, strongest over the plate station
  lightPool(ctx, 470, FRONT.top + 40, 330, 'rgba(255,206,132,0.55)', 0.5);
  lightPool(ctx, 1040, FRONT.top + 34, 300, 'rgba(255,214,146,0.6)', 0.55);
  ctx.fillStyle = '#4a2f1d';
  ctx.fillRect(0, FRONT.bottom - 12, FIELD.width, 12);
}

/** The bar front: panelled wood, two niches of produce and the house plaque. */
function barFront(ctx) {
  vGradient(ctx, 0, FOREGROUND.top, FIELD.width, 120, '#4a2f1d', '#2c1b0e');
  ctx.strokeStyle = 'rgba(0,0,0,0.32)';
  ctx.lineWidth = 3;
  for (let x = 24; x < FIELD.width; x += 168) {
    ctx.strokeRect(x, FOREGROUND.top + 14, 150, 60);
  }
  // niches of produce either side of the plaque
  for (const [nx, items] of [[186, ['tomato', '#c9402f']], [1094, ['bread', '#c98a4b']]]) {
    fillRound(ctx, nx - 62, FOREGROUND.top + 12, 124, 66, 6, '#20130a');
    ctx.fillStyle = 'rgba(255,206,132,0.16)';
    ctx.fillRect(nx - 58, FOREGROUND.top + 16, 116, 8);
    for (let i = 0; i < 4; i += 1) {
      ctx.fillStyle = items[1];
      ctx.beginPath();
      ctx.arc(nx - 42 + i * 28, FOREGROUND.top + 58 - (i % 2) * 6, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.arc(nx - 46 + i * 28, FOREGROUND.top + 53 - (i % 2) * 6, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#7a4f28';
    ctx.fillRect(nx - 62, FOREGROUND.top + 76, 124, 6);
  }
  const px = FIELD.width / 2;
  fillRound(ctx, px - 138, FOREGROUND.top + 20, 276, 42, 6, '#2a1a0e');
  ctx.strokeStyle = PALETTE.brass;
  ctx.lineWidth = 2;
  ctx.strokeRect(px - 132, FOREGROUND.top + 25, 264, 32);
  ctx.font = `700 18px ${FONT}`;
  ctx.fillStyle = PALETTE.brass;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('COPPER & THYME', px, FOREGROUND.top + 42);
  ctx.textBaseline = 'alphabetic';
}

export function drawRoom(ctx, t) {
  ctx.fillStyle = PALETTE.night;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  tileWall(ctx);
  chalkboard(ctx);
  shelf(ctx);
  hangingPans(ctx, t);
  lightPool(ctx, 640, WALL.bottom, 260, 'rgba(255,206,132,0.4)', 0.4);
  backCounter(ctx, t);
  barFront(ctx);
  aisle(ctx);
  frontCounter(ctx);
  // a soft vignette so the eye stays on the counters
  const vignette = ctx.createRadialGradient(FIELD.width / 2, 440, 300, FIELD.width / 2, 440, 820);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, WALL.top, FIELD.width, FIELD.height - WALL.top);
}