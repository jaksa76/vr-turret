const waves = [
    {
        start: 0,        
        number: 5,
        interval: 400,
        type: 'fly-along-curve',
        curve: '5 -30 -80, 5 0 -50, 5 15 0, 5 0 30, 5 -15 30',
    },
    // {
    //     start: 3000,        
    //     number: 5,
    //     interval: 400,
    //     type: 'fly-along-curve',
    //     curve: '-5 -30 -80, -15 0 -50, -5 15 0, -5 0 30, -5 -15 30',
    // },
    // {
    //     start: 8000,        
    //     number: 5,
    //     interval: 400,
    //     type: 'fly-along-curve',
    //     curve: '5 -30 -80, 0 0 -50, 0 5 0, 5 0 30, 5 -15 30',
    // },
    // {
    //     start: 12000,        
    //     number: 5,
    //     interval: 400,
    //     type: 'fly-along-curve',
    //     curve: '50 -30 -80, 30 0 -50, -15 15 0, -30 0 30, 5 -15 30',
    // },
    {
        start: 3000, // Example: Start after other waves
        number: 1,
        interval: 1000,
        type: 'shooting-enemy',
        curve: '-5 -30 -80, -15 0 -50, -5 15 0, -5 0 30, -5 -15 30', // A different path for shooting enemies
        stopProgress: 0.5, // Stop at 70% of the curve
        fireRate: 0.5, // Shoots once every 2 seconds
        target: '#camera', // Target the player's camera
        health: 30 // Example: shooting enemies might be tougher
    }
]

/**
 * Component to spawn enemies in waves.
 * Each wave can have a different type of enemy and spawn time.
 */

AFRAME.registerComponent('enemy-spawner', {
    init: function() {
        for (let wave of waves) {
            for (let i = 0; i < wave.number; i++) {
                setTimeout(() => {
                    if (wave.type == 'fly-along-curve') {
                        const enemy = document.createElement('a-entity');
                        enemy.setAttribute('fly-along-curve', 'curve', wave.curve);
                        this.el.appendChild(enemy);

                        const model = document.createElement('a-entity');
                        model.setAttribute('gltf-model', '#pancake-ship');
                        model.setAttribute('scale', '0.5 0.5 0.5');
                        model.setAttribute('ammo-body', {type: 'kinematic', emitCollisionEvents: true});
                        model.setAttribute('ammo-shape', {type: 'box', fit:'manual', halfExtents: '2 .5 2'});
                        model.setAttribute('destroyable', 'health', 20);  
                        enemy.appendChild(model);
                    } else if (wave.type == 'shooting-enemy') {
                        const enemy = document.createElement('a-entity');
                        enemy.setAttribute('shooting-enemy', {
                            curve: wave.curve,
                            stopProgress: wave.stopProgress,
                            fireRate: wave.fireRate,
                            projectileMixin: wave.projectileMixin,
                            target: wave.target,
                            health: wave.health
                        });
                        this.el.appendChild(enemy);

                        const model = document.createElement('a-entity');
                        model.setAttribute('gltf-model', '#pancake-ship');
                        model.setAttribute('scale', '0.5 0.5 0.5');
                        model.setAttribute('ammo-body', {type: 'kinematic', emitCollisionEvents: true});
                        model.setAttribute('ammo-shape', {type: 'box', fit:'manual', halfExtents: '2 .5 2'});
                        model.setAttribute('destroyable', 'health', 30);  
                        enemy.appendChild(model);
                    }
                }, wave.start + i * wave.interval);                
            }
        }
    }
});
