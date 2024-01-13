const PROJECTILE_SIZE = 0.05;

AFRAME.registerComponent('shooter', {
    init: function() {
        this.lastShot = 0;
    },
    tick(time, timeDelta) {
        if (time - this.lastShot > 200) {
            this.lastShot = time;

            const p = new THREE.Vector3();
            this.el.object3D.getWorldPosition(p);
            const q = new THREE.Quaternion();
            this.el.object3D.getWorldQuaternion(q);

            //convert direction to velocity
            const v = new THREE.Vector3(0, 0, -0.05);
            v.applyQuaternion(q);
            
            const projectile = document.createElement('a-entity');
            projectile.setAttribute('projectile', 'velocity', v);                        
            projectile.setAttribute('position', {x: p.x, y: p.y, z: p.z});
            projectile.setAttribute('geometry', { primitive: 'box', width: PROJECTILE_SIZE, height: PROJECTILE_SIZE, depth: PROJECTILE_SIZE });
            projectile.setAttribute('ammo-body', {type: 'kinematic'});
            projectile.setAttribute('ammo-shape', {type: 'box'});
            projectile.setAttribute('class', 'bullet');
            this.el.sceneEl.appendChild(projectile);

            // play sound
            if (this.el.components.sound) {
                this.el.components.sound.stopSound();
                this.el.components.sound.playSound();
            }
        }
    }
});