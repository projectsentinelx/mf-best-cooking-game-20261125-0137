// Copper & Thyme hands itself in from here (Node 22, standard library only).
//
// The game is the plain static tree in game/ — an index.html and its ES modules, no build step and
// no network request — and the screenshots in screenshots/ are real frames of it. This program
// copies both beside the platform's /output and writes /output/dossier.json with the vendored
// make.fun library, which is the summary the judge reads. It also refuses to hand in a tree that
// breaks the gate's own caps, so a bad copy fails here rather than on the site.
//
// Locally, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the game to play it with `node serve.ts` (http://localhost:8080).
import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

/** The gate's own numbers (the scorer's reference/gate.json), so this program ships nothing refused. */
const CAPS = {
  textMaxBytes: 163840,
  screenshotCount: { min: 3, max: 4 },
  screenshotBytes: 262144,
  gameEntries: 993,
  gameBytes: 50331648,
  pathBytes: 1000,
  indexBytes: 1024 * 1024,
};

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

interface TreeCount {
  entries: number;
  bytes: number;
  longestPath: number;
}

/** Every entry under `dir`, counted the way the gate counts game/: files and directories together. */
function audit(dir: string, root = dir, seen: TreeCount = { entries: 0, bytes: 0, longestPath: 0 }): TreeCount {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const info = statSync(path);
    seen.entries += 1;
    seen.longestPath = Math.max(seen.longestPath, Buffer.byteLength(relative(root, path)));
    if (info.isDirectory()) audit(path, root, seen);
    else seen.bytes += info.size;
  }
  return seen;
}

/** Fail loudly (and early) instead of handing the site an entry its gate will refuse. */
function insist(condition: boolean, message: string): void {
  if (!condition) throw new Error(`Copper & Thyme will not ship: ${message}`);
}

const gameDir = join(here, 'game');
const shotsDir = join(here, 'screenshots');
insist(existsSync(join(gameDir, 'index.html')), 'game/index.html is missing');
insist(existsSync(shotsDir), 'screenshots/ is missing');

const tree = audit(gameDir);
insist(tree.entries <= CAPS.gameEntries, `game/ holds ${tree.entries} entries (cap ${CAPS.gameEntries})`);
insist(tree.bytes <= CAPS.gameBytes, `game/ holds ${tree.bytes} bytes (cap ${CAPS.gameBytes})`);
insist(tree.longestPath <= CAPS.pathBytes, `a game path is ${tree.longestPath} bytes long`);
insist(statSync(join(gameDir, 'index.html')).size <= CAPS.indexBytes, 'game/index.html is over 1 MiB');

const shots = readdirSync(shotsDir).filter((name) => !name.startsWith('.'));
insist(shots.length >= CAPS.screenshotCount.min && shots.length <= CAPS.screenshotCount.max, `screenshots/ holds ${shots.length}`);
for (const name of shots) {
  insist(statSync(join(shotsDir, name)).size <= CAPS.screenshotBytes, `screenshot ${name} is over 256 KiB`);
}

mkdirSync(out, { recursive: true });
cpSync(gameDir, join(out, 'game'), { recursive: true });
cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: CAPS.textMaxBytes,
    screenshots: { max: CAPS.screenshotCount.max, max_bytes: CAPS.screenshotBytes },
    game_max_files: CAPS.gameEntries,
    game_max_bytes: CAPS.gameBytes,
    game_path_max_bytes: CAPS.pathBytes,
  }),
);

const dossier = statSync(join(out, 'dossier.json')).size;
console.log(
  `Copper & Thyme: game/ ${tree.entries} entries, ${tree.bytes} bytes · screenshots ${shots.length} · dossier ${dossier} bytes → ${out}`,
);
