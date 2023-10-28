var renderer;
var scene;
var model;
let mixer;
var gltfModel;
var already = false;
var requestFrame;
var currentCharacterModelIndex = 0; // a
var models = [
    "../model/characters/Default.gltf",
    "../model/characters/green.gltf",
    "../model/characters/skyblue.gltf",
    "../model/characters/blue.gltf",
    "../model/characters/purple.gltf",
    "../model/characters/pink.gltf",
];

window.onload = function init(){
    const canvas = document.getElementById("gl-canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    renderer = new THREE.WebGLRenderer({canvas});
    renderer.setSize(canvas.width, canvas.height);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(75, canvas.width/canvas.height, 0.1, 1000);
    camera.position.y = 3;
    camera.position.z = 7;

    const controls = new THREE.OrbitControls(camera, renderer.domElement);

    scene.add(new THREE.AmbientLight(0x888888, 1));
    var light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 3, 5);
    scene.add(light);
    already = false;
    loadModel(currentCharacterModelIndex);
}

function tick(){
    if(mixer){
        mixer.update(0.02);
    }
    // deltaTime이 0인 경우 mesh가 회전하지 않는다.
    renderer.render(scene, camera);
    requestFrame = window.requestAnimationFrame(tick);
}

function loadModel(modelIndex){
    console.log("실행됐니?");

    var loader = new THREE.GLTFLoader();
    loader.load(models[modelIndex], function (gltf) {
        model = gltf.scene;
        console.log(gltf);
        model.scale.set(0.8, 0.8, 0.8); // 모델 스케일 조절 (예시)
        scene.add(model);
        

        mixer = new THREE.AnimationMixer(model);
        const actions = mixer.clipAction(gltf.animations[0]);
        actions.play();
        tick();

    }, undefined, function(error){
        console.log("Error!");
    });
}

// 모델 변경 함수
function changeModel() {
    already = true;
    currentCharacterModelIndex = (currentCharacterModelIndex + 1) % models.length;
    window.cancelAnimationFrame(requestFrame);
    if(scene){
        scene.remove(model);
    }
    // 새 모델 로딩
    
    loadModel(currentCharacterModelIndex);
    
}

function start(){
    if(scene){
        scene.clear();
    }
}