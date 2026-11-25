// What one press of the action key does at each station, and the clocks the stations run on their
// own: searing advances while the pan is hot, a chop answers a held key or one tap of a knife, and a
// burnt pan empties itself in smoke. Drawing the station furniture lives at the bottom of the file.
import { PALETTE, CHOP_SECONDS, SEAR_READY, SEAR_BURN, SEAR_SECONDS } from './config.js';
import { INGREDIENTS, rawItem } from './pantry.js';
import { drawIngredient, drawPlateBase, drawPlate } from './food.js';
import { fillRound, plank, ring } from './paint.js';

const MAX_PARTS = 4;

/** A fixed-sequence noise source, so sparks and steam fall the same way on every run. */
let noiseSeed = 0x9e3779b9;
function noise() {
  noiseSeed = (Math.imul(noiseSeed, 1664525) + 1013904223) >>> 0;
  return noiseSeed / 4294967296;
}

function puff(kitchen, x, y, size, drift) {
  kitchen.smoke.push({ x, y, size, life: 1, drift });
}

function spark(kitchen, x, y, color) {
  kitchen.sparks.push({
    x,
    y,
    vx: (noise() - 0.5) * 120,
    vy: -40 - noise() * 90,
    life: 1,
    color,
  });
}

function note(kitchen, x, y, text, color) {
  kitchen.flashes.push({ x, y, text, color, life: 1 });
}

/**
 * One interaction at the nearest station. Returns what happened so the world can score a serve, ring
 * the bell or buzz a refusal; `ok` false means the chef was told why not.
 */
export function act(world, station) {
  const { kitchen, chef } = world;
  if (!station) return { ok: false, note: 'Nothing within reach' };

  if (station.kind === 'crate') {
    if (chef.carry) return { ok: false, note: 'Hands are full' };
    chef.carry = { kind: 'item', item: rawItem(station.ingredient) };
    station.bob = 1;
    return { ok: true, note: `Took ${INGREDIENTS[station.ingredient].name}`, sound: 'pick' };
  }

  if (station.kind === 'board') {
    if (chef.carry && chef.carry.kind === 'item') {
      if (chef.carry.item.done) return { ok: false, note: 'That is already finished' };
      if (station.item) return { ok: false, note: 'The board is busy' };
      station.item = chef.carry.item;
      station.item.progress = 0;
      station.item.state = 'working';
      chef.carry = null;
      return { ok: true, note: 'On the board — hold to chop', sound: 'place' };
    }
    if (!chef.carry && station.item) {
      if (!station.item.done) return { ok: false, note: 'Not chopped yet' };
      chef.carry = { kind: 'item', item: station.item };
      station.item = null;
      return { ok: true, note: 'Chopped and ready', sound: 'pick' };
    }
    return { ok: false, note: station.item ? 'Put it down first' : 'Nothing on the board' };
  }

  if (station.kind === 'burner') {
    if (chef.carry && chef.carry.kind === 'item') {
      if (station.item) return { ok: false, note: 'That pan is taken' };
      if (chef.carry.item.done) return { ok: false, note: 'Already seared' };
      station.item = chef.carry.item;
      station.item.state = 'working';
      station.item.progress = 0;
      chef.carry = null;
      station.flare = 1;
      return { ok: true, note: 'In the pan — watch it', sound: 'sizzle' };
    }
    if (!chef.carry && station.item) {
      const item = station.item;
      station.item = null;
      chef.carry = { kind: 'item', item };
      return { ok: true, note: item.done ? 'Off the heat' : 'Underdone', sound: 'pick' };
    }
    return { ok: false, note: station.item ? 'Hands are full' : 'The pan is empty' };
  }

  if (station.kind === 'plate') {
    if (chef.carry && chef.carry.kind === 'item') {
      const item = chef.carry.item;
      if (!item.done) return { ok: false, note: 'Finish it first' };
      if (station.plate.parts.length >= MAX_PARTS) return { ok: false, note: 'The plate is full' };
      station.plate.parts.push(item);
      chef.carry = null;
      note(kitchen, station.x, 512, '+ 1', PALETTE.ok);
      return { ok: true, note: 'On the plate', sound: 'place' };
    }
    if (chef.carry && chef.carry.kind === 'plate') {
      station.plate.parts = chef.carry.parts;
      chef.carry = null;
      return { ok: true, note: 'Plate set down', sound: 'place' };
    }
    if (!chef.carry) {
      if (station.plate.parts.length === 0) return { ok: false, note: 'Take a clean plate first' };
      chef.carry = { kind: 'plate', parts: station.plate.parts };
      station.plate = { parts: [] };
      return { ok: true, note: 'Carrying the plate', sound: 'pick' };
    }
  }

  if (station.kind === 'pass') {
    if (chef.carry && chef.carry.kind === 'plate') return { ok: true, serve: chef.carry.parts, sound: 'bell' };
    if (chef.carry && chef.carry.kind === 'item') return { ok: false, note: 'Plate it before the pass' };
    return { ok: false, note: 'Bring a plated dish' };
  }

  if (station.kind === 'bin') {
    if (!chef.carry) return { ok: false, note: 'Nothing to bin' };
    chef.carry = null;
    station.shake = 1;
    return { ok: true, note: 'Binned', sound: 'bin' };
  }

  return { ok: false, note: 'Nothing here' };
}

/** A knife stroke on the board, from a held key or a click; returns true when the chop completes. */
export function chop(world, amount) {
  const { kitchen } = world;
  const { board } = kitchen;
  const item = board.item;
  if (!item || item.done) return false;
  board.stroke = 1;
  item.progress = Math.min(1, item.progress + amount);
  spark(kitchen, board.x + (noise() - 0.5) * 48, 566, INGREDIENTS[item.ingredient].flesh);
  if (item.progress >= 1) {
    item.done = true;
    item.state = 'ready';
    note(kitchen, board.x, 520, 'Chopped', PALETTE.ok);
    return true;
  }
  return false;
}

/** The station clocks: searing, burning and the smoke and sparks both throw off. */
export function tickStations(kitchen, dt) {
  for (const burner of kitchen.burners) {
    burner.flare = Math.max(0, burner.flare - dt * 2.4);
    const item = burner.item;
    if (!item) continue;
    if (item.state === 'burnt') {
      item.burnTimer = (item.burnTimer || 0) + dt;
      if (item.burnTimer > 0.9) {
        burner.item = null;
        for (let i = 0; i < 4; i += 1) puff(kitchen, burner.x + (i - 1.5) * 14, 330, 11, i * 1.7);
        note(kitchen, burner.x, 300, 'Burnt!', PALETTE.bad);
      }
      continue;
    }
    item.progress = Math.min(item.progress + dt / SEAR_SECONDS, 2);
    if (item.progress >= SEAR_READY) {
      item.done = true;
      item.state = 'ready';
    }
    if (item.progress >= SEAR_BURN) {
      item.state = 'burnt';
      item.done = false;
      item.burnTimer = 0;
      note(kitchen, burner.x, 300, 'Burnt!', PALETTE.bad);
    }
    if (noise() < dt * 4) puff(kitchen, burner.x + (noise() - 0.5) * 36, 324, 4 + noise() * 3, noise() * 6);
  }

  for (let i = kitchen.smoke.length - 1; i >= 0; i -= 1) {
    const cloud = kitchen.smoke[i];
    cloud.life -= dt * 0.85;
    cloud.y -= dt * 34;
    cloud.x += Math.sin((1 - cloud.life) * 4 + cloud.drift) * dt * 12;
    if (cloud.life <= 0) kitchen.smoke.splice(i, 1);
  }

  for (let i = kitchen.sparks.length - 1; i >= 0; i -= 1) {
    const bit = kitchen.sparks[i];
    bit.life -= dt * 1.8;
    bit.x += bit.vx * dt;
    bit.y += bit.vy * dt;
    bit.vy += 420 * dt;
    if (bit.life <= 0) kitchen.sparks.splice(i, 1);
  }

  for (let i = kitchen.flashes.length - 1; i >= 0; i -= 1) {
    const flash = kitchen.flashes[i];
    flash.life -= dt * 1.1;
    flash.y -= dt * 26;
    if (flash.life <= 0) kitchen.flashes.splice(i, 1);
  }

  for (const crate of kitchen.crates) crate.bob = Math.max(0, crate.bob - dt * 4);
  kitchen.bin.shake = Math.max(0, kitchen.bin.shake - dt * 3);
  kitchen.board.stroke = Math.max(0, kitchen.board.stroke - dt * 6);
  kitchen.pass.ring = Math.max(0, kitchen.pass.ring - dt * 1.6);
}

// ---------------------------------------------------------------- drawing

function drawCrate(ctx, crate) {
  const { box } = crate;
  const lift = crate.bob * 3;
  ctx.save();
  ctx.translate(0, -lift);
  plank(ctx, box.x, box.y, box.w, box.h, '#6b4a2d', '#5a3d24', '#8a6238');
  ctx.strokeStyle = '#402a17';
  ctx.lineWidth = 2;
  ctx.strokeRect(box.x + 1, box.y + 1, box.w - 2, box.h - 2);
  fillRound(ctx, box.x + 4, box.y + 4, box.w - 8, 26, 4, 'rgba(20,12,6,0.45)');
  const ingredient = INGREDIENTS[crate.ingredient];
  drawIngredient(ctx, crate.ingredient, 'raw', box.x + box.w / 2, box.y + 20, 40);
  ctx.fillStyle = ingredient.crate;
  ctx.fillRect(box.x + 4, box.y + box.h - 16, box.w - 8, 12);
  ctx.font = '600 10px "Trebuchet MS", sans-serif';
  ctx.fillStyle = 'rgba(255,246,232,0.92)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(crate.label, box.x + box.w / 2, box.y + box.h - 10);
  ctx.restore();
}

function drawBoard(ctx, world, t) {
  const { board } = world.kitchen;
  const { box } = board;
  plank(ctx, box.x, box.y + 14, box.w, box.h - 14, '#b98b52', '#a3763f', '#d3a76a');
  ctx.fillStyle = '#8a6234';
  fillRound(ctx, box.x + box.w - 14, box.y + 4, 18, 14, 4, '#8a6234');
  if (board.item) {
    const item = board.item;
    const state = item.done ? 'chopped' : 'raw';
    drawIngredient(ctx, item.ingredient, state, box.x + box.w / 2 - 6, box.y + 48, 46);
    if (!item.done) ring(ctx, box.x + box.w / 2 - 6, box.y + 48, 30, 4, item.progress, PALETTE.ok, 'rgba(0,0,0,0.3)');
    // The knife comes down on each stroke.
    const swing = board.stroke > 0 ? -0.5 + (1 - board.stroke) * 1.1 : -0.85;
    ctx.save();
    ctx.translate(box.x + box.w / 2 + 24, box.y + 34);
    ctx.rotate(swing);
    ctx.fillStyle = '#dfe4e8';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(42, 6);
    ctx.lineTo(42, 12);
    ctx.lineTo(0, 14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#4a3a2a';
    fillRound(ctx, -20, 2, 22, 9, 4, '#4a3a2a');
    ctx.restore();
  }
  ctx.font = '600 11px "Trebuchet MS", sans-serif';
  ctx.fillStyle = 'rgba(246,231,205,0.6)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('CHOP', box.x + box.w / 2, box.y + 10);
}

function drawBurner(ctx, burner, t) {
  const cx = burner.x;
  const cy = 338;
  // flame tongues under the pan
  for (let i = 0; i < 7; i += 1) {
    const a = -Math.PI + (i * Math.PI) / 6;
    const flicker = 0.7 + 0.3 * Math.sin(t * 9 + i * 1.7 + burner.index);
    const len = (18 + 8 * flicker) * (0.6 + burner.heat * 0.5) + burner.flare * 14;
    ctx.fillStyle = i % 2 === 0 ? PALETTE.ember : PALETTE.emberHot;
    ctx.globalAlpha = 0.55 + 0.35 * flicker;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * 40, cy + 20 + Math.sin(a) * 8);
    ctx.quadraticCurveTo(cx + Math.cos(a) * (40 + len * 0.4), cy + 26 - len * 0.4, cx + Math.cos(a) * (40 + len * 0.2), cy + 18 - len * 0.15);
    ctx.quadraticCurveTo(cx + Math.cos(a) * (44 + len), cy + 22 - len * 0.2, cx + Math.cos(a) * 42, cy + 18);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // grate
  ctx.strokeStyle = '#2b2b30';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, 52, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#3c3c44';
  ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath();
    ctx.moveTo(cx - 46, cy + i * 16);
    ctx.lineTo(cx + 46, cy + i * 16);
    ctx.stroke();
  }
  // copper pan
  const item = burner.item;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 8, 50, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a8572c';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 50, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c9703c';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 3, 46, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a2a20';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 3, 40, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  // handle
  ctx.strokeStyle = '#7a4a26';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(cx + 48, cy);
  ctx.lineTo(cx + 78, cy - 14);
  ctx.stroke();
  if (item) {
    const state = item.state === 'burnt' ? 'burnt' : item.done ? 'seared' : 'raw';
    drawIngredient(ctx, item.ingredient, state, cx, cy - 4, 48);
    if (!item.done || item.state === 'burnt') {
      ctx.save();
      ctx.globalAlpha = 0.8;
      ring(ctx, cx, cy - 3, 47, 3, item.state === 'burnt' ? 1 : item.progress / 1.2, item.state === 'burnt' ? PALETTE.bad : PALETTE.warn, 'rgba(0,0,0,0.22)');
      ctx.restore();
    }
  }
}

function drawPlateStation(ctx, kitchen) {
  const station = kitchen.plateStation;
  const { box } = station;
  plank(ctx, box.x, box.y, box.w, box.h, '#8a6236', '#754f28', '#a87a45');
  for (let i = 0; i < Math.min(station.stack, 5); i += 1) {
    drawPlateBase(ctx, box.x + 32, box.y + 42 - i * 5, 70);
  }
  if (station.plate.parts.length > 0) {
    drawPlate(ctx, station.plate.parts, box.x + 98, box.y + 32, 92);
    ctx.font = '700 11px "Trebuchet MS", sans-serif';
    ctx.fillStyle = PALETTE.paper;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(`PLATE · ${station.plate.parts.length}`, box.x + 98, box.y + 78);
  }
  ctx.font = '600 11px "Trebuchet MS", sans-serif';
  ctx.fillStyle = 'rgba(246,231,205,0.6)';
  ctx.textAlign = 'left';
  ctx.fillText('PLATE', box.x + 6, box.y + 13);
}

function drawBin(ctx, kitchen) {
  const { box } = kitchen.bin;
  const wobble = Math.sin(kitchen.bin.shake * 22) * kitchen.bin.shake * 4;
  ctx.save();
  ctx.translate(box.x + box.w / 2 + wobble, 0);
  ctx.fillStyle = '#4a4f56';
  ctx.beginPath();
  ctx.moveTo(-24, box.y + 20);
  ctx.lineTo(24, box.y + 20);
  ctx.lineTo(19, box.y + 78);
  ctx.lineTo(-19, box.y + 78);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5c626b';
  fillRound(ctx, -28, box.y + 12, 56, 12, 4, '#5c626b');
  ctx.strokeStyle = '#33373d';
  ctx.lineWidth = 2;
  for (let i = -1; i <= 1; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * 12, box.y + 24);
    ctx.lineTo(i * 10, box.y + 74);
    ctx.stroke();
  }
  ctx.restore();
  ctx.font = '600 10px "Trebuchet MS", sans-serif';
  ctx.fillStyle = 'rgba(246,231,205,0.5)';
  ctx.textAlign = 'center';
  ctx.fillText('BIN', box.x + box.w / 2, box.y + 8);
}

function drawPass(ctx, kitchen, t) {
  const { box } = kitchen.pass;
  // hatch opening with warm light from the room beyond
  const glow = 0.6 + 0.12 * Math.sin(t * 2) + kitchen.pass.ring * 0.4;
  ctx.fillStyle = '#0d1216';
  fillRound(ctx, box.x, box.y, box.w, box.h, 10, '#0d1216');
  ctx.save();
  ctx.globalAlpha = glow;
  ctx.fillStyle = '#6b4a1e';
  fillRound(ctx, box.x + 10, box.y + 10, box.w - 20, box.h - 26, 8, '#6b4a1e');
  ctx.restore();
  fillRound(ctx, box.x + 16, box.y + 16, box.w - 32, box.h - 40, 6, 'rgba(255,214,150,0.35)');
  ctx.fillStyle = 'rgba(255,236,196,0.5)';
  ctx.fillRect(box.x + 20, box.y + 18, box.w - 40, 6);
  // shelf and the bell
  ctx.fillStyle = '#8a6236';
  ctx.fillRect(box.x - 6, box.y + box.h - 16, box.w + 12, 14);
  ctx.fillStyle = '#e8b25a';
  ctx.beginPath();
  ctx.arc(box.x + box.w - 44, box.y + box.h - 26, 13, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(box.x + box.w - 58, box.y + box.h - 26, 28, 4);
  ctx.fillStyle = '#f6e7cd';
  ctx.beginPath();
  ctx.arc(box.x + box.w - 44, box.y + box.h - 34, 4, 0, Math.PI * 2);
  ctx.fill();
  // the sign
  ctx.font = '700 15px "Trebuchet MS", sans-serif';
  ctx.fillStyle = PALETTE.brass;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('P A S S', box.x + 22, box.y + box.h - 26);
  // the pass lamp flares when a plate goes out
  if (kitchen.pass.ring > 0) {
    ctx.save();
    ctx.globalAlpha = kitchen.pass.ring * 0.75;
    const flare = ctx.createLinearGradient(0, box.y, 0, box.y + box.h);
    flare.addColorStop(0, 'rgba(255,209,122,0)');
    flare.addColorStop(0.35, 'rgba(255,209,122,0.85)');
    flare.addColorStop(1, 'rgba(255,209,122,0)');
    ctx.fillStyle = flare;
    ctx.fillRect(box.x + 4, box.y + 2, box.w - 8, box.h - 8);
    ctx.restore();
  }
}

/** Draw every station's furniture. `near` gets a brass ring around it. */
export function drawStations(ctx, world, t, near) {
  const { kitchen } = world;
  for (const crate of kitchen.crates) drawCrate(ctx, crate);
  drawBoard(ctx, world, t);
  for (const burner of kitchen.burners) drawBurner(ctx, burner, t);
  drawPlateStation(ctx, kitchen);
  drawBin(ctx, kitchen);
  drawPass(ctx, kitchen, t);

  if (near) {
    ctx.save();
    ctx.strokeStyle = 'rgba(232,178,90,0.85)';
    ctx.lineWidth = 3;
    ctx.setLineDash([9, 7]);
    ctx.lineDashOffset = -t * 22;
    ctx.beginPath();
    const y = near.kind === 'crate' || near.kind === 'board' || near.kind === 'plate' || near.kind === 'bin' ? 522 : 400;
    ctx.ellipse(near.x, y, near.kind === 'pass' ? 60 : 46, 14, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // smoke, sparks and floating notes
  for (const cloud of kitchen.smoke) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, cloud.life) * 0.26;
    ctx.fillStyle = '#f2e6d2';
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, cloud.size * (1.2 - cloud.life * 0.4), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  for (const bit of kitchen.sparks) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, bit.life);
    ctx.fillStyle = bit.color;
    ctx.fillRect(bit.x - 2, bit.y - 2, 4, 4);
    ctx.restore();
  }
  for (const flash of kitchen.flashes) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, flash.life);
    ctx.font = '700 15px "Trebuchet MS", sans-serif';
    ctx.fillStyle = flash.color;
    ctx.textAlign = 'center';
    ctx.fillText(flash.text, flash.x, flash.y);
    ctx.restore();
  }
  // a gentle shadow under the counter edge keeps the two rows apart
  const shade = ctx.createLinearGradient(0, 398, 0, 428);
  shade.addColorStop(0, 'rgba(0,0,0,0.45)');
  shade.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 398, 1280, 30);
}
