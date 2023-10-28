// Building.js

import * as THREE from '../../build/three.module.js';

export function createBuilding(scene, x, y, buildingList) {
    // 정수로 위치 조정
    const roundX = Math.round(x);
    const roundY = Math.round(y);
    
    // 이미 해당 위치에 빌딩이 있는지 확인
    if (isBuildingAtLocation(buildingList, roundX, roundY)) {
        console.log(roundX, roundY, "위치에 이미 빌딩이 있습니다.");
        console.log(buildingList);
        return null; // 빌딩 생성 실패를 나타내기 위해 null 반환
    }

    // 빌딩의 재질
    const buildingMaterial = new THREE.MeshStandardMaterial({
        color: 0xa00aaa,
        roughness: 0.5,
        metalness: 0.8
    });

    // 빌딩의 모양과 크기
    const buildingGeometry = new THREE.BoxGeometry(2, 2, 2);

    // 빌딩 메쉬 생성
    const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial);

    // 빌딩 메쉬의 위치, 회전 설정
    buildingMesh.rotation.x = -Math.PI / 2;
    buildingMesh.renderOrder = 1;
    buildingMesh.position.set(roundX, 1, roundY);

    // 씬에 빌딩 메쉬 추가
    scene.add(buildingMesh);

    console.log(roundX, roundY, "위치에 빌딩 생성됨");

    // 생성된 빌딩 정보 반환
    const buildingInfo = { mesh: buildingMesh, x: roundX, y: roundY };
    buildingList.push(buildingInfo); // 새로운 빌딩을 목록에 추가
    console.log("buildingList: ",buildingList);
    return buildingInfo;
}

function isBuildingAtLocation(buildingList, x, y) {
    const buildingSize = 2; // 빌딩의 크기
    return buildingList.some(building => {
        const isOverlapX = Math.abs(x - building.x) < buildingSize;
        const isOverlapY = Math.abs(y - building.y) < buildingSize;
        return isOverlapX && isOverlapY;
    });
}


