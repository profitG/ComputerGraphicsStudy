// Station.js

import * as THREE from '../../build/three.module.js';

export function createStation(scene, x, y, StationList) {
    // 위치를 정수로 조정합니다.
    const roundX = Math.round(x);
    const roundY = Math.round(y);

    // 이미 해당 위치에 역이 있는지 확인합니다.
    if (isStationAtLocation(StationList, roundX, roundY)) {
        console.log(roundX, roundY, "위치에 이미 역이 있습니다.");
        console.log(StationList);
        return null; // 역 생성 실패를 나타내기 위해 null을 반환합니다.
    }

    // 역의 재질
    const StationMaterial = new THREE.MeshStandardMaterial({
        color: 0x548769,
        roughness: 0.5,
        metalness: 0.8
    });

    // 역의 모양과 크기
    const StationGeometry = new THREE.CylinderGeometry(2, 2, 2);

    // 역 메쉬 생성
    const StationMesh = new THREE.Mesh(StationGeometry, StationMaterial);

    // 역 메쉬의 위치와 회전 설정
    StationMesh.rotation.x = -Math.PI / 2;
    StationMesh.renderOrder = 1;
    StationMesh.position.set(roundX, 0, roundY);

    // 씬에 역 메쉬 추가
    scene.add(StationMesh);

    console.log(roundX, roundY, "위치에 역이 생성되었습니다.");

    // 생성된 역 정보
    const StationInfo = { mesh: StationMesh, x: roundX, y: roundY, trains: [] };

    console.log("Station Info: ", StationInfo);

    // 생성된 역 정보를 StationList에 추가합니다.
    StationList.push(StationInfo);
    console.log("역 목록: ", StationList);
    return StationInfo;
}

function isStationAtLocation(StationList, x, y) {
    const StationSize = 2; // 역의 크기
    return StationList.some(Station => {
        const isOverlapX = Math.abs(x - Station.x) < StationSize;
        const isOverlapY = Math.abs(y - Station.y) < StationSize;
        return isOverlapX && isOverlapY;
    });
}
