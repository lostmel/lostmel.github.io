let data = {"patient" : "./assets/030_1_Patient.json", "implants": "./assets/030_1_ImplantDesigns.json"};

let isFullVue = true;

var container = document.getElementById('three-main');
var containerNrrd = document.getElementById('three-side-1');
var loaderSTL = new THREE.STLLoader();
var renderer, rendererNrrd;
var scene, sceneNrrd;
var camera, cameraNrrd;
var controls, controlsNrrd;
var directionalLight;
var t_fix_operative_rotation, t_fix_contralateral_rotation;
var opFemurMesh, contFemurMesh, halfPelvisMesh;
var boneMaterial;

fetch("http://127.0.0.1:5000/preop_planning", {
  mode: 'cors',
  method: "POST",
  body: JSON.stringify(data),
  headers: new Headers({
    'Content-Type': 'application/json'
  })
}).then( res => res.json() )
.then( response => {
    console.log(response)
    // MATRIX
    var transforms = response.transforms;
    t_fix_operative_rotation = new THREE.Matrix4();
    t_fix_operative_rotation.set(...transforms.T_fix_operative_rotation);

    t_fix_contralateral_rotation = new THREE.Matrix4();
    t_fix_contralateral_rotation.set(...transforms.T_fix_contralateral_rotation);

    init();
    animate();
}).catch(function(error) {
    console.log('Fetch Error:', error);
});

function init() {
    // RENDERER
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setClearColor(0x353535, 1);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // --- SCENE
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xF7F7F7 );

    // --- CAMERA
    camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 0.01, 10000000);
    camera.position.x = 181; // help.
    camera.position.y = -900;
    camera.position.z = 700;

    // CONTROLS
    controls = new AMI.TrackballControl(camera, container);
    controls.target.set(181, 260, 619);

    // --- LIGHTS
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(100, 100, 100).normalize();
    scene.add(directionalLight);

    directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-100, -100, -100).normalize();
    scene.add(directionalLight2);

    // camera.add(new THREE.PointLight(0xfff7a9, 0.3));
    scene.add(camera);

    // MATERIAL
    boneMaterial = new THREE.MeshToonMaterial({ color: 0xb8a670, reflectivity: 0, transparent: true, opacity: 1});

    // Load STL model
    loaderSTL.load('./test-assets/stls/contralateral_femur.stl', function(geometry) {
        contFemurMesh = new THREE.Mesh(geometry, boneMaterial);
        JUBERISHCODE
        scene.add(contFemurMesh);
    });

    loaderSTL.load('./test-assets/stls/half_pelvis.stl', function(geometry) {
        halfPelvisMesh = new THREE.Mesh(geometry, boneMaterial);
        console.log('WHAT SO SPECIAL')
        scene.add(halfPelvisMesh);
    });

    loaderSTL.load('./test-assets/stls/operative_femur.stl', function(geometry) {\
        femurOpMesh = new THREE.Mesh(geometry, boneMaterial);
        scene.add(femurOpMesh);
    });
}

// WINDOW RESIZE
function onWindowResize() {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.offsetWidth, container.offsetHeight);
}

// ANIMATION LOOP
function animate() {
    var timer = Date.now() * 0.00025;

    controls.update();
    renderer.render(scene, camera);

    requestAnimationFrame(function() {
        animate();
    });
}

function fixMalrotation() {
    scene.remove(opFemurMesh);
    opFemurMesh.applyMatrix(t_fix_operative_rotation);
    scene.add(opFemurMesh);
}

function toggleView() {
    isFullVue = !isFullVue;
    var mainCon = document.getElementById('three-main');
    var imgCon = document.getElementById('toggle');

    if (isFullVue) {
        imgCon.setAttribute("src", "./assets/grid-view.png");
        mainCon.setAttribute("style", "width: 99%; height: 100%");
    } else {
        imgCon.setAttribute("src", "./assets/single-view.png");
        mainCon.setAttribute("style", "width: 49%; height: 50%");
    }

    camera.aspect = (container.clientWidth)/(container.clientHeight);
    camera.updateProjectionMatrix();
    renderer.setSize((container.clientWidth), (container.clientHeight));
}
