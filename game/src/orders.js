// The order rail: which dishes the room is calling for, how long each will wait, and what a plate is
// worth when it lands in time. Tickets are generated from the menu the shift has unlocked so far, so
// the pressure grows by combination rather than by extra chores.
import { TICKET } from './config.js';
import { menuFor, plateMatches } from './recipes.js';

let nextId = 1;

export function createTicket(recipe, progress, special = false) {
  const total = TICKET.patience + (TICKET.patienceLate - TICKET.patience) * progress;
  return {
    id: nextId++,
    recipe,
    special,
    total,
    left: total,
    patience: 1,
    mood: 'calm',
    bornAt: 0,
  };
}

/** What a ticket's plate pays before the tip: the dish's price, doubled for a house special. */
export function ticketPrice(ticket) {
  return ticket.special ? ticket.recipe.price * 2 : ticket.recipe.price;
}

/** The next ticket the room wants; `progress` is how far the shift has run, 0 to 1. */
export function pickRecipe(random, progress, active) {
  const menu = menuFor(progress);
  const waiting = new Set(active.map((ticket) => ticket.recipe.id));
  const fresh = menu.filter((recipe) => !waiting.has(recipe.id));
  const pool = fresh.length > 0 ? fresh : menu;
  // Late in the shift the heavier plates come up more often.
  if (progress > 0.4 && pool.length > 1 && random.chance(0.35)) {
    return pool.reduce((heavy, recipe) => (recipe.parts.length > heavy.parts.length ? recipe : heavy));
  }
  return random.pick(pool);
}

export function ticketMood(ticket) {
  if (ticket.patience > 0.55) return 'calm';
  if (ticket.patience > 0.25) return 'waiting';
  return 'urgent';
}

/** Age every ticket by `dt`; returns the tickets that ran out this step. */
export function ageTickets(tickets, dt) {
  const lost = [];
  for (const ticket of tickets) {
    ticket.left -= dt;
    ticket.patience = Math.max(0, ticket.left / ticket.total);
    ticket.mood = ticketMood(ticket);
    if (ticket.left <= 0) lost.push(ticket);
  }
  return lost;
}

/** Which ticket a finished plate serves: the best-matching one that has waited longest. */
export function ticketForPlate(tickets, plateParts) {
  let found = null;
  for (const ticket of tickets) {
    if (!plateMatches(plateParts, ticket.recipe)) continue;
    if (found === null || ticket.patience < found.patience) found = ticket;
  }
  return found;
}

/**
 * What one served plate is worth: the dish's price, a tip for the patience left, and the combo the
 * cook has built. A rushed plate is worth more than a slow one, never less than the price.
 */
export function scoreServe(ticket, patienceLeft, combo) {
  const base = ticketPrice(ticket);
  const tip = Math.round(base * 0.5 * patienceLeft);
  const comboBonus = Math.min(combo, 5) * 2;
  return { base, tip, combo: comboBonus, total: base + tip + comboBonus };
}

/** Star rating for the end card, out of the shift's takings and the plates that walked out. */
export function rateShift(earned, served, walkouts) {
  const grade = earned / 240 + served / 28 - walkouts * 0.25;
  if (grade >= 1.75) return 3;
  if (grade >= 1.05) return 2;
  if (grade >= 0.4) return 1;
  return 0;
}
