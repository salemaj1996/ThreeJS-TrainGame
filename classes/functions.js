
// Linear Curve Prototype
function LinearCurve(CP1, CP2) {
    THREE.Curve.call(this);
    this.point1 = CP1;
    this.point2 = CP2;
}

LinearCurve.prototype = Object.create(THREE.Curve.prototype);
LinearCurve.prototype.constructor = LinearCurve;

LinearCurve.prototype.getPoint = function (t) {
    var p0 = [this.point1.position().x, this.point1.position().y, this.point1.position().z];
    var p1 = [this.point2.position().x, this.point2.position().y, this.point2.position().z];
    var result = [p0[0] + (p1[0] - p0[0]) * t,
    p0[1] + (p1[1] - p0[1]) * t,
    p0[2] + (p1[2] - p0[2]) * t
    ];
    return new THREE.Vector3(result[0], result[1], result[2]);

};

// Bspline Curve Prototype
function BsplineCurve(CP1, CP2, CP3, CP4) {
    THREE.Curve.call(this);
    this.point1 = CP1;
    this.point2 = CP2;
    this.point3 = CP3;
    this.point4 = CP4;
}

BsplineCurve.prototype = Object.create(THREE.Curve.prototype);
BsplineCurve.prototype.constructor = BsplineCurve;
BsplineCurve.prototype.getPoint = function (t) {

    var p0 = [this.point1.position().x, this.point1.position().y, this.point1.position().z];
    var p1 = [this.point2.position().x, this.point2.position().y, this.point2.position().z];
    var p2 = [this.point3.position().x, this.point3.position().y, this.point3.position().z];
    var p3 = [this.point4.position().x, this.point4.position().y, this.point4.position().z];

    // derived from the basis matrix of b-spline
    var b0 = (-t * t * t + 3 * t * t - 3 * t + 1) / 6;
    var b1 = (3 * t * t * t - 6 * t * t + 4) / 6;
    var b2 = (-3 * t * t * t + 3 * t * t + 3 * t + 1) / 6;
    var b3 = (t * t * t) / 6;

    var result = [p0[0] * b0 + p1[0] * b1 + p2[0] * b2 + p3[0] * b3,
    p0[1] * b0 + p1[1] * b1 + p2[1] * b2 + p3[1] * b3,
    p0[2] * b0 + p1[2] * b1 + p2[2] * b2 + p3[2] * b3
    ];

    return new THREE.Vector3(result[0], result[1], result[2]);
};


function drawCurves(cur_curveSegments) {

    for (var i = 0; i < curvesMeshes.length; i++) {
        trainWorld.scene.remove(curvesMeshes[i]);
        curvesMeshes[i].geometry.dispose();
        curvesMeshes[i].material.dispose();
    }
    var material = new THREE.MeshBasicMaterial({
        color: 0x000000
    });

    // clear lists of curve meshes and curves
    curvesMeshes = [];
    curves = [];

    for (var i = 0; i < CPlist.length; i++) {
        // four adjacent indices in order
        var a = i;
        var b = i + 1 >= CPlist.length ? i + 1 - CPlist.length : i + 1;
        var c = i + 2 >= CPlist.length ? i + 2 - CPlist.length : i + 2;
        var d = i + 3 >= CPlist.length ? i + 3 - CPlist.length : i + 3;

        var curve;

        curve = new LinearCurve(CPlist[a], CPlist[b]);
        if (params.Bspline) {
        curve = new BsplineCurve(CPlist[a], CPlist[b], CPlist[c], CPlist[d]);
        }

        var geometry = new THREE.TubeGeometry(
            curve,
            cur_curveSegments,
            0.5,
            4,
            false
        );
        var curveObject = new THREE.Mesh(geometry, material);
        CPlist[i].mesh.lookAt(0, 0, 0)
        trainWorld.addObject(curveObject);
        curvesMeshes.push(curveObject);
        curves.push(curve);
    }
}

// Compute normals at points on curves based on the number of curve segments
function computeNormals(cur_curveSegments) {
    normals = [];
    for (var i = 0; i < CPlist.length; i++) {
        var a = i;
        var b = i + 1 >= CPlist.length ? 0 : i + 1;
        var cur_normals = [];
        for (var j = 0; j < cur_curveSegments; j++) {
            var normal = new THREE.Vector3();
            normal.lerpVectors(
                CPlist[a].orient,
                CPlist[b].orient,
                j * (1 / cur_curveSegments)
            );
            cur_normals.push(normal);
        }
        var normal = new THREE.Vector3();
        normal.lerpVectors(CPlist[a].orient, CPlist[b].orient, 1);
        cur_normals.push(normal);
        normals.push(cur_normals);
    }
}


// create texture for rail ties
var loader = new THREE.TextureLoader();
loader.setCrossOrigin("anonymous");

var texture = loader.load("images/wood.jpeg");

// draw rail ties based on the number of curve segments
function drawRail(cur_curveSegments) {
    var material = new THREE.MeshBasicMaterial({
        map: texture
    });
    var geometry = new THREE.BoxGeometry(20, 1, 5, 1, 1, 1);
    // remove previously drawn rail ties
    for (var i = 0; i < rails.length; i++) {
        trainWorld.scene.remove(rails[i]);
        rails[i].geometry.dispose();
        rails[i].material.dispose();
    }

    // store rail ties meshes
    rails = [];

    for (var i = 0; i < CPlist.length; i++) {
        for (var j = 0; j < cur_curveSegments; j++) {
            var rail = new THREE.Mesh(geometry, material);
            // position
            rail.position.x = curves[i].getPoint((1 / cur_curveSegments) * j).x;
            rail.position.y = curves[i].getPoint((1 / cur_curveSegments) * j).y;
            rail.position.z = curves[i].getPoint((1 / cur_curveSegments) * j).z;
            // orientation
            rail.up.x = normals[i][j].x;
            rail.up.y = normals[i][j].y;
            rail.up.z = normals[i][j].z;
            rail.lookAt(curves[i].getPoint((1 / cur_curveSegments) * (j + 1)));
            rail.receiveShadow = true;
            trainWorld.addObject(rail);
            rails.push(rail);
        }
    }
}



function drawStaticRails(cur_curveSegments, start, end){
    curve = new LinearCurve(start, end);
    var material = new THREE.MeshBasicMaterial({
        color: 0x000000
    });
    var geometry = new THREE.TubeGeometry(
        curve,
        cur_curveSegments,
        0.5,
        4,
        false
    );
    var curveObject = new THREE.Mesh(geometry, material);
    trainWorld.addObject(curveObject);

    var material = new THREE.MeshBasicMaterial({
        map: texture
    });
    var geometry = new THREE.BoxGeometry(20, 1, 5, 1, 1, 1);
    for (var j = 0; j < cur_curveSegments; j++) {
        var rail = new THREE.Mesh(geometry, material);
        // position
        rail.position.x = curve.getPoint((1 / cur_curveSegments) * j).x;
        rail.position.y = curve.getPoint((1 / cur_curveSegments) * j).y;
        rail.position.z = curve.getPoint((1 / cur_curveSegments) * j).z;
        // orientation
        rail.lookAt(curve.getPoint((1 / cur_curveSegments) * (j + 1)));
        rail.receiveShadow = true;
        
        trainWorld.addObject(rail);
        enemyRails.push(rail);
    }
}

function computerTimeIncrements() {
    time_increments = [];
    for (var i = 0; i < curves.length; i++) {
        time_increments.push(params.speed);
    }
}

function updateTrainPosition() {
    for (var i = 1; i < train.meshes.length; i++) {
        var head_time = times[i - 1];
        var distance1 = head_time * curves[cur_curves[i - 1]].getLength();
        var temp_dist;

        temp_dist = distance1 - 35;

        // if on the same curve
        if (temp_dist >= 0) {
            cur_curves.push(cur_curves[i - 1]);
            times.push(temp_dist / curves[cur_curves[i - 1]].getLength());
        }
        //if not on the same curve
        else {
            var to_push_cur_curve =
                cur_curves[i - 1] == 0 ? curves.length - 1 : cur_curves[i - 1] - 1;
            temp_dist = curves[to_push_cur_curve].getLength() + temp_dist;
            cur_curves.push(to_push_cur_curve);
            times.push(temp_dist / curves[to_push_cur_curve].getLength());
        }
    }

    // position of the head car
    var pos = curves[cur_curve].getPointAt(t);

    // update train positions
    if (!switched) {
        train.position(0).copy(pos);
        for (var i = 1; i < train.meshes.length; i++) {
            var temp_t = times[i];
            train.position(i).copy(curves[cur_curves[i]].getPointAt(temp_t));
        }
    }
}
function updateTrainOrientaion() {
    train.lookAt(0, curves[cur_curve].getPointAt(t + 0.001));
    train.up(0).x = normals[cur_curve][Math.round(t * cur_curveSegments)].x;
    train.up(0).z = normals[cur_curve][Math.round(t * cur_curveSegments)].z;
    train.meshes[0].position.y = 20
    for (var i = 1; i < train.meshes.length; i++) {
        var temp_t = times[i];
        if (temp_t < 0) {
            temp_t = 0;
        }
        train.lookAt(i, curves[cur_curves[i]].getPointAt(temp_t + 0.001));
        train.up(i).x =
            normals[cur_curves[i]][Math.round(temp_t * cur_curveSegments)].x;
        train.up(i).z =
            normals[cur_curves[i]][Math.round(temp_t * cur_curveSegments)].z;
    }
}

// linear interpolation function
function lerp(a, b, t) { return a + (b - a) * t }

function loopEnemyTrains() {
    for (var i = 1; i <= enemyTrains.length; i++) {
        enemyTrain = enemyTrains[i-1];
        if (enemyTrainSpeed[i-1].t - 2 * enemyTrainSpeed[i-1].dt > 0 && enemyTrainSpeed[i-1].t + 2 * enemyTrainSpeed[i-1].dt < 1) {
            var size = enemyTrain.size();
            
            var start = enemyTrainsPath[i-1].start.position();
            var end =enemyTrainsPath[i-1].end.position();
            if(start.x == end.x){
                tempStartZ = start.z > 0 ? start.z - size.z / 2 - (enemyTrain.cars - 1) * 35 : start.z + size.z / 2 + (enemyTrain.cars - 1) * 35;
                tempEndZ = end.z > 0 ? end.z - size.z / 2 -  (enemyTrain.cars - 1) * 35 : end.z + size.z / 2 + (enemyTrain.cars - 1) * 35;
                var newX = start.x;
                var newZ = lerp(tempStartZ, tempEndZ, ease(enemyTrainSpeed[i-1].t));
            }
            else {
                tempStartX = start.x > 0 ? start.x - size.z / 2 - (enemyTrain.cars - 1) * 35 : start.x + size.z / 2 + (enemyTrain.cars - 1) * 35;
                tempEndX = end.x > 0 ? end.x - size.z / 2 -  (enemyTrain.cars - 1) * 35 : end.x + size.z / 2 + (enemyTrain.cars - 1) * 35;
                var newZ = start.z;
                var newX = lerp(tempStartX, tempEndX, ease(enemyTrainSpeed[i-1].t));
            }
            
            enemyTrain.position(0).set(newX, start.y, newZ);
            enemyTrain.lookAt(0, end)
            enemyTrainSpeed[i-1].t += enemyTrainSpeed[i-1].dt;
            if (enemyTrainSpeed[i-1].t <= 0) {
                enemyTrainSpeed[i-1].dt = -enemyTrainSpeed[i-1].dt;
            }
            if (enemyTrainSpeed[i-1].t >= 1) {
                enemyTrainSpeed[i-1].dt = -enemyTrainSpeed[i-1].dt;
            }

        }
        else {
            enemyTrainSpeed[i-1].t += enemyTrainSpeed[i-1].dt;
            if (enemyTrainSpeed[i-1].t <= 0) {
                enemyTrainSpeed[i-1].dt = -enemyTrainSpeed[i-1].dt;
            }
            if (enemyTrainSpeed[i-1].t >= 1) {
                enemyTrainSpeed[i-1].dt = -enemyTrainSpeed[i-1].dt;
            }
        }
    }
}

// example easing function (quadInOut, see link above)
function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t }


// Function to call when control points are being dragged
function dragStartCallBack(event) {
    trainWorld.controls.enabled = false;
}

// Function to call while control points are being dragged
function dragCallBack(event) {
    for (var i = 0; i < CPlist.length; i++) {
        if (CPlist[i].mesh == event.object) {
            CPlist[i].mesh.position.y = 10
            if (CPlist[i].mesh.position.z > 300) CPlist[i].mesh.position.z = 300;
            if (CPlist[i].mesh.position.z < -300) CPlist[i].mesh.position.z = -300;
            if (CPlist[i].mesh.position.x > islandWidth/2) CPlist[i].mesh.position.x = islandWidth/2;
            if (CPlist[i].mesh.position.x < -islandWidth/2) CPlist[i].mesh.position.x = -islandWidth/2;
        }
    }
}

// function to call when control points finish dragging
function dragEndCallBack(event) {
    trainWorld.controls.enabled = true;
}



// set up the UI
function setupUI() {
    const gui = new dat.GUI();
    f1 = gui.addFolder("Точка зрения");
    f2 = gui.addFolder("Animation");
    controllers = [];
  
    // view Folder
    f1.add(params, "TrainView").name("точка зрения поезда")
      .onChange(function(value) {
        if (value == false) {
          trainWorld.controls.reset();
          trainWorld.camera.up.set(0, 1, 0);
          trainWorld.controls.target = new THREE.Vector3(0, 1, 0);
          trainWorld.controls.noRotate = false;
          trainWorld.camera.position.set(0, 700, 0);
        }
      })
      .listen()
      .onFinishChange();
    // Animation folder
    controllers[0] = f2
      .add(params, "Bspline")
      .listen()
      .onFinishChange();
    f2.add(params, "addFog").name("Добавьте эффект тумана");
    f2.add(params, "addCar").name("Добавить вагон");
    f2.add(params, "removeCar").name("Удалить вагон");
  }