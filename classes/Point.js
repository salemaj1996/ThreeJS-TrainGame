class Point {
    constructor(x, y, z, world, visible = true) {
        if(visible) {
            var textureLoader = new THREE.TextureLoader();
            textureLoader.setCrossOrigin("");
            var signTexture = new textureLoader.load("images/arrow.jpg");
    
            var CPmaterial = new THREE.MeshPhongMaterial({
            color: 0xf0ff0f,
            map: signTexture
            });
            var signTextureReverse = new textureLoader.load("images/arrow_reverse.jpg");
    
            var CPmaterialReverse = new THREE.MeshPhongMaterial({
            color: 0xf0ff0f,
            map: signTextureReverse
            });
            var CPBasematerial = new THREE.MeshLambertMaterial( {color: 'lightgray'} );
            var CPgeometry = new THREE.BoxGeometry(25, 25, 3, 1, 1, 1);
            this.sign = new THREE.Mesh(CPgeometry, [CPBasematerial, CPBasematerial, CPBasematerial, CPBasematerial, CPmaterialReverse, CPmaterial ]);
           
            this.orient = new THREE.Vector3(0, 1, 0);
    
    
            const stickGeometry = new THREE.BoxGeometry(1, 20, 2);
    
            var stick = new THREE.Mesh(stickGeometry,  [CPBasematerial, CPBasematerial, CPBasematerial, CPBasematerial, CPmaterialReverse, CPmaterial ]);
            this.sign.position.y = 20;
            
    
            var singleGeometry = new THREE.Geometry();
            var singleMesh = new THREE.Mesh(singleGeometry, [CPBasematerial, CPBasematerial, CPBasematerial, CPBasematerial, CPmaterialReverse, CPmaterial ]);
            stick.updateMatrix();
            singleGeometry.merge(stick.geometry, stick.matrix);
            this.sign.updateMatrix();
            singleGeometry.merge(this.sign.geometry, this.sign.matrix);
            this.mesh = singleMesh;
    
            
            this.mesh.position.x = x;
            this.mesh.position.y = y;
            this.mesh.position.z = z;
            this.mesh.castShadow = true;
            world.addObject(this.mesh);
            draggableObjects.push(this.mesh);
            CPlist.push(this);
            CPlist_positions.push(this.position());
        }

        else {
            var CPgeometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
            this.mesh = new THREE.Mesh(CPgeometry);
            this.mesh.position.x = x;
            this.mesh.position.y = y;
            this.mesh.position.z = z;
            world.addObject(this.mesh);
        }
       
    }
    position() {
        return this.mesh.position;
    }

    setOrient(x, y, z) {
        this.orient = new THREE.Vector3(x, y, z);
    }
    animate() {
        this.mesh.rotation.y += 0.1;
    }
}