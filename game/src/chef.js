// The cook: where they stand, what they are holding, and the little body that carries it. Movement is
// clamped to the aisle between the two counters, a carried plate slows the walk, and the drawing is
// built from the same pair of coordinates so the shadow always meets the floor.
import { CHEF, WALK } from './config.js';
import { drawIngredient, drawPlate } from './food.js';

export function createChef() {
  return {
    x: 640,
    y: 460,
    facing: 1,
    carry: null,
    phase: 0,
    moving: false,
    armSwing: 0,
  };
}

export function moveChef(chef, wishX, wishY, dt) {
  const length = Math.hypot(wishX, wishY);
  const speed = CHEF.speed * (chef.carry ? CHEF.carrySpeed : 1);
  if (length < 0.001) {
    chef.moving = false;
    chef.armSwing *= Math.max(0, 1 - dt * 8);
    return;
  }
  const nx = wishX / length;
  const ny = wishY / length;
  chef.x = Math.min(WALK.right, Math.max(WALK.left, chef.x + nx * speed * dt));
  chef.y = Math.min(WALK.bottom, Math.max(WALK.top, chef.y + ny * speed * dt));
  if (Math.abs(nx) > 0.15) chef.facing = nx > 0 ? 1 : -1;
  chef.phase += dt * speed * 0.05;
  chef.moving = true;
  chef.armSwing = Math.sin(chef.phase * 2.2) * 0.5;
}

export function teleportChef(chef, x, y) {
  chef.x = Math.min(WALK.right, Math.max(WALK.left, x));
  chef.y = Math.min(WALK.bottom, Math.max(WALK.top, y));
}

/** Draw the cook with whatever they hold: an item overhead, or a plate out in front. */
export function drawChef(ctx, chef, t) {
  const bob = chef.moving ? Math.sin(chef.phase * 2.2) * 2.4 : Math.sin(t * 2) * 0.8;
  const x = 0;
  const y = 0;

  ctx.save();
  ctx.translate(chef.x, chef.y + 4);
  ctx.scale(1.46, 1.46);
  ctx.fillStyle = 'rgba(0,0,0,0.32)';
  ctx.beginPath();
  ctx.ellipse(x, y + 4, 22, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // legs
  ctx.strokeStyle = '#2a2f38';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  const stride = chef.moving ? Math.sin(chef.phase * 2.2) * 7 : 0;
  ctx.beginPath();
  ctx.moveTo(x - 7, y - 22);
  ctx.lineTo(x - 8 + stride, y - 2);
  ctx.moveTo(x + 7, y - 22);
  ctx.lineTo(x + 8 - stride, y - 2);
  ctx.stroke();

  // apron body
  ctx.fillStyle = '#f2ede2';
  ctx.beginPath();
  ctx.moveTo(x - 15, y - 46 + bob);
  ctx.lineTo(x + 15, y - 46 + bob);
  ctx.lineTo(x + 18, y - 18);
  ctx.lineTo(x - 18, y - 18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#dcd4c4';
  ctx.fillRect(x - 18, y - 26, 36, 5);
  ctx.fillStyle = '#8a2f33';
  ctx.fillRect(x - 3, y - 46 + bob, 6, 16);

  // arms
  ctx.strokeStyle = '#e8c9a8';
  ctx.lineWidth = 6;
  const lift = chef.carry ? 0.9 : 0.02;
  ctx.beginPath();
  ctx.moveTo(x - 14, y - 42 + bob);
  ctx.lineTo(x - 20 - chef.armSwing * 6, y - 42 + bob - lift * 22);
  ctx.moveTo(x + 14, y - 42 + bob);
  ctx.lineTo(x + 20 + chef.armSwing * 6, y - 42 + bob - lift * 22);
  ctx.stroke();

  // head and toque
  ctx.fillStyle = '#eec9a4';
  ctx.beginPath();
  ctx.arc(x, y - 56 + bob, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fbf7ef';
  ctx.beginPath();
  ctx.ellipse(x, y - 70 + bob, 14, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x - 9, y - 76 + bob, 7, 7, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 9, y - 76 + bob, 7, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d9d2c4';
  ctx.fillRect(x - 14, y - 64 + bob, 28, 4);

  // eyes look the way the cook faces
  ctx.fillStyle = '#2b2320';
  ctx.beginPath();
  ctx.arc(x - 4 + chef.facing * 2, y - 57 + bob, 1.8, 0, Math.PI * 2);
  ctx.arc(x + 4 + chef.facing * 2, y - 57 + bob, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // what the cook carries
  if (chef.carry && chef.carry.kind === 'item') {
    const item = chef.carry.item;
    const state = item.done ? (item.method === 'chop' ? 'chopped' : 'seared') : item.state === 'burnt' ? 'burnt' : 'raw';
    drawIngredient(ctx, item.ingredient, state, x + chef.facing * 18, y - 36 + bob, 32);
  } else if (chef.carry && chef.carry.kind === 'plate') {
    drawPlate(ctx, chef.carry.parts, x + chef.facing * 10, y - 34 + bob, 72);
  }
  ctx.restore();
  ctx.lineCap = 'butt';
}
