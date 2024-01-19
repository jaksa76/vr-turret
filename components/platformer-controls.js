AFRAME.registerComponent('platformer-controls', {
    schema: {
        xspeed: { default: 20 },
        yspeed: { default: 20 },
    },
    init: function () {
        document.addEventListener('keydown', (evt) => {
            switch (evt.code) {
                case 'Space':
                    this.jumping = true;
                    break;
            }
        });
    },
    tick: function (time, timeDelta) {
        var x = this.el.components['keyboard-versor'].direction.x;
        var y = 0;
        if (this.jumping) {
            this.jumping = false;
            this.el.body.applyCentralImpulse(new Ammo.btVector3(0, this.data.yspeed, 0));
        }
        if (this.el.body) {
            this.el.body.getLinearVelocity().setX(x * this.data.xspeed);
            this.el.body.activate();
        }
    },
    isTouchingGround: function () {
        return this.el.body.isTouchingDown();
    }
});