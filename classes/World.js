class World {
    constructor(canvasId) {

        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById(canvasId),
            antialias: true
        });

        this.renderer.setClearColor(0x3c6cfb);

        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.renderer.setSize(98/100 * window.innerWidth, 98/100 * window.innerHeight);

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.BasicShadowMap;

        this.camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.01,
            3000
        );
        
        this.camera.position.set(0, 700, 0);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));


        this.scene = new THREE.Scene();

        // trackball Controls :
        this.controls = new THREE.OrbitControls(
            this.camera,
            this.renderer.domElement
        );
        this.controls.maxPolarAngle = Math.PI * 0.45;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 800;

        // the trackball controls are only enabled when the mouse is over
        document.getElementById(canvasId).onmouseover = () => {
            this.controls.enabled = true;
        };
        document.getElementById(canvasId).onmouseout = () => {
            this.controls.enabled = false;
        };
    }


    addObject(object) {
        this.scene.add(object);
    }

    removeObject(object) {
        this.scene.remove(object);
    }

    renderwithCamera(camera) {
        this.renderer.render(this.scene, camera);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
