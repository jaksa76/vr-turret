# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Dev Server

```bash
npm run dev
```

Starts Vite dev server with HTTPS (required for WebXR). Access on Meta Quest via the network URL printed on startup (e.g. `https://192.168.x.x:5173`). Changes to HTML or JS trigger automatic browser reload.

## Architecture

Vanilla JS + [A-Frame](https://aframe.io) (v1.5.0) WebXR app. No build step — all dependencies load from CDN. Components are plain `<script>` tags in each HTML file.

**Entry points** (each is a self-contained scene):
- `index.html` — main turret shooter game
- `car.html` — top-down car racing prototype
- `explosion.html`, `physics.html`, `physics-ammo.html`, `mix.html`, `platformer.html`, `physx.html` — standalone experiments

**Physics:** ammo.js (`aframe-physics-system`) used in most scenes. Bodies are `ammo-body` + `ammo-shape`. Kinematic bodies emit `collidestart` events used for hit detection.

**Component overview (`components/`):**
- `turret.js` — aims at a raycaster target (mouse cursor or VR controller) each tick
- `shooter.js` — fires projectiles at fixed intervals from the turret barrel; adjust the ms threshold to change fire rate
- `projectile.js` — moves a bullet along a velocity vector each tick; destroyed on `collidestart` or when too far away
- `destroyable.js` — listens for `collidestart`, reduces health when hit by `.bullet` elements; spawns an explosion entity on death
- `explosion.js` — particle/visual effect on entity death
- `enemy-spawner.js` — time-based wave scheduler; spawns enemies using `setTimeout` chains; wave definitions are the top-level `waves` array
- `fly-along-curve.js` — moves an entity along a `CatmullRomCurve3` defined by comma-separated `"x y z"` control points, looping
- `shooting-enemy.js` — flies a curve until `stopProgress`, then stops and fires `projectile-motion` projectiles at a target; also defines the `projectile-motion` component
- `rotation-mimic.js` — copies another entity's Y rotation (used for turret base tracking the barrel)
- `space-dust.js` — ambient particle effect
- `bounce.js`, `ortho.js`, `keyboard-versor.js`, `platformer-controls.js`, `control-switcher.js` — misc / experimental

**VR input:** Turret defaults to mouse raycaster. Pressing the A button on the right Oculus Touch controller switches target to the controller (`#right-hand`).
