// The room's layout: where every station stands, how far its reach is, and the anchors the chef walks
// to. The kitchen is one flat work line in two rows — the pantry, board, plate and bin along the near
// counter, the two burners and the pass along the far one — so a dish is a route between them.
import { PANTRY_ORDER, INGREDIENTS } from './pantry.js';

const CRATE = { width: 74, height: 70, gap: 4, left: 30, y: 536 };
const BACK_Y = 402;
const FRONT_Y = 508;

export function createKitchen() {
  const crates = PANTRY_ORDER.map((ingredient, index) => ({
    id: `crate-${ingredient}`,
    kind: 'crate',
    ingredient,
    label: INGREDIENTS[ingredient].name,
    x: CRATE.left + CRATE.width / 2 + index * (CRATE.width + CRATE.gap),
    y: FRONT_Y,
    box: { x: CRATE.left + index * (CRATE.width + CRATE.gap), y: CRATE.y, w: CRATE.width, h: CRATE.height },
    bob: 0,
  }));

  const board = {
    id: 'board',
    kind: 'board',
    x: 751,
    y: FRONT_Y,
    box: { x: 676, y: 536, w: 150, h: 68 },
    item: null,
    stroke: 0,
  };

  const burners = [0, 1].map((index) => ({
    id: `burner-${index}`,
    kind: 'burner',
    index,
    x: 352 + index * 178,
    y: BACK_Y,
    box: { x: 352 + index * 178 - 66, y: 300, w: 132, h: 78 },
    item: null,
    heat: 0.55,
    flare: 0,
  }));

  const plateStation = {
    id: 'plate',
    kind: 'plate',
    x: 931,
    y: FRONT_Y,
    box: { x: 856, y: 530, w: 150, h: 80 },
    plate: { parts: [] },
    stack: 7,
  };

  const bin = { id: 'bin', kind: 'bin', x: 1071, y: FRONT_Y, box: { x: 1036, y: 530, w: 70, h: 86 }, shake: 0 };

  const pass = { id: 'pass', kind: 'pass', x: 1064, y: BACK_Y, box: { x: 896, y: 292, w: 344, h: 92 }, ring: 0, plates: 0 };

  const stations = [...crates, board, ...burners, plateStation, bin, pass];

  return {
    stations,
    crates,
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

/** The station the chef is closest to and close enough to use, or null. */
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
