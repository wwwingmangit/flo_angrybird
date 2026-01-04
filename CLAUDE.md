# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Simplified Angry Birds clone - a browser-based physics game using Matter.js and Canvas HTML5.

## Development

**Run locally:** Open `index.html` in a browser or use a local server (e.g., Live Server on port 5500).

No build step, no dependencies to install - pure vanilla JS with Matter.js loaded via CDN.

## Architecture

The game uses the **IIFE module pattern** - each JS file exposes a single global object.

```
Game loop flow:
main.js (Game) → Physics.update() → checkBirdStatus() → checkGameEnd() → Renderer.render()
```

**Module responsibilities:**

| Module | Global | Role |
|--------|--------|------|
| `physics.js` | `Physics` | Matter.js engine, world, collision events |
| `entities.js` | `Entities` | Factory functions for Bird, Pig, Block |
| `renderer.js` | `Renderer` | Canvas drawing, responsive scaling |
| `slingshot.js` | `Slingshot` | Drag/drop controls (mouse + touch), launch velocity |
| `level.js` | `Level` | Level data, entity management, win/lose state |
| `main.js` | `Game` | Game loop, state machine, initialization |

**Game states:** `READY` → `FLYING` → `SETTLE` → `WIN`/`LOSE`

**Key constants to tune gameplay:**
- `slingshot.js`: `MAX_DRAG_DISTANCE` (pull distance), `POWER_MULTIPLIER` (launch force)
- `entities.js`: `BLOCK_TYPES` resistance values
- `main.js`: `DAMAGE_THRESHOLD`, `SETTLE_TIME`

## Adding New Levels

Edit `level.js` → `levelData` object:
```javascript
{
  birds: 3,
  pigs: [{ x, y }, ...],
  blocks: [{ x, y, width, height, type: 'wood'|'stone'|'metal' }, ...]
}
```