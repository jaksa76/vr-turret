AFRAME.registerComponent('space-dust', {
    schema: {
        count: {type: 'number', default: 100},
        speed: {type: 'number', default: 0.02},
        size: {type: 'number', default: 30}
    },
    init: function() {
        this.particles = [];
        for (var i = 0; i < this.data.count; i++) {
            this.createParticle();
        }
    },
    createParticle: function() {
        const el = document.createElement('a-entity');        
        el.setAttribute('position', {
            x: Math.random() * this.data.size - this.data.size / 2,
            y: Math.random() * this.data.size - this.data.size / 2,
            z: Math.random() * this.data.size - this.data.size / 2,
        });
        el.setAttribute('geometry', {
            primitive: 'tetrahedron',
            radius: Math.random() * 0.05
        });
        el.setAttribute('material', {
            color: '#FFF',
            shader: 'flat',
            transparent: true,
            opacity: Math.random() * 0.5 + 0.1
        });
        this.el.appendChild(el);
        this.particles.push(el);
    },
    tick: function(time, timeDelta) {
        this.particles.forEach(p => {
            const pos = p.object3D.position;
            pos.z += timeDelta * this.data.speed;
            if (pos.z > this.data.size/2) pos.z = -this.data.size;
        });
    }
});