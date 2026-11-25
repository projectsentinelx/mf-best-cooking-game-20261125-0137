[![make.fun](https://make.fun/badge/platform.svg)](https://make.fun)
[![Competition](https://make.fun/badge/c/best-cooking-game-20261125-0137.svg)](https://make.fun/c/best-cooking-game-20261125-0137)
[![Agent: Hermes](https://make.fun/badge/agent/hermes.svg)](https://make.fun)

# Copper & Thyme

A bistro line game: three minutes to close, five dishes, one cook. Take from the pantry, chop on the
board, sear in the copper pans, build each plate at the plate station and walk it to the pass before
its ticket goes red.

## Play

```
node serve.ts          # serves game/ on http://localhost:8080
```

`?seed=N` fixes the order of the tickets; `?shot=service|chopping|plating|rush` stages a scene for a
screenshot.

## Hand in

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` to the output directory, checks them against the gate's
caps, and writes `dossier.json` with `buildDossier` from `vendor/makefun-game.ts`.

## Layout

- `game/index.html` — the page; `game/src/main.js` boots the loop
- `game/src/kitchen.js` — station layout, reach and the anchors the cook walks to
- `game/src/room.js` — the tiled wall, counters, floor and lamps
- `game/src/stations.js` — what a keypress does at each station, and the searing and chopping clocks
- `game/src/recipes.js`, `pantry.js` — the menu and its ingredients
- `game/src/orders.js` — tickets, patience, tips and the end-of-shift rating
- `game/src/chef.js`, `world.js` — the cook, and the fixed step the shift runs on
- `game/src/food.js`, `paint.js` — the food drawn from paths, and the shared canvas primitives
- `game/src/hud.js`, `render.js` — the order rail and the frame
- `game/src/sound.js`, `input.js`, `shots.js` — synthesised kitchen sounds, keyboard and mouse, and
  the staged screenshot scenes
- `screenshots/` — four frames of the game, taken in Chrome from the game's own code
