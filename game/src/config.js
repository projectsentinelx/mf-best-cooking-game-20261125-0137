// Fixed numbers for Copper & Thyme: the logical stage, the shift clock, station timing windows and
// the palette the whole kitchen is painted from. Nothing here runs code; every other module reads it.
export const FIELD = { width: 1280, height: 720 };

export const SHIFT_SECONDS = 180;

// The order rail hangs across the top; the wall, two counters and the floor band fill the rest.
export const RAIL = { top: 10, height: 132, slot: 280, left: 16, count: 4 };
export const WALL = { top: 152, bottom: 288 };
export const BACK = { top: 288, bottom: 398 };
export const FLOOR = { top: 398, bottom: 522 };
export const FRONT = { top: 522, bottom: 640 };
export const FOREGROUND = { top: 640, bottom: 720 };

// Where the chef may stand, and how far a station reaches from its anchor.
export const WALK = { left: 44, right: 1236, top: 408, bottom: 512 };
export const REACH = 108;
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
  tile: '#1d3a3c',
  tileDark: '#16302f',
  tileLine: '#24504f',
  counter: '#7a5233',
  counterTop: '#a4713f',
  counterEdge: '#5b3a22',
  floor: '#3d2c22',
  floorLine: '#4a3628',
  brass: '#e8b25a',
  copper: '#c9703c',
  cream: '#f6e7cd',
  ember: '#ff8a3c',
  emberHot: '#ffd17a',
  ok: '#7ed08a',
  warn: '#f0b83c',
  bad: '#e2564a',
  ink: '#231a14',
  paper: '#f4e6c8',
  paperEdge: '#d9c49d',
  steam: 'rgba(255,246,232,0.42)',
  text: '#f6e7cd',
  muted: '#b49e86',
  panel: 'rgba(16,22,28,0.94)',
};

export const FONT = '"Trebuchet MS", "Segoe UI", Verdana, sans-serif';
