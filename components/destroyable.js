AFRAME.registerComponent('destroyable', {
    schema: {
        health: {type: 'number', default: 100},
    },
    init: function() {
        this.el.addEventListener('collidestart', this.hit.bind(this));
    },
    hit: function(evt) {
        if (evt.detail.targetEl.className == 'bullet') {
            this.data.health -= 10;
            if (this.data.health <= 0) {
                this.die();
            }
        } else {
            console.log('hit by', evt.detail.withEl);
        }
    },
    die: function() {
        // if two bullets hit at the same time, only die once
        if (this.data.dead) return;
        this.data.dead = true;     

        // sometimes the parent is not set, so use the scene as a fallback
        let parent = this.el.parentEl;
        if (!parent) {
            parent = this.el.sceneEl;
            console.log('no parent');
        }

        this.el.parentEl.removeChild(this.el);
        
        const explosion = document.createElement('a-entity');
        explosion.setAttribute('explosion', {radius: 3});
        
        let worldPosition = new THREE.Vector3();
        worldPosition.setFromMatrixPosition(this.el.object3D.matrixWorld);
        explosion.setAttribute('position', worldPosition);

        parent.appendChild(explosion);
    }
});