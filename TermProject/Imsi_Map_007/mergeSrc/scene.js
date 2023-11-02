// scene.js

import * as THREE from '../../build/three.module.js';
import { GLTFLoader } from '../../examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from "../../examples/jsm/controls/OrbitControls.js"
import { cameraTo2D } from './cameraTo2D.js';
import { NPC } from './npc.js'
import { createCity as createCityObject } from './city.js';
import { createRoad } from './road.js';
import { createBuilding } from './Building.js';
import { createHouse } from './house.js';
import { createStation } from './Station.js';

/**
 * 3D 시뮬레이션의 주요 씬을 생성합니다.
 * @returns {Object} - 3D 씬과 초기화 및 렌더링을 담당하는 함수들을 포함하는 객체입니다.
 */

const cityInfo = [];
const buildingList = [];
const HouseList = [];
const StationList = [];

var myCharacter;
var cameraPosition = new THREE.Vector3(-2, 4, 10);
var targetPosition = new THREE.Vector3(-17, 12, 3); // 최종 목표 카메라 위치
var animationDuration = 3000; // 이동 애니메이션의 지속 시간 (밀리초)
var index = 0;
var start = false;

let flag_to_hover = 0;
let positon_Num = 0; // 열차정보를 담고있음


export function createScene() {
    // 씬 생성
    const scene = new THREE.Scene();
    let activeToolId = '';

    // 렌더러 생성 및 설정
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    document.getElementById('render-target').appendChild(renderer.domElement);
    
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    //createCamera(document.getElementById('root-window'));
    //const controls = new OrbitControls(camera, document.getElementById('render-target'));

    // 초기화 함수
    function initialize() {
        const cityCount = 5; // 원하는 도시 개수로 조절
        const citySize = 100; // 원하는 도시 크기로 조절
        const cityInfo = [];
        const Xlist = [20, -10, -19];
        const Ylist = [13, -20, 18];
        for (let i = 0; i < cityCount; i++) {
            for (let j = 0; j < cityCount; j++) {
                const offsetX = i * citySize * 1.5; // 각 도시의 X 오프셋 조절
                const offsetY = j * citySize * 1.5; // 각 도시의 Y 오프셋 조절
                if(j < 2 && i < 2){
                    createStation(scene, offsetX, offsetY);
                }
                
                for(let k = 0; k < 3; k++){
                    createBuilding(scene, offsetX + Xlist[k], Ylist[k], buildingList);
                }
                const cityObject = createCityObject(citySize);
        
                cityObject.mesh.position.set(offsetX, 0, offsetY);
        
                scene.add(cityObject.mesh);
            }
        }
        
    
        myCharacter = new NPC(scene, renderer, camera);
        camera.position.set(-2, 4, 10);

        scene.background = new THREE.Color(0xffdab9);
    
        setupLights(scene);

        // 여기에 다른 초기화 로직 추가 (도시 객체를 이용하여 씬 초기 상태 설정)
    }

    function setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);

    const directionalLight1 = new THREE.DirectionalLight(0xffcc00, 0.6);
    directionalLight1.position.set(0, 1, 0);

    const shadowLight = new THREE.DirectionalLight(0xffffff, 1);
    shadowLight.position.set(200, 200, 200);
    shadowLight.target.position.set(0, 0, 0);

    shadowLight.castShadow = true;
    shadowLight.shadow.mapSize.width = 1024;
    shadowLight.shadow.mapSize.height = 1024;
    shadowLight.shadow.camera.top = 30;
    shadowLight.shadow.camera.right = 90;
    shadowLight.shadow.camera.bottom = -60;
    shadowLight.shadow.camera.left = -30;
    shadowLight.shadow.camera.near = 100;
    shadowLight.shadow.camera.far = 500;
    shadowLight.shadow.radius = 5;
    const shadowCameraHelper = new THREE.CameraHelper(shadowLight.shadow.camera);
    scene.add(shadowCameraHelper);

    const directionalLight3 = new THREE.DirectionalLight(0xff00cc, 0.6);
    directionalLight3.position.set(0, 1, 0);
    

    scene.add(ambientLight, directionalLight1, shadowLight, shadowLight.target, directionalLight3);
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
        //updateInfoWindow(camera.position.x, camera.position.z, meshCount);

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
        let selectedControl_2D = document.getElementById('cameraTo2D');
        
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
            if(activeToolId == 'connect') {
                
                activeToolId = null;
                toolId = null;
                flag_to_hover = 0;
                selectedControl_Connect.classList.remove('selected');
                document.removeEventListener('mousedown', handleConnectHover);
            }
            if(activeToolId == 'cameraTo2D') {
                
                activeToolId = null;
                toolId = null;
                selectedControl_2D.classList.remove('selected');
                document.removeEventListener('mousedown', handleCameraTo2D);
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
            if (activeToolId == 'connect') {
                flag_to_hover = 1;
                document.addEventListener('mousemove', handleConnectHover, false);
            } else {
                flag_to_hover = 0;
                document.removeEventListener('mousemove', handleConnectHover, false);
            }

            if (activeToolId == 'cameraTo2D') {
                document.addEventListener('mousedown', handleCameraTo2D);
            } else {
                document.removeEventListener('mousedown', handleCameraTo2D);
            }

            if (activeToolId == 'start') {
                
            } else {
               
            }

            if (activeToolId == 'stop') {
                
            } else {
               
            }
        }
    }

    let leftButton = document.getElementById("left-button");
    let rightButton = document.getElementById("right-button");
    let startButton = document.getElementById("start-button");
    let pauseBGMButton = document.getElementById("pause-bgm");

    leftButton.onclick = function(){
        console.log("왽");
        index--;
        myCharacter.changeMesh(index);
    }

    rightButton.onclick = function(){
        console.log("오");
        index++;
        myCharacter.changeMesh(index);
    }

    startButton.onclick = function(){
        console.log("start");
        myCharacter._currentAnimationAction.fadeOut(0.5);
        myCharacter._currentAnimationAction = myCharacter._animationMap["Armature|Idle"];
        myCharacter._currentAnimationAction.reset().fadeIn(0.5).play();
        animateCamera();
        leftButton.style.display = "none";
        rightButton.style.display = "none";
        startButton.style.display = "none";        
        myCharacter._start = true;
    }

    pauseBGMButton.onclick = function(){
        console.log("멈춰");
        const bgm = document.getElementById('bgm');
        if (bgm.paused) {
            bgm.play();
        } else {
            bgm.pause();
        }
    }

    // 카메라 애니메이션 함수
    function animateCamera() {
        var startTimestamp = null;

        function animate(timestamp) {
            console.log(timestamp);
            console.log(camera.position);
            if (!startTimestamp) startTimestamp = timestamp;

            var progress = (timestamp - startTimestamp) / animationDuration;

            if (progress < 1) {
                // 이동 중인 경우
                camera.position.lerpVectors(cameraPosition, targetPosition, progress);
                requestAnimationFrame(animate);
            } else {
                console.log("설마");
                // 애니메이션 완료
                camera.position.copy(targetPosition);
            }
            // 렌더링 및 다른 업데이트 로직
            render();
        }
        requestAnimationFrame(animate);
    }

    ///////////////////////////////////////////////

    function handleCameraTo2D(event){
        var previous_camera = camera;
        
        cameraTo2D(camera);
    }

    function handleConnectHover(event) {
        if ( flag_to_hover === 0 ) return;
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
    
        // 레이캐스팅 결과
        const intersects = raycaster.intersectObjects(scene.children);
    
        // 모든 물체의 빛을 초기화 (원래 색으로 되돌리기)
        scene.children.forEach(object => {
            if (object.material && object.material.emissive) {
                object.material.emissive.set(0x000000); // 원래 색으로 초기화
            }
        });
    
        if (intersects.length > 0) {
            const intersection = intersects[0];
            const object = intersection.object;
    
            // 빛나게 하는 코드 추가
            if (object.userData.name === undefined) {
                object.material.emissive.set(0x808080); // 빛나게 하는 색상
            }
        }

        document.addEventListener('mousedown', handleConnectClick, false );
    }

    let selectedObjects = [];
    
    function handleConnectClick(event) {
        if ( flag_to_hover === 0 ) return;
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
    
        // 레이캐스팅 결과
        const intersects = raycaster.intersectObjects(scene.children);

        // 선택된 객체를 저장
        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (object.userData.name === undefined) {
                // 빨간색으로 변경
                object.material = new THREE.MeshStandardMaterial({
                    color: 0xff0000,
                    emissive: 0xff0000,
                    transparent: true,
                    opacity: 0.5,
                });
    
                selectedObjects.push(object);
                console.log(selectedObjects);
                
                // 두 객체가 선택되었을 때 연결선 생성
                if (selectedObjects.length === 2) {
                    const object1 = selectedObjects[0];
                    const object2 = selectedObjects[1];

                    const position1 = object1.position;
                    const position2 = object2.position;
        
                    //console.log("Map 1 position: ", position1.x, position1.y);
                    //console.log("Map 2 position: ", position2.x, position2.y);
        
                    connectObjects( object1, object2);
                    //console.log(" selectedObjects[0]: ", selectedObjects[0]);
                    //console.log(" selectedObjects[1]: ", selectedObjects[1]);
                
                }
            }
        }
    }

    const connectedObjects  = [];

    function connectObjects(object1, object2) {
        if ( flag_to_hover === 0 ) return;
        // 중복 체크
        if (!isAlreadyConnected(object1, object2)) {
            // 중복이 아니면 연결된 객체 배열에 추가
            connectedObjects.push({ object1, object2 });

            const geometry = new THREE.BufferGeometry();
            const vertices = new Float32Array([
                object1.position.x, object1.position.y, object1.position.z,
                object2.position.x, object2.position.y, object2.position.z
            ]);

            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

            const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
            const line = new THREE.Line(geometry, material);

            scene.add(line);
            } else {
            console.log('Already connected!');
            }

            // 연결된 객체를 저장
            object1.userData.connectedObject = object2;
            object2.userData.connectedObject = object1;

            // 선택된 객체 초기화
            selectedObjects = [];
            console.log(connectedObjects);
            moveTrain(connectedObjects);
    }

    function isAlreadyConnected(object1, object2) {
        if ( flag_to_hover === 0 ) return;


        // 이미 연결된 객체인지 확인
        for (const connection of connectedObjects) {
            if (
                (connection.object1 === object1 && connection.object2 === object2) ||
                (connection.object1 === object2 && connection.object2 === object1)
            ) {
                return true;
            }
        }
        return false;
    }

    function moveTrain(connectedObjects) {
        const train = new Train(scene, connectedObjects, 3, camera, renderer);
        train.start();
    }
    
    function handleNPCPlacement(event) {
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
            createNPC(scene, x, y);
        }
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
    
            // 여기에 road 생성 코드 추가 (createRoad 함수 호출 등)
            createBuilding(scene, x, y, buildingList);
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
    // scene.onMouseDown = onMouseDown;
    // scene.onMouseMove = onMouseMove;
    // scene.onMouseUp = onMouseUp;
    // scene 객체 반환
    return scene;
}