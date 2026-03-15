/**
 * Mulberry32 seeded PRNG. Returns a function that produces floats in [0, 1).
 * Same seed always produces the same sequence (deterministic).
 * @param {number} seed - Integer seed
 * @returns {function} PRNG function
 */
function mulberry32(seed) {
    return function() {
        seed |= 0; seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

/**
 * Generates a CatmullRomCurve3-compatible curve string for enemy paths.
 * The curve starts far back (-Z), weaves through the scene, and ends far back again.
 * @param {function} rand - PRNG function returning [0, 1)
 * @param {object} params - Scene dimension params
 * @returns {string} Comma-separated "x y z" control points
 */
function generateCurve(rand, params) {
    const { sceneDepth, sceneWidth, sceneHeight } = params;
    const halfW = sceneWidth / 2;
    const halfH = sceneHeight / 2;

    const points = [];

    // Start point: far back, random X/Y
    const startX = (rand() * sceneWidth - halfW).toFixed(1);
    const startY = (rand() * halfH - halfH / 2).toFixed(1);
    points.push(`${startX} ${startY} ${-sceneDepth}`);

    // 2–4 mid-points spread across the scene volume
    const numMid = 2 + Math.floor(rand() * 3); // 2, 3, or 4
    for (let m = 0; m < numMid; m++) {
        // Spread mid-points along Z from -sceneDepth*0.8 toward player
        const zFrac = 1 - (m + 1) / (numMid + 1); // 0.8 down to 0.2 range mapped
        const z = (-sceneDepth * 0.8 + sceneDepth * 1.2 * zFrac).toFixed(1);
        const x = (rand() * sceneWidth - halfW).toFixed(1);
        const y = (rand() * sceneHeight - halfH).toFixed(1);
        points.push(`${x} ${y} ${z}`);
    }

    // End point: far back on the opposite X side so enemies sweep across
    const endX = (-(parseFloat(startX)) + (rand() * 4 - 2)).toFixed(1);
    const endY = (rand() * halfH - halfH / 2).toFixed(1);
    points.push(`${endX} ${endY} ${-sceneDepth}`);

    return points.join(', ');
}

/**
 * Generates a full level of enemy waves from a small set of parameters.
 * Uses a seeded PRNG so the same seed always produces the same level.
 */
class WaveGenerator {
    /**
     * @param {object} params
     * @param {number} [params.seed=1]        - Integer seed for PRNG
     * @param {number} [params.numWaves=10]   - Total waves to generate
     * @param {number} [params.difficulty=0.5]- 0–1 scale; drives enemy count, health, speed, fire rate
     * @param {number} [params.waveGap=6000]  - Base ms gap between wave starts
     * @param {number} [params.sceneDepth=80] - Max Z distance for curve endpoints
     * @param {number} [params.sceneWidth=16] - ±X range for curve control points
     * @param {number} [params.sceneHeight=10]- ±Y range for curve control points
     */
    constructor(params = {}) {
        this.seed        = params.seed        !== undefined ? params.seed        : 1;
        this.numWaves    = params.numWaves    !== undefined ? params.numWaves    : 10;
        this.difficulty  = params.difficulty  !== undefined ? params.difficulty  : 0.5;
        this.waveGap     = params.waveGap     !== undefined ? params.waveGap     : 6000;
        this.sceneDepth  = params.sceneDepth  !== undefined ? params.sceneDepth  : 80;
        this.sceneWidth  = params.sceneWidth  !== undefined ? params.sceneWidth  : 16;
        this.sceneHeight = params.sceneHeight !== undefined ? params.sceneHeight : 10;
    }

    /**
     * Generate the full wave array.
     * @returns {object[]} Array of wave definition objects compatible with enemy-spawner.js
     */
    generate() {
        const rand = mulberry32(this.seed);
        const { numWaves, difficulty, waveGap } = this;
        const maxEnemiesPerWave = 20;
        const waveDefs = [];

        for (let i = 0; i < numWaves; i++) {
            // Timing: base gap plus ±10% jitter
            const jitter = (rand() * 2 - 1) * waveGap * 0.1;
            const start = Math.round(waveGap * i + jitter);

            // Enemy count grows with wave index and difficulty; capped for performance
            const number = Math.min(
                maxEnemiesPerWave,
                Math.max(1, Math.round(2 + i * 0.5 * difficulty * 3 + rand() * 2))
            );

            // Spawn interval: tighter at higher difficulty
            const interval = Math.round(800 - difficulty * 400 + rand() * 200);

            // Curve for this wave
            const curve = generateCurve(rand, this);

            // Enemy type: first two waves always fly-along-curve; later waves may be shooting-enemy
            // weighted by difficulty
            let type = 'fly-along-curve';
            if (i >= 2 && rand() < difficulty * 0.6) {
                type = 'shooting-enemy';
            }

            if (type === 'fly-along-curve') {
                waveDefs.push({ start, number, interval, type, curve });
            } else {
                // shooting-enemy specific params
                const stopProgress = 0.35 + rand() * 0.3; // [0.35, 0.65]
                const fireRate = 1 + difficulty * 3;
                const health = 1 + Math.floor(difficulty * 4);
                waveDefs.push({
                    start,
                    number,
                    interval,
                    type,
                    curve,
                    stopProgress,
                    fireRate,
                    target: '#camera',
                    health
                });
            }
        }

        return waveDefs;
    }
}

// A-Frame component wrapper — exposes WaveGenerator to the scene.
// NOTE: wave-generator must be listed before enemy-spawner in the HTML so that
// this component's init() runs first and enemy-spawner.init() can safely read
// this.el.components['wave-generator'].waves. If the order is reversed,
// enemy-spawner will silently fall back to its hardcoded waves constant.
AFRAME.registerComponent('wave-generator', {
    schema: {
        seed:        { type: 'int',    default: 1 },
        numWaves:    { type: 'int',    default: 10 },
        difficulty:  { type: 'number', default: 0.5 },
        waveGap:     { type: 'number', default: 6000 },
        sceneDepth:  { type: 'number', default: 80 },
        sceneWidth:  { type: 'number', default: 16 },
        sceneHeight: { type: 'number', default: 10 }
    },
    init() {
        const gen = new WaveGenerator(this.data);
        this.waves = gen.generate();
    }
});
