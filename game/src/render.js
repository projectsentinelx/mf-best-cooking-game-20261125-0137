// Painting one frame: the room, then the stations, then the cook, then the rail over everything, and
// a card instead when the shift has not started, is paused or is over. The 1280x720 stage is fitted
// to the window and centred so screenshots and play match pixel for pixel.
import { FIELD, FONT, PALETTE } from './config.js';
import { drawRoom, drawAtmosphere } from './room.js';
import { drawStations } from './stations.js';
import { drawChef } from './chef.js';
import { drawRail, drawRushBanner } from './hud.js';
import { fillRound, star } from './paint.js';
import { drawDish } from './food.js';
import { recipeById } from './recipes.js';
import { SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, shiftReport } from './world.js';
import { INGREDIENTS } from './pantry.js';

function actionHint(station, chef) {
  if (!station) return null;
  if (station.kind === 'crate') return chef.carry ? 'Hands full' : `E · ${INGREDIENTS[station.ingredient].name}`;
  if (station.kind === 'board') {
    if (station.item && !station.item.done) return 'Hold E · chop';
    if (station.item) return 'E · take it';
    return 'E · set it down';
  }
  if (station.kind === 'burner') return station.item ? 'E · off the heat' : 'E · to the pan';
  if (station.kind === 'plate') return station.plate.parts.length > 0 ? 'E · take the plate' : 'E · plate up';
  if (station.kind === 'pass') return 'E · serve';
  if (station.kind === 'bin') return 'E · bin it';
  return null;
}

function drawHint(ctx, world) {
  const station = world.lastStation && world.lastStation.kind !== 'pass' ? world.lastStation : world.lastStation;
  const hint = actionHint(station, world.chef);
  if (!hint) return;
  const y = station.kind === 'crate' || station.kind === 'board' || station.kind === 'plate' || station.kind === 'bin' ? 468 : 398;
  ctx.font = `700 13px ${FONT}`;
  const width = ctx.measureText(hint).width + 22;
  const x = Math.min(FIELD.width - width - 8, Math.max(8, station.x - width / 2));
  fillRound(ctx, x, y - 26, width, 24, 12, 'rgba(12,17,21,0.9)');
  ctx.strokeStyle = 'rgba(232,178,90,0.6)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = PALETTE.brass;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(hint, x + width / 2, y - 13);
  ctx.textBaseline = 'alphabetic';
}

function drawFootText(ctx, text, color, y, size) {
  ctx.font = `600 ${size}px ${FONT}`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(text, FIELD.width / 2, y);
}

function drawToasts(ctx, world) {
  let index = 0;
  for (const item of world.toasts) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, item.life * 1.6);
    ctx.font = `700 18px ${FONT}`;
    ctx.fillStyle = item.color;
    ctx.textAlign = 'center';
    ctx.fillText(item.text, FIELD.width / 2, 250 + item.y + index * 24);
    ctx.restore();
    index += 1;
  }
}

function panel(ctx, x, y, w, h) {
  fillRound(ctx, x, y, w, h, 14, PALETTE.panel);
  ctx.strokeStyle = 'rgba(232,178,90,0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawTitle(ctx, world, best) {
  ctx.fillStyle = 'rgba(8,10,14,0.66)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  const w = 760;
  const h = 430;
  const x = (FIELD.width - w) / 2;
  const y = (FIELD.height - h) / 2;
  panel(ctx, x, y, w, h);

  ctx.textAlign = 'center';
  ctx.font = `700 52px ${FONT}`;
  ctx.fillStyle = PALETTE.brass;
  ctx.fillText('COPPER & THYME', FIELD.width / 2, y + 96);
  ctx.font = `600 16px ${FONT}`;
  ctx.fillStyle = PALETTE.muted;
  ctx.fillText('a bistro line, one cook, three minutes to close', FIELD.width / 2, y + 126);

  const lines = [
    'Walk the aisle with W A S D or the arrow keys.',
    'E takes, sets down, chops and sears — hold E at the board to chop through.',
    'Sear in a copper pan and lift it out before the edges catch.',
    'Plate the finished parts, then serve the plate at the pass.',
  ];
  ctx.textAlign = 'left';
  ctx.font = `600 15px ${FONT}`;
  for (let i = 0; i < lines.length; i += 1) {
    ctx.fillStyle = PALETTE.text;
    ctx.fillText(lines[i], x + 60, y + 176 + i * 26);
  }

  ctx.textAlign = 'center';
  ctx.font = `700 20px ${FONT}`;
  ctx.fillStyle = PALETTE.ember;
  const pulse = 0.65 + 0.35 * Math.abs(Math.sin(performance.now() / 520));
  ctx.globalAlpha = pulse;
  ctx.fillText('Press Space or click to start the shift', FIELD.width / 2, y + h - 64);
  ctx.globalAlpha = 1;
  ctx.font = `600 13px ${FONT}`;
  ctx.fillStyle = PALETTE.muted;
  ctx.fillText(best > 0 ? `House record: $${best} in a shift` : 'No record set yet — the board is yours', FIELD.width / 2, y + h - 34);
}

function drawStars(ctx, count, x, y) {
  for (let i = 0; i < 3; i += 1) {
    star(ctx, x + i * 52, y, 20, i < count ? PALETTE.brass : 'rgba(255,255,255,0.14)');
  }
}

function drawOver(ctx, world) {
  const report = shiftReport(world);
  ctx.fillStyle = 'rgba(8,10,14,0.7)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  const w = 700;
  const h = 420;
  const x = (FIELD.width - w) / 2;
  const y = (FIELD.height - h) / 2;
  panel(ctx, x, y, w, h);
  ctx.textAlign = 'center';
  ctx.font = `700 40px ${FONT}`;
  ctx.fillStyle = PALETTE.brass;
  ctx.fillText('SERVICE CLOSED', FIELD.width / 2, y + 76);

  drawStars(ctx, report.stars, FIELD.width / 2 - 52, y + 118);

  const rows = [
    ['Takings', `$${report.earned}`],
    ['Plates served', String(report.served)],
    ['Longest combo', `x${report.bestCombo}`],
    ['Walked out', String(report.walkouts)],
  ];
  ctx.font = `600 16px ${FONT}`;
  for (let i = 0; i < rows.length; i += 1) {
    const rowY = y + 176 + i * 32;
    ctx.textAlign = 'left';
    ctx.fillStyle = PALETTE.muted;
    ctx.fillText(rows[i][0], x + 70, rowY);
    ctx.textAlign = 'right';
    ctx.fillStyle = PALETTE.text;
    ctx.fillText(rows[i][1], x + 360, rowY);
  }
  // the house plate, drawn by the same code that draws it mid-service
  const housePlate = recipeById('melt');
  if (housePlate) {
    drawDish(ctx, housePlate, x + w - 130, y + 210, 190);
    ctx.font = `600 12px ${FONT}`;
    ctx.fillStyle = PALETTE.muted;
    ctx.textAlign = 'center';
    ctx.fillText('the house plate', x + w - 130, y + 320);
  }

  ctx.textAlign = 'center';
  ctx.font = `700 18px ${FONT}`;
  ctx.fillStyle = PALETTE.ember;
  ctx.fillText('Press Space or click to open again', FIELD.width / 2, y + h - 46);
}

function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(8,10,14,0.6)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  panel(ctx, FIELD.width / 2 - 220, FIELD.height / 2 - 80, 440, 160);
  ctx.textAlign = 'center';
  ctx.font = `700 34px ${FONT}`;
  ctx.fillStyle = PALETTE.brass;
  ctx.fillText('Paused', FIELD.width / 2, FIELD.height / 2 - 10);
  ctx.font = `600 15px ${FONT}`;
  ctx.fillStyle = PALETTE.muted;
  ctx.fillText('The pans will wait. Press P to pick the shift back up.', FIELD.width / 2, FIELD.height / 2 + 36);
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    // A browser can report a viewport of nothing for the first instant of a page. Keep the last
    // good size instead of collapsing the stage to zero and painting an empty canvas.
    const width = Math.round((canvas.clientWidth || document.documentElement.clientWidth || 0) * ratio);
    const height = Math.round((canvas.clientHeight || document.documentElement.clientHeight || 0) * ratio);
    if (width < 40 || height < 40) {
      if (canvas.width < 40) {
        canvas.width = FIELD.width;
        canvas.height = FIELD.height;
        view.scale = 1;
        view.x = 0;
        view.y = 0;
      }
      return;
    }
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    view.scale = Math.min(width / FIELD.width, height / FIELD.height);
    view.x = (width - FIELD.width * view.scale) / 2;
    view.y = (height - FIELD.height * view.scale) / 2;
  }

  /** Paint a frame of the shift at presentation time `t`, plus the screen's card if it has one. */
  function draw(world, t, best) {
    if (canvas.width < 40 || canvas.height < 40) resize();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = PALETTE.backdrop;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);

    const shakeX = world.shake > 0 ? Math.sin(t * 60) * world.shake * 5 : 0;
    // The camera: the kitchen is painted around a focus point at a zoom, so a scene can stand the
    // viewer at the chopping board or over the pass while the rail and the clock stay where they
    // are. At zoom 1 and focus 640,366 this is the wide view the game plays at.
    const cam = world.camera || { x: FIELD.width / 2, y: 366, zoom: 1 };
    ctx.save();
    ctx.translate(FIELD.width / 2 + shakeX, FIELD.height / 2);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(-cam.x, -cam.y);
    drawRoom(ctx, t);
    drawStations(ctx, world, t, world.screen === 'play' ? world.lastStation : null);
    drawChef(ctx, world.chef, t);
    drawAtmosphere(ctx, t);
    ctx.restore();
    // a screen-space vignette closes the frame whatever the camera is doing
    const edge = ctx.createRadialGradient(FIELD.width / 2, FIELD.height / 2, 300, FIELD.width / 2, FIELD.height / 2, 800);
    edge.addColorStop(0, 'rgba(0,0,0,0)');
    edge.addColorStop(1, 'rgba(0,0,0,0.38)');
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);

    drawRail(ctx, world);
    drawRushBanner(ctx, world, t);
    if (world.screen === SCREEN_PLAY || world.screen === SCREEN_PAUSED) drawHint(ctx, world);
    drawFootText(ctx, 'WASD / arrows to move · E to act · hold E to chop · click a station to walk there', 'rgba(246,231,205,0.55)', 706, 13);
    drawToasts(ctx, world);

    if (world.screen === SCREEN_TITLE) drawTitle(ctx, world, best);
    else if (world.screen === SCREEN_PAUSED) drawPaused(ctx);
    else if (world.screen === SCREEN_OVER) drawOver(ctx, world);
  }

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('load', resize);
  return {
    draw,
    resize,
    /** Canvas pixels (as the mouse reports them) to stage coordinates. */
    toStage(clientX, clientY) {
      return { x: (clientX - view.x) / view.scale, y: (clientY - view.y) / view.scale };
    },
  };
}
