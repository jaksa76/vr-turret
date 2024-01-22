AFRAME.registerComponent('ortho', {
    init: function () {
        var sceneEl = this.el.sceneEl;
            this.originalCamera = sceneEl.camera;
            this.cameraParent = sceneEl.camera.parent;
            
            // get canvas size
            var canvas = sceneEl.canvas;
            var width = canvas.clientWidth / 50;
            var height = canvas.clientHeight / 50;

            // this.orthoCamera = new THREE.OrthographicCamera(-10, 10, 10, -10);
            this.orthoCamera = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2);
            this.cameraParent.add(this.orthoCamera);
            sceneEl.camera = this.orthoCamera;
            console.log('ortho camera added');
    },
    remove: function () {
        this.cameraParent.remove(this.orthoCamera);
        sceneEl.camera = this.originalCamera;
    }
});