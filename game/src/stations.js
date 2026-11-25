// What one press of the action key does at each station, and the clocks the stations run on their
// own: searing advances while the pan is hot, a chop answers a held key or one tap of a knife, and a
// burnt pan empties itself in smoke. The furniture each station draws lives at the bottom of the file
// and is painted against the bands in config.js, so the pans, the board and the plate line up.
import { PALETTE, CHOP_SECONDS, SEAR_READY, SEAR_BURN, SEAR_SECONDS, FRONT } from './config.js';
import { INGREDIENTS, rawItem } from './pantry.js';
import { drawIngredient, drawPlateBase, drawPlate } from './food.js';
import { assemblySummary, drawAssemblyBadge, drawPlateInProgress } from './plating.js';
import { drawPass } from './pass.js';
import { fillRound, plank, ring } from './paint.js';

const MAX_PARTS = 4;
const FONT = '"Trebuchet MS", "Segoe UI", Verdana, sans-serif';

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
 * the bell or buzz a refusal; `ok` false means the cook was told why not.
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
      note(kitchen, station.x, 470, '+ 1', PALETTE.ok);
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
  spark(kitchen, board.x + (noise() - 0.5) * 48, board.box.y + 70, INGREDIENTS[item.ingredient].flesh);
  if (item.progress >= 1) {
    item.done = true;
    item.state = 'ready';
    note(kitchen, board.x, board.box.y - 10, 'Chopped', PALETTE.ok);
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
    if (noise() < dt * 4) puff(kitchen, burner.x + (noise() - 0.5) * 40, 320, 4 + noise() * 3, noise() * 6);
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

/** One pantry crate: a slatted box with its ingredient sitting proud of the rim. */
function drawCrate(ctx, crate) {
  const { box } = crate;
  const lift = crate.bob * 4;
  const ingredient = INGREDIENTS[crate.ingredient];
  ctx.save();
  ctx.translate(0, -lift);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(box.x + 4, box.y + box.h - 4, box.w - 8, 8);
  plank(ctx, box.x, box.y, box.w, box.h, '#6f4c2e', '#5c3d23', '#96693c');
  // the dark inside of the crate, so the food reads against it
  fillRound(ctx, box.x + 5, box.y + 5, box.w - 10, box.h - 26, 3, 'rgba(46,30,16,0.55)');
  ctx.fillStyle = 'rgba(255,214,150,0.14)';
  ctx.fillRect(box.x + 5, box.y + 5, box.w - 10, 2);
  drawIngredient(ctx, crate.ingredient, 'raw', box.x + box.w / 2, box.y + 40, 66);
  // the painted label board along the bottom
  ctx.fillStyle = ingredient.crate;
  ctx.fillRect(box.x + 3, box.y + box.h - 19, box.w - 6, 15);
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fillRect(box.x + 3, box.y + box.h - 19, box.w - 6, 2);
  ctx.font = `700 10px ${FONT}`;
  ctx.fillStyle = 'rgba(255,248,236,0.96)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(crate.label, box.x + box.w / 2, box.y + box.h - 10);
  ctx.restore();
}

/** The chopping board, its knife and whatever is on it. */
function drawBoard(ctx, world) {
  const { board } = world.kitchen;
  const { box } = board;
  plank(ctx, box.x, box.y + 20, box.w, box.h - 20, '#c2955c', '#a8783f', '#dcb277');
  ctx.strokeStyle = 'rgba(90,60,30,0.45)';
  ctx.lineWidth = 2;
  ctx.strokeRect(box.x + 2, box.y + 22, box.w - 4, box.h - 24);
  fillRound(ctx, box.x + box.w - 18, box.y + 6, 22, 18, 4, '#8a6234');
  ctx.font = `700 10px ${FONT}`;
  ctx.fillStyle = 'rgba(246,231,205,0.62)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('CHOP', box.x + 8, box.y + 14);

  if (board.item) {
    const item = board.item;
    const state = item.done ? 'chopped' : 'raw';
    const cx = box.x + box.w / 2 - 10;
    const cy = box.y + 62;
    drawIngredient(ctx, item.ingredient, state, cx, cy, 58);
    if (!item.done) ring(ctx, cx, cy, 34, 4, item.progress, PALETTE.ok, 'rgba(0,0,0,0.3)');
    const swing = board.stroke > 0 ? -0.5 + (1 - board.stroke) * 1.1 : -0.85;
    ctx.save();
    ctx.translate(cx + 30, box.y + 40);
    ctx.rotate(swing);
    ctx.fillStyle = '#e4e9ed';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(46, 7);
    ctx.lineTo(46, 14);
    ctx.lineTo(0, 16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(150,170,180,0.5)';
    ctx.fillRect(6, 10, 38, 3);
    ctx.fillStyle = '#4a3a2a';
    fillRound(ctx, -22, 2, 24, 10, 4, '#4a3a2a');
    ctx.restore();
  }
}

/** A copper pan on its flame, the item in it and the clock over the item. */
function drawBurner(ctx, burner, t) {
  const cx = burner.x;
  const cy = 330;
  for (let i = 0; i < 7; i += 1) {
    const a = -Math.PI + (i * Math.PI) / 6;
    const flicker = 0.7 + 0.3 * Math.sin(t * 9 + i * 1.7 + burner.index);
    const len = (22 + 9 * flicker) * (0.6 + burner.heat * 0.5) + burner.flare * 16;
    ctx.fillStyle = i % 2 === 0 ? PALETTE.ember : PALETTE.emberHot;
    ctx.globalAlpha = 0.55 + 0.35 * flicker;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * 46, cy + 24 + Math.sin(a) * 8);
    ctx.quadraticCurveTo(cx + Math.cos(a) * (46 + len * 0.4), cy + 30 - len * 0.4, cx + Math.cos(a) * (46 + len * 0.2), cy + 22 - len * 0.15);
    ctx.quadraticCurveTo(cx + Math.cos(a) * (50 + len), cy + 26 - len * 0.2, cx + Math.cos(a) * 48, cy + 22);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // the iron ring the pan sits in: a thin dark collar, never a black wheel around the copper
  ctx.fillStyle = '#302a26';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 4, 62, 37, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 4, 62, 37, 0, 0, Math.PI * 2);
  ctx.stroke();
  const item = burner.item;
  ctx.fillStyle = 'rgba(0,0,0,0.34)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 12, 58, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a8572c';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 58, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c9703c';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 4, 54, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  const inner = ctx.createRadialGradient(cx - 8, cy - 12, 4, cx, cy - 4, 48);
  inner.addColorStop(0, '#6b4a2c');
  inner.addColorStop(1, '#3f2a1c');
  ctx.fillStyle = inner;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 4, 46, 25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,190,120,0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 2, 52, 29, 0, Math.PI * 1.05, Math.PI * 1.75);
  ctx.stroke();
  ctx.strokeStyle = '#7a4a26';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(cx + 55, cy);
  ctx.lineTo(cx + 92, cy - 16);
  ctx.stroke();
  if (item) {
    const state = item.state === 'burnt' ? 'burnt' : item.done ? 'seared' : 'raw';
    drawIngredient(ctx, item.ingredient, state, cx, cy - 6, 64);
    if (!item.done || item.state === 'burnt') {
      ctx.save();
      ctx.globalAlpha = 0.85;
      ring(ctx, cx, cy - 4, 53, 3, item.state === 'burnt' ? 1 : item.progress / 1.2, item.state === 'burnt' ? PALETTE.bad : PALETTE.warn, 'rgba(0,0,0,0.22)');
      ctx.restore();
    }
  }
}

/** The plate line: the stack of clean plates and the dish being built on the board. */
function drawPlateStation(ctx, kitchen, recipes) {
  const station = kitchen.plateStation;
  const { box } = station;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(box.x + 3, box.y + box.h - 5, box.w - 6, 9);
  plank(ctx, box.x, box.y, box.w, box.h, '#96663c', '#7a4f28', '#c08a4a');
  ctx.font = `700 10px ${FONT}`;
  ctx.fillStyle = 'rgba(246,231,205,0.62)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('PLATE', box.x + 8, box.y + 14);

  const stackX = box.x + 34;
  for (let i = 0; i < Math.min(station.stack, 6); i += 1) {
    drawPlateBase(ctx, stackX, box.y + 84 - i * 6, 78);
  }

  const cx = box.x + 106;
  const cy = box.y + 48;
  const parts = station.plate.parts;
  if (parts.length > 0) {
    const summary = assemblySummary(parts, recipes);
    drawPlateInProgress(ctx, parts, cx, cy, 132, summary);
    drawAssemblyBadge(ctx, cx, box.y + box.h - 6, summary);
  } else {
    drawPlateBase(ctx, cx, cy, 132);
    ctx.font = `600 11px ${FONT}`;
    ctx.fillStyle = 'rgba(255,250,238,0.75)';
    ctx.textAlign = 'center';
    ctx.fillText('clean plate', cx, box.y + box.h - 12);
  }
}

function drawBin(ctx, kitchen) {
  const { box } = kitchen.bin;
  const wobble = Math.sin(kitchen.bin.shake * 22) * kitchen.bin.shake * 4;
  ctx.save();
  ctx.translate(box.x + box.w / 2 + wobble, 0);
  ctx.fillStyle = '#4a4f56';
  ctx.beginPath();
  ctx.moveTo(-26, box.y + 20);
  ctx.lineTo(26, box.y + 20);
  ctx.lineTo(20, box.y + box.h);
  ctx.lineTo(-20, box.y + box.h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5c626b';
  fillRound(ctx, -30, box.y + 12, 60, 12, 4, '#5c626b');
  ctx.strokeStyle = '#33373d';
  ctx.lineWidth = 2;
  for (let i = -1; i <= 1; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * 13, box.y + 24);
    ctx.lineTo(i * 11, box.y + box.h - 4);
    ctx.stroke();
  }
  ctx.restore();
  ctx.font = `700 9px ${FONT}`;
  ctx.fillStyle = 'rgba(246,231,205,0.5)';
  ctx.textAlign = 'center';
  ctx.fillText('BIN', box.x + box.w / 2, box.y + 8);
}

/** Draw every station's furniture. `near` gets a brass ring on the floor in front of it. */
export function drawStations(ctx, world, t, near) {
  const { kitchen } = world;
  const recipes = world.tickets.map((ticket) => ticket.recipe);
  for (const crate of kitchen.crates) drawCrate(ctx, crate);
  drawBoard(ctx, world);
  for (const burner of kitchen.burners) drawBurner(ctx, burner, t);
  drawPlateStation(ctx, kitchen, recipes);
  drawBin(ctx, kitchen);
  drawPass(ctx, kitchen.pass, t);

  if (near) {
    ctx.save();
    ctx.strokeStyle = 'rgba(242,192,105,0.85)';
    ctx.lineWidth = 3;
    ctx.setLineDash([9, 7]);
    ctx.lineDashOffset = -t * 22;
    const front = near.kind === 'crate' || near.kind === 'board' || near.kind === 'plate' || near.kind === 'bin';
    ctx.beginPath();
    ctx.ellipse(near.x, front ? 474 : 402, near.kind === 'pass' ? 64 : 50, 13, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

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
    ctx.font = `700 15px ${FONT}`;
    ctx.fillStyle = flash.color;
    ctx.textAlign = 'center';
    ctx.fillText(flash.text, flash.x, flash.y);
    ctx.restore();
  }
  // the counter edge keeps the two rows apart
  const shade = ctx.createLinearGradient(0, FRONT.top - 14, 0, FRONT.top + 12);
  shade.addColorStop(0, 'rgba(0,0,0,0)');
  shade.addColorStop(1, 'rgba(0,0,0,0.32)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, FRONT.top - 14, 1280, 26);
}