// House.js

import * as THREE from '../../build/three.module.js';

export function createHouse(scene, x, y, HouseList) {
    // 정수로 위치 조정
    const roundX = Math.round(x);
    const roundY = Math.round(y);
    
    // 이미 해당 위치에 빌딩이 있는지 확인
    if (isHouseAtLocation(HouseList, roundX, roundY)) {
        console.log(roundX, roundY, "위치에 이미 빌딩이 있습니다.");
        console.log(HouseList);
        return null; // 빌딩 생성 실패를 나타내기 위해 null 반환
    }

    // 빌딩의 재질
    const HouseMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.5,
        metalness: 0.8
    });

    // 빌딩의 모양과 크기
    const HouseGeometry = new THREE.BoxGeometry(1, 1, 1);

    // 빌딩 메쉬 생성
    const HouseMesh = new THREE.Mesh(HouseGeometry, HouseMaterial);

    // 빌딩 메쉬의 위치, 회전 설정
    HouseMesh.rotation.x = -Math.PI / 2;
    HouseMesh.renderOrder = 1;
    HouseMesh.position.set(roundX, 0.7, roundY);

    // 씬에 빌딩 메쉬 추가
    scene.add(HouseMesh);

    console.log(roundX, roundY, "위치에 하우스 생성됨");

    // 생성된 빌딩 정보 반환
    const HouseInfo = { mesh: HouseMesh, x: roundX, y: roundY };
    HouseList.push(HouseInfo); // 새로운 빌딩을 목록에 추가
    console.log("HouseList: ",HouseList);
    return HouseInfo;
}

function isHouseAtLocation(HouseList, x, y) {
    const HouseSize = 2; // 하우스의 크기
    return HouseList.some(House => {
        const isOverlapX = Math.abs(x - House.x) < HouseSize;
        const isOverlapY = Math.abs(y - House.y) < HouseSize;
        return isOverlapX && isOverlapY;
    });
}


