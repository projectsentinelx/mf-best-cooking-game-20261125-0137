// The screenshot scenes behind ?shot=service|chopping|plating|rush. Each one loads the real kitchen,
// fills the real pans and the real plate, and sets the real rail to a moment a shift passes through —
// never a mock-up drawn for the camera — so a capture is a frame the game itself would show.
import { SHIFT_SECONDS } from './config.js';
import { rawItem } from './pantry.js';
import { recipeById } from './recipes.js';
import { createTicket } from './orders.js';
import { resetWorld, SCREEN_OVER, SCREEN_PLAY } from './world.js';
import { teleportChef } from './chef.js';
import { sendToPass } from './pass.js';

/** A component as the kitchen holds it: `stage` is raw, a progress number, chopped or seared. */
function part(ingredient, method, stage) {
  const item = rawItem(ingredient);
  item.method = method;
  if (stage === 'seared') {
    item.progress = 0.78;
    item.done = true;
    item.state = 'ready';
  } else if (stage === 'chopped') {
    item.progress = 1;
    item.done = true;
    item.state = 'ready';
  } else if (typeof stage === 'number') {
    item.progress = stage;
    item.state = 'working';
    item.done = stage >= 0.62;
  }
  return item;
}

/** A called dish on the rail, at the patience its age has left. */
function ticket(world, id, patience, age, special = false) {
  const recipe = recipeById(id);
  const card = createTicket(recipe, world.progress, special);
  card.patience = patience;
  card.left = card.total * patience;
  card.mood = patience > 0.55 ? 'calm' : patience > 0.25 ? 'waiting' : 'urgent';
  card.bornAt = age;
  world.tickets.push(card);
  return card;
}

function steam(kitchen, x, y, count, spread) {
  for (let i = 0; i < count; i += 1) {
    kitchen.smoke.push({ x: x + (i - count / 2) * spread, y: y - i * 7, size: 8 + i * 1.6, life: 0.8 - i * 0.1, drift: i * 1.3 });
  }
}

export function stageShot(name, world) {
  resetWorld(world);
  world.screen = SCREEN_PLAY;

  if (name === 'chopping') {
    // At the board, close: the knife is halfway through a tomato, the pieces it has already made
    // are at the near edge, the ring says how far the chop has run, and the cook's whole arm is on
    // it — a pan still going on the left, a dish waiting on the pass behind.
    world.camera = { x: 805, y: 415, zoom: 1.4 };
    world.time = SHIFT_SECONDS - 31;
    world.progress = 0.17;
    world.earned = 44;
    world.served = 1;
    world.combo = 1;
    ticket(world, 'tart', 0.82, 2);
    ticket(world, 'omelette', 0.6, 7);
    const board = world.kitchen.board;
    board.item = part('tomato', 'chop', 0.58);
    board.stroke = 0.55;
    world.kitchen.plateStation.plate.parts = [];
    world.kitchen.burners[1].item = part('egg', 'sear', 0.52);
    world.kitchen.burners[1].flare = 0.5;
    steam(world.kitchen, 498, 300, 4, 16);
    teleportChef(world.chef, 893, 444);
    // stood right up against the board so the arm, the knife and the tomato read as one gesture
    world.chef.facing = 1;
    world.chef.carry = null;
    sendToPass(world.kitchen.pass, recipeById('toast'), 0);
    world.kitchen.pass.ring = 0.3;
    for (let i = 0; i < 7; i += 1) {
      world.kitchen.sparks.push({ x: board.x - 14 + (i % 3) * 9, y: 552, vx: -46 + i * 15, vy: -64 - i * 9, life: 0.75, color: i % 3 === 0 ? '#e8604f' : '#8d2a21' });
    }
  } else if (name === 'plating') {
    // Close on the plate line: two of three components stacked on the plate, the third still to go,
    // and a finished dish already waiting under the pass lamp behind it.
    world.camera = { x: 845, y: 372, zoom: 1.45 };
    world.time = 96;
    world.progress = 0.47;
    world.earned = 154;
    world.served = 5;
    world.combo = 4;
    ticket(world, 'melt', 0.34, 9);
    ticket(world, 'toast', 0.72, 3);
    ticket(world, 'tart', 0.58, 6);
    world.kitchen.plateStation.plate.parts = [part('bread', 'sear', 'seared'), part('cheese', 'chop', 'chopped')];
    world.kitchen.board.item = part('tomato', 'chop', 'chopped');
    world.kitchen.burners[0].item = part('mushroom', 'sear', 0.52);
    world.kitchen.burners[1].item = part('bread', 'sear', 0.86);
    world.kitchen.burners[1].flare = 0.4;
    steam(world.kitchen, 498, 300, 3, 14);
    sendToPass(world.kitchen.pass, recipeById('toast'), 0);
    sendToPass(world.kitchen.pass, recipeById('soup'), 0);
    world.kitchen.pass.plates[1].life = 0.72;
    world.kitchen.pass.ring = 0.5;
    teleportChef(world.chef, 902, 452);
    world.chef.facing = 1;
    world.chef.carry = { kind: 'item', item: part('herb', 'chop', 'chopped') };
  } else if (name === 'rush') {
    // The last minutes: five tickets on the rail, two of them red, the clock amber, both pans going,
    // a full pass and a cook moving fast enough to leave a smear.
    world.camera = { x: 700, y: 402, zoom: 1.14 };
    world.railSlots = 5;
    world.time = 42;
    world.progress = 0.68;
    world.earned = 208;
    world.served = 7;
    world.combo = 5;
    ticket(world, 'soup', 0.16, 11);
    ticket(world, 'melt', 0.22, 9, true);
    ticket(world, 'toast', 0.44, 6);
    ticket(world, 'tart', 0.66, 4);
    ticket(world, 'omelette', 0.88, 1);
    world.kitchen.burners[0].item = part('dough', 'sear', 0.7);
    world.kitchen.burners[1].item = part('mushroom', 'sear', 0.98);
    world.kitchen.burners[0].flare = 0.8;
    world.kitchen.burners[1].flare = 0.5;
    world.kitchen.board.item = part('herb', 'chop', 'chopped');
    world.kitchen.plateStation.plate.parts = [part('broth', 'sear', 'seared'), part('tomato', 'chop', 'chopped')];
    sendToPass(world.kitchen.pass, recipeById('tart'), 0);
    sendToPass(world.kitchen.pass, recipeById('melt'), 0);
    sendToPass(world.kitchen.pass, recipeById('toast'), 0);
    world.kitchen.pass.ring = 0.7;
    steam(world.kitchen, 272, 300, 4, 18);
    steam(world.kitchen, 498, 300, 4, 18);
    steam(world.kitchen, 786, 292, 3, 14);
    teleportChef(world.chef, 720, 448);
    world.chef.facing = 1;
    world.chef.moving = true;
    world.chef.phase = 1.1;
    world.chef.rush = 1;
    world.chef.carry = null;
  } else if (name === 'closed') {
    world.camera = { x: 640, y: 366, zoom: 1 };
    world.time = 0;
    world.progress = 1;
    world.earned = 318;
    world.served = 14;
    world.walkouts = 3;
    world.bestCombo = 6;
    world.combo = 6;
    world.over = true;
    teleportChef(world.chef, 640, 442);
    world.lastStation = null;
    return { screen: SCREEN_OVER, best: 0 };
  } else {
    // the cover: mid-service — three tickets on the rail, two pans on the heat, a plate two-thirds
    // built with the third component in hand, and a finished dish already under the pass lamp
    world.camera = { x: 640, y: 366, zoom: 1 };
    world.time = 74;
    world.progress = 0.59;
    world.earned = 186;
    world.served = 6;
    world.combo = 3;
    ticket(world, 'melt', 0.3, 12, true);
    ticket(world, 'soup', 0.64, 5);
    ticket(world, 'toast', 0.9, 1);
    world.kitchen.burners[0].item = part('bread', 'sear', 0.72);
    world.kitchen.burners[1].item = part('mushroom', 'sear', 0.34);
    world.kitchen.burners[1].flare = 0.5;
    world.kitchen.board.item = part('tomato', 'chop', 0.42);
    world.kitchen.board.stroke = 0.5;
    world.kitchen.plateStation.plate.parts = [part('bread', 'sear', 'seared'), part('cheese', 'chop', 'chopped')];
    sendToPass(world.kitchen.pass, recipeById('melt'), 0);
    sendToPass(world.kitchen.pass, recipeById('tart'), 0);
    sendToPass(world.kitchen.pass, recipeById('soup'), 0);
    world.kitchen.pass.plates[0].life = 0.82;
    world.kitchen.pass.plates[1].life = 0.64;
    world.kitchen.pass.ring = 0.45;
    steam(world.kitchen, 272, 302, 3, 16);
    steam(world.kitchen, 786, 292, 2, 14);
    teleportChef(world.chef, 878, 448);
    world.chef.facing = 1;
    world.chef.carry = { kind: 'item', item: part('herb', 'chop', 'chopped') };
    for (let i = 0; i < 4; i += 1) world.kitchen.sparks.push({ x: 880 + i * 8, y: 552, vx: -20 + i * 14, vy: -60 - i * 10, life: 0.8, color: '#e8604f' });
  }

  // the station under the cook, so the frame carries its own prompt: at the board the chip reads
  // "Hold E · chop"
  world.lastStation = name === 'chopping' ? world.kitchen.board : null;
  return { screen: SCREEN_PLAY, best: 0 };
}
