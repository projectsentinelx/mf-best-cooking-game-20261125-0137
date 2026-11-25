// The screenshot scenes behind ?shot=service|chopping|plating|rush. Each sets the real kitchen and
// the real rail to a moment a shift really passes through — pans loaded, a plate half-built, a
// ticket in the red — so the frame is the game's own drawing, not a mock-up.
import { SHIFT_SECONDS } from './config.js';
import { rawItem } from './pantry.js';
import { recipeById } from './recipes.js';
import { createTicket } from './orders.js';
import { resetWorld } from './world.js';
import { teleportChef } from './chef.js';
import { SCREEN_OVER, SCREEN_PLAY } from './world.js';

/** A component as the kitchen holds it: `stage` is raw, chopped or seared. */
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

export function stageShot(name, world) {
  resetWorld(world);
  world.screen = SCREEN_PLAY;

  if (name === 'chopping') {
    world.time = SHIFT_SECONDS - 26;
    world.progress = 0.14;
    world.earned = 62;
    world.combo = 1;
    ticket(world, 'tart', 0.82, 2);
    ticket(world, 'omelette', 0.64, 6);
    const board = world.kitchen.board;
    board.item = part('egg', 'sear', 0.44);
    board.stroke = 0.55;
    world.kitchen.plateStation.plate.parts = [part('dough', 'sear', 'seared')];
    world.kitchen.burners[0].item = part('dough', 'sear', 0.28);
    teleportChef(world.chef, board.x - 6, 494);
    world.chef.facing = 1;
    world.chef.carry = null;
  } else if (name === 'plating') {
    world.time = 96;
    world.progress = 0.47;
    world.earned = 154;
    world.served = 5;
    world.combo = 4;
    ticket(world, 'melt', 0.34, 9);
    ticket(world, 'toast', 0.72, 3);
    ticket(world, 'tart', 0.58, 6);
    const plateStation = world.kitchen.plateStation;
    plateStation.plate.parts = [part('bread', 'sear', 'seared'), part('cheese', 'chop', 'chopped'), part('herb', 'chop', 'chopped')];
    world.kitchen.burners[0].item = part('mushroom', 'sear', 0.52);
    world.kitchen.burners[1].item = part('bread', 'sear', 0.86);
    teleportChef(world.chef, plateStation.x - 58, 496);
    world.chef.facing = 1;
    world.chef.carry = { kind: 'item', item: part('tomato', 'chop', 'chopped') };
  } else if (name === 'closed') {
    // the end card: the shift's own numbers, after the clock has run out
    world.time = 0;
    world.progress = 1;
    world.earned = 318;
    world.served = 14;
    world.walkouts = 3;
    world.bestCombo = 6;
    world.combo = 6;
    world.over = true;
    teleportChef(world.chef, 640, 470);
    world.lastStation = null;
    return { screen: SCREEN_OVER, best: 0 };
  } else if (name === 'rush') {
    world.time = 58;
    world.progress = 0.68;
    world.earned = 208;
    world.served = 7;
    world.combo = 5;
    ticket(world, 'soup', 0.2, 11);
    ticket(world, 'melt', 0.44, 7, true);
    ticket(world, 'toast', 0.86, 1);
    world.kitchen.burners[0].item = part('dough', 'sear', 0.7);
    world.kitchen.burners[1].item = part('mushroom', 'sear', 0.98);
    world.kitchen.burners[0].flare = 0.8;
    world.kitchen.board.item = part('herb', 'chop', 'chopped');
    world.kitchen.plateStation.plate.parts = [part('broth', 'sear', 'seared')];
    teleportChef(world.chef, world.kitchen.board.x + 32, 494);
    world.chef.carry = { kind: 'item', item: part('cheese', 'chop', 'chopped') };
    for (let i = 0; i < 5; i += 1) world.kitchen.smoke.push({ x: 352 + i * 18, y: 322 - i * 6, size: 9 + i, life: 0.85 - i * 0.1, drift: i * 1.3 });
  } else {
    // the cover: mid-service, a finished plate at the pass and another dish half-built
    world.time = 74;
    world.progress = 0.59;
    world.earned = 186;
    world.served = 6;
    world.combo = 3;
    ticket(world, 'melt', 0.28, 12, true);
    ticket(world, 'soup', 0.62, 5);
    ticket(world, 'toast', 0.9, 1);
    world.kitchen.burners[0].item = part('bread', 'sear', 0.72);
    world.kitchen.burners[1].item = part('mushroom', 'sear', 0.34);
    world.kitchen.burners[1].flare = 0.5;
    world.kitchen.board.item = part('tomato', 'chop', 'chopped');
    world.kitchen.plateStation.plate.parts = [part('egg', 'sear', 'seared'), part('herb', 'chop', 'chopped')];
    teleportChef(world.chef, world.kitchen.pass.x - 40, 486);
    world.chef.facing = 1;
    world.chef.carry = { kind: 'plate', parts: [part('bread', 'sear', 'seared'), part('cheese', 'chop', 'chopped'), part('herb', 'chop', 'chopped')] };
    world.kitchen.pass.ring = 0.35;
    for (let i = 0; i < 3; i += 1) world.kitchen.smoke.push({ x: 540 + i * 16, y: 330 - i * 8, size: 8 + i, life: 0.7 - i * 0.12, drift: i * 2 });
    for (let i = 0; i < 4; i += 1) world.kitchen.sparks.push({ x: 760 + i * 8, y: 566, vx: -20 + i * 14, vy: -60 - i * 10, life: 0.8, color: '#d9483a' });
  }

  world.lastStation = null;
  return { screen: SCREEN_PLAY, best: 0 };
}
