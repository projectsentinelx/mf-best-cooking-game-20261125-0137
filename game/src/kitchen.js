// The floor plan: where every station stands along the two work lines, how far its reach is, and the
// anchors the cook walks to. The pantry, board, plate and bin run along the near counter; the two
// pans and the pass along the far one, with the pass directly behind the plate station so a finished
// dish only has to be turned around. A dish is a route between the two rows.
import { BACK, FRONT, WALK } from './config.js';
import { PANTRY_ORDER, INGREDIENTS } from './pantry.js';

const CRATE = { width: 92, height: 100, gap: 6, left: 20, y: FRONT.top + 16 };
const COUNTER_Y = FRONT.top + 6;
const BACK_Y = WALK.top - 6;

/** The eight pantry crates, sized so the ingredient in each reads from across the room. */
function pantryCrates() {
  return PANTRY_ORDER.map((ingredient, index) => {
    const x = CRATE.left + index * (CRATE.width + CRATE.gap);
    return {
      id: `crate-${ingredient}`,
      kind: 'crate',
      ingredient,
      label: INGREDIENTS[ingredient].name,
      x: x + CRATE.width / 2,
      y: FRONT.top + 18,
      box: { x, y: CRATE.y, w: CRATE.width, h: CRATE.height },
      bob: 0,
    };
  });
}

export function createKitchen() {
  const burners = [0, 1].map((index) => ({
    id: `burner-${index}`,
    kind: 'burner',
    index,
    x: 272 + index * 226,
    y: BACK_Y,
    box: { x: 272 + index * 226 - 84, y: BACK.top + 4, w: 168, h: BACK.bottom - BACK.top - 18 },
    item: null,
    heat: 0.55,
    flare: 0,
  }));

  const board = {
    id: 'board',
    kind: 'board',
    x: 900,
    y: FRONT.top + 18,
    box: { x: 812, y: COUNTER_Y, w: 158, h: 106 },
    item: null,
    stroke: 0,
  };

  const plateStation = {
    id: 'plate',
    kind: 'plate',
    x: 1052,
    y: FRONT.top + 16,
    box: { x: 968, y: COUNTER_Y - 4, w: 168, h: 112 },
    plate: { parts: [] },
    stack: 7,
  };

  const bin = { id: 'bin', kind: 'bin', x: 1190, y: FRONT.top + 20, box: { x: 1158, y: COUNTER_Y + 10, w: 64, h: 96 }, shake: 0 };

  const pass = {
    id: 'pass',
    kind: 'pass',
    x: 1046,
    y: BACK_Y - 44,
    box: { x: 884, y: BACK.top + 8, w: 372, h: 116 },
    ring: 0,
    plates: [],
  };

  const stations = [...pantryCrates(), board, ...burners, plateStation, bin, pass];

  return {
    stations,
    crates: stations.filter((station) => station.kind === 'crate'),
    board,
    burners,
    plateStation,
    bin,
    pass,
    smoke: [],
    sparks: [],
    flashes: [],
    glow: 0,
  };
}

/** The station the cook is closest to and close enough to use, or null. */
export function stationNear(kitchen, chef, reach) {
  let best = null;
  let bestDistance = reach;
  for (const station of kitchen.stations) {
    const dx = station.x - chef.x;
    const dy = station.y - chef.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = station;
    }
  }
  return best;
}