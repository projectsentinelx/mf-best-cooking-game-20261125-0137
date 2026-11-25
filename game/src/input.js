// Keyboard and mouse, read once a frame: a wish direction, whether the action key is down (for a
// held chop), one press per tap, and the last click. The page's own scrolling and context menu are
// kept out of the way so the game owns the window.
const KEYS = {
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
  action: ['KeyE', 'Space', 'Enter'],
};

export function createInput(canvas) {
  const down = new Set();
  let pressed = false;
  let paused = false;
  let click = null;

  window.addEventListener('keydown', (event) => {
    if (event.repeat) {
      if (KEYS.action.includes(event.code)) event.preventDefault();
      return;
    }
    down.add(event.code);
    if (event.code === 'KeyP') paused = true;
    if (KEYS.action.includes(event.code)) {
      pressed = true;
      event.preventDefault();
    }
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(event.code)) event.preventDefault();
  });

  window.addEventListener('keyup', (event) => {
    down.delete(event.code);
  });

  window.addEventListener('blur', () => down.clear());

  canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    click = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    pressed = true;
  });

  canvas.addEventListener('contextmenu', (event) => event.preventDefault());

  function any(codes) {
    for (const code of codes) if (down.has(code)) return true;
    return false;
  }

  return {
    /** {x, y} wish direction in -1..1, whether action is held, and one press flag for this frame. */
    read() {
      let x = 0;
      let y = 0;
      if (any(KEYS.left)) x -= 1;
      if (any(KEYS.right)) x += 1;
      if (any(KEYS.up)) y -= 1;
      if (any(KEYS.down)) y += 1;
      const state = { x, y, held: any(KEYS.action), pressed, paused, click };
      pressed = false;
      paused = false;
      click = null;
      return state;
    },
    clear() {
      down.clear();
      pressed = false;
      paused = false;
      click = null;
    },
  };
}
