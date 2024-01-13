AFRAME.registerComponent('fly-along-curve', {
    schema: {
        speed: {type: 'number', default: 0.0001},
        debug: {type: 'boolean', default: false},
        curve: {default: [],
            parse: function(value) {
                const points = value.split(',')
                    .map(point => point.trim().split(' ').filter(v => v).map(v => parseFloat(v.trim())))
                    .map(point => new THREE.Vector3(point[0], point[1], point[2]));
                return points;
            },
            stringify: function(data) {
                return data.map(v => v.x + ',' + v.y + ',' + v.z).join(',');
            }
        },
    },
    init() {
        this.curve = new THREE.CatmullRomCurve3(this.data.curve);
        this.curve.tension = .2;

        if (this.data.debug) {
            // draw curve
            const points = this.curve.getPoints( 50 );
            const geometry = new THREE.BufferGeometry().setFromPoints( points );
            const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
            // Create the final object to add to the scene
            const curveObject = new THREE.Line( geometry, material );
            this.el.sceneEl.object3D.add(curveObject);
        }
    },
    update: function() {
        this.curve = new THREE.CatmullRomCurve3(this.data.curve);
        this.curve.tension = .2;       
    },
    tick: function(time, timeDelta) {
        if (this.spawnTime == null) this.spawnTime = time;

        var d = this.data.speed * (time - this.spawnTime);
        d = d % .98;

        const p = this.curve.getPointAt(d);
        this.el.object3D.position.copy(p);
        
        // rotate towards next point        
        const p2 = this.curve.getPointAt(d + 0.01);
        var o = new THREE.Vector3();
        o.copy(p2);
        o.sub(p).normalize();
        const rotation = {
            x: -THREE.MathUtils.radToDeg(Math.asin(o.y)),
            z: 0,
            y: THREE.MathUtils.radToDeg(Math.atan2(o.x, o.z))
        }
        this.el.setAttribute('rotation', rotation);
    },
});

function print(a) {
    console.log(a);
    return a;
}