// Boot, the one loop, and the three screens. Input is read every frame, the shift advances in fixed
// 1/60 s steps (several in a slow frame, none in a fast one), and the renderer paints what is there.
// ?shot=service|chopping|plating|rush stages a scene for a screenshot instead of starting the clock.
import { REACH, STEP } from './config.js';
import { createRandom } from './random.js';
import { createInput } from './input.js';
import { createRenderer } from './render.js';
import { createSound } from './sound.js';
import { createWorld, interactWorld, resetWorld, stepWorld, tapChop, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './world.js';
import { stageShot } from './shots.js';
import { stationNear } from './kitchen.js';

const BEST_KEY = 'copper-thyme-best';
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const input = createInput(canvas);
const playSound = createSound();
world.sound = playSound;

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Private windows keep the record for this visit only.
  }
}

/** Click on the kitchen: walk there, and work the station if one was clicked. */
function handleClick(point) {
  if (world.screen !== SCREEN_PLAY) {
    if (world.screen === SCREEN_TITLE || world.screen === SCREEN_OVER) startShift();
    return;
  }
  const near = nearestStationTo(point);
  if (near) {
    walk.target = { x: near.x, y: near.y > 450 ? 496 : 408 };
    walk.station = near;
    return;
  }
  walk.target = point;
  walk.station = null;
}

function nearestStationTo(point) {
  let best = null;
  let bestDistance = 72;
  for (const station of world.kitchen.stations) {
    const dy = point.y - (station.box.y + station.box.h / 2);
    const dx = point.x - (station.box.x + station.box.w / 2);
    const distance = Math.hypot(dx, dy * 0.8);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = station;
    }
  }
  return best;
}

function announce(message) {
  status.textContent = message;
}

const walk = { target: null, station: null };

function startShift() {
  resetWorld(world);
  walk.target = null;
  walk.station = null;
  playSound('order');
  announce('Service is open. Three minutes to close.');
}

function runLoop() {
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();
  let chopSound = 0;

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    const controls = input.read();

    if (controls.click) handleClick(renderer.toStage(controls.click.x, controls.click.y));

    if (world.screen === SCREEN_TITLE || world.screen === SCREEN_OVER) {
      if (controls.pressed) startShift();
      renderer.draw(world, now / 1000, best);
      return;
    }

    if (controls.paused) {
      const paused = world.screen === SCREEN_PLAY;
      world.screen = paused ? SCREEN_PAUSED : SCREEN_PLAY;
      announce(paused ? 'Paused.' : 'Playing.');
    }
    if (world.screen === SCREEN_PAUSED) {
      accumulator = 0;
      renderer.draw(world, now / 1000, best);
      return;
    }

    // Walk toward a clicked spot until the cook is standing on it.
    let wishX = controls.x;
    let wishY = controls.y;
    if (walk.target && controls.x === 0 && controls.y === 0) {
      const dx = walk.target.x - world.chef.x;
      const dy = walk.target.y - world.chef.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 6) {
        walk.target = null;
        if (walk.station && Math.hypot(walk.station.x - world.chef.x, walk.station.y - world.chef.y) < REACH) {
          interactWorld(world);
          playSound('chop');
        }
        walk.station = null;
      } else {
        wishX = dx / distance;
        wishY = dy / distance;
      }
    }

    if (controls.pressed) {
      const near = stationNear(world.kitchen, world.chef, REACH);
      if (near && near.kind === 'board' && near.item && !near.item.done) tapChop(world);
      else interactWorld(world);
      walk.target = null;
      walk.station = null;
    }

    accumulator += dt;
    let steps = 0;
    while (accumulator >= STEP && steps < 5) {
      stepWorld(world, STEP, { x: wishX, y: wishY, held: controls.held });
      accumulator -= STEP;
      steps += 1;
      chopSound += STEP;
      if (controls.held && world.kitchen.board.item && !world.kitchen.board.item.done) {
        if (chopSound > 0.2) {
          playSound('chop');
          chopSound = 0;
        }
      }
    }

    if (world.over && world.earned > best) {
      best = world.earned;
      saveBest(best);
      announce(`Service closed. Takings $${world.earned}.`);
    }

    renderer.draw(world, now / 1000, best);
  }

  requestAnimationFrame(frame);
}

if (shot) {
  const scene = stageShot(shot, world);
  world.screen = scene.screen;
  // Two synchronous paints: the frame is on the canvas before the browser can be asked for a
  // screenshot, so a headless capture never catches the empty first buffer. A later frame only
  // settles the fonts.
  const paint = () => renderer.draw(world, 1.4, 0);
  paint();
  paint();
  window.addEventListener('load', paint);
  document.addEventListener('DOMContentLoaded', paint);
  requestAnimationFrame(() => {
    paint();
    window.__shotReady = true;
  });
  setTimeout(paint, 80);
  setTimeout(paint, 400);
} else {
  announce('Copper & Thyme. Press Space or click to open the shift.');
  runLoop();
}
