// The room itself: the cool tiled wall with the house chalkboard and its hanging copper, the far
// counter, the narrow aisle, the pantry counter under its warm lamp and the bar front below. Nothing
// here is state — it is the same kitchen every shift, painted once a frame so the lamps can breathe
// and the steam can cross it. Every band comes from config.js, so the room and the stations agree.
import { BACK, FIELD, FOREGROUND, FRONT, PALETTE, WALL } from './config.js';
import { castShadow, fillRound, grain, keyWash, lightPool, litSurface, plank, vGradient } from './paint.js';
import { RECIPES } from './recipes.js';

const FONT = '"Trebuchet MS", "Segoe UI", Verdana, sans-serif';

// The room is painted wider and deeper than the 1280x720 stage. The camera moves in on a station in
// some scenes, and the bands have to keep going past the frame edge instead of stopping at it.
const L = -460;
const R = FIELD.width + 460;
const W = R - L;
const BOTTOM = FIELD.height + 460;

function tileWall(ctx) {
  const top = WALL.top;
  const height = WALL.bottom - top;
  // The wall is warmed where the window and the pass lamp stand at the left of the room, and cools
  // and darkens toward the far right corner — one light, one gradient, whole wall.
  const base = ctx.createLinearGradient(-380, top - 30, 1200, top + height);
  base.addColorStop(0, '#3c7670');
  base.addColorStop(0.3, '#2a5a55');
  base.addColorStop(0.72, '#1d4041');
  base.addColorStop(1, '#102629');
  ctx.fillStyle = base;
  ctx.fillRect(L, top, W, height);

  const tileW = 62;
  const tileH = 40;
  // grout first: a dark bed the tiles sit in
  ctx.fillStyle = 'rgba(8,20,20,0.5)';
  for (let row = 0; row * tileH <= height; row += 1) {
    ctx.fillRect(L, top + row * tileH - 1, W, 2);
  }
  for (let row = 0; row * tileH <= height; row += 1) {
    const offset = row % 2 === 0 ? 0 : -tileW / 2;
    for (let col = -9; col * tileW < R + tileW; col += 1) {
      const x = col * tileW + offset;
      const y = top + row * tileH;
      const tone = ((row * 7 + col * 13) % 7) / 7;
      // each tile its own glaze: a hair lighter or greener than its neighbours
      ctx.fillStyle = tone > 0.5 ? `rgba(240,255,238,${0.025 + tone * 0.04})` : `rgba(6,26,24,${0.05 + tone * 0.08})`;
      ctx.fillRect(x + 1, y + 1, tileW - 2, tileH - 2);
      // the bevel: light along the top and left, shadow along the bottom and right
      ctx.fillStyle = 'rgba(206,246,236,0.13)';
      ctx.fillRect(x + 1.5, y + 1.5, tileW - 3, 1.6);
      ctx.fillRect(x + 1.5, y + 1.5, 1.6, tileH - 3);
      ctx.fillStyle = 'rgba(0,0,0,0.24)';
      ctx.fillRect(x + 1.5, y + tileH - 3, tileW - 3, 1.6);
      ctx.fillRect(x + tileW - 3, y + 1.5, 1.6, tileH - 3);
    }
  }
  // the key catches the grout on the left of the room and loses it to the right
  const grout = ctx.createLinearGradient(-300, 0, 1250, 0);
  grout.addColorStop(0, 'rgba(196,240,230,0.16)');
  grout.addColorStop(0.55, 'rgba(196,240,230,0.04)');
  grout.addColorStop(1, 'rgba(196,240,230,0)');
  ctx.fillStyle = grout;
  ctx.fillRect(L, top, W, height);
  const shade = ctx.createLinearGradient(0, top, 0, WALL.bottom);
  shade.addColorStop(0, 'rgba(4,10,12,0.5)');
  shade.addColorStop(0.4, 'rgba(4,10,12,0.06)');
  shade.addColorStop(1, 'rgba(4,10,12,0.5)');
  ctx.fillStyle = shade;
  ctx.fillRect(L, top, W, height);
}

/** The house menu, chalked on the wall: the five plates the kitchen cooks, and what they pay. */
function chalkboard(ctx) {
  const x = 34;
  const y = 150;
  const w = 392;
  const h = 104;
  castShadow(ctx, x + w / 2, y + h + 2, w * 0.62, 22, 0.4);
  fillRound(ctx, x - 8, y - 8, w + 16, h + 16, 7, '#3a230d');
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
  castShadow(ctx, 440 + 192, y + 12, 196, 14, 0.45);
  ctx.fillStyle = '#3f2712';
  ctx.fillRect(440, y, 384, 10);
  litSurface(ctx, 440, y - 1, 384, 6, '#a9713f', '#7d4f2a');
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

/**
 * The wall over the rail: one brass rod, the tools a line hangs on it and a run of dockets clipped
 * along it, plus a column of chalk tallies. It sits behind the tickets in a stop darker than the
 * cream paper, so the band above the wall is dressed without ever competing with an order card.
 */
function wallDressing(ctx) {
  const rodY = 38;
  const rod = ctx.createLinearGradient(0, rodY, 0, rodY + 6);
  rod.addColorStop(0, 'rgba(226,190,132,0.42)');
  rod.addColorStop(0.42, 'rgba(136,102,62,0.62)');
  rod.addColorStop(1, 'rgba(40,28,16,0.55)');
  ctx.fillStyle = rod;
  ctx.fillRect(16, rodY, 1024, 5);
  for (const bx of [16, 1036]) {
    ctx.fillStyle = 'rgba(44,30,16,0.55)';
    ctx.fillRect(bx - 3, rodY - 4, 8, 14);
  }

  // a pale silhouette per tool: bowl of a ladle, loops of a whisk, mesh of a sieve. The two at the
  // right of the ticket stack are the only ones the rail leaves visible up here.
  const pale = 'rgba(206,232,222,0.26)';
  const line = 'rgba(214,238,228,0.22)';
  for (const [kind, tx] of [['ladle', 1028], ['sieve', 1072]]) {
    ctx.strokeStyle = pale;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(tx, rodY + 5);
    ctx.lineTo(tx, kind === 'sieve' ? rodY + 44 : rodY + 52);
    ctx.stroke();
    ctx.fillStyle = 'rgba(24,34,32,0.55)';
    if (kind === 'ladle') {
      ctx.beginPath();
      ctx.ellipse(tx, rodY + 60, 9, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = pale;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(tx, rodY + 60, 9, 10, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (kind === 'whisk') {
      ctx.strokeStyle = line;
      ctx.lineWidth = 1.6;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.ellipse(tx, rodY + 60, 5 + i * 3.4, 13 + i * 2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      ctx.beginPath();
      ctx.ellipse(tx, rodY + 52, 13, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = pale;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(tx, rodY + 52, 13, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(206,232,222,0.14)';
      ctx.lineWidth = 1;
      for (let i = -2; i <= 2; i += 1) {
        ctx.beginPath();
        ctx.moveTo(tx + i * 5, rodY + 48);
        ctx.lineTo(tx + i * 5, rodY + 56);
        ctx.stroke();
      }
    }
  }

  // the run of order dockets: flimsy, clipped, each a shade off the wall
  for (const [dx, tilt] of [[866, -0.05], [910, 0.03], [954, -0.02]]) {
    ctx.save();
    ctx.translate(dx, rodY + 6);
    ctx.rotate(tilt);
    ctx.fillStyle = 'rgba(8,16,16,0.45)';
    ctx.fillRect(3, 4, 36, 52);
    ctx.fillStyle = 'rgba(236,226,200,0.44)';
    ctx.fillRect(0, 0, 36, 52);
    ctx.strokeStyle = 'rgba(198,224,214,0.28)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, 35, 51);
    // the ink on the slip: a dish line, two components, a price
    ctx.fillStyle = 'rgba(40,48,42,0.62)';
    ctx.fillRect(5, 8, 20, 2.4);
    ctx.fillStyle = 'rgba(52,60,52,0.42)';
    for (let i = 0; i < 4; i += 1) ctx.fillRect(6, 16 + i * 7.5, i === 3 ? 13 : 22, 1.5);
    ctx.fillStyle = 'rgba(60,74,66,0.85)';
    ctx.fillRect(14, -3, 8, 7);
    ctx.restore();
  }

  // chalk tallies, one column, ticked through the shift
  ctx.strokeStyle = 'rgba(214,240,228,0.2)';
  ctx.lineWidth = 2;
  for (let group = 0; group < 3; group += 1) {
    const gx = 1084 + group * 17;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(gx + i * 4, 96);
      ctx.lineTo(gx + i * 4 + 1, 120);
      ctx.stroke();
    }
  }

  // The strip of wall that actually shows — between the chalkboard and the pass cabinet, above the
  // spice shelf — was the flattest teal in the frame. A brass rail with the line's ladles, whisk and
  // sieve hangs here, and a plate ledge at the far end. Everything stops above the jars and sits a
  // stop paler than the wall, so the band is dressed without competing with the tickets.
  const toolY = 146;
  const toolRail = ctx.createLinearGradient(0, toolY, 0, toolY + 6);
  toolRail.addColorStop(0, 'rgba(238,202,144,0.72)');
  toolRail.addColorStop(0.45, 'rgba(168,124,72,0.85)');
  toolRail.addColorStop(1, 'rgba(46,30,14,0.7)');
  ctx.fillStyle = toolRail;
  ctx.fillRect(440, toolY, 426, 6);
  ctx.fillStyle = 'rgba(255,232,186,0.35)';
  ctx.fillRect(440, toolY, 426, 1.5);
  for (const bx of [440, 862]) {
    ctx.fillStyle = 'rgba(28,18,8,0.7)';
    ctx.fillRect(bx - 4, toolY - 4, 9, 13);
    ctx.fillStyle = 'rgba(190,146,88,0.5)';
    ctx.fillRect(bx - 3, toolY - 3, 2, 11);
  }

  const steel = 'rgba(222,244,234,0.55)';
  for (const [kind, tx] of [['ladle', 478], ['whisk', 558], ['sieve', 638], ['ladle', 718]]) {
    // the wall takes the tool's shadow before the tool itself
    ctx.fillStyle = 'rgba(4,12,12,0.4)';
    ctx.beginPath();
    ctx.ellipse(tx + 5, toolY + 38, kind === 'whisk' ? 9 : 11, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    // the hook and the shaft
    ctx.strokeStyle = 'rgba(214,238,228,0.5)';
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(tx, toolY + 5);
    ctx.lineTo(tx, toolY + 33);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(18,30,28,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tx + 2, toolY + 6);
    ctx.lineTo(tx + 2, toolY + 33);
    ctx.stroke();
    // each head keeps its own mass so the run still reads when the cover is thumbnailed
    if (kind === 'ladle') {
      ctx.fillStyle = '#b06a3a';
      ctx.beginPath();
      ctx.ellipse(tx, toolY + 43, 10, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,210,150,0.5)';
      ctx.beginPath();
      ctx.ellipse(tx - 3, toolY + 40, 4, 5, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,236,200,0.6)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(tx, toolY + 43, 10, 11, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (kind === 'whisk') {
      ctx.strokeStyle = 'rgba(214,238,228,0.5)';
      ctx.lineWidth = 1.8;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.ellipse(tx, toolY + 41, 4.5 + i * 3.4, 10 + i * 2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(214,238,228,0.32)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(tx - 9, toolY + 34);
      ctx.lineTo(tx + 9, toolY + 52);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(tx + 9, toolY + 34);
      ctx.lineTo(tx - 9, toolY + 52);
      ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(28,44,40,0.85)';
      ctx.beginPath();
      ctx.ellipse(tx, toolY + 35, 14, 5.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = steel;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(tx, toolY + 35, 14, 5.6, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(222,244,234,0.3)';
      ctx.lineWidth = 1;
      for (let i = -3; i <= 3; i += 1) {
        ctx.beginPath();
        ctx.moveTo(tx + i * 4, toolY + 31);
        ctx.lineTo(tx + i * 4, toolY + 39);
        ctx.stroke();
      }
      // the short handle from the rim up to the hook
      ctx.strokeStyle = 'rgba(214,238,228,0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(tx, toolY + 5);
      ctx.lineTo(tx, toolY + 30);
      ctx.stroke();
    }
  }

  // the plate ledge at the end of the run, clean plates stacked where the pass can reach them
  ctx.fillStyle = 'rgba(8,18,18,0.4)';
  ctx.fillRect(792, toolY + 42, 74, 5);
  ctx.fillStyle = '#4a2f18';
  ctx.fillRect(792, toolY + 40, 74, 6);
  litSurface(ctx, 792, toolY + 40, 74, 3, '#a9713f', '#7d4f2a');
  for (const sx of [812, 846]) {
    for (let i = 0; i < 3; i += 1) {
      const py = toolY + 38 - i * 5;
      ctx.fillStyle = 'rgba(40,52,48,0.55)';
      ctx.beginPath();
      ctx.ellipse(sx, py + 2, 14, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ded8c6';
      ctx.beginPath();
      ctx.ellipse(sx, py, 14, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,252,240,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(sx, py - 1, 9, 2.4, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
    }
  }
}

/**
 * The far counter's working stretch: the board with a half onion and the knife that cut it, the
 * bowl of beaten egg, and a stack of clean plates with a cloth, each with its contact shadow. Set
 * down in the gaps the pans leave, never in front of them.
 */
function prepBench(ctx) {
  const base = 399;

  // board, onion, knife
  ctx.save();
  castShadow(ctx, 62, base - 4, 56, 12, 0.42);
  fillRound(ctx, 16, base - 22, 92, 22, 5, '#9d6c3b');
  ctx.fillStyle = 'rgba(255,232,190,0.22)';
  ctx.fillRect(20, base - 22, 84, 3);
  ctx.fillStyle = 'rgba(52,32,16,0.28)';
  ctx.fillRect(20, base - 4, 84, 3);
  ctx.strokeStyle = 'rgba(60,38,18,0.35)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(24, base - 17 + i * 5);
    ctx.quadraticCurveTo(62, base - 18 + i * 5, 100, base - 16 + i * 5);
    ctx.stroke();
  }
  // half onion, cut face up
  ctx.fillStyle = '#e8dcc0';
  ctx.beginPath();
  ctx.ellipse(52, base - 25, 17, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f6efe0';
  ctx.beginPath();
  ctx.ellipse(52, base - 27, 14, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(160,120,140,0.55)';
  ctx.lineWidth = 1;
  for (let r = 3; r <= 11; r += 4) {
    ctx.beginPath();
    ctx.ellipse(52, base - 27, r, r * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(196,168,140,0.8)';
  ctx.beginPath();
  ctx.ellipse(52, base - 27, 2.5, 1.6, 0, 0, Math.PI * 2);
  ctx.fill();
  // the knife, laid down where the hand left it
  ctx.save();
  ctx.translate(88, base - 32);
  ctx.rotate(-0.22);
  ctx.fillStyle = 'rgba(12,18,20,0.3)';
  ctx.beginPath();
  ctx.ellipse(4, 4, 21, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c9d2cf';
  ctx.beginPath();
  ctx.moveTo(-16, -3.5);
  ctx.lineTo(9, -1.5);
  ctx.lineTo(9, 2.5);
  ctx.lineTo(-16, 3.5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillRect(-14, -2.5, 22, 1.4);
  ctx.fillStyle = '#59391f';
  fillRound(ctx, 9, -3, 15, 6, 2, '#59391f');
  ctx.restore();
  ctx.restore();

  // bowl of beaten egg
  ctx.save();
  castShadow(ctx, 162, base - 2, 30, 9, 0.4);
  ctx.fillStyle = '#8d9c96';
  ctx.beginPath();
  ctx.ellipse(162, base - 8, 24, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d7dcd4';
  ctx.beginPath();
  ctx.ellipse(162, base - 11, 23, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8d489';
  ctx.beginPath();
  ctx.ellipse(162, base - 12, 19, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,250,214,0.7)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(160, base - 12, 9, 0.4, 2.2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.ellipse(148, base - 15, 6, 2, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // clean plates, stacked, and the cloth they were dried with
  ctx.save();
  castShadow(ctx, 646, base - 3, 34, 10, 0.4);
  for (let i = 0; i < 3; i += 1) {
    const py = base - 6 - i * 6;
    ctx.fillStyle = '#8c9187';
    ctx.beginPath();
    ctx.ellipse(646, py + 2, 29, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e2ddcd';
    ctx.beginPath();
    ctx.ellipse(646, py, 29, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(646, py - 1, 21, 4.6, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
  ctx.save();
  castShadow(ctx, 700, base - 2, 26, 7, 0.32);
  fillRound(ctx, 676, base - 18, 50, 16, 4, '#e4d9c1');
  ctx.fillStyle = 'rgba(164,54,44,0.85)';
  ctx.fillRect(676, base - 12, 50, 4);
  ctx.fillStyle = 'rgba(0,0,0,0.14)';
  ctx.fillRect(676, base - 6, 50, 2);
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fillRect(678, base - 18, 46, 2);
  ctx.restore();
}

/** The far counter: the hot line, the stock pot and the shelf under it. */
function backCounter(ctx, t) {
  plank(ctx, L, BACK.top, W, BACK.bottom - BACK.top, PALETTE.counter, '#6b4526', PALETTE.counterTop);
  // the wall throws its shadow onto the back edge of the counter; the near edge falls into a fascia
  const under = ctx.createLinearGradient(0, BACK.top, 0, BACK.top + 46);
  under.addColorStop(0, 'rgba(4,10,12,0.62)');
  under.addColorStop(0.55, 'rgba(4,10,12,0.22)');
  under.addColorStop(1, 'rgba(4,10,12,0)');
  ctx.fillStyle = under;
  ctx.fillRect(L, BACK.top, W, 46);
  ctx.fillStyle = 'rgba(255,222,168,0.16)';
  ctx.fillRect(L, BACK.top + 46, W, 3);
  ctx.fillStyle = '#3f2712';
  ctx.fillRect(L, BACK.bottom - 16, W, 16);
  ctx.fillStyle = 'rgba(255,206,140,0.2)';
  ctx.fillRect(L, BACK.bottom - 16, W, 2);

  // the stock pot, simmering between the pans and the pass
  const px = 786;
  castShadow(ctx, px, 386, 64, 18, 0.5);
  fillRound(ctx, px - 48, 300, 96, 84, 12, '#7e4220');
  const potSide = ctx.createLinearGradient(px - 48, 0, px + 48, 0);
  potSide.addColorStop(0, 'rgba(255,196,132,0.5)');
  potSide.addColorStop(0.3, 'rgba(255,176,104,0.1)');
  potSide.addColorStop(0.78, 'rgba(40,16,6,0.34)');
  potSide.addColorStop(1, 'rgba(24,10,4,0.6)');
  fillRound(ctx, px - 48, 300, 96, 84, 12, potSide);
  ctx.fillStyle = 'rgba(255,236,196,0.34)';
  ctx.fillRect(px - 38, 308, 5, 66);
  fillRound(ctx, px - 56, 290, 112, 16, 8, '#5c2f1a');
  fillRound(ctx, px - 48, 292, 96, 6, 3, '#d5965e');
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
  vGradient(ctx, L, 398, W, FRONT.top - 398, '#37271c', '#241811');
  // the floor takes the same key as the wall: warm at the left, cool and dark at the right
  const floorLight = ctx.createLinearGradient(-200, 398, 1240, 470);
  floorLight.addColorStop(0, 'rgba(255,196,124,0.22)');
  floorLight.addColorStop(0.42, 'rgba(255,186,112,0.07)');
  floorLight.addColorStop(1, 'rgba(30,54,80,0.3)');
  ctx.fillStyle = floorLight;
  ctx.fillRect(L, 398, W, FRONT.top - 398);
  // the two counters overhang the aisle and shade its edges
  const lip = ctx.createLinearGradient(0, 398, 0, 418);
  lip.addColorStop(0, 'rgba(0,0,0,0.55)');
  lip.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = lip;
  ctx.fillRect(L, 398, W, 20);
  ctx.strokeStyle = 'rgba(0,0,0,0.32)';
  ctx.lineWidth = 2;
  for (let y = 412; y < FRONT.top; y += 18) {
    ctx.beginPath();
    ctx.moveTo(L, y);
    ctx.lineTo(R, y);
    ctx.stroke();
  }
  for (let x = L + 12; x < R; x += 84) {
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.moveTo(x, 398);
    ctx.lineTo(x - 12, FRONT.top);
    ctx.stroke();
  }
  for (const lx of [300, 640, 980]) lightPool(ctx, lx, 442, 210, 'rgba(255,203,126,0.55)', 0.5);
  // one worn runner down the whole line, so the aisle is a working floor with a history
  for (const [x0, x1] of [[150, 872], [886, 1230]]) {
    ctx.fillStyle = 'rgba(112,44,40,0.62)';
    ctx.fillRect(x0, 412, x1 - x0, 44);
    ctx.strokeStyle = 'rgba(242,192,105,0.32)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x0 + 6, 417, x1 - x0 - 12, 34);
    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    for (let x = x0 + 14; x < x1 - 12; x += 20) ctx.fillRect(x, 417, 2, 34);
  }
  aisleProps(ctx);
}

/**
 * The things a line keeps on the floor at the head and foot of the aisle: a stack of folded cloths,
 * two prep bowls and a crate of tomatoes coming in. One object each end, both on the runner, both
 * with a shadow, so the floor between the two counters has something for the eye to land on.
 */
function aisleProps(ctx) {
  // folded cloths, stacked and slightly out of true
  ctx.save();
  ctx.translate(86, 440);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(3, 15, 44, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  const cloths = [['#e7dcc4', 0], ['#a8402f', 7], ['#efe5cf', 14], ['#8f4030', 21]];
  for (const [color, lift] of cloths) {
    fillRound(ctx, -38, 10 - lift, 76, 8, 3, color);
    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    ctx.fillRect(-38, 15 - lift, 76, 1.6);
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    ctx.fillRect(-38, 10 - lift, 76, 1.4);
  }
  ctx.restore();

  // two prep bowls, the smaller stacked in the larger
  ctx.save();
  ctx.translate(178, 436);
  ctx.fillStyle = 'rgba(0,0,0,0.34)';
  ctx.beginPath();
  ctx.ellipse(2, 16, 34, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3f4a4e';
  ctx.beginPath();
  ctx.ellipse(0, 2, 30, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#b9c3c0';
  ctx.beginPath();
  ctx.ellipse(0, 0, 27, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5b6a6d';
  ctx.beginPath();
  ctx.ellipse(0, 1, 22, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4a585b';
  ctx.beginPath();
  ctx.ellipse(6, -6, 17, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c9d2ce';
  ctx.beginPath();
  ctx.ellipse(6, -7, 15, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.ellipse(-8, -4, 7, 2.4, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // a crate of tomatoes waiting to go up to the pass
  ctx.save();
  ctx.translate(1150, 436);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(2, 16, 40, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  fillRound(ctx, -36, -8, 72, 24, 3, '#6f4c2e');
  ctx.fillStyle = 'rgba(40,26,14,0.55)';
  ctx.fillRect(-32, -6, 64, 14);
  for (const [bx, by, r] of [[-20, -6, 9], [-2, -10, 10], [17, -6, 9], [6, 1, 8], [-12, 2, 8]]) {
    ctx.fillStyle = '#b93a2b';
    ctx.beginPath();
    ctx.arc(bx, by, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(bx - r * 0.3, by - r * 0.35, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#8a5c33';
  ctx.fillRect(-38, 12, 76, 5);
  ctx.restore();
}

/** The pantry counter the cook works along, under the warmest lamp in the room. */
function frontCounter(ctx) {
  plank(ctx, L, FRONT.top, W, FRONT.bottom - FRONT.top, '#96663c', '#7a4f28', '#c08a4a');
  // the back counter and the cook throw a shadow onto the far edge of this one
  const under = ctx.createLinearGradient(0, FRONT.top, 0, FRONT.top + 40);
  under.addColorStop(0, 'rgba(6,10,12,0.55)');
  under.addColorStop(0.7, 'rgba(6,10,12,0.14)');
  under.addColorStop(1, 'rgba(6,10,12,0)');
  ctx.fillStyle = under;
  ctx.fillRect(L, FRONT.top, W, 40);
  // a pool of lamp light across the work surface, strongest over the plate station
  lightPool(ctx, 470, FRONT.top + 54, 360, 'rgba(255,206,132,0.6)', 0.62);
  lightPool(ctx, 1055, FRONT.top + 50, 340, 'rgba(255,214,146,0.72)', 0.72);
  lightPool(ctx, 880, FRONT.top + 66, 220, 'rgba(255,198,120,0.4)', 0.4);
  // the near edge turns down into a face, so the surface has thickness
  ctx.fillStyle = '#40281a';
  ctx.fillRect(L, FRONT.bottom - 16, W, 16);
  ctx.fillStyle = 'rgba(255,196,126,0.28)';
  ctx.fillRect(L, FRONT.bottom - 16, W, 2.5);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(L, FRONT.bottom - 20, W, 4);
}

/** The bar front: panelled wood, two niches of produce and the house plaque. */
function barFront(ctx) {
  vGradient(ctx, L, FOREGROUND.top, W, BOTTOM - FOREGROUND.top, '#4a2f1d', '#2c1b0e');
  ctx.strokeStyle = 'rgba(0,0,0,0.32)';
  ctx.lineWidth = 3;
  for (let x = L + 24; x < R; x += 168) {
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
  ctx.fillRect(L, WALL.top - 320, W, BOTTOM - WALL.top + 320);
  tileWall(ctx);
  wallDressing(ctx);
  chalkboard(ctx);
  shelf(ctx);
  hangingPans(ctx, t);
  lightPool(ctx, 640, WALL.bottom, 260, 'rgba(255,206,132,0.4)', 0.4);
  backCounter(ctx, t);
  prepBench(ctx);
  barFront(ctx);
  aisle(ctx);
  frontCounter(ctx);
  // One light over the whole room: warm in from the upper left, cool fill off the right-hand wall.
  keyWash(ctx, L, WALL.top, W, BOTTOM - WALL.top, 0.1, 0.16);
  // a soft vignette so the eye stays on the counters
  const vignette = ctx.createRadialGradient(FIELD.width / 2, 440, 340, FIELD.width / 2, 440, 860);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.46)');
  ctx.fillStyle = vignette;
  ctx.fillRect(L, WALL.top - 200, W, BOTTOM - WALL.top + 200);
}

/**
 * The air over the kitchen, painted after the furniture so it sits in front of it: the warm haze
 * under the pass lamp, a cool drift in from the right, and two soft plumes off the pans. Kept thin —
 * a frame has to stay crisp at thumbnail size.
 */
export function drawAtmosphere(ctx, t) {
  const haze = ctx.createRadialGradient(1064, 300, 10, 1064, 300, 230);
  haze.addColorStop(0, `rgba(255,214,150,${0.12 + 0.02 * Math.sin(t * 2.1)})`);
  haze.addColorStop(0.45, 'rgba(255,206,136,0.05)');
  haze.addColorStop(1, 'rgba(255,206,136,0)');
  ctx.fillStyle = haze;
  ctx.fillRect(L, 0, W, BOTTOM);

  // steam off the two pans, made of overlapping ellipses that drift up and fade together
  for (const [cx, base] of [[272, 306], [498, 306]]) {
    for (let i = 0; i < 4; i += 1) {
      const rise = ((t * 15 + i * 26) % 96);
      const alpha = Math.max(0, 0.15 - rise * 0.0015);
      const sway = Math.sin(t * 0.8 + i * 1.6) * 9;
      ctx.fillStyle = `rgba(255,248,236,${alpha})`;
      ctx.beginPath();
      ctx.ellipse(cx - 12 + i * 8 + sway, base - rise, 26 + rise * 0.22, 15 + rise * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const fill = ctx.createLinearGradient(760, 0, 1340, 0);
  fill.addColorStop(0, 'rgba(40,68,102,0)');
  fill.addColorStop(1, 'rgba(34,60,92,0.2)');
  ctx.fillStyle = fill;
  ctx.fillRect(760, 0, 580, BOTTOM);
}