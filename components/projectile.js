var SPEED = 0.001;

AFRAME.registerComponent('projectile', {
    schema: {
        velocity: {type: 'vec3', default: {x:0, y:0, z:-0.01}}
    },
    tick: function(time, timeDelta) {
        const d = new THREE.Vector3();
        d.copy(this.data.velocity);
        d.multiplyScalar(timeDelta);

        this.el.object3D.position.add(d);

        if (this.el.object3D.position.z < -500) {
            this.el.hideCollider = function() {}; // added to avoid error
            this.el.sceneEl.removeChild(this.el);
        }
    },
    events: {
        obbcollisionstarted: function(e) {
            this.el.hideCollider = function() {}; // added to avoid error
            this.el.sceneEl.removeChild(this.el);
        }
    }
})