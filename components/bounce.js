AFRAME.registerComponent('bounce', {
    schema: {
    },
    init: function () {
        this.el.addEventListener('collidestart', function (e) {
            console.log('Player has collided with body #' + e.detail.body.id);
            console.log(e.detail.target.el);  // Original entity (playerEl).
            console.log(e.detail.body.el);  // Other entity, which playerEl touched.
            console.log(e.detail.contact);  // Stats about the collision (CANNON.ContactEquation).
            console.log(e.detail.contact.ni);  // Normal (direction) of the collision (CANNON.Vec3).
        });
    },
    tick: function (time, timeDelta) {
    }
});