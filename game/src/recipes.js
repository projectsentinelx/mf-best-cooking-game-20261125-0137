// The menu: five bistro plates, each a set of components that must reach the plate finished the right
// way. Matching is exact (same ingredients, same method each) and order-free, so a cook can build a
// dish in whatever sequence the kitchen allows.
import { METHOD } from './pantry.js';

export const RECIPES = [
  {
    id: 'tart',
    name: 'Tomato Tart',
    parts: [
      { ingredient: 'dough', method: METHOD.SEAR },
      { ingredient: 'tomato', method: METHOD.CHOP },
    ],
    price: 14,
    tier: 1,
    garnish: 'thyme',
    blurb: 'A round of dough blistered in the pan, chopped tomato heaped on top.',
  },
  {
    id: 'omelette',
    name: 'Herb Omelette',
    parts: [
      { ingredient: 'egg', method: METHOD.SEAR },
      { ingredient: 'herb', method: METHOD.CHOP },
    ],
    price: 13,
    tier: 1,
    garnish: 'herb',
    blurb: 'A soft fold of egg, thyme scattered through it.',
  },
  {
    id: 'toast',
    name: 'Mushroom Toast',
    parts: [
      { ingredient: 'bread', method: METHOD.SEAR },
      { ingredient: 'mushroom', method: METHOD.SEAR },
    ],
    price: 16,
    tier: 2,
    garnish: 'mushroom',
    blurb: 'Thick toast and sliced mushrooms, both off the pan — two pans or a wait.',
  },
  {
    id: 'soup',
    name: 'Garden Soup',
    parts: [
      { ingredient: 'broth', method: METHOD.SEAR },
      { ingredient: 'tomato', method: METHOD.CHOP },
      { ingredient: 'herb', method: METHOD.CHOP },
    ],
    price: 18,
    tier: 3,
    garnish: 'herb',
    blurb: 'Broth brought up hot, chopped tomato and thyme stirred in at the pass.',
  },
  {
    id: 'melt',
    name: 'Copper Melt',
    parts: [
      { ingredient: 'bread', method: METHOD.SEAR },
      { ingredient: 'cheese', method: METHOD.CHOP },
      { ingredient: 'herb', method: METHOD.CHOP },
    ],
    price: 20,
    tier: 3,
    garnish: 'cheese',
    blurb: 'Seared bread, chopped cheese melted over it, thyme on the finish.',
  },
];

const BY_ID = new Map(RECIPES.map((recipe) => [recipe.id, recipe]));

export function recipeById(id) {
  return BY_ID.get(id) || null;
}

/** Recipes a shift may call for at the given point in the service (0 at the bell, 1 at close). */
export function menuFor(progress) {
  const top = progress < 0.2 ? 1 : progress < 0.45 ? 2 : 3;
  return RECIPES.filter((recipe) => recipe.tier <= top);
}

/** A stable key for a finished component, used to compare a plate with what a ticket asks for. */
export function partKey(part) {
  return `${part.ingredient}:${part.method}`;
}

/**
 * Does this plate serve that recipe? Every component on the plate must be finished, the counts must
 * be equal, and each ingredient must carry the method the recipe names.
 */
export function plateMatches(plateParts, recipe) {
  if (plateParts.length !== recipe.parts.length) return false;
  const wanted = new Map();
  for (const part of recipe.parts) {
    const key = partKey(part);
    wanted.set(key, (wanted.get(key) || 0) + 1);
  }
  for (const part of plateParts) {
    if (!part.done) return false;
    const key = partKey(part);
    const left = wanted.get(key) || 0;
    if (left === 0) return false;
    wanted.set(key, left - 1);
  }
  for (const left of wanted.values()) if (left > 0) return false;
  return true;
}

/** How many of a recipe's components are already on the plate, for the mid-assembly badge. */
export function plateProgress(plateParts, recipe) {
  if (!recipe) return 0;
  const left = recipe.parts.map(partKey);
  let found = 0;
  for (const part of plateParts) {
    if (!part.done) continue;
    const index = left.indexOf(partKey(part));
    if (index === -1) continue;
    left.splice(index, 1);
    found += 1;
  }
  return found;
}
