/**
 * @file Shooting enemy component for A-Frame
 * 
 * This component defines an enemy that flies along a predefined curve,
 * stops at a certain point, and then shoots projectiles at a target.
 */

AFRAME.registerComponent('shooting-enemy', {
    schema: {
        // Movement part (inspired by fly-along-curve)
        speed: {type: 'number', default: 0.0001},
        debug: {type: 'boolean', default: false},
        curve: { // The curve points
            default: [],
            parse: function(value) {
                if (typeof value !== 'string') { return value; }
                const points = value.split(',')
                    .map(pointStr => pointStr.trim().split(' ').filter(v => v).map(v => parseFloat(v.trim())))
                    .filter(pointArray => pointArray.length === 3) // Ensure valid 3D points
                    .map(pointArray => new THREE.Vector3(pointArray[0], pointArray[1], pointArray[2]));
                return points;
            },
            stringify: function(data) {
                if (!data || !Array.isArray(data)) { return ''; }
                return data.map(v => v.x + ' ' + v.y + ' ' + v.z).join(',');
            }
        },
        // Stopping and Shooting part
        stopProgress: {type: 'number', default: 0.3, min: 0, max: 1}, // Progress along the curve to stop (0.0 to 1.0)
        target: {type: 'selector', default: '[camera]'},
        fireRate: {type: 'number', default: 1}, // Shots per second
        projectileMixin: {type: 'string', default: ''}, // Mixin for projectile appearance/behavior
        projectileSpeed: {type: 'number', default: 10}, // Speed of the projectile
        projectileLifetime: {type: 'number', default: 5000} // Milliseconds before projectile is removed
    },

    init: function() {
        this.spawnTime = null;
        this.hasStopped = false;
        this.lastShotTime = 0;
        this.curvePath = null;

        if (this.data.curve && this.data.curve.length > 1) {
            this.curvePath = new THREE.CatmullRomCurve3(this.data.curve);
            this.curvePath.tension = 0.2;
        } else {
            console.warn('Shooting-enemy: Curve data is insufficient to form a CatmullRomCurve3. Need at least 2 points.');
        }

        if (this.data.debug && this.curvePath) {
            const points = this.curvePath.getPoints(50);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
            const curveObject = new THREE.Line(geometry, material);
            this.el.sceneEl.object3D.add(curveObject);
        }

        this.targetEl = this.data.target;
        if (!this.targetEl) {
            console.warn('Shooting-enemy: Target selector "' + this.data.target + '" did not find any entity.');
        }
    },

    update: function(oldData) {
        // Update curve if it has changed
        if (this.data.curve !== oldData.curve) {
            if (this.data.curve && this.data.curve.length > 1) {
                this.curvePath = new THREE.CatmullRomCurve3(this.data.curve);
                this.curvePath.tension = 0.2;
            } else {
                this.curvePath = null;
                console.warn('Shooting-enemy: Updated curve data is insufficient.');
            }
        }

        // Update target if it has changed
        if (this.data.target !== oldData.target) {
            this.targetEl = this.data.target;
            if (!this.targetEl) {
                console.warn('Shooting-enemy: Target selector "' + this.data.target + '" did not find any entity.');
            }
        }
    },

    tick: function(time, timeDelta) {
        if (!this.curvePath) return; // No curve to follow

        if (this.spawnTime === null) this.spawnTime = time;

        let progress = this.data.speed * (time - this.spawnTime);

        if (!this.hasStopped) {
            // Ensure progress is capped at 1 for getPointAt, effectively stopping at the end of the curve.
            let currentProgressOnCurve = Math.min(progress, 1.0);

            if (currentProgressOnCurve < this.data.stopProgress && currentProgressOnCurve < 0.9999) { // Keep moving if before stop point and not at the very end
                const p = this.curvePath.getPointAt(currentProgressOnCurve);
                this.el.object3D.position.copy(p);

                // Rotate towards next point on the curve
                const lookAheadProgress = Math.min(currentProgressOnCurve + 0.01, 1.0);
                const p2 = this.curvePath.getPointAt(lookAheadProgress);
                if (!p.equals(p2)) { // Avoid lookAt error if p and p2 are the same
                    this.el.object3D.lookAt(p2);
                }
            } else {
                // Stop at the designated stopProgress point or end of curve if stopProgress is 1
                const finalProgress = Math.min(this.data.stopProgress, 1.0);
                const finalP = this.curvePath.getPointAt(finalProgress);
                this.el.object3D.position.copy(finalP);
                this.hasStopped = true;
                // console.log('Shooting-enemy stopped at progress:', finalProgress);
            }
        }

        if (this.hasStopped && this.targetEl) {
            // Aim at target
            const targetPosition = new THREE.Vector3();
            this.targetEl.object3D.getWorldPosition(targetPosition);
            this.el.object3D.lookAt(targetPosition);

            // Shoot
            if (time - this.lastShotTime > (1000 / this.data.fireRate)) {
                this.shoot(targetPosition);
                this.lastShotTime = time;
            }
        }
    },

    shoot: function(targetPosition) {
        const el = this.el;
        const data = this.data;

        const projectile = document.createElement('a-entity');
        if (data.projectileMixin) {
            projectile.setAttribute('mixin', data.projectileMixin);
        } else {
            // Default projectile appearance if no mixin
            projectile.setAttribute('geometry', 'primitive: square; width: 0.1; height: 0.1');
            projectile.setAttribute('material', 'color: red');
        }

        // Get current position and direction for projectile start
        const startPosition = new THREE.Vector3();
        el.object3D.getWorldPosition(startPosition);
        
        const direction = new THREE.Vector3();
        // Use the object's forward direction (local -Z, transformed to world)
        el.object3D.getWorldDirection(direction); // direction is normalized

        // Offset projectile start position slightly in front of the enemy
        // Note: getWorldDirection gives a vector pointing away from the front (local -Z).
        // If models are oriented with +Z forward, this might need adjustment or use lookAt vector.
        // Assuming standard A-Frame/Three.js convention (local -Z is forward for camera/lookAt)
        // For an object that `lookAt` a target, its local -Z axis points towards the target.
        // So, `getWorldDirection` (which is local -Z) will point towards the target.
        startPosition.addScaledVector(direction, 1); // Start 1 unit in front along the facing direction

        projectile.setAttribute('position', startPosition);

        // Calculate velocity vector towards the target (more accurate for moving targets if re-calculated here)
        const velocity = new THREE.Vector3();
        velocity.copy(targetPosition).sub(startPosition).normalize().multiplyScalar(data.projectileSpeed);
        
        projectile.setAttribute('projectile-motion', {
            velocity: velocity, // Pass the THREE.Vector3 directly
            lifetime: data.projectileLifetime 
        });

        // It's good practice for projectiles to be destroyable or have collision
        // For example, if you have a 'destroyable' component:
        // projectile.setAttribute('destroyable', 'health: 1');
        // If using a physics system like ammo.js, you'd add ammo-body and ammo-shape:
        // projectile.setAttribute('ammo-body', {type: 'dynamic', mass: 0.1, emitCollisionEvents: true});
        // projectile.setAttribute('ammo-shape', {type: 'sphere', fit:'manual', sphereRadius: 0.1});

        el.sceneEl.appendChild(projectile);
        // console.log('Shooting-enemy shot projectile.');

        // Example: Play shooting sound if a sound component is attached to the enemy
        // if (el.components.sound) {
        //     el.components.sound.playSound();
        // }
    }
});

/**
 * Simple projectile motion component.
 * Moves an entity based on an initial velocity vector.
 * Removes the entity after a specified lifetime.
 * For more complex interactions (collisions, physics), integrate with a physics system.
 */
AFRAME.registerComponent('projectile-motion', {
    schema: {
        velocity: {type: 'vec3', default: {x: 0, y: 0, z: -1}}, // Initial velocity vector
        lifetime: {type: 'number', default: 5000} // Milliseconds
    },
    init: function() {
        this.startTime = this.el.sceneEl.time;
        this.currentVelocity = new THREE.Vector3(this.data.velocity.x, this.data.velocity.y, this.data.velocity.z);
    },
    tick: function(time, timeDelta) {
        if (!this.el.parentNode) return; // Already removed

        if (time - this.startTime > this.data.lifetime) {
            this.el.parentNode.removeChild(this.el);
            return;
        }
        const dt = timeDelta / 1000; // Convert ms to s
        this.el.object3D.position.addScaledVector(this.currentVelocity, dt);
    }
});
