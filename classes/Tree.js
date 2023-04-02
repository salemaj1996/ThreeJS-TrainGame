const treeCrownColor = 0x498c2c;
const treeTrunkColor = 0x4b3f2f;

const treeTrunkGeometry = new THREE.BoxBufferGeometry(15, 50, 15);
const treeTrunkMaterial = new THREE.MeshLambertMaterial({
  color: treeTrunkColor
});
const treeCrownMaterial = new THREE.MeshLambertMaterial({
  color: treeCrownColor
});

class Tree {
    constructor(world) {
        this.world = world;
        this.tree = new THREE.Group();
        const trunk = new THREE.Mesh(treeTrunkGeometry, treeTrunkMaterial);
        
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        trunk.matrixAutoUpdate = false;
        this.tree.add(trunk);
      
        const treeHeights = [45, 60, 75];
        const height =  treeHeights[Math.floor(Math.random() * treeHeights.length)];
      
        const crown = new THREE.Mesh(
          new THREE.SphereGeometry(height / 2, 30, 30),
          treeCrownMaterial
        );
        crown.position.y = height / 2 + 20;
        crown.castShadow = true;
        crown.receiveShadow = false;
        this.tree.add(crown);
        this.tree.position.x = 280*(0.5 - Math.random());
        this.tree.position.z = 280*(0.5 - Math.random());
        this.tree.position.y = 20;
        world.addObject(this.tree);
        
        this.updatePosition ()
    }
    updatePosition () {
        const treeBox = new THREE.Box3().setFromObject(this.tree);
        rails.forEach(rail => {
            var collidableBox = new THREE.Box3().setFromObject(rail);
            if (treeBox.intersectsBox(collidableBox)) {
                this.tree.position.x = rail.position.x + 30 > 290 ? rail.position.x - 30 : rail.position.x + 30;
                this.tree.position.z = rail.position.z + 30 > 290 ? rail.position.z - 30 : rail.position.z + 30;
            }
        })
    }
  }