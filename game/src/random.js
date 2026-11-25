// A tiny seeded generator so a shift replays exactly: orders, garnish and steam offsets all draw
// from it, and ?seed=N in the URL pins it.
export function createRandom(seed) {
  let state = seed >>> 0 || 1;
  function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  return {
    next,
    int(n) {
      return Math.floor(next() * n);
    },
    pick(list) {
      return list[Math.floor(next() * list.length)];
    },
    range(low, high) {
      return low + next() * (high - low);
    },
    chance(p) {
      return next() < p;
    },
  };
}
