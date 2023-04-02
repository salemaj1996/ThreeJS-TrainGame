class EnemyTrain {
    constructor(world, color, cars) {
        this.world = world;
        this.cars = cars;
        var textureLoader = new THREE.TextureLoader();
        textureLoader.setCrossOrigin("");
        var trainTexture = new textureLoader.load("images/metal.png");
        this.material = new THREE.MeshPhongMaterial({
            color: color,
            map: trainTexture
          });

        this.smokeTexture = new textureLoader.load('images/clouds.png'); //images/Smoke-Element.png
        this.smokeMaterial = new THREE.MeshLambertMaterial({color: 0x67C240, map: this.smokeTexture, transparent: true});
        this.smokeGeo = new THREE.PlaneGeometry(300,300);
        this.smokeParticles = [];

        this.meshes = [];

        const trainBodyMaterial = new THREE.MeshStandardMaterial({
            color: color,
            flatShading: true
        })

        trainBodyMaterial.color.convertSRGBToLinear();

        const trainDetailMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            flatShading: true
        })

        trainDetailMaterial.color.convertSRGBToLinear();

        const noseGeommetry = new THREE.CylinderBufferGeometry(6, 6, 22, 30);
        const cabinGeommetry = new THREE.BoxBufferGeometry(15, 20, 30);
        const chimneyGeommetry = new THREE.CylinderBufferGeometry(4, 2, 7);
        const wheelGeommetry = new THREE.CylinderBufferGeometry(5, 5, 18, 320);
        wheelGeommetry.rotateX(Math.PI / 2);


        var nose = new THREE.Mesh(noseGeommetry, trainBodyMaterial);
       
        nose.rotation.x = Math.PI / 2;
        nose.position.z = +23;
        nose.position.y = 10;

        var cabin = new THREE.Mesh(cabinGeommetry, trainBodyMaterial);
        cabin.position.y = 14;

        var chimney = new THREE.Mesh(chimneyGeommetry, trainDetailMaterial);
        chimney.position.set(0, 18, 23);

        var smallWheelRear = new THREE.Mesh(wheelGeommetry, trainDetailMaterial);
        smallWheelRear.rotation.y = Math.PI / 2;
        smallWheelRear.position.z = +24;
        smallWheelRear.position.y = 5;

        var bigWheel = smallWheelRear.clone()
        bigWheel.scale.set(1.6, 1.6, 1.1)
        bigWheel.position.z = 0;
        bigWheel.position.y = 8;


        var smokeGroup = new THREE.Group();
        for (var p = 0; p < 100; p++) {
            var particle = new THREE.Mesh(this.smokeGeo,this.smokeMaterial);
            particle.position.set(Math.random()*50-25,Math.random()*50-25,Math.random()*100-10);
            particle.rotation.z = Math.random() * 36;
            particle.rotation.y = Math.random() * 36;
            particle.rotation.x = Math.random() * 36;
            smokeGroup.add(particle);
            this.smokeParticles.push(particle);
        }
        smokeGroup.scale.set(0.03, 0.08, 0.03);
        smokeGroup.position.y = 32;
        smokeGroup.position.z = 24;

        
        const train = new THREE.Group();
        train.add(nose, cabin, chimney, smallWheelRear, bigWheel, smokeGroup)
        for(var i = 1; i <= this.cars; i++) {
            let car = this.addCar();
            car.position.z = car.position.z - i*35;
            train.add(car);
        }
        this.meshes.push(train);
        world.addObject(train);
        collidableMeshList.push(train);

        this.stopped = false;
    }

    lookAt(index, position) {
        this.meshes[index].lookAt(position);
    }

    position(index) {
        return this.meshes[index].position;
    }

    rotation(index) {
        return this.meshes[index].rotation;
    }

    up(index) {
        return this.meshes[index].up;
    }

    size() {
        var box = new THREE.Box3().setFromObject(this.meshes[0]);
        const size = new THREE.Vector3();
        box.getSize( size );
        return size
    }

    addCar() {
        // body
        var boxGeometry = new THREE.BoxGeometry(15, 15, 30, 1, 1, 1);

        var boxMesh = new THREE.Mesh(boxGeometry, this.material);
        boxMesh.position.y = 10;

        // wheels
        var wheelGeometry = new THREE.CylinderGeometry(5, 5, 5, 12);
        var wheelMesh1 = new THREE.Mesh(wheelGeometry, this.material);
        wheelMesh1.position.x = 6;
        wheelMesh1.position.y = 5;
        wheelMesh1.position.z = 8;
        wheelMesh1.rotation.z = Math.PI / 2;

        var wheelMesh2 = new THREE.Mesh(wheelGeometry, this.material);
        wheelMesh2.position.x = -6;
        wheelMesh2.position.y = 5;
        wheelMesh2.position.z = 8;
        wheelMesh2.rotation.z = Math.PI / 2;

        var wheelMesh3 = new THREE.Mesh(wheelGeometry, this.material);
        wheelMesh3.position.x = -6;
        wheelMesh3.position.y = 5;
        wheelMesh3.position.z = -8;
        wheelMesh3.rotation.z = Math.PI / 2;

        var wheelMesh4 = new THREE.Mesh(wheelGeometry, this.material);
        wheelMesh4.position.x = 6;
        wheelMesh4.position.y = 5;
        wheelMesh4.position.z = -8;
        wheelMesh4.rotation.z = Math.PI / 2;

        var singleGeometry = new THREE.Geometry();
        var singleMesh = new THREE.Mesh(singleGeometry, this.material);
        boxMesh.updateMatrix();
        singleGeometry.merge(boxMesh.geometry, boxMesh.matrix);
        wheelMesh1.updateMatrix();
        singleGeometry.merge(wheelMesh1.geometry, wheelMesh1.matrix);
        wheelMesh2.updateMatrix();
        singleGeometry.merge(wheelMesh2.geometry, wheelMesh2.matrix);
        wheelMesh3.updateMatrix();
        singleGeometry.merge(wheelMesh3.geometry, wheelMesh3.matrix);
        wheelMesh4.updateMatrix();
        singleGeometry.merge(wheelMesh4.geometry, wheelMesh4.matrix);

        return singleMesh;
    }
}
