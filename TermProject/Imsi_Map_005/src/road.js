// road.js

import * as THREE from '../../build/three.module.js';

export function createRoad(scene, x, y) {
    // 정수로 위치 조정
    const roundX = Math.round(x);
    const roundY = Math.round(y);

    // 도로의 재질
    const roadMaterial = new THREE.MeshStandardMaterial({
        color: 0x788888,
        roughness: 0,
        metalness: 0,
    });

    // 도로의 모양과 크기
    const roadGeometry = new THREE.PlaneGeometry(1, 1);

    // 도로 메쉬 생성
    const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
    
    // isMapObject 속성 추가
    roadMesh.isMapObject = true;
    
    // 도로 메쉬의 위치, 회전 설정
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.renderOrder = 1;
    roadMesh.position.set(Math.round(roundX), 0.05, Math.round(roundY));

     // 맵 객체 여부를 나타내는 속성 추가
     roadMesh.isMapObject = true;

     // 도로 메쉬를 씬에 추가
     scene.add(roadMesh);
     console.log("tile create", roundX, roundY);

    // 생성된 도로 정보 반환
    return { mesh: roadMesh, x: Math.round(roundX), y: Math.round(roundY) };
}
