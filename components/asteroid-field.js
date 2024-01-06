const ASTEROID_FIELD_SIZE = 100;
const ASTEROID_FIELD_SPAWN_DELAY = 3000;
const INITIAL_NUMBER_OF_ASTEROIDS = 20;
const ASTEROID_SIZE = 3;
const ASTEROID_SPEED = 0.01;

AFRAME.registerComponent('asteroid-field', {
    init: function() {
        this.lastShot = 0;
        const p = new THREE.Vector3();
        this.el.object3D.getWorldPosition(p);

        // spawn 100 asteroids in the asteroid field
        for (let i = 0; i < INITIAL_NUMBER_OF_ASTEROIDS; i++) {
            const asteroid = document.createElement('a-entity');
            asteroid.setAttribute('projectile', 'velocity', {x: 0, y: 0, z: ASTEROID_SPEED});

            const dx = (Math.random() - 0.5)*ASTEROID_FIELD_SIZE
            const dy = (Math.random() - 0.5)*ASTEROID_FIELD_SIZE;
            const dz = (Math.random() - 0.5)*ASTEROID_FIELD_SIZE;

            asteroid.setAttribute('position', {x: p.x + dx, y: p.y + dy, z: p.z + dz});
            asteroid.setAttribute('geometry', 'primitive', 'icosahedron');
            asteroid.setAttribute('scale', {x: ASTEROID_SIZE, y: ASTEROID_SIZE, z: ASTEROID_SIZE});
            asteroid.setAttribute('obb-collider', 'size', {x: ASTEROID_SIZE, y: ASTEROID_SIZE, z: ASTEROID_SIZE});
            asteroid.setAttribute('material', 'color', '#000');
            this.el.sceneEl.appendChild(asteroid);
        }
    },
    tick(time, timeDelta) {
        
        if (time - this.lastShot > ASTEROID_FIELD_SPAWN_DELAY) {
            this.lastShot = time;
            const p = new THREE.Vector3();
            this.el.object3D.getWorldPosition(p);
            
            const asteroid = document.createElement('a-entity');
            asteroid.setAttribute('projectile', 'velocity', {x: 0, y: 0, z: ASTEROID_SPEED});

            const dx = (Math.random() - 0.5)*ASTEROID_FIELD_SIZE;
            const dy = (Math.random() - 0.5)*ASTEROID_FIELD_SIZE;
            asteroid.setAttribute('position', {x: p.x + dx, y: p.y + dy, z: p.z - ASTEROID_FIELD_SIZE});
            
            asteroid.setAttribute('geometry', 'primitive', 'icosahedron');
            asteroid.setAttribute('scale', {x: ASTEROID_SIZE, y: ASTEROID_SIZE, z: ASTEROID_SIZE});
            asteroid.setAttribute('obb-collider', 'size', {x: ASTEROID_SIZE, y: ASTEROID_SIZE, z: ASTEROID_SIZE});
            asteroid.setAttribute('material', 'color', '#444444');
            this.el.sceneEl.appendChild(asteroid);
        }
    }
});