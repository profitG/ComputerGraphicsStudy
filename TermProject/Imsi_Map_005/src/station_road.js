// station_road.js

import * as THREE from '../../build/three.module.js';
import { Train } from './train.js';

export function createStationRoad(scene, x, y, StationRoadList) {
    // 정수로 위치 조정
    const roundX = Math.round(x);
    const roundY = Math.round(y);

    // 이미 해당 위치에 철도역이 있는지 확인
    if (isStationRoadAtLocation(StationRoadList, roundX, roundY)) {
        console.log(roundX, roundY, "위치에 이미 철도가 있습니다.");
        console.log(StationRoadList);
        return null; // 철도 생성 실패를 나타내기 위해 null 반환
    }

    // 첫 번째로 생성된 타일인지 확인
    const isFirstTile = StationRoadList.length === 0;

    // 철도의 재질
    const StationRoadMaterial = new THREE.MeshStandardMaterial({
        color: 0x548769,
        roughness: 0.5,
        metalness: 0.8
    });

    // 연결된 철도를 그리기 위한 머티리얼 및 지오메트리
    const midPoint = new THREE.Vector3((roundX + x) / 2, 0.1, (roundY + y) / 2);
    const ConnectionMaterial = new THREE.LineBasicMaterial({ color: 0x548769 });
    const ConnectionGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, 0.1, y),
        midPoint,
        new THREE.Vector3(roundX, 0.1, roundY)
    ]);

    // 연결된 철도를 나타내는 라인 메쉬 생성
    const ConnectionLine = new THREE.Line(ConnectionGeometry, ConnectionMaterial);
    scene.add(ConnectionLine);

    // 철도의 모양과 크기
    const StationRoadGeometry = new THREE.PlaneGeometry(2, 2);

    // 철도 메쉬 생성
    const StationRoadMesh = new THREE.Mesh(StationRoadGeometry, StationRoadMaterial);

    // 철도 메쉬의 위치, 회전 설정
    StationRoadMesh.rotation.x = -Math.PI / 2;
    StationRoadMesh.renderOrder = 1;
    StationRoadMesh.position.set(roundX, 0.1, roundY);

    // 씬에 철도 메쉬 추가
    scene.add(StationRoadMesh);

    console.log(roundX, roundY, "위치에 철도 생성됨");

    // 생성된 철도 정보 반환
    const StationRoadInfo = { mesh: StationRoadMesh, x: roundX, y: roundY };
    StationRoadList.push(StationRoadInfo); // 새로운 철도를 목록에 추가
    console.log("Station List: ", StationRoadList);

    // 이전 철도와 연결
    if (!isFirstTile) {
        const prevStationRoad = StationRoadList[StationRoadList.length - 2];
        connectStationRoads(StationRoadMesh, prevStationRoad.mesh);

        // 철도가 생성되면 Train을 시작하는 코드 추가
        startTrainAnimation(scene, StationRoadList);
    }

    return StationRoadList;
}

function isStationRoadAtLocation(StationRoadList, x, y) {
    const StationRoadSize = 1; // 철도의 크기
    return StationRoadList.some(StationRoad => {
        const isOverlapX = Math.abs(x - StationRoad.x) < StationRoadSize;
        const isOverlapY = Math.abs(y - StationRoad.y) < StationRoadSize;
        return isOverlapX && isOverlapY;
    });
}

// 두 철도를 연결하는 함수
function connectStationRoads(stationRoad1, stationRoad2) {
    const point1 = new THREE.Vector3().copy(stationRoad1.position);
    const point2 = new THREE.Vector3().copy(stationRoad2.position);

    // 여기에 철도를 연결하는 코드를 추가하세요.
    // 예를 들어, point1과 point2를 연결하는 방법으로 선을 그립니다.
    const ConnectionMaterial = new THREE.LineBasicMaterial({ color: 0x548769 });
    const ConnectionGeometry = new THREE.BufferGeometry().setFromPoints([point1, point2]);

    const ConnectionLine = new THREE.Line(ConnectionGeometry, ConnectionMaterial);
    stationRoad1.parent.add(ConnectionLine);
}

// Train을 시작하는 함수
function startTrainAnimation(scene, stationRoadList) {
    const trainSpeed = 0.05; // 원하는 속도로 조절
    console.log("이거 넘긴다: ",stationRoadList);
    const train = new Train(scene, stationRoadList, trainSpeed);
    train.start(); // Train 애니메이션 시작
}


