// The pantry: eight crates along the front counter, each holding one ingredient, and the two ways an
// ingredient can be finished (chopped on the board, seared in a pan). Colours and cut shapes live
// here so the art and the tickets agree.
export const METHOD = { CHOP: 'chop', SEAR: 'sear' };

export const INGREDIENTS = {
  tomato: { name: 'Tomato', crate: '#b8352a', flesh: '#d9483a', accent: '#ffb9a2', seed: '#f5d76e', method: METHOD.CHOP, unit: 'wedge' },
  dough: { name: 'Dough', crate: '#c9a878', flesh: '#e6c893', accent: '#f6e3b8', seed: '#c2a06a', method: METHOD.SEAR, unit: 'round' },
  egg: { name: 'Egg', crate: '#d9c07a', flesh: '#f3d35c', accent: '#fff6cf', seed: '#f8a93c', method: METHOD.SEAR, unit: 'fold' },
  herb: { name: 'Thyme', crate: '#3f6b3a', flesh: '#69a352', accent: '#bfe08c', seed: '#2f5429', method: METHOD.CHOP, unit: 'sprig' },
  mushroom: { name: 'Mushroom', crate: '#7a6146', flesh: '#a98863', accent: '#d3bb99', seed: '#5d4832', method: METHOD.SEAR, unit: 'slice' },
  cheese: { name: 'Cheese', crate: '#d8a33c', flesh: '#f2c250', accent: '#ffe6a3', seed: '#b8842a', method: METHOD.CHOP, unit: 'wedge' },
  bread: { name: 'Bread', crate: '#9c6b3f', flesh: '#d29a5b', accent: '#f0c894', seed: '#7d5230', method: METHOD.SEAR, unit: 'slice' },
  broth: { name: 'Broth', crate: '#8a6a3a', flesh: '#c99856', accent: '#eccb92', seed: '#6d5129', method: METHOD.SEAR, unit: 'ladle' },
};

/** The crates left to right along the pantry counter. */
export const PANTRY_ORDER = ['tomato', 'dough', 'egg', 'herb', 'mushroom', 'cheese', 'bread', 'broth'];

/** What the ticket calls the finished state, and how the HUD asks for it. */
export const METHOD_LABEL = { chop: 'Chop', sear: 'Sear' };

/** A fresh, unprepared ingredient as the chef picks it from its crate. */
export function rawItem(id) {
  const ingredient = INGREDIENTS[id];
  return {
    ingredient: id,
    method: ingredient.method,
    state: 'raw', // raw -> working -> ready (seared items can also go to 'burnt')
    progress: 0,
    done: false,
  };
}

export function isPrepared(item) {
  return item.done === true;
}

/** The single word a ticket shows for one component: what it must be, not what it is. */
export function componentLabel(part) {
  return `${INGREDIENTS[part.ingredient].name} · ${METHOD_LABEL[part.method]}`;
}
