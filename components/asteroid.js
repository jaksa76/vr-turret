var SPEED = 0.001;

AFRAME.registerComponent('asteroid', {
    schema: {
        position: {type: 'vec3', default: {x:0, y:0, z:0}}
    },
    init: function() {
        console.log("asteroid here");
        
        var data = this.data;
        var el = this.el;

        this.geometry = new THREE.SphereGeometry( 1, 32, 16 );
        this.material = new THREE.MeshStandardMaterial({color: 0x444444, roughness: 1});
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        el.setObject3D('mesh', this.mesh);
    },
    // remove: function() {
    //     this.el.removeObject3D('mesh')
    // },
    tick: function(time, timeDelta) {
        var p = this.el.object3D.position;
        this.el.setAttribute('position', {
            x: p.x,
            y: p.y,
            z: p.z + timeDelta * SPEED
        });
    },
    events: {
        obbcollisionstarted: function(e) {
            console.log("collide");                        
            this.el.hideCollider = function() {}; // added to avoid error
            this.el.sceneEl.removeChild(this.el);
        }
    }
})