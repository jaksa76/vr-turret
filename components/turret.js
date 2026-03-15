
AFRAME.registerComponent('turret', {
    schema: {
        target:          { type: 'string', default: '#cursor' },
        servoSound:      { type: 'string', default: '' },
        minPlaybackRate: { type: 'number', default: 0.5 },
        maxPlaybackRate: { type: 'number', default: 2.0 },
        maxAngularSpeed: { type: 'number', default: 180 }
    },
    init: function() {
        this.target = document.querySelector(this.data.target);
        this.prevRotationX = 0;
        this.prevRotationY = 0;
        this.servoReady = false;
        this.servoPlaying = false;

        if (this.data.servoSound) {
            this.el.setAttribute('sound', `src: ${this.data.servoSound}; loop: true; autoplay: false; poolSize: 1`);
            this.el.addEventListener('sound-loaded', () => { this.servoReady = true; });
        }
    },
    update: function() {
        this.target = document.querySelector(this.data.target);
    },
    tick: function(time, timeDelta) {
        if (timeDelta === 0) return;

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

        // Compute angular speed for servo sound
        if (this.data.servoSound) {
            const rot = this.el.object3D.rotation;
            const newX = THREE.MathUtils.radToDeg(rot.x);
            const newY = THREE.MathUtils.radToDeg(rot.y);

            let deltaX = Math.abs(newX - this.prevRotationX);
            let deltaY = Math.abs(newY - this.prevRotationY);
            // Handle wrap-around
            if (deltaX > 180) deltaX = 360 - deltaX;
            if (deltaY > 180) deltaY = 360 - deltaY;

            const angularSpeed = (deltaX + deltaY) / (timeDelta / 1000);

            this.prevRotationX = newX;
            this.prevRotationY = newY;

            const deadzone = 0.5;
            if (angularSpeed > deadzone && this.servoReady) {
                if (!this.servoPlaying) {
                    this.el.components.sound.playSound();
                    this.servoPlaying = true;
                }
                const t = THREE.MathUtils.clamp(angularSpeed / this.data.maxAngularSpeed, 0, 1);
                const rate = THREE.MathUtils.lerp(this.data.minPlaybackRate, this.data.maxPlaybackRate, t);
                const sound = this.el.components.sound.sound;
                if (sound && sound.source) {
                    sound.source.playbackRate.value = rate;
                }
            } else if (angularSpeed <= deadzone && this.servoPlaying) {
                this.el.components.sound.stopSound();
                this.servoPlaying = false;
            }
        }
    },
    remove: function() {
        if (this.servoPlaying && this.el.components.sound) {
            this.el.components.sound.stopSound();
            this.servoPlaying = false;
        }
    }
})
