AFRAME.registerComponent('explosion', {
    schema: {
        radius: {type: 'number', default: 2},
        numberOfBlobs: {type: 'number', default: 50},        
        sound: {type: 'string', default: '#explosionSound'},
    },
    init: function () {
        // main blob
        const blob = this.createBlob(this.data.radius);
        this.animateBlob(blob, 0);
        blob.setAttribute('position', this.el.object3D.position);
        this.el.sceneEl.appendChild(blob);

        this.blobsToCreate = this.data.numberOfBlobs;

        // play sound
        this.el.setAttribute('sound', {
            src: '#explosionSound',
            volume: 20,
            // autoplay: true,
        });
    },
    tick: function () {
        if (this.blobsToCreate > 0) {
            const radius = Math.random() * 0.5 + .7;        
            const blob = this.createBlob(radius);                           
            this.setPositionAndSpeed(blob);
            const delay = Math.random() * 480
            this.animateBlob(blob, 0);
            this.el.sceneEl.appendChild(blob);
            this.blobsToCreate--;
        }
    },    
    setPositionAndSpeed: function (blob) {
        var relativePosition = new THREE.Vector3();
        relativePosition.setFromSphericalCoords(
            this.data.radius * .3,
            Math.random() * Math.PI,
            Math.random() * Math.PI * 2
        );                
        const worldPosition = relativePosition.clone();
        worldPosition.add(this.el.object3D.position);                                
        blob.setAttribute('position', worldPosition);

        const direction = relativePosition.clone();
        direction.multiplyScalar(2);
        direction.add(this.el.object3D.position);
        blob.setAttribute('animation', {
            property: 'position',
            to: direction,
            dur: 1000,
            easing: 'easeOutQuad',
        });
    },
    createBlob: function (radius) {
        const blob = document.createElement('a-entity');
        blob.setAttribute('geometry', {
            primitive: 'sphere',
            radius: radius,
            segmentsWidth: 6,
            segmentsHeight: 6,
        });
        blob.setAttribute('material', {
            color: "#FF8",
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
            easing: 'easeOutQuad',
        });
        blob.setAttribute('animation__2', {
            property: 'scale',
            to: '0 0 0',
            dur: 800,
            delay: 100,
            easing: 'easeInQuad',
            startEvents: 'animationcomplete__1'
        });
        blob.setAttribute('animation__3', {
            property: 'material.color',
            to: "#F40",
            type: 'color',            
            dur: 600,
            delay: delay,
            easing: 'easeInCubic',
        });
        blob.setAttribute('animation__4', {
            property: 'material.color',
            to: "#222",
            type: 'color',            
            dur: 200,
            easing: 'easeInCubic',
            startEvents: 'animationcomplete__3'
        });
    },
    events: {
        "sound-loaded": function (e) {
            e.target.components.sound.playSound();
        }
    }
});