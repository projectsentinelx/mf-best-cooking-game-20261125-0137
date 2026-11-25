// The room itself: tiled wall, hanging copper, the two wooden counters, the floor between them and
// the bar front below. Nothing here is state — it is the same kitchen every shift, painted once a
// frame so the lamps can breathe and the steam from the pans drifts across it.
import { BACK, FIELD, FOREGROUND, FRONT, PALETTE, WALL } from './config.js';
import { fillRound, lightPool, plank, vGradient } from './paint.js';

function tileWall(ctx) {
  const top = WALL.top;
  const height = WALL.bottom - top;
  vGradient(ctx, 0, top, FIELD.width, height, '#22484a', '#152c2e');
  const tileW = 64;
  const tileH = 34;
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(58,110,108,0.55)';
  for (let row = 0; row * tileH < height; row += 1) {
    const y = top + row * tileH;
    const offset = row % 2 === 0 ? 0 : -tileW / 2;
    for (let col = -1; col * tileW < FIELD.width + tileW; col += 1) {
      const x = col * tileW + offset;
      ctx.strokeRect(x, y, tileW, tileH);
      ctx.fillStyle = (row + col) % 3 === 0 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.05)';
      ctx.fillRect(x + 1, y + 1, tileW - 2, tileH - 2);
    }
  }
  // the tiles fall into shadow behind the pass
  const shade = ctx.createLinearGradient(0, top, 0, WALL.bottom);
  shade.addColorStop(0, 'rgba(0,0,0,0.35)');
  shade.addColorStop(0.5, 'rgba(0,0,0,0.05)');
  shade.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, top, FIELD.width, height);
}

function sconces(ctx) {
  for (const lx of [300, 640, 980]) {
    ctx.strokeStyle = '#3a2a1c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(lx, 250);
    ctx.lineTo(lx, 262);
    ctx.stroke();
    ctx.fillStyle = '#b0742f';
    ctx.beginPath();
    ctx.moveTo(lx - 20, 262);
    ctx.lineTo(lx + 20, 262);
    ctx.lineTo(lx + 10, 276);
    ctx.lineTo(lx - 10, 276);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,223,160,0.95)';
    ctx.beginPath();
    ctx.ellipse(lx, 277, 15, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    lightPool(ctx, lx, 286, 74, 'rgba(255,209,140,0.55)', 0.55);
  }
}

function shelf(ctx) {
  const y = 176;
  ctx.fillStyle = '#5b3a22';
  ctx.fillRect(28, y + 44, 430, 9);
  ctx.fillStyle = '#7a5233';
  ctx.fillRect(28, y + 44, 430, 3);
  const jars = [
    [56, 26, '#c9a04b', 'OIL'], [96, 30, '#7d8f4a', 'HERB'], [138, 24, '#b5563a', 'PEPP'],
    [176, 32, '#d9c07a', 'SALT'], [218, 26, '#8a5a33', 'STOCK'], [258, 30, '#a8477a', 'BEET'],
    [300, 24, '#c98a3c', 'HONEY'], [338, 28, '#5b7a8a', 'VINEG'],
  ];
  for (const [x, h, color, label] of jars) {
    fillRound(ctx, x, y + 44 - h, 30, h, 5, color);
    fillRound(ctx, x, y + 44 - h, 30, 7, 3, 'rgba(255,255,255,0.35)');
    ctx.fillStyle = 'rgba(20,14,8,0.55)';
    ctx.fillRect(x + 3, y + 44 - h + 14, 24, 9);
    ctx.font = '700 6px "Trebuchet MS", sans-serif';
    ctx.fillStyle = 'rgba(246,231,205,0.8)';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + 15, y + 44 - h + 21);
  }
  // a sprig of dried thyme hanging from the shelf end
  ctx.strokeStyle = '#6f8f4a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(452, y + 46);
  ctx.lineTo(448, y + 84);
  ctx.stroke();
  for (let i = 0; i < 6; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? '#7aa055' : '#5c7f3c';
    ctx.beginPath();
    ctx.ellipse(450 + (i % 2 === 0 ? -5 : 5), y + 56 + i * 5, 6, 3, i % 2 === 0 ? -0.5 : 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function hangingPans(ctx, t) {
  const swing = Math.sin(t * 0.9) * 0.01;
  const pans = [[960, 92, 34], [1032, 78, 28], [1096, 96, 30], [1168, 84, 26]];
  for (const [x, y, r] of pans) {
    ctx.save();
    ctx.translate(x, WALL.top + 10);
    ctx.rotate(swing);
    ctx.strokeStyle = '#8a6236';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, y - 40);
    ctx.stroke();
    ctx.fillStyle = '#b06a38';
    ctx.beginPath();
    ctx.arc(0, y - 12, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d08a4c';
    ctx.beginPath();
    ctx.arc(-r * 0.25, y - 18, r * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7a4a26';
    ctx.fillRect(r - 2, y - 18, 16, 6);
    ctx.restore();
  }
}

function sign(ctx) {
  ctx.font = '700 19px "Trebuchet MS", sans-serif';
  ctx.fillStyle = PALETTE.brass;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('COPPER & THYME', 486, 206);
  ctx.font = '600 10px "Trebuchet MS", sans-serif';
  ctx.fillStyle = 'rgba(246,231,205,0.55)';
  ctx.fillText('BISTRO · OPEN LATE', 488, 222);
}

function backCounter(ctx) {
  plank(ctx, 0, BACK.top, FIELD.width, BACK.bottom - BACK.top, PALETTE.counter, '#68452a', PALETTE.counterTop);
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.fillRect(0, BACK.top, FIELD.width, 8);
  ctx.fillStyle = '#4d3019';
  ctx.fillRect(0, BACK.bottom - 12, FIELD.width, 12);
  ctx.fillStyle = 'rgba(255,214,150,0.12)';
  ctx.fillRect(0, BACK.top + 8, FIELD.width, 4);
  // the stock pot, simmering off to the side of the burners
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(742, 384, 46, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8c4c26';
  fillRound(ctx, 700, 316, 84, 64, 12, '#8c4c26');
  ctx.fillStyle = '#b0663a';
  fillRound(ctx, 706, 320, 30, 52, 10, '#b0663a');
  ctx.fillStyle = '#6b3720';
  fillRound(ctx, 692, 308, 100, 14, 7, '#6b3720');
  ctx.fillStyle = '#c98551';
  fillRound(ctx, 704, 310, 76, 6, 3, '#c98551');
  ctx.strokeStyle = 'rgba(255,246,232,0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(716 + i * 16, 302);
    ctx.quadraticCurveTo(710 + i * 16, 292, 718 + i * 16, 282);
    ctx.stroke();
  }
  ctx.font = '700 9px "Trebuchet MS", sans-serif';
  ctx.fillStyle = 'rgba(246,231,205,0.5)';
  ctx.textAlign = 'center';
  ctx.fillText('STOCK', 742, 394);
}

function floor(ctx) {
  const top = FRONT.top - 124;
  vGradient(ctx, 0, 398, FIELD.width, FRONT.top - 398, '#33241b', '#2a1d15');
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 2;
  for (let y = 430; y < FRONT.top; y += 26) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(FIELD.width, y);
    ctx.stroke();
  }
  for (let x = 0; x < FIELD.width; x += 96) {
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.moveTo(x, 398);
    ctx.lineTo(x - 14, FRONT.top);
    ctx.stroke();
  }
  // light falls from the sconces on the tiled wall into the aisle
  for (const lx of [300, 640, 980]) lightPool(ctx, lx, 470, 215, 'rgba(255,203,126,0.5)', 0.45);
  // a worn runner mat along the pass end of the aisle
  ctx.fillStyle = 'rgba(104,42,38,0.55)';
  ctx.fillRect(852, 468, 376, 46);
  ctx.strokeStyle = 'rgba(232,178,90,0.28)';
  ctx.lineWidth = 2;
  ctx.strokeRect(858, 473, 364, 36);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for (let x = 866; x < 1216; x += 22) ctx.fillRect(x, 473, 2, 36);
  void top;
}

function frontCounter(ctx) {
  plank(ctx, 0, FRONT.top, FIELD.width, 88, '#8a6236', '#774f28', '#a87a45');
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(0, FRONT.top + 88, FIELD.width, 4);
  // face of the counter with its panels and the house plaque
  vGradient(ctx, 0, FOREGROUND.top - 22, FIELD.width, 82, '#4a2f1d', '#33200f');
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 3;
  for (let x = 24; x < FIELD.width; x += 158) {
    ctx.strokeRect(x, FOREGROUND.top - 6, 140, 54);
  }
  const px = FIELD.width / 2;
  fillRound(ctx, px - 132, 654, 264, 34, 6, '#2a1a0e');
  ctx.strokeStyle = PALETTE.brass;
  ctx.lineWidth = 2;
  ctx.strokeRect(px - 128, 658, 256, 26);
  ctx.font = '700 17px "Trebuchet MS", sans-serif';
  ctx.fillStyle = PALETTE.brass;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('COPPER & THYME', px, 671);
  ctx.textBaseline = 'alphabetic';
}

export function drawRoom(ctx, t) {
  ctx.fillStyle = PALETTE.night;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  tileWall(ctx);
  sconces(ctx);
  shelf(ctx);
  hangingPans(ctx, t);
  sign(ctx);
  backCounter(ctx);
  frontCounter(ctx);
  floor(ctx);
  // a soft vignette so the eye stays on the counters
  const vignette = ctx.createRadialGradient(FIELD.width / 2, 430, 260, FIELD.width / 2, 430, 780);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, WALL.bottom, FIELD.width, FIELD.height - WALL.bottom);
}
