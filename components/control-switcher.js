// AFRAME component that detects the abuttondown event and find all turrets in the scene and changes the target to the current element.
AFRAME.registerComponent('control-switcher', {
    init: function() {
        this.el.addEventListener('abuttondown', () => {
            const turrets = document.querySelectorAll('[turret]');
            for (let turret of turrets) {
                turret.setAttribute('turret', 'target', '#' + this.el.id);
            }
        });
    }
})