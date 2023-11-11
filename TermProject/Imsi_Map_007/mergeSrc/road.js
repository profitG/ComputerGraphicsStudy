// road.js

import * as THREE from '../../build/three.module.js';

export function createRoad(scene, x, y) {
    // 정수로 위치 조정
    const roundX = Math.round(x);
    const roundY = Math.round(y);

    // 도로의 텍스처 로드
    const textureLoader = new THREE.TextureLoader();
    const texturePath = './Model/low_road/textures/Material.006_baseColor.jpeg'; // Provide the correct path to your texture
    const roadTexture = textureLoader.load(texturePath);

    // 도로 메쉬 생성
    const geometry = new THREE.PlaneGeometry(8, 10); // Assuming a plane geometry for the road
    //const material = new THREE.MeshBasicMaterial({ map: roadTexture });
    const material = new THREE.MeshStandardMaterial({
        color: 0x808080,
        roughness: 0.8,
        metalness: 0.1,
        side: THREE.DoubleSide, // 이 부분을 추가
        transparent: true, // 추가
        opacity: 1.0, // 추가
    });
    const roadMesh = new THREE.Mesh(geometry, material);

    // 도로 메쉬의 위치, 회전 설정
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.renderOrder = 1;
    roadMesh.position.set(Math.round(roundX), 0.05, Math.round(roundY));
    roadMesh.receiveShadow = true;
    // 맵 객체 여부를 나타내는 속성 추가
    roadMesh.isMapObject = true;

    // 도로 메쉬를 씬에 추가
    scene.add(roadMesh);
    console.log("tile create", roundX, roundY);

    // 생성된 도로 정보 반환
    return { mesh: roadMesh, x: Math.round(roundX), y: Math.round(roundY) };
}
