// scene.js

import * as THREE from "../../build/three.module.js";
import { GLTFLoader } from "../../examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "../../examples/jsm/controls/OrbitControls.js";
import { cameraTo2D } from "./cameraTo2D.js";
import { MyCharacter } from "./myCharacter.js";
import { NewNPC } from "./newNPC.js";
import { createCity as createCityObject } from "./city.js";
import { createRoad } from "./road.js";
import { createBuilding } from "./Building.js";
import { createHouse } from "./house.js";
import { createStation } from "./Station.js";
import { Train } from "./train.js";

/**
 * 3D 시뮬레이션의 주요 씬을 생성합니다.
 * @returns {Object} - 3D 씬과 초기화 및 렌더링을 담당하는 함수들을 포함하는 객체입니다.
 */
const cityInfo = [];
const buildingList = [];
const HouseList = [];
const StationList = [];

const npcList = [];
const connectedObjects_Line1 = [];
const connectedObjects_Line2 = [];
const connectedObjects_Line3 = [];

const adjacencyList_Line1 = {};
const adjacencyList_Line2 = {};
const adjacencyList_Line3 = {};

let flag_to_hover1 = 0;
let flag_to_hover2 = 0;
let flag_to_hover3 = 0;

let rail_Line1 = [];
let rail_Line2 = [];
let rail_Line3 = [];

let rail_info = new Array(3).fill([]);

var myCharacter;
var cameraPosition = new THREE.Vector3(-2, 4, 10);
var targetPosition = new THREE.Vector3(-17, 12, 3); // 최종 목표 카메라 위치
var animationDuration = 3000; // 이동 애니메이션의 지속 시간 (밀리초)
var index = 0;
var camera2D = false;
var shadowLight;
let angle = 0;
let radius = 700;
let clock;
let skybox;

let connectionTable = [];

let positon_Num = 0; // 열차정보를 담고있음

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
    3000
  );
  //createCamera(document.getElementById('root-window'));
  //const controls = new OrbitControls(camera, document.getElementById('render-target'));

  // 초기화 함수
  function initialize() {
    clock = new THREE.Clock();
    const cityCount = 3; // 원하는 도시 개수로 조절
    const citySize = 100; // 원하는 도시 크기로 조절

    for (let i = 0; i < cityCount * cityCount; i++) {
      connectionTable.push(new Array(cityCount * cityCount).fill([]));
    }

    const Xlist = [20, -10, -19];
    const Ylist = [13, -20, 18];
    var stationIndex = 0;
    for (let i = 0; i < cityCount; i++) {
      for (let j = 0; j < cityCount; j++) {
        const offsetX = i * citySize * 1 * 1.05; // 각 도시의 X 오프셋 조절
        const offsetY = j * citySize * 1 * 1.05; // 각 도시의 Y 오프셋 조절
        if (j < 16 && i < 16) {
          createStation(scene, offsetX, offsetY, StationList, stationIndex);
          stationIndex++;
        }

        for (let k = 0; k < 3; k++) {
          createBuilding(
            scene,
            offsetX + Xlist[k],
            offsetY + Ylist[k],
            buildingList
          );
        }
        let cityObject = createCityObject(citySize);

        const infoContainer = document.getElementById("info-panel");

        const infoElement = document.createElement("div");
        infoElement.id = `city-info-${i}`;
        infoElement.className = "city-info";
        infoContainer.appendChild(infoElement);

        cityInfo.push({
          name: `City ${i + 1}`,
          population: Math.floor(Math.random() * 1000000),
          x: offsetX,
          y: 0,
          z: offsetY,
          index: i,
          isTrainArrive: false,
        });

        // console.log(cityInfo);

        updateInfoWindow(cityInfo);

        cityObject.mesh.position.set(offsetX, 0, offsetY);

        scene.add(cityObject.mesh);
      }
    }
    myCharacter = new MyCharacter(scene, renderer, camera);
    camera.position.set(-2, 4, 10);

    scene.background = new THREE.CubeTextureLoader()
      .setPath("./Model/Background/")
      .load([
        "clouds1_east.bmp",
        "clouds1_west.bmp",
        "clouds1_up.bmp",
        "clouds1_down.bmp",
        "clouds1_north.bmp",
        "clouds1_south.bmp",
      ]);

    setupLights(scene);

    const raycaster = new THREE.Raycaster();

    // console.log(StationList);
    // 여기에 다른 초기화 로직 추가 (도시 객체를 이용하여 씬 초기 상태 설정)
  }

  function setupLights() {
    const ambientLight = new THREE.AmbientLight(0x000000, 0.6);

    shadowLight = new THREE.DirectionalLight(0x000000, 3);
    shadowLight.position.z = 100;
    shadowLight.target.position.set(0, 0, 0);

    shadowLight.castShadow = true;
    shadowLight.shadow.mapSize.width = 1024;
    shadowLight.shadow.mapSize.height = 1024;
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
    // 렌더링 전에 정보창 업데이트
    const meshCount = scene.children.length;
    updateInfoWindow(camera.position.x, camera.position.z, meshCount);
    animate();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  function setActiveToolId(event, toolId) {
    let selectedControl_npc = document.getElementById("button-npc");
    let selectedControl_road = document.getElementById("button-road");
    let selectedControl_building = document.getElementById("button-building");
    let selectedControl_house = document.getElementById("button-house");
    let selectedControl_station = document.getElementById("button-station");
    let selectedControl_remove = document.getElementById("button-remove");
    let selectedControl_start = document.getElementById("button-start");
    let selectedControl_stop = document.getElementById("button-stop");

    let selectedControl_Connect_Line1 = document.getElementById(
      "button-connect_Line1"
    );
    let selectedControl_Connect_Line2 = document.getElementById(
      "button-connect_Line2"
    );
    let selectedControl_Connect_Line3 = document.getElementById(
      "button-connect_Line3"
    );

    if (activeToolId === toolId) {
      // 이미 선택된 도구를 다시 클릭하면 선택 취소
      console.log("Tool selection canceled.");

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

      if (activeToolId == "connect_Line1") {
        activeToolId = null;
        toolId = null;
        flag_to_hover1 = 0;
        selectedControl_Connect_Line1.classList.remove("selected");
        document.removeEventListener("mousedown", handleConnectHover_Line1);
        // rail_Line1 = StationList;
        // for(let i = 1; i<rail_Line1.length; i++){
        //   const x = rail_Line1[i-1].index;
        //   const y = rail_Line1[i].index;
        //   connectionTable[x][y] = connectionTable[x][y].concat(1);
        //   connectionTable[y][x] = connectionTable[y][x].concat(1);
        //   console.log(x, y);
        // }
        // console.log(connectionTable);

        for (let i = 0; i < rail_Line1.length; i++) {
          rail_info[0] = rail_info[0].concat(rail_Line1[i].index);
        }
        console.log(rail_info);
        let isCircleLine1 = false;
        if (rail_Line1[0] == rail_Line1[rail_Line1.length - 1]) {
          isCircleLine1 = true;
          rail_Line1.pop();
          console.log(" rail_Lin1: ", rail_Line1);
        }
        for (let i = 0; i < npcList.length; i++) {
          npcList[i].updateRailInfo(rail_info);
        }
        console.log(rail_info);
        //서클라인 변경 필요함.
        const myTrain1 = new Train(scene, rail_Line1, 2.0, isCircleLine1, 0);
        myTrain1.start();
      }

      if (activeToolId == "connect_Line2") {
        activeToolId = null;
        toolId = null;
        flag_to_hover2 = 0;
        selectedControl_Connect_Line2.classList.remove("selected");
        document.removeEventListener("mousedown", handleConnectHover_Line2);
        // rail_Line1 = StationList;
        // for(let i = 1; i<rail_Line2.length; i++){
        //   const x = rail_Line2[i-1].index;
        //   const y = rail_Line2[i].index;
        //   connectionTable[x][y] = connectionTable[x][y].concat(2);
        //   connectionTable[y][x] = connectionTable[y][x].concat(2);
        //   console.log(x, y);
        // }

        for (let i = 0; i < rail_Line2.length; i++) {
          rail_info[1] = rail_info[1].concat(rail_Line2[i].index);
        }
        console.log(rail_info);

        let isCircleLine2 = false;
        if (rail_Line2[0] == rail_Line2[rail_Line2.length - 1]) {
          isCircleLine2 = true;
          rail_Line2.pop();
        }
        for (let i = 0; i < npcList.length; i++) {
          npcList[i].updateRailInfo(rail_info);
        }
        // console.log(connectionTable);
        const myTrain2 = new Train(scene, rail_Line2, 2.0, isCircleLine2, 1);
        myTrain2.start();
      }

      if (activeToolId == "connect_Line3") {
        activeToolId = null;
        toolId = null;
        flag_to_hover3 = 0;
        selectedControl_Connect_Line3.classList.remove("selected");
        document.removeEventListener("mousedown", handleConnectHover_Line3);
        // rail_Line1 = StationList;
        // for(let i = 1; i<rail_Line3.length; i++){
        //   const x = rail_Line3[i-1].index;
        //   const y = rail_Line3[i].index;
        //   connectionTable[x][y] = connectionTable[x][y].concat(3);
        //   connectionTable[y][x] = connectionTable[y][x].concat(3);
        //   console.log(x, y);
        // }
        // console.log(connectionTable);

        for (let i = 0; i < rail_Line3.length; i++) {
          rail_info[2] = rail_info[2].concat(rail_Line3[i].index);
        }
        console.log(rail_info);

        let isCircleLine3 = false;
        if (rail_Line3[0] == rail_Line3[rail_Line3.length - 1]) {
          isCircleLine3 = true;
          rail_Line3.pop();
        }
        for (let i = 0; i < npcList.length; i++) {
          npcList[i].updateRailInfo(rail_info);
        }
        const myTrain3 = new Train(scene, rail_Line3, 2.0, isCircleLine3, 2);
        myTrain3.start();
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
      console.log("active" + activeToolId);

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
      if (activeToolId == "connect_Line1") {
        flag_to_hover1 = 1;
        document.addEventListener("mousemove", handleConnectHover_Line1, false);
      } else {
        flag_to_hover1 = 0;
        document.removeEventListener(
          "mousemove",
          handleConnectHover_Line1,
          false
        );
      }

      if (activeToolId == "connect_Line2") {
        flag_to_hover2 = 1;
        document.addEventListener("mousemove", handleConnectHover_Line2, false);
      } else {
        flag_to_hover2 = 0;
        document.removeEventListener(
          "mousemove",
          handleConnectHover_Line2,
          false
        );
      }

      if (activeToolId == "connect_Line3") {
        flag_to_hover3 = 1;
        document.addEventListener("mousemove", handleConnectHover_Line3, false);
      } else {
        flag_to_hover3 = 0;
        document.removeEventListener(
          "mousemove",
          handleConnectHover_Line3,
          false
        );
      }

      if (activeToolId == "start") {
      } else {
      }

      if (activeToolId == "stop") {
      } else {
      }

      if (activeToolId == "gameStart") {
        // console.log("들어갔니?");
        document.getElementById("ui-toolbar").style.display = "block";
        document.getElementById("title-bar").style.display = "flex";
        document.getElementById("info-panel").style.display = "block";
        document.getElementById("info-details").style.display = "block";
        document.getElementById("start-panel").style.display = "none";
        // console.log("start");
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
    console.log("왽");
    index--;
    myCharacter.changeMesh(index);
  };

  rightButton.onclick = function () {
    console.log("오");
    index++;
    myCharacter.changeMesh(index);
  };

  // 카메라 애니메이션 함수
  function animateCamera() {
    var startTimestamp = null;

    function animateCameraMove(timestamp) {
      if (!startTimestamp) startTimestamp = timestamp;

      var progress = (timestamp - startTimestamp) / animationDuration;

      if (progress < 1) {
        // 이동 중인 경우
        camera.position.lerpVectors(cameraPosition, targetPosition, progress);
        requestAnimationFrame(animateCameraMove);
      } else {
        // 애니메이션 완료
        camera.position.copy(targetPosition);
      }
    }
    requestAnimationFrame(animateCameraMove);
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

  function handleConnectHover_Line1(event) {
    if (flag_to_hover1 === 0) return;

    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // 레이캐스팅 결과
    const intersects = raycaster.intersectObjects(scene.children);

    //console.log( "intersects1: ", intersects);

    // 모든 물체의 빛을 초기화 (원래 색으로 되돌리기)
    scene.children.forEach((object1) => {
      if (object1.material && object1.material.emissive) {
        object1.material.emissive.set(0x000000); // 원래 색으로 초기화
      }
    });

    if (intersects.length > 0) {
      const intersection = intersects[0];
      const object = intersection.object;

      //빛나게 하는 코드 추가
      if (object.userData.name === undefined) {
        object.material.emissive.set(0x808080); // 빛나게 하는 색상
      }
    }

    document.addEventListener("mousedown", handleConnectClick_Line1, false);
  }

  function handleConnectHover_Line2(event) {
    if (flag_to_hover2 === 0) return;
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // 레이캐스팅 결과
    const intersects2 = raycaster.intersectObjects(scene.children);

    // 모든 물체의 빛을 초기화 (원래 색으로 되돌리기)
    scene.children.forEach((object) => {
      if (object.material && object.material.emissive) {
        object.material.emissive.set(0x000000); // 원래 색으로 초기화
      }
    });

    if (intersects2.length > 0) {
      const intersection = intersects2[0];
      const object = intersection.object;

      // 빛나게 하는 코드 추가
      if (object.userData.name === undefined) {
        object.material.emissive.set(0x808080); // 빛나게 하는 색상
      }
    }

    document.addEventListener("mousedown", handleConnectClick_Line2, false);
  }

  function handleConnectHover_Line3(event) {
    if (flag_to_hover3 === 0) return;
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // 레이캐스팅 결과
    const intersects3 = raycaster.intersectObjects(scene.children);

    //console.log(" intersects3: ", intersects3);

    // 모든 물체의 빛을 초기화 (원래 색으로 되돌리기)
    scene.children.forEach((object) => {
      if (object.material && object.material.emissive) {
        object.material.emissive.set(0x000000); // 원래 색으로 초기화
      }
    });

    if (intersects3.length > 0) {
      const intersection = intersects3[0];
      const object = intersection.object;

      // 빛나게 하는 코드 추가
      if (object.userData.name === undefined) {
        object.material.emissive.set(0x808080); // 빛나게 하는 색상
      }
    }

    document.addEventListener("mousedown", handleConnectClick_Line3, false);
  }

  // let selectedObjects = [];

  function handleConnectClick_Line1(event) {
    if (flag_to_hover1 === 0) return;

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
          transparent: true,
          opacity: 0.5,
        });
        const objectposition = new THREE.Vector3(
          object.position.x,
          object.position.y,
          object.position.z
        );
        let minDistance = Infinity;
        let nearStationIndex;
        console.log(" StationList: ", StationList);
        for (var i = 0; i < StationList.length; i++) {
          const stationposition = new THREE.Vector3(
            StationList[i].x,
            // StationList[i].mesh.position.y,
            0,
            StationList[i].y
          );

          const distance = objectposition.distanceTo(stationposition);
          if (minDistance > distance) {
            nearStationIndex = i;
            minDistance = distance;
          }
        }
        //console.log("!!!!!!!!!", nearStationIndex);

        rail_Line1.push(StationList[nearStationIndex]);
        StationList[nearStationIndex].connectedRail.push(0);
        console.log(" rail_Line1 ", rail_Line1);
        // console.log(object);
        // console.log(selectedObjects);

        // 두 객체가 선택되었을 때 연결선 생성
        if (rail_Line1.length >= 2) {
          const object1 = rail_Line1[rail_Line1.length - 2];
          const object2 = rail_Line1[rail_Line1.length - 1];

          connectObjects_Line1(object1, object2);
        }
      }
    }
  }

  function handleConnectClick_Line2(event) {
    if (flag_to_hover2 === 0) return;
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
          color: 0x00ff00,
          transparent: true,
          opacity: 0.9,
        });
        const objectposition = new THREE.Vector3(
          object.position.x,
          object.position.y,
          object.position.z
        );
        let minDistance = Infinity;
        let nearStationIndex;
        for (var i = 0; i < StationList.length; i++) {
          const stationposition = new THREE.Vector3(
            StationList[i].x,
            // StationList[i].mesh.position.y,
            0,
            StationList[i].y
          );
          const distance = objectposition.distanceTo(stationposition);
          if (minDistance > distance) {
            nearStationIndex = i;
            minDistance = distance;
          }
        }
        //console.log("!!!!!!!!!", nearStationIndex);

        rail_Line2.push(StationList[nearStationIndex]);
        StationList[nearStationIndex].connectedRail.push(1);

        console.log(" rail_Line2: ", rail_Line2);
        // console.log(object);
        // console.log(selectedObjects);

        // 두 객체가 선택되었을 때 연결선 생성
        if (rail_Line2.length >= 2) {
          const object1 = rail_Line2[rail_Line2.length - 2];
          const object2 = rail_Line2[rail_Line2.length - 1];

          connectObjects_Line2(object1, object2);
        }
      }
    }
  }

  function handleConnectClick_Line3(event) {
    if (flag_to_hover3 === 0) return;
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
          color: 0x0000ff,
          emissive: 0x0000ff,
          transparent: true,
          opacity: 0.5,
        });
        const objectposition = new THREE.Vector3(
          object.position.x,
          object.position.y,
          object.position.z
        );
        let minDistance = Infinity;
        let nearStationIndex;
        for (var i = 0; i < StationList.length; i++) {
          const stationposition = new THREE.Vector3(
            StationList[i].x,
            // StationList[i].mesh.position.y,
            0,
            StationList[i].y
          );
          const distance = objectposition.distanceTo(stationposition);
          if (minDistance > distance) {
            nearStationIndex = i;
            minDistance = distance;
          }
        }
        // console.log("!!!!!!!!!", nearStationIndex);

        rail_Line3.push(StationList[nearStationIndex]);
        StationList[nearStationIndex].connectedRail.push(2);
        console.log(StationList[nearStationIndex]);
        // console.log(object);
        // console.log(selectedObjects);

        // 두 객체가 선택되었을 때 연결선 생성
        if (rail_Line3.length >= 2) {
          const object1 = rail_Line3[rail_Line3.length - 2];
          const object2 = rail_Line3[rail_Line3.length - 1];

          connectObjects_Line3(object1, object2);
        }
      }
    }
  }

  function connectObjects_Line1(object1, object2) {
    //console.log(" connectObjects_Line Obj1: ", object1);
    //console.log(" connectObjects_Line Obj2: ", object2);
    if (flag_to_hover1 === 0) return;

    console.log("activate connectObjects");
    // 중복 체크
    // if (!isAlreadyConnected(object1, object2)) {
    // 중복이 아니면 연결된 객체 배열에 추가

    // 필요 x connectedObjects_Line1.push({ object1, object2 });

    if (!adjacencyList_Line1[object1.mesh.id]) {
      adjacencyList_Line1[object1.mesh.id] = [];
    }
    if (!adjacencyList_Line1[object2.mesh.id]) {
      adjacencyList_Line1[object2.mesh.id] = [];
    }

    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      object1.x,
      0,
      object1.y,

      object2.x,
      0,
      object2.y,
    ]);

    adjacencyList_Line1[object1.mesh.id].push(object2.mesh.id);
    adjacencyList_Line1[object2.mesh.id].push(object1.mesh.id);

    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const line = new THREE.Line(geometry, material);

    scene.add(line);

    console.log("adjacencyList: ", adjacencyList_Line1);
    // } else {
    //   console.log("Already connected!");
    // }
  }

  function connectObjects_Line2(object1, object2) {
    if (flag_to_hover2 === 0) return;
    console.log("activate connectObjects");
    console.log(" Object1: ", object1);
    console.log(" Object1: ", object2);
    // 중복 체크
    // if (!isAlreadyConnected(object1, object2)) {
    // 중복이 아니면 연결된 객체 배열에 추가
    connectedObjects_Line2.push({ object1, object2 });

    if (!adjacencyList_Line2[object1.mesh.id]) {
      adjacencyList_Line2[object1.mesh.id] = [];
    }
    if (!adjacencyList_Line2[object2.mesh.id]) {
      adjacencyList_Line2[object2.mesh.id] = [];
    }

    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      object1.x,
      0,
      object1.y,

      object2.x,
      0,
      object2.y,
    ]);

    adjacencyList_Line2[object1.mesh.id].push(object2.mesh.id);
    adjacencyList_Line2[object2.mesh.id].push(object1.mesh.id);

    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

    const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const line = new THREE.Line(geometry, material);

    scene.add(line);

    console.log("adjacencyList: ", adjacencyList_Line2);
    // } else {
    //   console.log("Already connected!");
    // }
  }

  function connectObjects_Line3(object1, object2) {
    if (flag_to_hover3 === 0) return;
    console.log("activate connectObjects");
    console.log("Object1,2 : ", object1, object2);
    // 중복 체크
    // if (!isAlreadyConnected(object1, object2)) {
    // 중복이 아니면 연결된 객체 배열에 추가
    connectedObjects_Line3.push({ object1, object2 });

    if (!adjacencyList_Line3[object1.mesh.id]) {
      adjacencyList_Line3[object1.mesh.id] = [];
    }
    if (!adjacencyList_Line3[object2.mesh.id]) {
      adjacencyList_Line3[object2.mesh.id] = [];
    }

    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      object1.x,
      0,
      object1.y,

      object2.x,
      0,
      object2.y,
    ]);

    adjacencyList_Line3[object1.mesh.id].push(object2.mesh.id);
    adjacencyList_Line3[object2.mesh.id].push(object1.mesh.id);

    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const line = new THREE.Line(geometry, material);

    scene.add(line);

    console.log("adjacencyList: ", adjacencyList_Line3);
    // } else {
    //   console.log("Already connected!");
    // }
  }
  //   // 연결된 객체를 저장
  //   object1.userData.connectedObject = object2;
  //   object2.userData.connectedObject = object1;

  //   // 선택된 객체 초기화
  //   selectedObjects = [];
  //   console.log(connectedObjects);
  //   moveTrain(connectedObjects);
  // }

  // function isAlreadyConnected(object1, object2) {
  //   if (flag_to_hover === 0) return;

  //   // 이미 연결된 객체인지 확인
  //   for (const connection of connectedObjects) {
  //     if (
  //       (connection.object1 === object1 && connection.object2 === object2) ||
  //       (connection.object1 === object2 && connection.object2 === object1)
  //     ) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }

  // function moveTrain(connectedObjects) {
  //   const train = new Train(scene, connectedObjects, 3, camera, renderer);
  //   train.start();
  // }

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
    const myNPC = new NewNPC(
      scene,
      camera,
      renderer,
      buildingList,
      StationList,
      npcList
    );
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
        console.log(
          "Object removed at:",
          intersectedObject.x,
          intersectedObject.y
        );

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

        console.log(
          "Object removed at:",
          intersectedObject.x,
          intersectedObject.y
        );
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
      console.log("빌딩??");
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
    if (myCharacter._start) {
      angle += 0.001;

      // directionalLight의 위치 업데이트
      shadowLight.position.x = radius * Math.cos(angle);
      shadowLight.position.y = radius * Math.sin(angle);
    }
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
