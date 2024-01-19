AFRAME.registerComponent('keyboard-versor', {
    init: function () {
        this.keyboardDirection = new THREE.Vector3(0, 0, 0);
        this.direction = new THREE.Vector3(0, 0, 0);
        keyboardDirection = this.keyboardDirection;
        document.addEventListener("keydown", (event) => {
            if (event.key === "w" || event.key === "ArrowUp") {
                keyboardDirection.y = -1;
            } else if (event.key === "s" || event.key === "ArrowDown") {
                keyboardDirection.y = 1;
            } else if (event.key === "a" || event.key === "ArrowLeft") {
                keyboardDirection.x = -1;
            } else if (event.key === "d" || event.key === "ArrowRight") {
                keyboardDirection.x = 1;
            }
        });
        document.addEventListener("keyup", (event) => {
            if (event.key === "w" || event.key === "ArrowUp") {
                keyboardDirection.y = 0;
            } else if (event.key === "s" || event.key === "ArrowDown") {
                keyboardDirection.y = 0;
            } else if (event.key === "a" || event.key === "ArrowLeft") {
                keyboardDirection.x = 0;
            } else if (event.key === "d" || event.key === "ArrowRight") {
                keyboardDirection.x = 0;
            }
        });
    },
    tick: function (time, timeDelta) {
        this.direction.x = this.keyboardDirection.x;
        this.direction.y = this.keyboardDirection.y;
        this.direction.z = this.keyboardDirection.z;
        this.direction.normalize();
    }
});