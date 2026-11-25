// The shift itself: one state object, one fixed step. Orders arrive, patience drains, the cook walks
// and works the stations, and a finished plate either lands on a ticket or is refused at the pass.
import { CHOP_SECONDS, REACH, SHIFT_SECONDS, TICKET } from './config.js';
import { createChef, moveChef } from './chef.js';
import { createKitchen, stationNear } from './kitchen.js';
import { act, chop, tickStations } from './stations.js';
import { ageTickets, createTicket, pickRecipe, scoreServe, ticketForPlate, rateShift } from './orders.js';
import { PALETTE } from './config.js';
import { sendToPass, tickPass } from './pass.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

export function createWorld(random) {
  const world = {
    random,
    kitchen: createKitchen(),
    chef: createChef(),
    tickets: [],
    time: SHIFT_SECONDS,
    elapsed: 0,
    progress: 0,
    earned: 0,
    served: 0,
    combo: 0,
    bestCombo: 0,
    walkouts: 0,
    spawnTimer: 1.4,
    toasts: [],
    shake: 0,
    over: false,
    screen: SCREEN_TITLE,
    sound: null,
    lastStation: null,
    // What the camera is looking at: the shots move it in for a close-up of a station, and the
    // live shift leaves it on the wide view of the whole line.
    camera: { x: 640, y: 366, zoom: 1 },
    railSlots: 0,
    banner: null,
  };
  return world;
}

export function resetWorld(world) {
  world.kitchen = createKitchen();
  world.chef = createChef();
  world.tickets = [];
  world.time = SHIFT_SECONDS;
  world.elapsed = 0;
  world.progress = 0;
  world.earned = 0;
  world.served = 0;
  world.combo = 0;
  world.bestCombo = 0;
  world.walkouts = 0;
  world.spawnTimer = 1.4;
  world.toasts = [];
  world.shake = 0;
  world.over = false;
  world.screen = SCREEN_PLAY;
  world.lastStation = null;
  world.camera = { x: 640, y: 366, zoom: 1 };
  world.railSlots = 0;
  world.banner = null;
}

function toast(world, text, color) {
  world.toasts.push({ text, color, life: 1, y: 0 });
}

function spawn(world) {
  if (world.tickets.length >= TICKET.max) return;
  const recipe = pickRecipe(world.random, world.progress, world.tickets);
  const special = world.progress > 0.22 && world.random.chance(0.18);
  const ticket = createTicket(recipe, world.progress, special);
  ticket.bornAt = world.elapsed;
  world.tickets.push(ticket);
  if (world.sound) world.sound('order');
}

/** One fixed step of the shift. `controls` is {x, y} wish direction and whether the action is held. */
export function stepWorld(world, dt, controls) {
  if (world.over) return;
  world.time = Math.max(0, world.time - dt);
  world.elapsed += dt;
  world.progress = Math.min(1, world.elapsed / SHIFT_SECONDS);

  moveChef(world.chef, controls.x, controls.y, dt);

  const near = stationNear(world.kitchen, world.chef, REACH);
  world.lastStation = near;
  if (controls.held && near && near.kind === 'board') chop(world, dt / CHOP_SECONDS);

  tickStations(world.kitchen, dt);
  tickPass(world.kitchen.pass, dt);

  const lost = ageTickets(world.tickets, dt);
  if (lost.length > 0) {
    world.tickets = world.tickets.filter((ticket) => !lost.includes(ticket));
    for (const ticket of lost) {
      world.walkouts += 1;
      world.combo = 0;
      world.shake = 1;
      toast(world, `${ticket.recipe.name} walked out`, PALETTE.bad);
      if (world.sound) world.sound('walkout');
    }
  }

  world.spawnTimer -= dt;
  if (world.spawnTimer <= 0) {
    spawn(world);
    const interval = TICKET.spawn + (TICKET.spawnLate - TICKET.spawn) * world.progress;
    world.spawnTimer = interval * world.random.range(0.82, 1.18);
  }

  for (let i = world.toasts.length - 1; i >= 0; i -= 1) {
    const item = world.toasts[i];
    item.life -= dt * 0.7;
    item.y += dt * 22;
    if (item.life <= 0) world.toasts.splice(i, 1);
  }
  world.shake = Math.max(0, world.shake - dt * 2.4);

  if (world.time <= 0) {
    world.over = true;
    world.screen = SCREEN_OVER;
    if (world.sound) world.sound('close');
  }
}

/** Tap the action key: do the obvious thing at the nearest station, and score a plate at the pass. */
export function interactWorld(world) {
  const station = stationNear(world.kitchen, world.chef, REACH);
  if (!station) return { ok: false, note: 'Nothing within reach' };
  const result = act(world, station);

  if (result.serve) {
    const ticket = ticketForPlate(world.tickets, result.serve);
    if (!ticket) {
      toast(world, 'The pass wants a ticket for that', PALETTE.warn);
      if (world.sound) world.sound('buzz');
      return { ok: false, note: 'No ticket matches that plate' };
    }
    world.chef.carry = null;
    const combo = world.combo + 1;
    const scored = scoreServe(ticket, ticket.patience, combo);
    world.earned += scored.total;
    world.served += 1;
    world.combo = combo;
    world.bestCombo = Math.max(world.bestCombo, combo);
    world.tickets = world.tickets.filter((item) => item.id !== ticket.id);
    sendToPass(world.kitchen.pass, ticket.recipe, world.elapsed);
    toast(world, `+$${scored.total}  ${ticket.recipe.name}${ticket.special ? ' · special' : ''}`, PALETTE.ok);
    if (world.sound) world.sound('serve');
    return { ok: true, note: `Served ${ticket.recipe.name}`, served: ticket.recipe };
  }

  if (result.ok) {
    if (world.sound && result.sound) world.sound(result.sound);
  } else if (world.sound) {
    world.sound('buzz');
  }
  return result;
}

/** A quick tap of the knife: one stroke of the chop bar. */
export function tapChop(world) {
  const near = stationNear(world.kitchen, world.chef, REACH);
  if (near && near.kind === 'board' && world.kitchen.board.item) chop(world, 0.34);
}

export function shiftReport(world) {
  return {
    earned: world.earned,
    served: world.served,
    walkouts: world.walkouts,
    bestCombo: world.bestCombo,
    stars: rateShift(world.earned, world.served, world.walkouts),
  };
}
