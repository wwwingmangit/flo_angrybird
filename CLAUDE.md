# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**YETI SMASH!** - A browser-based physics game (Angry Birds clone) where a yeti launches at viking boars. Built with Matter.js physics engine and Canvas HTML5.

## Development

**Run locally:** Open `index.html` in a browser or use a local server (e.g., Live Server on port 5500).

No build step, no npm dependencies - vanilla JS with Matter.js loaded via CDN.

## Architecture

The game uses the **IIFE module pattern** - each JS file exposes a single global object.

```
Game loop flow:
main.js (Game) → Physics.update() → Particles.update() → checkBirdStatus() → checkGameEnd() → render()
                                                                                              ↓
                                         Renderer.render() → Particles.render() → Slingshot.draw()
```

**Module responsibilities:**

| Module | Global | Role |
|--------|--------|------|
| `physics.js` | `Physics` | Matter.js engine, world, collision events |
| `entities.js` | `Entities` | Factory functions for Bird, Pig, Block |
| `renderer.js` | `Renderer` | Canvas drawing, sprites, parallax background, animations |
| `slingshot.js` | `Slingshot` | Drag/drop controls (mouse + touch), launch velocity |
| `level.js` | `Level` | Level data, entity management |
| `particles.js` | `Particles` | Visual effects (ice shards, stars, snow) |
| `audio.js` | `Audio` | Synthesized sound effects |
| `main.js` | `Game` | Game loop, state machine, screenshake, UI |

**Game states:** `READY` → `FLYING` → `SETTLE` → `WIN`/`LOSE`

## Sprite System

Sprites are loaded from `assets/images/` and mapped in `renderer.js`:

| Game Entity | Sprite | Internal Type |
|-------------|--------|---------------|
| Yeti (projectile) | `yeti.png` | `bird` |
| Viking Boar (target) | `boar.png` | `pig` |
| Ice Block | `block-ice.png` | `wood` |
| Dense Ice | `block-ice-dark.png` | `stone` |
| Frozen Metal | `block-metal.png` | `metal` |

Background uses 3-layer parallax: `bg-sky.png`, `bg-mountains-far.png`, `bg-mountains-near.png`

## Key Constants

**Gameplay tuning:**
- `slingshot.js`: `MAX_DRAG_DISTANCE` (120px), `POWER_MULTIPLIER` (0.15)
- `entities.js`: `BLOCK_TYPES` resistance values (wood:3, stone:7, metal:15)
- `main.js`: `DAMAGE_THRESHOLD` (1.5), `SETTLE_TIME` (2000ms)

**Rendering:**
- `physics.js`: `CANVAS_WIDTH` (900), `CANVAS_HEIGHT` (500)
- `renderer.js`: Sprite sizes, parallax layer positions

## Adding New Levels

Edit `level.js` → `levelData` object:
```javascript
{
  birds: 3,
  pigs: [{ x, y }, ...],
  blocks: [{ x, y, width, height, type: 'wood'|'stone'|'metal' }, ...]
}
```

Note: Internal types (`wood`, `stone`, `metal`) map to ice-themed sprites automatically.
