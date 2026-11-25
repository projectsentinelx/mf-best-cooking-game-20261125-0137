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
    // the board: one egg half through the knife, a pan running, the first plate started
    world.time = SHIFT_SECONDS - 31;
    world.progress = 0.17;
    world.earned = 44;
    world.served = 1;
    world.combo = 1;
    ticket(world, 'tart', 0.82, 2);
    ticket(world, 'omelette', 0.6, 7);
    const board = world.kitchen.board;
    board.item = part('egg', 'sear', 0.48);
    board.stroke = 0.62;
    world.kitchen.plateStation.plate.parts = [part('dough', 'sear', 'seared')];
    world.kitchen.burners[0].item = part('dough', 'sear', 0.3);
    world.kitchen.burners[0].flare = 0.35;
    steam(world.kitchen, 272, 306, 3, 16);
    teleportChef(world.chef, board.x - 26, 442);
    world.chef.facing = 1;
    world.chef.carry = null;
    for (let i = 0; i < 5; i += 1) world.kitchen.sparks.push({ x: board.x - 6 + i * 6, y: 560, vx: -30 + i * 12, vy: -70 - i * 12, life: 0.7, color: '#e8604f' });
  } else if (name === 'plating') {
    // two of three components down, the third in the cook's hands, a plate already on the pass
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
    steam(world.kitchen, 498, 306, 3, 14);
    sendToPass(world.kitchen.pass, recipeById('toast'), 0);
    world.kitchen.pass.ring = 0.55;
    teleportChef(world.chef, 872, 442);
    world.chef.facing = 1;
    world.chef.carry = { kind: 'item', item: part('herb', 'chop', 'chopped') };
  } else if (name === 'rush') {
    // the last minutes: three tickets in the red, both pans going, steam along the whole line
    world.time = 58;
    world.progress = 0.68;
    world.earned = 208;
    world.served = 7;
    world.combo = 5;
    ticket(world, 'soup', 0.18, 11);
    ticket(world, 'melt', 0.42, 7, true);
    ticket(world, 'toast', 0.86, 1);
    world.kitchen.burners[0].item = part('dough', 'sear', 0.7);
    world.kitchen.burners[1].item = part('mushroom', 'sear', 0.98);
    world.kitchen.burners[0].flare = 0.8;
    world.kitchen.burners[1].flare = 0.5;
    world.kitchen.board.item = part('herb', 'chop', 'chopped');
    world.kitchen.plateStation.plate.parts = [part('broth', 'sear', 'seared')];
    sendToPass(world.kitchen.pass, recipeById('tart'), 0);
    sendToPass(world.kitchen.pass, recipeById('melt'), 0);
    world.kitchen.pass.ring = 0.7;
    steam(world.kitchen, 272, 300, 4, 18);
    steam(world.kitchen, 498, 300, 4, 18);
    steam(world.kitchen, 786, 292, 3, 14);
    teleportChef(world.chef, 700, 442);
    world.chef.facing = 1;
    world.chef.moving = true;
    world.chef.phase = 1.1;
    world.chef.carry = { kind: 'item', item: part('cheese', 'chop', 'chopped') };
  } else if (name === 'closed') {
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
    world.kitchen.board.item = part('tomato', 'chop', 'chopped');
    world.kitchen.plateStation.plate.parts = [part('bread', 'sear', 'seared'), part('cheese', 'chop', 'chopped')];
    sendToPass(world.kitchen.pass, recipeById('melt'), 0);
    world.kitchen.pass.ring = 0.45;
    steam(world.kitchen, 272, 302, 3, 16);
    steam(world.kitchen, 786, 292, 2, 14);
    teleportChef(world.chef, 878, 442);
    world.chef.facing = 1;
    world.chef.carry = { kind: 'item', item: part('herb', 'chop', 'chopped') };
    for (let i = 0; i < 4; i += 1) world.kitchen.sparks.push({ x: 900 + i * 8, y: 560, vx: -20 + i * 14, vy: -60 - i * 10, life: 0.8, color: '#d9483a' });
  }

  world.lastStation = null;
  return { screen: SCREEN_PLAY, best: 0 };
}