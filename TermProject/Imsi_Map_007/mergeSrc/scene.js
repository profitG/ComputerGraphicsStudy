// scene.js

import * as THREE from "../../build/three.module.js";
import { GLTFLoader } from "../../examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "../../examples/jsm/controls/OrbitControls.js";
import { Sky } from "../../examples/jsm/objects/Sky.js";
import { GUI } from "../../examples/jsm/libs/lil-gui.module.min.js";
import { cameraTo2D } from "./cameraTo2D.js";
import { MyCharacter } from "./myCharacter.js";
import { npc } from "./npc2.js";
import { NewNPC } from "./newNPC.js";
import { createCity as createCityObject } from "./city.js";
import { createRoad } from "./road.js";
import { createBuilding } from "./Building.js";
import { createHouse } from "./house.js";
import { createStation } from "./Station.js";
import { Train } from "./train.js";
import { TREE } from "./Tree.js";
import { STREETLIGHT } from "./StreetLight.js";
import {FLOWER} from "./Flower.js";
import { BENCH } from "./Bench.js";

/**
 * 3D 시뮬레이션의 주요 씬을 생성합니다.
 * @returns {Object} - 3D 씬과 초기화 및 렌더링을 담당하는 함수들을 포함하는 객체입니다.
 */

const buildingList = [];
const HouseList = [];
const StationList = [];
const StationList_ = [];
const NPCList = [];
const treeList = [];
const streetLight = [];

var myCharacter;
var cameraPosition = new THREE.Vector3(-2, 4, 10);
var targetPosition = new THREE.Vector3(-17, 12, 3); // 최종 목표 카메라 위치
var animationDuration = 3000; // 이동 애니메이션의 지속 시간 (밀리초)
var index = 0;
var camera2D = false;

let flag_to_hover = 0;
let positon_Num = 0; // 열차정보를 담고있음
var shadowLight;
let angle = 0;
let radius = 700;
let clock;

export function createScene() {
  // 씬 생성
  const scene = new THREE.Scene();
  let activeToolId = "";

  // 렌더러 생성 및 설정
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById("render-target").appendChild(renderer.domElement);

  var camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    2000000
  );
  //createCamera(document.getElementById('root-window'));
  //const controls = new OrbitControls(camera, document.getElementById('render-target'));

  // 초기화 함수
  function initialize() {
    clock = new THREE.Clock();
    const cityCount = 3; // 원하는 도시 개수로 조절
    const citySize = 100; // 원하는 도시 크기로 조절
    const cityInfo = [];
    const Xlist = [-30, -40, -40];
    const Ylist = [-40, -10, 40];
    for (let i = 0; i < cityCount; i++) {
      for (let j = 0; j < cityCount; j++) {
        const offsetX = i * citySize * 1 * 1.02; // 각 도시의 X 오프셋 조절
        const offsetY = j * citySize * 1 * 1.02; // 각 도시의 Y 오프셋 조절
        if (j < 2 && i < 2) {
          createStation(scene, offsetX + 30, offsetY - 30, StationList);
          for (let k = 0; k < 3; k++) {
            createBuilding(
              scene,
              offsetX + Xlist[k],
              offsetY + Ylist[k],
              buildingList,
              k // 빌딩 인덱스
            );
          }

          // 가로등 생성
          createStreetLights(offsetX + 42, offsetY - 26, 0); // station옆
          createStreetLights(offsetX + 15, offsetY - 26, 0); // station 옆
          createStreetLights(offsetX - 30, offsetY + 35, 1); // 주황 건물 옆
          createStreetLights(offsetX - 33, offsetY - 8, 0); // 젤 작은 건물 옆
          createStreetLights(offsetX - 28, offsetY - 47, 2); // 젤 높은 건물 옆

          // station 뒤 나무 생성
          for(let k = 0; k < 5; k++){
            createTrees(offsetX + 20 + 5 * k , offsetY - 40);
          }

          // 빌딩 뒤 나무 생성
          for(let k = 0; k < 3; k++){
            createTrees(offsetX - 40, offsetY - 45 + 5 * k);
          }
          createTrees(offsetX - 47, offsetY + 7);




          // 꽃과 벤치 생성
          createBenches(offsetX, offsetY + 45, 0);
          createFlowers(offsetX - 7, offsetY + 45);
          createFlowers(offsetX + 7, offsetY + 45);

          createBenches(offsetX, offsetY - 45, 1);
          createFlowers(offsetX - 7, offsetY - 45);
          createFlowers(offsetX + 7, offsetY - 45);

          createBenches(offsetX - 47, offsetY, 2);
          createFlowers(offsetX - 45, offsetY);
          
          

          
        }
        const cityObject = createCityObject(citySize);

        const infoContainer = document.getElementById("info-panel");

        const infoElement = document.createElement("div");
        infoElement.id = `city-info-${i}`;
        infoElement.className = "city-info";
        infoContainer.appendChild(infoElement);

        cityInfo.push({
          name: `City ${i + 1}`,
          population: Math.floor(Math.random() * 1000000),
        });
        console.log(StationList);

        updateInfoWindow(cityInfo);

        cityObject.mesh.position.set(offsetX, 0, offsetY);
        console.log(cityObject.mesh);

        scene.add(cityObject.mesh);
      }
    }

    myCharacter = new MyCharacter(scene, renderer, camera);
    camera.position.set(-2, 4, 10);

    initSky();

    setupLights(scene);

    // 여기에 다른 초기화 로직 추가 (도시 객체를 이용하여 씬 초기 상태 설정)
  }

  function createTrees(x, y){
    const TreeInstance = new TREE(scene, x, y);
    treeList.push(TreeInstance);
  }

  function createStreetLights(x, y, k){
    const StreetLightInstance = new STREETLIGHT(scene, x, y, k);
    streetLight.push(StreetLightInstance);
  }

  function createFlowers(x, y){
    const FlowerInstance = new FLOWER(scene, x, y);
  }

  function createBenches(x, y, k){
    const BenchInstance = new BENCH(scene, x, y, k);
  }

  function initSky() {
    let sky = new Sky();
    console.log(sky.position);
    sky.position.set(100.0, 0.0, 100.0);
    sky.scale.setScalar(50000);
    scene.add(sky);

    let sun = new THREE.Vector3();

    /// GUI

    const effectController = {
      turbidity: 10,
      rayleigh: 3,
      mieCoefficient: 0.005,
      mieDirectionalG: 0.9,
      elevation: 5,
      azimuth: 180,
      exposure: renderer.toneMappingExposure,
    };

    function guiChanged() {
      const uniforms = sky.material.uniforms;
      uniforms["turbidity"].value = effectController.turbidity;
      uniforms["rayleigh"].value = effectController.rayleigh;
      uniforms["mieCoefficient"].value = effectController.mieCoefficient;
      uniforms["mieDirectionalG"].value = effectController.mieDirectionalG;

      const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
      const theta = THREE.MathUtils.degToRad(effectController.azimuth);

      sun.setFromSphericalCoords(1, phi, theta);

      console.log(sun);
      uniforms["sunPosition"].value.copy(sun);

      renderer.toneMappingExposure = effectController.exposure;
      renderer.render(scene, camera);
    }

    const gui = new GUI();

    gui.add(effectController, "turbidity", 0.0, 20.0, 0.1).onChange(guiChanged);
    gui.add(effectController, "rayleigh", 0.0, 4, 0.001).onChange(guiChanged);
    gui
      .add(effectController, "mieCoefficient", 0.0, 0.1, 0.001)
      .onChange(guiChanged);
    gui
      .add(effectController, "mieDirectionalG", 0.0, 1, 0.001)
      .onChange(guiChanged);
    gui.add(effectController, "elevation", 0, 90, 0.1).onChange(guiChanged);
    gui.add(effectController, "azimuth", -180, 180, 0.1).onChange(guiChanged);
    gui.add(effectController, "exposure", 0, 1, 0.0001).onChange(guiChanged);

    guiChanged();
  }

  function setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

    shadowLight = new THREE.DirectionalLight(0xf0f0f0, 3);
    shadowLight.position.z = 100;
    shadowLight.target.position.set(0, 0, 0);

    shadowLight.castShadow = true;
    shadowLight.shadow.mapSize.width = 3000;
    shadowLight.shadow.mapSize.height = 3000;
    shadowLight.shadow.camera.top = 50;
    shadowLight.shadow.camera.right = 150;
    shadowLight.shadow.camera.bottom = -200;
    shadowLight.shadow.camera.left = -150;
    shadowLight.shadow.camera.near = 300;
    shadowLight.shadow.camera.far = 1500;
    shadowLight.shadow.radius = 5;
    const shadowCameraHelper = new THREE.CameraHelper(
      shadowLight.shadow.camera
    );
    scene.add(shadowCameraHelper);

    scene.add(ambientLight, shadowLight, shadowLight.target);
  }

  function updateInfoWindow(newCityInfo) {
    const infoList = document.getElementById("info-panel");
    if (!infoList || newCityInfo.length === 0) {
      console.error(
        'Error: Unable to find the element with id "city-info-list" or newCityInfo is empty.'
      );
      return;
    }

    // const newCity = newCityInfo[newCityInfo.length - 1];

    // // newCity가 유효한 객체인지 확인
    // if (newCity && newCity.name && newCity.population) {
    //   const listItem = document.createElement("li");
    //   listItem.innerHTML = `<strong>${newCity.name}</strong>: 인구 - ${newCity.population}`;
    //   infoList.appendChild(listItem);
    // }
  }

  // 렌더링 루프 함수
  function render() {
    requestAnimationFrame(render);
    animate();

    // 렌더링 전에 정보창 업데이트
    const meshCount = scene.children.length;
    updateInfoWindow(camera.position.x, camera.position.z, meshCount);

    renderer.render(scene, camera);
  }

  function setActiveToolId(event, toolId) {
    let selectedControl_npc = document.getElementById("button-npc");
    let selectedControl_road = document.getElementById("button-road");
    let selectedControl_building = document.getElementById("button-building");
    let selectedControl_house = document.getElementById("button-house");
    let selectedControl_station = document.getElementById("button-station");
    let selectedControl_Connect = document.getElementById("button-connect");
    let selectedControl_remove = document.getElementById("button-remove");
    let selectedControl_start = document.getElementById("button-start");
    let selectedControl_stop = document.getElementById("button-stop");

    if (activeToolId === toolId) {
      // 이미 선택된 도구를 다시 클릭하면 선택 취소

      if (activeToolId == "NPC") {
        activeToolId = null;
        toolId = null;
        selectedControl_npc.classList.remove("selected");
        document.removeEventListener("mousedown", handleNPCPlacement);
      }

      if (activeToolId == "road") {
        activeToolId = null;
        toolId = null;
        selectedControl_road.classList.remove("selected");
        document.removeEventListener("mousedown", handleRoadPlacement);
      }

      if (activeToolId == "building") {
        activeToolId = null;
        toolId = null;
        selectedControl_building.classList.remove("selected");
        document.removeEventListener("mousedown", handleBuildingPlacement);
      }

      if (activeToolId == "house") {
        activeToolId = null;
        toolId = null;
        selectedControl_house.classList.remove("selected");
        document.removeEventListener("mousedown", handleHousePlacement);
      }

      if (activeToolId == "station") {
        activeToolId = null;
        toolId = null;
        selectedControl_station.classList.remove("selected");
        document.removeEventListener("mousedown", handleStationPlacement);
      }

      if (activeToolId == "remove") {
        activeToolId = null;
        toolId = null;
        selectedControl_remove.classList.remove("selected");
        document.removeEventListener("mousedown", handleRemovePlacement);
      }
      if (activeToolId == "connect") {
        activeToolId = null;
        toolId = null;
        flag_to_hover = 0;
        selectedControl_Connect.classList.remove("selected");
        document.removeEventListener("mousedown", handleConnectHover);
      }

      if (activeToolId == "start") {
        activeToolId = null;
        toolId = null;
        selectedControl_start.classList.remove("selected");
      }

      if (activeToolId == "stop") {
        activeToolId = null;
        toolId = null;
        selectedControl_stop.classList.remove("selected");
      }
    } else {
      activeToolId = toolId;

      if (activeToolId === "NPC") {
        // 마우스 클릭 이벤트 리스너 등록
        document.addEventListener("mousedown", handleNPCPlacement);
      } else {
        // road가 아닌 다른 도구가 선택되면 리스너 제거
        document.removeEventListener("mousedown", handleNPCPlacement);
      }

      if (activeToolId === "road") {
        // 마우스 클릭 이벤트 리스너 등록
        document.addEventListener("mousedown", handleRoadPlacement);
      } else {
        // road가 아닌 다른 도구가 선택되면 리스너 제거
        document.removeEventListener("mousedown", handleRoadPlacement);
      }

      if (activeToolId === "building") {
        // 마우스 클릭 이벤트 리스너 등록
        document.addEventListener("mousedown", handleBuildingPlacement);
      } else {
        // road가 아닌 다른 도구가 선택되면 리스너 제거
        document.removeEventListener("mousedown", handleBuildingPlacement);
      }

      if (activeToolId === "house") {
        // 마우스 클릭 이벤트 리스너 등록
        document.addEventListener("mousedown", handleHousePlacement);
      } else {
        // road가 아닌 다른 도구가 선택되면 리스너 제거
        document.removeEventListener("mousedown", handleHousePlacement);
      }

      if (activeToolId === "station") {
        // 마우스 클릭 이벤트 리스너 등록
        document.addEventListener("mousedown", handleStationPlacement);
      } else {
        // road가 아닌 다른 도구가 선택되면 리스너 제거
        document.removeEventListener("mousedown", handleStationPlacement);
      }

      if (activeToolId == "remove") {
        // 마우스 클릭 이벤트 리스너 등록
        document.addEventListener("mousedown", handleRemovePlacement);
      } else {
        // remove가 아닌 다른 도구가 선택되면 리스너 제거
        document.removeEventListener("mousedown", handleRemovePlacement);
      }
      if (activeToolId == "connect") {
        flag_to_hover = 1;
        document.addEventListener("mousemove", handleConnectHover, false);
      } else {
        flag_to_hover = 0;
        document.removeEventListener("mousemove", handleConnectHover, false);
      }

      if (activeToolId == "start") {
        console.log("시작?");
        handleGameStart();
      } else {
        console.log("해제");
      }

      if (activeToolId == "stop") {
      } else {
      }

      if (activeToolId == "gameStart") {
        document.getElementById("ui-toolbar").style.display = "block";
        document.getElementById("title-bar").style.display = "flex";
        document.getElementById("info-panel").style.display = "block";
        document.getElementById("info-details").style.display = "block";
        document.getElementById("start-panel").style.display = "none";
        myCharacter._currentAnimationAction.fadeOut(0.5);
        myCharacter._currentAnimationAction =
          myCharacter._animationMap["Armature|Idle"];
        myCharacter._currentAnimationAction.reset().fadeIn(0.5).play();
        animateCamera();
        leftButton.style.display = "none";
        rightButton.style.display = "none";
        myCharacter._start = true;
      }
    }
  }

  let leftButton = document.getElementById("left-button");
  let rightButton = document.getElementById("right-button");
  let pauseBGMButton = document.getElementById("pause-bgm");
  let camera2DButton = document.getElementById("cameraTo2D");

  leftButton.onclick = function () {
    index--;
    myCharacter.changeMesh(index);
  };

  rightButton.onclick = function () {
    index++;
    myCharacter.changeMesh(index);
  };

  // 카메라 애니메이션 함수
  function animateCamera() {
    var startTimestamp = null;

    function cameraMove(timestamp) {
      if (!startTimestamp) startTimestamp = timestamp;

      var progress = (timestamp - startTimestamp) / animationDuration;

      if (progress < 1) {
        // 이동 중인 경우
        camera.position.lerpVectors(cameraPosition, targetPosition, progress);
        requestAnimationFrame(cameraMove);
      } else {
        // 애니메이션 완료
        camera.position.copy(targetPosition);
      }
    }
    requestAnimationFrame(cameraMove);
  }

  pauseBGMButton.onclick = function () {
    const bgm = document.getElementById("bgm");
    if (bgm.paused) {
      bgm.play();
    } else {
      bgm.pause();
    }
  };

  camera2DButton.onclick = function () {
    camera2D = !camera2D;
    myCharacter._camera2D = camera2D;
    if (camera2D) {
      cameraTo2D(camera);
      myCharacter._controls.target.set(200, 0, 200);
    } else {
      camera.position.set(
        myCharacter._model.position.x - 2,
        4,
        myCharacter._model.position.z + 10
      );
      camera.lookAt(myCharacter._model.position);
    }
  };

  function handleGameStart(event) {
    console.log("실행됐다");
    const tmp = new NewNPC(scene, camera, renderer, buildingList, StationList);
    NPCList.push(tmp);
  }

  function handleConnectHover(event) {
    if (flag_to_hover === 0) return;
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // 레이캐스팅 결과
    const intersects = raycaster.intersectObjects(scene.children);

    // 모든 물체의 빛을 초기화 (원래 색으로 되돌리기)
    scene.children.forEach((object) => {
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

    document.addEventListener("mousedown", handleConnectClick, false);
  }

  let selectedObjects = [];

  function handleConnectClick(event) {
    if (flag_to_hover === 0) return;
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

        // 두 객체가 선택되었을 때 연결선 생성
        if (selectedObjects.length === 2) {
          const object1 = selectedObjects[0];
          const object2 = selectedObjects[1];

          const position1 = object1.position;
          const position2 = object2.position;

          //console.log("Map 1 position: ", position1.x, position1.y);
          //console.log("Map 2 position: ", position2.x, position2.y);

          connectObjects(object1, object2);
          //console.log(" selectedObjects[0]: ", selectedObjects[0]);
          //console.log(" selectedObjects[1]: ", selectedObjects[1]);
        }
      }
    }
  }

  const connectedObjects = [];

  function connectObjects(object1, object2) {
    if (flag_to_hover === 0) return;
    // 중복 체크
    if (!isAlreadyConnected(object1, object2)) {
      // 중복이 아니면 연결된 객체 배열에 추가
      connectedObjects.push({ object1, object2 });

      const geometry = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        object1.position.x,
        object1.position.y,
        object1.position.z,
        object2.position.x,
        object2.position.y,
        object2.position.z,
      ]);

      geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

      const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
      const line = new THREE.Line(geometry, material);

      scene.add(line);
    } else {
    }

    // 연결된 객체를 저장
    object1.userData.connectedObject = object2;
    object2.userData.connectedObject = object1;

    // 선택된 객체 초기화
    selectedObjects = [];
    moveTrain(connectedObjects);
  }

  function isAlreadyConnected(object1, object2) {
    if (flag_to_hover === 0) return;

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
    // const mouse = new THREE.Vector2();
    // mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    // mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // const raycaster = new THREE.Raycaster();
    // raycaster.setFromCamera(mouse, camera);

    // // 레이캐스팅 결과
    // const intersects = raycaster.intersectObjects(scene.children);

    // if (intersects.length > 0) {
    //   // 첫 번째 객체의 위치에 road 생성
    //   const intersection = intersects[0];
    //   const x = intersection.point.x;
    //   const y = intersection.point.z; // Z 좌표를 사용할 수 있도록 변경

    //   // 여기에 road 생성 코드 추가 (createRoad 함수 호출 등)
    //   createNPC(scene, x, y);
    // }
    // 화면 좌표를 월드 좌표로 변환
    let start_building_idx = Math.floor(
      Math.random() * (buildingList.length - 1)
    );
    let start_building = buildingList[start_building_idx];
    let dst_building_idx = Math.floor(
      Math.random() * (buildingList.length - 1)
    );
    while (
      buildingList[dst_building_idx].cityinfo.index ==
      start_building.cityinfo.index
    ) {
      dst_building_idx = Math.floor(Math.random() * (buildingList.length - 1));
    }
    let dst_building = buildingList[dst_building_idx];
    const newNPC = new npc(scene, start_building, dst_building, StationList_);
  }
  function handleRemovePlacement(event) {
    // 마우스의 클릭 위치를 가져옴
    const mousePosition = getMousePosition(event.clientX, event.clientY);

    // 선택된 도구가 Remove이면 해당 위치에 있는 객체를 찾아 삭제
    if (activeToolId === "remove") {
      const intersectedObject = getIntersectedObject(mousePosition);

      if (intersectedObject) {
        // 객체를 삭제하고 씬에서 제거
        scene.remove(intersectedObject.mesh);

        // buildingList에서 해당 빌딩 제거
        const index1 = buildingList.findIndex(
          (building) => building.mesh === intersectedObject.mesh
        );
        if (index1 !== -1) {
          buildingList.splice(index1, 1);
        }

        // HouseList에서 해당 집 제거
        const index2 = HouseList.findIndex(
          (House) => House.mesh === intersectedObject.mesh
        );
        if (index2 !== -1) {
          HouseList.splice(index2, 1);
        }

        // StationList에서 해당 역 제거
        const index3 = StationList.findIndex(
          (Station) => Station.mesh === intersectedObject.mesh
        );
        if (index3 !== -1) {
          HouseList.splice(index3, 1);
        }
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
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = (-(clientY - rect.top) / rect.height) * 2 + 1;
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

  function animate(time) {
    console.log("실행은 되니");
    angle += 0.001;

    // directionalLight의 위치 업데이트
    shadowLight.position.x = radius * Math.cos(angle);
    shadowLight.position.y = radius * Math.sin(angle);
  }

  // 시작 함수
  function start() {
    render();
  }

  function stop() {}

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
