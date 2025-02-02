window.onload = function init(){
    const canvas = document.getElementById("gl-canvas");
    const renderer = new THREE.WebGLRenderer({canvas});

    // 지구 파라미터
    var radius = 0.5;
    var segments = 32;
    var rotation = 6;

    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(45, canvas.width/canvas.height, 0.01, 1000);
    camera.position.z = 1.5;

    scene.add(camera);
    scene.add(new THREE.AmbientLight(0x333333));

    var light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 3, 5);
    scene.add(light);

    var sphere = createSphere(radius, segments);
    sphere.rotation.y = rotation;
    scene.add(sphere);

    var clouds = createClouds(radius, segments);
    clouds.rotation.y = rotation;
    scene.add(clouds);

    var starts = createStars(90, 64);
    scene.add(starts);

    var controls = new THREE.TrackballControls(camera);

    render();

    function render(){
        controls.update();
        sphere.rotation.y += 0.0005;
        clouds.rotation.y += 0.0005;
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

    function createSphere(radius, segments){
        return new THREE.Mesh(
            new THREE.SphereGeometry(radius, segments, segments),
            new THREE.MeshPhongMaterial({
                map: THREE.ImageUtils.loadTexture("images/2_no_clouds_4k.jpg"),
                bumpMap: THREE.ImageUtils.loadTexture("images/elev_bump_4k.jpg"),
                bumpScale: 0.005,
                specularMap: THREE.ImageUtils.loadTexture("images/water_4k.png"),
                specular: new THREE.Color('grey')
            })
        );
    }

    function createClouds(radius, segments){
        return new THREE.Mesh(
            new THREE.SphereGeometry(radius + 0.003, segments, segments),
            new THREE.MeshPhongMaterial({
                map: THREE.ImageUtils.loadTexture("images/fair_clouds_4k.png"),
                transparent: true
            })
        );
    }

    function createStars(radius, segments){
        return new THREE.Mesh(
            new THREE.SphereGeometry(radius, segments, segments),
            new THREE.MeshPhongMaterial({
                map: THREE.ImageUtils.loadTexture("images/galaxy_starfield.png"),
                side: THREE.BackSide
            })
        );
    }
}
