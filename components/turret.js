
AFRAME.registerComponent('turret', {
    schema: {
        target: {type: 'string', default: '#cursor'}
    },
    init: function() {
        this.target = document.querySelector(this.data.target);
        this.el.addEventListener('abuttondown', () => {
            this.el.setAttribute('turret', 'target', '#right-hand');
        });
    },
    update: function() {
        this.target = document.querySelector(this.data.target);
    },
    tick: function(time, timeDelta) {
        const target = this.target;
        if (target) {            
            const raycaster = target.components.raycaster;
            const intersections = raycaster.intersections;
            if (intersections.length > 0) {
                const p = intersections[0].point;
                
                // rotate towards p
                var o = new THREE.Vector3();
                this.el.object3D.getWorldPosition(o);
                o.sub(p).normalize();
                const rotation = {
                    x: -THREE.MathUtils.radToDeg(Math.asin(o.y)),
                    z: 0,
                    y: THREE.MathUtils.radToDeg(Math.atan2(o.x, o.z))
                }
                this.el.setAttribute('rotation', rotation);
            }
        }        
    }
})
