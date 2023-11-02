// road.js

import * as THREE from '../../build/three.module.js';

export function createNPC(scene, x, y) {
    // npc의 재질
    const npcMaterial = new THREE.MeshStandardMaterial({
        color: 0x77ff77,
        roughness: 0.8,
        metalness: 0.8,
    });

    // npc의 모양과 크기
    const npcGeometry = new THREE.BoxGeometry(0.5, 0.5, 1.5);

    // npc 메쉬 생성
    const npcMesh = new THREE.Mesh(npcGeometry, npcMaterial);
    
    // npc 메쉬의 크기 및 회전
    npcMesh.rotation.x = -Math.PI / 2;
    npcMesh.renderOrder = 1;
    npcMesh.position.set(x, 1, y);

     // 맵 객체 여부를 나타내는 속성 추가
     npcMesh.isMapObject = true;

     // 도로 메쉬를 씬에 추가
     scene.add(npcMesh);
     console.log("NPC created!", x, y);

    // 생성된 도로 정보 반환
    return { mesh: npcMesh, x: x, y: y };
}
