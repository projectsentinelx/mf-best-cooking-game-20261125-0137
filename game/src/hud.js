// The rail and the clock: the tickets the room has called, each with its components and the patience
// left in it, and the board that says how long until close and what the night has taken. Read at a
// glance, at a squint, and from across the room.
import { FONT, PALETTE, RAIL, SHIFT_SECONDS } from './config.js';
import { INGREDIENTS, METHOD_LABEL } from './pantry.js';
import { ticketPrice } from './orders.js';
import { drawIngredient } from './food.js';
import { fillRound, ring } from './paint.js';

const TICKET_H = RAIL.height;
const TICKET_W = RAIL.slot - 8;
const CLOCK_W = 124;
export const CLOCK_X = RAIL.left + RAIL.count * RAIL.slot + 8;

function money(value) {
  return `$${value}`;
}

function mmss(seconds) {
  const whole = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(whole / 60);
  const s = whole % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

/** Which of a ticket's components are already finished on the plate in play (or in the cook's hands). */
function onHand(parts, recipe) {
  const left = recipe.parts.map((part) => `${part.ingredient}:${part.method}`);
  const found = new Set();
  for (const part of parts) {
    if (!part.done) continue;
    const key = `${part.ingredient}:${part.method}`;
    const index = left.indexOf(key);
    if (index === -1) continue;
    left.splice(index, 1);
    found.add(key);
  }
  return found;
}

function drawTicket(ctx, ticket, x, y, served) {
  const mood = ticket.mood;
  const cardColor = mood === 'urgent' ? '#f6dccc' : PALETTE.paper;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(((ticket.id % 5) - 2) * 0.004);
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  // the paper is not one flat cream: it takes the room's warm key at the top left and shades off
  // toward the near corner, with a fold across it where the printer creased it
  const paper = ctx.createLinearGradient(0, 0, TICKET_W * 0.7, TICKET_H);
  paper.addColorStop(0, mood === 'urgent' ? '#fde7d6' : '#fdf4e2');
  paper.addColorStop(0.55, cardColor);
  paper.addColorStop(1, mood === 'urgent' ? '#e6c3ae' : '#e8d8bd');
  fillRound(ctx, 0, 0, TICKET_W, TICKET_H, 4, paper);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  // the fold: a soft dark line and a lighter one just under it
  ctx.fillStyle = 'rgba(120,86,48,0.13)';
  ctx.fillRect(2, 50, TICKET_W - 4, 3);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillRect(2, 53, TICKET_W - 4, 1.5);
  // a torn bottom edge: the printer never cuts these straight
  ctx.fillStyle = cardColor;
  for (let i = 0; i < 9; i += 1) {
    const tx = 4 + i * (TICKET_W - 8) / 9;
    ctx.beginPath();
    ctx.moveTo(tx, TICKET_H - 4);
    ctx.lineTo(tx + 8, TICKET_H - 4);
    ctx.lineTo(tx + 4, TICKET_H - 0.5 + (i % 3) * 0.8);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = ticket.special ? '#c9992c' : mood === 'urgent' ? '#a83a2c' : '#7a5c3a';
  ctx.fillRect(0, 0, TICKET_W, ticket.special ? 6 : 4);
  ctx.font = `600 9px ${FONT}`;
  ctx.fillStyle = 'rgba(60,42,26,0.65)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(`TICKET ${String(ticket.id).padStart(2, '0')}`, 14, 20);
  if (ticket.special) {
    ctx.font = `700 9px ${FONT}`;
    ctx.fillStyle = '#a8791c';
    ctx.fillText('· HOUSE SPECIAL', 76, 20);
  }

  ctx.font = `700 19px ${FONT}`;
  ctx.fillStyle = PALETTE.ink;
  ctx.fillText(ticket.recipe.name, 14, 42);

  ctx.font = `700 16px ${FONT}`;
  ctx.fillStyle = ticket.special ? '#a8791c' : '#8a5a1e';
  ctx.textAlign = 'right';
  ctx.fillText(money(ticketPrice(ticket)), TICKET_W - 14, 42);

  const parts = ticket.recipe.parts;
  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index];
    const rowY = 58 + index * 18;
    const key = `${part.ingredient}:${part.method}`;
    const done = served.has(key);
    ctx.save();
    ctx.globalAlpha = done ? 0.42 : 1;
    drawIngredient(ctx, part.ingredient, part.method === 'chop' ? 'chopped' : 'seared', 22, rowY + 1, 16);
    ctx.font = `600 12px ${FONT}`;
    ctx.fillStyle = done ? '#5c6b4e' : PALETTE.ink;
    ctx.textAlign = 'left';
    ctx.fillText(INGREDIENTS[part.ingredient].name, 36, rowY + 5);
    ctx.font = `600 10px ${FONT}`;
    ctx.fillStyle = done ? '#5c6b4e' : '#8a6a44';
    ctx.fillText(METHOD_LABEL[part.method], 146, rowY + 5);
    if (done) {
      ctx.strokeStyle = '#4f7a45';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(188, rowY - 1);
      ctx.lineTo(193, rowY + 4);
      ctx.lineTo(202, rowY - 8);
      ctx.stroke();
    }
    ctx.restore();
  }

  const ready = served.size === parts.length && parts.length > 0;
  if (ready) {
    fillRound(ctx, TICKET_W - 82, TICKET_H - 27, 68, 17, 8, '#4f7a45');
    ctx.font = `700 10px ${FONT}`;
    ctx.fillStyle = '#f2ffe9';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PLATE IT', TICKET_W - 48, TICKET_H - 18);
    ctx.textBaseline = 'alphabetic';
  }

  const barY = TICKET_H - 20;
  const barW = TICKET_W - 58;
  fillRound(ctx, 14, barY, barW, 9, 4, 'rgba(60,42,26,0.16)');
  const color = mood === 'urgent' ? PALETTE.bad : mood === 'waiting' ? PALETTE.warn : '#5f8f5a';
  fillRound(ctx, 14, barY, Math.max(4, barW * ticket.patience), 9, 4, color);
  if (mood === 'urgent') {
    ctx.globalAlpha = 0.12 + 0.22 * Math.abs(Math.sin(ticket.left * 4));
    fillRound(ctx, 0, 0, TICKET_W, TICKET_H, 4, '#e2564a');
    ctx.globalAlpha = 1;
  }
  if (!ready) {
    ctx.font = `700 12px ${FONT}`;
    ctx.fillStyle = mood === 'urgent' ? PALETTE.bad : '#5c4630';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.ceil(ticket.left)}s`, TICKET_W - 12, barY + 9);
  }
  ctx.restore();
}

function drawClock(ctx, world, x, y) {
  fillRound(ctx, x, y, CLOCK_W, TICKET_H, 8, 'rgba(14,20,25,0.94)');
  ctx.strokeStyle = 'rgba(232,178,90,0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();

  const left = Math.max(0, world.time);
  const fraction = left / SHIFT_SECONDS;
  // brass through the evening, amber once the last minute is in sight, red in the final half minute
  const clockInk = left < 30 ? PALETTE.bad : left < 62 ? PALETTE.warn : PALETTE.brass;
  ring(ctx, x + CLOCK_W / 2, y + 46, 27, 5, fraction, clockInk, 'rgba(255,255,255,0.12)');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 21px ${FONT}`;
  ctx.fillStyle = left < 30 ? PALETTE.bad : left < 62 ? PALETTE.warn : PALETTE.text;
  ctx.fillText(mmss(left), x + CLOCK_W / 2, y + 46);

  ctx.font = `600 9px ${FONT}`;
  ctx.fillStyle = PALETTE.muted;
  ctx.fillText('TILL CLOSE', x + CLOCK_W / 2, y + 16);

  ctx.font = `700 17px ${FONT}`;
  ctx.fillStyle = PALETTE.brass;
  ctx.fillText(money(world.earned), x + CLOCK_W / 2, y + 92);
  ctx.font = `600 9px ${FONT}`;
  ctx.fillStyle = PALETTE.muted;
  ctx.fillText('TAKINGS', x + CLOCK_W / 2, y + 108);

  if (world.combo > 1) {
    ctx.font = `700 12px ${FONT}`;
    ctx.fillStyle = PALETTE.ember;
    ctx.fillText(`COMBO x${world.combo}`, x + CLOCK_W / 2, y + 124);
  }
  ctx.textBaseline = 'alphabetic';
}

/** The whole rail: four ticket hooks (or more, squeezed, when the room is slammed), then the clock. */
export function drawRail(ctx, world) {
  const plateParts = world.chef.carry && world.chef.carry.kind === 'plate' ? world.chef.carry.parts : world.kitchen.plateStation.plate.parts;
  const count = world.railSlots > 0 ? Math.max(RAIL.count, Math.min(6, world.railSlots)) : RAIL.count;
  const slotW = (RAIL.count * RAIL.slot) / count;
  const scale = Math.min(1, (slotW - 8) / TICKET_W);
  for (let slot = 0; slot < count; slot += 1) {
    const x = RAIL.left + slot * slotW;
    ctx.save();
    ctx.translate(x, RAIL.top - 4);
    ctx.scale(scale, scale);
    fillRound(ctx, 0, 0, TICKET_W + 8, TICKET_H + 8, 6, 'rgba(0,0,0,0.22)');
    const ticket = world.tickets[slot];
    if (ticket) drawTicket(ctx, ticket, 4, 4, onHand(plateParts, ticket.recipe));
    ctx.restore();
  }
  ctx.fillStyle = '#2b1d12';
  ctx.fillRect(RAIL.left - 6, RAIL.top + 1, RAIL.count * RAIL.slot + 2, 3);
  drawClock(ctx, world, CLOCK_X, RAIL.top);
}

/**
 * The rush call: when the clock is short and a table has gone red the house throws a banner up over
 * the line. It is driven by the shift itself, never drawn for a screenshot, and it clears the moment
 * the last red ticket leaves the rail.
 */
export function drawRushBanner(ctx, world, t) {
  const red = world.tickets.filter((ticket) => ticket.mood === 'urgent').length;
  if (!world.time || world.time > 62 || red === 0) return;
  const w = 316;
  const h = 46;
  const x = 470;
  const y = 158;
  ctx.save();
  const pulse = 0.72 + 0.28 * Math.abs(Math.sin(t * 3.4));
  ctx.globalAlpha = 0.92;
  fillRound(ctx, x, y, w, h, 6, 'rgba(24,14,12,0.94)');
  ctx.strokeStyle = `rgba(226,86,74,${pulse})`;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = `rgba(226,86,74,${0.75 + 0.25 * pulse})`;
  fillRound(ctx, x, y, 86, h, 6, `rgba(184,52,42,${0.85})`);
  ctx.font = `700 22px ${FONT}`;
  ctx.fillStyle = '#ffefe4';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('RUSH', x + 43, y + h / 2 + 1);
  ctx.textAlign = 'left';
  ctx.font = `700 13px ${FONT}`;
  ctx.fillStyle = PALETTE.brass;
  ctx.fillText('TABLE WAITING', x + 100, y + 19);
  ctx.font = `600 11px ${FONT}`;
  ctx.fillStyle = 'rgba(246,231,205,0.8)';
  ctx.fillText(`${red} ticket${red === 1 ? '' : 's'} in the red · keep the pass moving`, x + 100, y + 34);
  ctx.textBaseline = 'alphabetic';
  ctx.restore();
}
