import { GLTFLoader } from '../../examples/jsm/loaders/GLTFLoader.js';

// 하우스 모델의 경로와 크기 정보
const houseModels = [
    { path: '../Model/low_poly_building1/scene.gltf', scale: 0.2 },
    //{ path: './Model/residential_building_with_parking_lot/scene.gltf', scale: 0.001 },
];

export function createHouse(scene, x, y, HouseList) {
    // 정수로 위치 조정
    const roundX = Math.round(x);
    const roundY = Math.round(y);
    
    // 이미 해당 위치에 하우스이 있는지 확인
    if (isHouseAtLocation(HouseList, roundX, roundY)) {
        console.log(roundX, roundY, "위치에 이미 하우스이 있습니다.");
        console.log(HouseList);
        return null; // 하우스 생성 실패를 나타내기 위해 null 반환
    }

    // 랜덤한 하우스 모델 선택
    const randomModelIndex = Math.floor(Math.random() * houseModels.length);
    const selectedModel = houseModels[randomModelIndex];

    // 하우스 모델 로드
    const loader = new GLTFLoader();
    let houseMesh;

    loader.load(selectedModel.path, (gltf) => {
        houseMesh = gltf.scene;

        // 하우스 메쉬의 위치, 회전, 크기 설정
        houseMesh.rotation.x = Math.PI / 180;
        houseMesh.scale.set(selectedModel.scale, selectedModel.scale, selectedModel.scale);
        houseMesh.position.set(roundX, 1, roundY);

        // 씬에 하우스 메쉬 추가
        scene.add(houseMesh);

        console.log(roundX, roundY, "위치에 하우스 생성됨");

        // 생성된 하우스 정보 반환
        const houseInfo = { mesh: houseMesh, x: roundX, y: roundY };
        HouseList.push(houseInfo); // 새로운 하우스을 목록에 추가
        console.log("houseList: ", HouseList);
    });

    return null; // 비동기로 모델이 로드되기를 기다리는 동안 null 반환
}

function isHouseAtLocation(HouseList, x, y) {
    const HouseSize = 2; // 하우스의 크기
    return HouseList.some(House => {
        const isOverlapX = Math.abs(x - House.x) < HouseSize;
        const isOverlapY = Math.abs(y - House.y) < HouseSize;
        return isOverlapX && isOverlapY;
    });
}
