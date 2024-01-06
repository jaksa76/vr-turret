
AFRAME.registerComponent('rotation-mimic', {
    schema: {
        target: {type: 'string'},
        axes: {type: 'array', default: ['x', 'y', 'z']}
    },
    init: function() {
        this.target = document.querySelector(this.data.target);
    },
    update: function() {
        this.target = document.querySelector(this.data.target);
    },
    tick: function(time, timeDelta) {
        const target = this.target;
        if (target) {            
            const targetRotation = target.getAttribute('rotation');
            const el = this.el;
            this.data.axes.forEach(function(axis) {
                el.setAttribute('rotation', axis, targetRotation[axis]);
            });
        }        
    }
})
