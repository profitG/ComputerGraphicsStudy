var model;

window.onload = function init(){
    const canvas = document.getElementById("gl-canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({canvas});
    renderer.setSize(canvas.width, canvas.height);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFFFFF);

    camera = new THREE.PerspectiveCamera(75, canvas.width/canvas.height, 0.1, 1000);
    camera.position.y = 2;
    camera.position.z = 5;

    const controls = new THREE.OrbitControls(camera, renderer.domElement);

    scene.add(new THREE.AmbientLight(0x888888, 1));
    var light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 3, 5);
    scene.add(light);
    const loader = new THREE.GLTFLoader();
    loader.load("../model/stick_man/color.gltf", function(gltf){
        model = gltf.scene;
        scene.add(model);
        animate();
        console.log("제발.. " + model.material);
        // 모델의 하위 Mesh를 순회하면서 각 Mesh의 material 확인
        model.traverse(function (child) {
            console.log("child: " + child);
            if (child instanceof THREE.Mesh) {
                var material = child.material;
                console.log("materail: " + material);
                if (material) {
                    // material이 정의되어 있다면 여기서 작업 수행
                }
            }
        });
    }, undefined, function(error){
        console.log("Error!");
    });

    function animate(){
        requestAnimationFrame(animate);
        if(model){
            //model.rotation.x += 0.01;
        }
        renderer.render(scene, camera);
    }
}