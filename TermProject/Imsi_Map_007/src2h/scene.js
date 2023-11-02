// scene.js

import * as THREE from '../../build/three.module.js';
import { GLTFLoader } from '../../examples/jsm/loaders/GLTFLoader.js';
import { createCamera } from './camera.js';
import { createNPC } from './npc.js'
import { createCity as createCityObject } from './city.js';
import { createRoad } from './road.js';
import { createBuilding } from './Building.js';
import { createHouse } from './house.js';
import { createStation } from './Station.js';
import { npc } from './npc2.js';
import { Train } from './train.js';

/**
 * 3D 시뮬레이션의 주요 씬을 생성합니다.
 * @returns {Object} - 3D 씬과 초기화 및 렌더링을 담당하는 함수들을 포함하는 객체입니다.
 */
const cityInfo = [];
const buildingList = [];
const HouseList = [];
const StationList = [];
const StationList2 = [];
const StationList_ = [];

export function createScene() {
    // 씬 생성
    const scene = new THREE.Scene();
    let activeToolId = '';

    // 렌더러 생성 및 설정
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('render-target').appendChild(renderer.domElement);

    const { 
        camera, 
        onMouseDown,
        onMouseUp,
        onMouseMove 
    } = createCamera(document.getElementById('root-window'));

    // 초기화 함수
    function initialize() {
        // Create City n x n
        const cityCount = 3; // 원하는 도시 개수로 조절
        const citySize = 30; // 원하는 도시 크기로 조절
        
        const offsetY = citySize * 1.5
        for (let i = 0; i < cityCount; i++) {
            const offsetX = i * citySize * 1.5; // 각 도시의 X 오프셋 조절
            const cityObject = createCityObject(citySize, i);          
            cityObject.mesh.position.x = offsetX;
            const cityObject2 = createCityObject(citySize, i+3);
            cityObject2.mesh.position.x = offsetX;
            cityObject2.mesh.position.z = offsetY;
            // console.log(cityObject);

            const infoContainer = document.getElementById('info');

            const infoElement = document.createElement('div');
            infoElement.id = `city-info-${i}`;
            infoElement.className = 'city-info';
            infoContainer.appendChild(infoElement);

            cityInfo.push({
                name: `City ${i + 1}`,
                population: Math.floor(Math.random() * 1000000),
                x : cityObject.mesh.position.x,
                z : cityObject.mesh.position.z,
                index : i
            });

            cityInfo.push({
                name: `City ${i + 4}`,
                population: Math.floor(Math.random() * 1000000),
                x : cityObject2.mesh.position.x,
                z : cityObject2.mesh.position.z,
                index : i+3
            });


            const Xlist = [10, -5, -8];
            const Ylist = [13, -12, 12];
            for(let j=0; j<1; j++){
                createBuilding(scene, offsetX + Xlist[j], Ylist[j], buildingList, cityInfo[2*i]);
                createBuilding(scene, offsetX + Xlist[j], offsetY + Ylist[j], buildingList, cityInfo[2*i+1]);
            }
            
            console.log(cityInfo);

            

            updateInfoWindow(cityInfo);

            scene.add(cityObject.mesh);
            scene.add(cityObject2.mesh);
        }
        const station1 = createStation(scene, 0, 0);
        const station2 = createStation(scene, 45, 0);
        const station3 = createStation(scene, 90, 0);
        const station4 = createStation(scene, 90, 45);
        const station5 = createStation(scene, 45, 45);
        const station6 = createStation(scene, 0, 45);
        StationList.push(station1);
        StationList.push(station2);
        StationList.push(station3);
        StationList.push(station4);
        StationList.push(station5);
        StationList.push(station6);

        StationList2.push(station1);
        StationList2.push(station4);

        StationList_.push(station1);
        StationList_.push(station2);
        StationList_.push(station3);
        StationList_.push(station6);
        StationList_.push(station5);
        StationList_.push(station4);

        console.log("StationList_", StationList_);
        const train1 = new Train(scene, StationList, 0.7, true);
        train1.start();

        const train2 = new Train(scene, StationList2, 0.7, false);
        train2.start();
        
        scene.background = new THREE.Color(0xffdab9);
    
        setupLights(scene);

        // 여기에 다른 초기화 로직 추가 (도시 객체를 이용하여 씬 초기 상태 설정)


    }

    function setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);

    const directionalLight1 = new THREE.DirectionalLight(0xffcc00, 0.6);
    directionalLight1.position.set(0, 1, 0);

    const directionalLight2 = new THREE.DirectionalLight(0x00ccff, 0.6);
    directionalLight2.position.set(1, 1, 0);

    const directionalLight3 = new THREE.DirectionalLight(0xff00cc, 0.6);
    directionalLight3.position.set(0, 1, 0);

    scene.add(ambientLight, directionalLight1, directionalLight2, directionalLight3);
    }

    function updateInfoWindow(newCityInfo) {
        const infoList = document.getElementById('info');
        if (!infoList || newCityInfo.length === 0) {
          console.error('Error: Unable to find the element with id "city-info-list" or newCityInfo is empty.');
          return;
        }
    
        const newCity = newCityInfo[newCityInfo.length - 1];
        
        // newCity가 유효한 객체인지 확인
        if (newCity && newCity.name && newCity.population) {
          const listItem = document.createElement('li');
          listItem.innerHTML = `<strong>${newCity.name}</strong>: 인구 - ${newCity.population}`;
          infoList.appendChild(listItem);
        } 
      }
      
    // 렌더링 루프 함수
    function render() {
        requestAnimationFrame(render);

        // 렌더링 전에 정보창 업데이트
        const meshCount = scene.children.length;
        updateInfoWindow(camera.position.x, camera.position.z, meshCount);

        renderer.render(scene, camera);
    }

    function setActiveToolId(event, toolId) {
        let selectedControl_npc = document.getElementById('button-npc')
        let selectedControl_road = document.getElementById('button-road');
        let selectedControl_building = document.getElementById('button-building');
        let selectedControl_house = document.getElementById('button-house');
        let selectedControl_station = document.getElementById('button-station');
        let selectedControl_remove = document.getElementById('button-remove');
        let selectedControl_start = document.getElementById('button-start');
        let selectedControl_stop = document.getElementById('button-stop');
        
        if (activeToolId === toolId) {
            // 이미 선택된 도구를 다시 클릭하면 선택 취소
            console.log('Tool selection canceled.');

            if(activeToolId == 'NPC') { 

                activeToolId = null;
                toolId = null;
                selectedControl_npc.classList.remove('selected');
                document.removeEventListener('mousedown', handleNPCPlacement);
            
            } 

            if(activeToolId == 'road') { 

                activeToolId = null;
                toolId = null;
                selectedControl_road.classList.remove('selected');
                document.removeEventListener('mousedown', handleRoadPlacement);
            
            } 

            if(activeToolId == 'building') { 

                activeToolId = null;
                toolId = null;
                selectedControl_building.classList.remove('selected');
                document.removeEventListener('mousedown', handleBuildingPlacement);
            
            } 

            if(activeToolId == 'house') { 

                activeToolId = null;
                toolId = null;
                selectedControl_house.classList.remove('selected');
                document.removeEventListener('mousedown', handleHousePlacement);
            
            } 

            if(activeToolId == 'station') { 

                activeToolId = null;
                toolId = null;
                selectedControl_station.classList.remove('selected');
                document.removeEventListener('mousedown', handleStationPlacement);
            
            } 

            if(activeToolId == 'remove') {

                activeToolId = null;
                toolId = null;
                selectedControl_remove.classList.remove('selected');
                document.removeEventListener('mousedown', handleRemovePlacement);

            }

            if(activeToolId == 'start') {

                activeToolId = null;
                toolId = null;
                selectedControl_start.classList.remove('selected');

            }

            if(activeToolId == 'stop') {

                activeToolId = null;
                toolId = null;
                selectedControl_stop.classList.remove('selected');
                
            }
        }

        else {
            activeToolId = toolId;
            console.log(activeToolId);

            if (activeToolId === 'NPC') {
                // 마우스 클릭 이벤트 리스너 등록
                document.addEventListener('mousedown', handleNPCPlacement);
            } else {
                // road가 아닌 다른 도구가 선택되면 리스너 제거
                document.removeEventListener('mousedown', handleNPCPlacement);
            }
    
            if (activeToolId === 'road') {
                // 마우스 클릭 이벤트 리스너 등록
                document.addEventListener('mousedown', handleRoadPlacement);
            } else {
                // road가 아닌 다른 도구가 선택되면 리스너 제거
                document.removeEventListener('mousedown', handleRoadPlacement);
            }

            if (activeToolId === 'building') {
                // 마우스 클릭 이벤트 리스너 등록
                document.addEventListener('mousedown', handleBuildingPlacement);
            } else {
                // road가 아닌 다른 도구가 선택되면 리스너 제거
                document.removeEventListener('mousedown', handleBuildingPlacement);
            }

            if (activeToolId === 'house') {
                // 마우스 클릭 이벤트 리스너 등록
                document.addEventListener('mousedown', handleHousePlacement);
            } else {
                // road가 아닌 다른 도구가 선택되면 리스너 제거
                document.removeEventListener('mousedown', handleHousePlacement);
            }

            if (activeToolId === 'station') {
                // 마우스 클릭 이벤트 리스너 등록
                document.addEventListener('mousedown', handleStationPlacement);
            } else {
                // road가 아닌 다른 도구가 선택되면 리스너 제거
                document.removeEventListener('mousedown', handleStationPlacement);
            }

            if (activeToolId == 'remove') {
                // 마우스 클릭 이벤트 리스너 등록
                document.addEventListener('mousedown',handleRemovePlacement);
            } else {
                // remove가 아닌 다른 도구가 선택되면 리스너 제거
                document.removeEventListener('mousedown', handleRemovePlacement);
            }

            if (activeToolId == 'start') {
                
            } else {
               
            }

            if (activeToolId == 'stop') {
                
            } else {
               
            }
        }
    }

    ///////////////////////////////////////////////
    function handleNPCPlacement(event) {
        // 화면 좌표를 월드 좌표로 변환
        let start_building_idx = Math.floor(Math.random() * (buildingList.length - 1))
        let start_building = buildingList[start_building_idx]
        let dst_building_idx = Math.floor(Math.random() * (buildingList.length - 1));
        while(buildingList[dst_building_idx].cityinfo.index == 
            start_building.cityinfo.index){
                dst_building_idx = Math.floor(Math.random() * (buildingList.length - 1));
            }
        let dst_building = buildingList[dst_building_idx];
        const newNPC = new npc(scene, start_building, dst_building, StationList_);
    }
    function handleRemovePlacement(event) {
        // 마우스의 클릭 위치를 가져옴
        const mousePosition = getMousePosition(event.clientX, event.clientY);

        // 선택된 도구가 Remove이면 해당 위치에 있는 객체를 찾아 삭제
        if (activeToolId === 'remove') {
            const intersectedObject = getIntersectedObject(mousePosition);

            if (intersectedObject) {
                // 객체를 삭제하고 씬에서 제거
                scene.remove(intersectedObject.mesh);
                console.log('Object removed at:', intersectedObject.x, intersectedObject.y);
                
                // buildingList에서 해당 빌딩 제거
                const index1 = buildingList.findIndex(building => building.mesh === intersectedObject.mesh);
                if (index1 !== -1) {
                    buildingList.splice(index1, 1);
                }

                // HouseList에서 해당 집 제거
                const index2 = HouseList.findIndex(House => House.mesh === intersectedObject.mesh);
                if (index2 !== -1) {
                    HouseList.splice(index2, 1);
                }

                // StationList에서 해당 역 제거
                const index3 = StationList.findIndex(Station => Station.mesh === intersectedObject.mesh);
                if (index3 !== -1) {
                    HouseList.splice(index3, 1);
                }
            
                console.log('Object removed at:', intersectedObject.x, intersectedObject.y);

            }
        }
    }

    function handleRoadPlacement(event) {
        // 화면 좌표를 월드 좌표로 변환
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
    
        // 레이캐스팅 결과
        const intersects = raycaster.intersectObjects(scene.children);
    
        if (intersects.length > 0) {
            // 첫 번째 객체의 위치에 road 생성
            const intersection = intersects[0];
            const x = intersection.point.x;
            const y = intersection.point.z; // Z 좌표를 사용할 수 있도록 변경
    
            // 여기에 road 생성 코드 추가 (createRoad 함수 호출 등)
            createRoad(scene, x, y);
        }
    }

    function handleBuildingPlacement(event) {
        // 화면 좌표를 월드 좌표로 변환
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
    
        // 레이캐스팅 결과
        const intersects = raycaster.intersectObjects(scene.children);
    
        if (intersects.length > 0) {
            // 첫 번째 객체의 위치에 road 생성
            const intersection = intersects[0];
            const x = intersection.point.x;
            const y = intersection.point.z; // Z 좌표를 사용할 수 있도록 변경
            let cityindex;
            let min_distance = 10000;
            for(let i = 0; i<cityInfo.length; i++){
                const delX = cityInfo[i].x - x;
                const delY = cityInfo[i].z - y;
                const distance = delX*delX + delY*delY;
                if(min_distance>distance){
                    min_distance = distance;
                    cityindex = i;
                }
            }
            // 여기에 road 생성 코드 추가 (createRoad 함수 호출 등)
            createBuilding(scene, x, y, buildingList, cityInfo[cityindex]);
            console.log(cityindex);
        }
    }

    function handleHousePlacement(event) {
        // 화면 좌표를 월드 좌표로 변환
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
            
        // 레이캐스팅 결과
        const intersects = raycaster.intersectObjects(scene.children);
            
        if (intersects.length > 0) {
            // 첫 번째 객체의 위치에 road 생성
            const intersection = intersects[0];
            const x = intersection.point.x;
            const y = intersection.point.z; // Z 좌표를 사용할 수 있도록 변경
            
            // 여기에 road 생성 코드 추가 (createRoad 함수 호출 등)
            createHouse(scene, x, y, HouseList);
        }
    }

    function handleStationPlacement(event) {
        // 화면 좌표를 월드 좌표로 변환
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
            
        // 레이캐스팅 결과
        const intersects = raycaster.intersectObjects(scene.children);
            
        if (intersects.length > 0) {
            // 첫 번째 객체의 위치에 road 생성
            const intersection = intersects[0];
            const x = intersection.point.x;
            const y = intersection.point.z; // Z 좌표를 사용할 수 있도록 변경

            // 여기에 road 생성 코드 추가 (createRoad 함수 호출 등)
            createStation(scene, x, y, StationList);

            animate();
        }
    }

    //////////////////////////////////////////////
    
    // 화면 좌표를 월드 좌표로 변환하는 함수
    
    function getMousePosition(clientX, clientY) {
        const rect = renderer.domElement.getBoundingClientRect();
        const x = (clientX - rect.left) / rect.width * 2 - 1;
        const y = -(clientY - rect.top) / rect.height * 2 + 1;
        const mousePosition = new THREE.Vector2(x, y);
        return mousePosition;
    }

    // 마우스 위치에서 씬에서의 교차된 객체를 찾는 함수
    function getIntersectedObject(mousePosition) {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mousePosition, camera);

        // 씬에서 교차된 객체들을 가져옴
        const intersects = raycaster.intersectObjects(scene.children, true);

        // 첫 번째로 교차된 객체를 반환
        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
            const { x, y } = intersectedObject.position;
            return { mesh: intersectedObject, x, y };
        }

        return null;
    }

    function animate() {

    }

    // 시작 함수
    function start() {
        render();
    }

    function stop() {
    }

    // scene 객체에 함수들을 추가하여 외부에서 접근 가능하도록 함
    scene.initialize = initialize;
    scene.start = start;
    scene.stop = stop;
    scene.setActiveToolId = setActiveToolId;
    scene.onMouseDown = onMouseDown;
    scene.onMouseMove = onMouseMove;
    scene.onMouseUp = onMouseUp;
    // scene 객체 반환
    return scene;
}