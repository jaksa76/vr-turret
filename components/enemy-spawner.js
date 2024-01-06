const waves = [
    {
        start: 0,        
        number: 5,
        interval: 400,
        type: 'fly-along-curve',
        curve: '5 -30 -80, 5 0 -50, 5 15 0, 5 0 30, 5 -15 30',
    },
    {
        start: 3000,        
        number: 5,
        interval: 400,
        type: 'fly-along-curve',
        curve: '-5 -30 -80, -15 0 -50, -5 15 0, -5 0 30, -5 -15 30',
    },
    {
        start: 8000,        
        number: 5,
        interval: 400,
        type: 'fly-along-curve',
        curve: '5 -30 -80, 0 0 -50, 0 5 0, 5 0 30, 5 -15 30',
    },
    {
        start: 12000,        
        number: 5,
        interval: 400,
        type: 'fly-along-curve',
        curve: '50 -30 -80, 30 0 -50, -15 15 0, -30 0 30, 5 -15 30',
    },
]

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
                        enemy.appendChild(model);
                    }
                }, wave.start + i * wave.interval);                
            }
        }
    }
});
