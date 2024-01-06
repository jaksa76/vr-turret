AFRAME.registerComponent('explosion', {
    schema: {
        radius: {type: 'number', default: 2},
        numberOfBlobs: {type: 'number', default: 50},        
    },
    init: function () {
        // main blob
        const blob = this.createBlob(this.data.radius);
        this.animateBlob(blob, 0);

        blob.setAttribute('position', this.el.object3D.position);
        this.el.sceneEl.appendChild(blob);

        for (let i = 0; i < this.data.numberOfBlobs; i++) {
            const radius = Math.random() * 0.5 + .7;        
            const blob = this.createBlob(radius);   
                        
            // position the blob randomly on the surface of the main blob
            randomPosition = new THREE.Vector3();
            randomPosition.setFromSphericalCoords(
                this.data.radius * .9,
                Math.random() * Math.PI,
                Math.random() * Math.PI * 2
            );            
            randomPosition.add(this.el.object3D.position);
            blob.setAttribute('position', randomPosition);

            const delay = Math.random() * 1200
            this.animateBlob(blob, delay);

            this.el.sceneEl.appendChild(blob);
        }
    },
    createBlob: function (radius) {
        const blob = document.createElement('a-entity');
        blob.setAttribute('geometry', {
            primitive: 'sphere',
            radius: radius,
            segmentsWidth: 8,
            segmentsHeight: 8,
        });
        blob.setAttribute('material', {
            color: "white",
            shader: 'flat',
        });
        blob.setAttribute('position', this.el.object3D.position);
        return blob;
    },
    animateBlob: function (blob, delay) {
        blob.setAttribute('scale', { x: 0, y: 0, z: 0 });
        blob.setAttribute('animation__1', {
            property: 'scale',
            to: "1 1 1",
            dur: 500,
            delay: delay,
            easing: 'easeOutExpo',
        });
        blob.setAttribute('animation__2', {
            property: 'scale',
            to: '0 0 0',
            dur: 500,
            delay: 500,
            easing: 'easeInQuad',
            startEvents: 'animationcomplete__1'
        });
        blob.setAttribute('animation__3', {
            property: 'material.color',
            to: "#FC0",
            dur: 500,
            easing: 'linear',
        });
    }
});