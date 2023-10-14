window.onload = function init(){
    const canvas = document.getElementById("gl-canvas");
    const renderer = new THREE.WebGLRenderer({canvas});

    // 카메라의 fov, aspect, near, far, position, camera 렌더링 종류 설정하는 코드
    const fov = 75;
    const aspect = 2;
    const near = 0.1;
    const far = 5;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

    // Scene 생성
    const scene = new THREE.Scene();
    
    // 광원의 색, 광도, 위치 설정 -> scene에 추가
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

    // box Geometry 설정
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;

    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    // 실제 인스턴스를 만드는 함수
    function makeInstance(geometry, color, x){
        const material = new THREE.MeshPhongMaterial({color});
        const cube = new THREE.Mesh(geometry, material); // geometry와 material을 종합해 scene에 들어갈 Mesh 생성
        scene.add(cube);

        cube.position.x = x;
        return cube;
    }

    const cubes = [
        makeInstance(geometry, 0x44aa88, 0),
        makeInstance(geometry, 0x8844aa, -2),
        makeInstance(geometry, 0xaa8844, 2)
    ];

    function render(time){
        time *= 0.001;

        cubes.forEach((cube, ndx) => { // cubes에 들어있는 cube를 
            const speed = 1 + ndx * 0.1;
            const rot = time * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;
        });

        renderer.render(scene, camera);
        requestAnimationFrame(render); // 이 코드가 없으면 회전하는게 렌더링이 안됨..
    }
    requestAnimationFrame(render); // 이 코드가 없으면 아예 렌더링이 안됨.

}