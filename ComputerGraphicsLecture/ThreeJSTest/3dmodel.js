var model;

window.onload = function init(){
    const canvas = document.getElementById("gl-canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({canvas});
    renderer.setSize(canvas.width, canvas.height);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x33c2e4);

    camera = new THREE.PerspectiveCamera(75, canvas.width/canvas.height, 0.1, 1000);
    camera.rotation.y = 45/180*Math.PI;
    camera.position.x = 150;
    camera.position.y = 150;
    camera.position.z = 150;

    const controls = new THREE.OrbitControls(camera, renderer.domElement);

    scene.add(new THREE.AmbientLight(0x888888, 1));
    var light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 3, 5);
    scene.add(light);

    var hemiLight = new THREE.HemisphereLight(0x33c2e4, 0x009630, 1);
    hemiLight.position.set(0, 0, 0);
    scene.add(hemiLight);
    
    const loader = new THREE.GLTFLoader();
    loader.load("./model/low_poly_nature_pack/scene.gltf", function(gltf){
        model = gltf.scene;
        model.scale.set(10, 10, 10);
        scene.add(model);
        animate();
    }, undefined, function(error){
        console.log("Error!");
    });

    function animate(){
        requestAnimationFrame(animate);
        if(model){
            model.rotation.x += 0.01;
        }
        renderer.render(scene, camera);
    }
}