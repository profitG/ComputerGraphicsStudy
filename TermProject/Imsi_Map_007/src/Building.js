// Building.js

import { GLTFLoader } from '../../examples/jsm/loaders/GLTFLoader.js';

// 빌딩 모델의 경로와 크기 정보
const buildingModels = [
    { path: './Model/apartment_building_-_3d_model/scene.gltf', scale: 0.005 },
    { path: './Model/low_poly_buidling/scene.gltf', scale: 0.45 },
    { path: './Model/city_police_station/scene.gltf', scale: 0.3 },
    { path: './Model/generic_business_building/scene.gltf', scale: 0.006 },
];

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

    // 랜덤한 빌딩 모델 선택
    const randomModelIndex = Math.floor(Math.random() * buildingModels.length);
    const selectedModel = buildingModels[randomModelIndex];

    // 빌딩 모델 로드
    const loader = new GLTFLoader();
    let buildingMesh;

    loader.load(selectedModel.path, (gltf) => {
        buildingMesh = gltf.scene;

        // 빌딩 메쉬의 위치, 회전, 크기 설정
        buildingMesh.rotation.x = - Math.PI / 180;
        buildingMesh.scale.set(selectedModel.scale, selectedModel.scale, selectedModel.scale);
        buildingMesh.position.set(roundX, 1, roundY);

        // 씬에 빌딩 메쉬 추가
        scene.add(buildingMesh);

        console.log(roundX, roundY, "위치에 빌딩 생성됨");

        // 생성된 빌딩 정보 반환
        const buildingInfo = { mesh: buildingMesh, x: roundX, y: roundY };
        buildingList.push(buildingInfo); // 새로운 빌딩을 목록에 추가
        console.log("buildingList: ", buildingList);
    });

    return null; // 비동기로 모델이 로드되기를 기다리는 동안 null 반환
}

function isBuildingAtLocation(buildingList, x, y) {
    const buildingSize = 2; // 빌딩의 크기
    return buildingList.some(building => {
        const isOverlapX = Math.abs(x - building.x) < buildingSize;
        const isOverlapY = Math.abs(y - building.y) < buildingSize;
        return isOverlapX && isOverlapY;
    });
}
