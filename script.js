var trainWorld = new World("myCanvas");

// curves
var curvesMeshes = [];
var curves = [];
// record the index of the curve each car is on
var cur_curve = 0;
var cur_curves = [];

// the meshes of rail ties
var rails = [];
// the normals for each point on each curve, depending on number of curve segments
var normals = [];
var collidableMeshList = [];
var draggableObjects = [];
var score;

// global paramaters for different rendering options
var params = {
    CurveSegments: 60,
    speed: 15,
    speedMax: 40,
    speedMin: 10,
    TrainView: false,
    start: false
};

// Animation Parameters

// paramters for curve switching
var switch_curve = false;
var switched = false;
var next_curve = 0;

// total time
var time = 0;
// looptime
var looptime = 12 * 200;
// current time stamp in range 0 to 1 for the head car
var t;
// record how much time should increment when render() is called for each curve
var time_increments = [];
var times = [];
var distances = [];
var draggableObjects = [];
var CPlist = [];

var CPlist_positions = [];
var train;

var enemyTrains;
var enemyTrainsPath;
var enemyTrainSpeed;

const islandWidth = window.innerWidth > 1200 ? 1000 : 600;
// -- control points
var CP1 = new Point(0.45 * islandWidth, 10, 220, trainWorld);
var CP2 = new Point(0.45 * islandWidth, 10, -220, trainWorld);
var CP3 = new Point(-0.45 * islandWidth, 10, -220, trainWorld);
var CP4 = new Point(-0.45 * islandWidth, 10, 220, trainWorld);
var tree_1 = new Tree(trainWorld);
var tree_2 = new Tree(trainWorld);
function init() {
    curvesMeshes = [];
    curves = [];
    cur_curve = 0;
    cur_curves = [];
    rails = [];
    normals = [];
    collidableMeshList = [];
    params = {
        CurveSegments: islandWidth == 600 ? 30 : 60,
        speed: 10,
        speedMax: 35,
        speedMin: 10,
        TrainView: false
    };
    switch_curve = false;
    switched = false;
    next_curve = 0;
    time = 0;
    looptime = 12 * 200;
    t;
    time_increments = [];
    times = [];
    distances = [];
    enemyTrains = [];
    enemyTrainsPath = [];
    enemyTrainSpeed = [];

    score = 0;
    // Set up lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(100, 300, 300);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.left = -400;
    dirLight.shadow.camera.right = 350;
    dirLight.shadow.camera.top = 400;
    dirLight.shadow.camera.bottom = -300;
    dirLight.shadow.camera.near = 100;
    dirLight.shadow.camera.far = 800;


    trainWorld.addObject(ambientLight);
    trainWorld.addObject(dirLight);

    // PLANE
    var planeGeometry = new THREE.PlaneGeometry(islandWidth, 600, 100, 100);
    var loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    var material = new THREE.MeshLambertMaterial({
        color: 0x67C240
    });
    var plane = new THREE.Mesh(planeGeometry, material);
    plane.receiveShadow = true;
    plane.rotation.x = -90 * (Math.PI / 180);
    trainWorld.addObject(plane);


    // Controls
    var dragControls = new THREE.DragControls(
        draggableObjects,
        trainWorld.camera,
        trainWorld.renderer.domElement
    );
    dragControls.addEventListener("dragstart", dragStartCallBack);
    dragControls.addEventListener("drag", dragCallBack);
    dragControls.addEventListener("dragend", dragEndCallBack);

    // -- curves and rails
    drawCurves(params.CurveSegments);
    computeNormals(params.CurveSegments);
    computerTimeIncrements();
    drawRail(params.CurveSegments);

    //Train
    train = new Train(trainWorld, "myCanvas", 0xff3333);
    train.addCar();
    train.addCar();
    cur_curveSegments = Math.round(params.CurveSegments);
    temp_curveSegments = Math.round(params.CurveSegments);
    drawCurves(cur_curveSegments);
    computeNormals(cur_curveSegments);
    computerTimeIncrements();
    drawRail(cur_curveSegments);
    t = (time % looptime) / looptime;
    cur_curves = [];
    cur_curves.push(cur_curve);
    times = [];
    times.push(t);
    updateTrainPosition(train)
    updateTrainOrientaion(train)





    // Enemy Trains
    enemyTrains = [];
    enemyTrainsPath = [];
    enemyTrainSpeed = [];

    enemyTrainsPath.push({ start: new Point(140, 10, 290, trainWorld, false), end: new Point(140, 10, -290, trainWorld, false) })
    enemyTrains.push(new EnemyTrain(trainWorld, 0x3333ff, 2))
    enemyTrainSpeed.push({ t: 0, dt: 0.01 });
    drawStaticRails(60, enemyTrainsPath[0].start, enemyTrainsPath[0].end);

    enemyTrainsPath.push({ start: new Point(-140, 10, -290, trainWorld, false), end: new Point(-140, 10, 290, trainWorld, false) })
    enemyTrains.push(new EnemyTrain(trainWorld, 0x33ff33, 2))
    enemyTrainSpeed.push({ t: 0, dt: 0.005 });
    drawStaticRails(60, enemyTrainsPath[1].start, enemyTrainsPath[1].end);

    enemyTrainsPath.push({ start: new Point(-480, 10, 0, trainWorld, false), end: new Point(480, 10, 0, trainWorld, false) })
    enemyTrains.push(new EnemyTrain(trainWorld, 0x3fffe3, 2))
    enemyTrainSpeed.push({ t: 0, dt: 0.005 });
    drawStaticRails(90, enemyTrainsPath[2].start, enemyTrainsPath[2].end);

    loopEnemyTrains()
    loopEnemyTrains()
    loopEnemyTrains()
    loopEnemyTrains()


    tree_1.updatePosition();
    tree_2.updatePosition();
    // Start
    trainWorld.renderer.setAnimationLoop(render);

}
init()
function reset() {
    cur_curve = 0;
    cur_curves = [];
    normals = [];
    params.speed = 10
    switch_curve = false;
    switched = false;
    next_curve = 0;
    time = 0;
    looptime = 12 * 200;
    t;
    time_increments = [];
    times = [];
    distances = [];

    score = 0;
    enemyTrainSpeed.forEach(e => {
        e.t = 0;
    })
    loopEnemyTrains()
    loopEnemyTrains()

    cur_curveSegments = Math.round(params.CurveSegments);
    temp_curveSegments = Math.round(params.CurveSegments);
    drawCurves(cur_curveSegments);
    computeNormals(cur_curveSegments);
    computerTimeIncrements();
    drawRail(cur_curveSegments);
    t = (time % looptime) / looptime;
    cur_curves = [];
    cur_curves.push(cur_curve);
    times = [];
    times.push(t);
    updateTrainPosition(train)
    updateTrainOrientaion(train)
}
function render() {
    drawCurves(params.CurveSegments);
    computeNormals(params.CurveSegments);
    computerTimeIncrements();
    drawRail(params.CurveSegments);
    if (params.start == true) {
        //animation
        cur_curveSegments = Math.round(params.CurveSegments);
        temp_curveSegments = Math.round(params.CurveSegments);
        t = (time % looptime) / looptime;
        cur_curves = [];
        cur_curves.push(cur_curve);
        times = [];
        times.push(t);
        updateTrainPosition(train)
        if (t < 0.987)
            updateTrainOrientaion(train)

        if (t >= 0.987 && !switched) {
            score += 250;
            document.getElementById("score").getElementsByTagName("span")[0].innerHTML = score;
            switch_curve = true;
            next_curve += 1;
            if (next_curve == CPlist.length) {
                next_curve = 0;
            }
        }
        if (switch_curve) {
            cur_curve = next_curve;
            switched = true;
            switch_curve = false;
        }
        if (t < 0.1) {
            switched = false;
        }


        time += time_increments[cur_curve];
        if (time % 500 == 0) {
            for (var p = 0; p < 25; p++) {
                var particle = train.smokeParticles[p];
                particle.position.set(Math.random() * 50 - 25, Math.random() * 50 - 25, Math.random() * 100 - 10);
                particle.rotation.z = Math.random() * 36;
                particle.rotation.y = Math.random() * 36;
                particle.rotation.x = Math.random() * 36;
            }
        }
        loopEnemyTrains()

        var trainBox = new THREE.Box3().setFromObject(train.meshes[0]);
        collidableMeshList.forEach(collidable => {
            collidableBox = new THREE.Box3().setFromObject(collidable);
            if (trainBox.intersectsBox(collidableBox)) {
                params.start = false;
                showResult();
            }
        })
    }

    if (params.TrainView == true) {
        trainWorld.controls.enabled = false;
        trainWorld.renderwithCamera(train.camera);
    } else {
        trainWorld.render();
    }
}

const playButton = document.getElementById("play-button");
const resetButton = document.getElementById("reset-button");

playButton.addEventListener("click", function () {
    params.start = true
    document.getElementById("controls").style.display = 'none';
    document.getElementById("result").style.display = 'block';
});

resetButton.addEventListener("click", function () {
    reset();
    params.start = true
    document.getElementById("controls").style.display = 'none';
    document.getElementById("result").style.display = 'block';
});

window.addEventListener("keydown", function (event) {
    if (event.key == "w") {
        console.log(params.speed, params.speedMax)
      if(params.speed == params.speedMax) return;
      params.speed += 5
      document.getElementById("speed").getElementsByTagName("span")[0].innerHTML = ((params.speed - params.speedMin) / 5) + 1;
      return;
    }
    if (event.key == "s") {
      if(params.speed == params.speedMin) return;
      params.speed -= 5
      document.getElementById("speed").getElementsByTagName("span")[0].innerHTML = ((params.speed - params.speedMin) / 5) + 1;
      return;
    }
  });

  function showResult() {
    document.getElementById("controls").style.display = 'block';
    document.getElementById("final-score").getElementsByTagName("span")[0].innerHTML = score;
    document.getElementById("final-score").style.display = 'block';
    document.getElementById("result").style.display = 'none';
    playButton.style.display = "none";
    resetButton.style.display = "block";
  }