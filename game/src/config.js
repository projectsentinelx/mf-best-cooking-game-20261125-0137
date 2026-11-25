// Fixed numbers for Copper & Thyme: the logical stage, the shift clock, station timing windows and
// the palette the whole kitchen is painted from. The stage is split into six bands, top to bottom —
// the ticket rail, the tiled wall, the far counter, a narrow aisle for the cook, the pantry counter
// and the bar front — and every module places its furniture against these bands rather than against
// loose pixels, so the frame stays dense and nothing drifts when the kitchen is re-proportioned.
export const FIELD = { width: 1280, height: 720 };

export const SHIFT_SECONDS = 180;

export const RAIL = { top: 6, height: 132, slot: 280, left: 16, count: 4 };
export const WALL = { top: 142, bottom: 262 };
export const BACK = { top: 262, bottom: 406 };
export const FLOOR = { top: 406, bottom: 470 };
export const FRONT = { top: 470, bottom: 600 };
export const FOREGROUND = { top: 600, bottom: 720 };

// Where the cook may stand, and how far a station reaches from its anchor.
export const WALK = { left: 44, right: 1236, top: 414, bottom: 464 };
export const REACH = 116;
export const STEP = 1 / 60;

export const CHEF = { speed: 430, radius: 22, carrySpeed: 0.82 };

// Chopping answers a held key; searing runs on its own clock with a sweet spot and a burn.
export const CHOP_SECONDS = 1.15;
export const SEAR_READY = 0.62;
export const SEAR_BURN = 1.42;
export const SEAR_SECONDS = 1.9;

export const TICKET = { patience: 36, patienceLate: 27, spawn: 10, spawnLate: 6.2, max: 4 };

export const PALETTE = {
  backdrop: '#0b0d12',
  night: '#121a22',
  tile: '#1f4244',
  tileDark: '#17312f',
  tileLine: '#2e6561',
  counter: '#8a5c38',
  counterTop: '#bb8341',
  counterEdge: '#5b3a22',
  floor: '#3d2c22',
  floorLine: '#4a3628',
  brass: '#f2c069',
  copper: '#d1763c',
  cream: '#f6e7cd',
  ember: '#ff8a3c',
  emberHot: '#ffd97a',
  ok: '#7ed08a',
  warn: '#f0b83c',
  bad: '#e2564a',
  ink: '#231a14',
  paper: '#f9edd4',
  paperEdge: '#d9c49d',
  steam: 'rgba(255,246,232,0.42)',
  text: '#f6e7cd',
  muted: '#b49e86',
  panel: 'rgba(16,22,28,0.94)',
  slate: '#20262b',
};

export const FONT = '"Trebuchet MS", "Segoe UI", Verdana, sans-serif';