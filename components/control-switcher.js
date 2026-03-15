AFRAME.registerComponent('control-switcher', {
    schema: {
        leftTurret:      { type: 'selector' },
        rightTurret:     { type: 'selector' },
        leftController:  { type: 'selector' },
        rightController: { type: 'selector' }
    },
    init: function () {
        this.mode = 'mouse'; // 'mouse' | 'dual'

        this.el.addEventListener('abuttondown', () => {
            this.mode = (this.mode === 'mouse') ? 'dual' : 'mouse';
            this._applyMode();
        });
    },
    _applyMode: function () {
        const { leftTurret, rightTurret, leftController, rightController } = this.data;
        if (this.mode === 'dual') {
            leftTurret  && leftTurret.setAttribute('turret',  'target', '#' + leftController.id);
            rightTurret && rightTurret.setAttribute('turret', 'target', '#' + rightController.id);
        } else {
            leftTurret  && leftTurret.setAttribute('turret',  'target', '#cursor');
            rightTurret && rightTurret.setAttribute('turret', 'target', '#cursor');
        }
    }
})