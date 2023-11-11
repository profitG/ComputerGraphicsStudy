import * as THREE from "../../build/three.module.js";
import { GLTFLoader } from "../../examples/jsm/loaders/GLTFLoader.js";

let stationCounter = 2; // Station 순차적 ID를 위한 변수

export class Train {
  constructor(scene, stationList, speed, isCircleLine) {
    if (Train.instance) {
      // If an instance already exists, return the existing instance
      return Train.instance;
    }
    this.scene = scene;
    this.stationList = stationList;
    this.speed = speed;
    this.isLastStation = 0;
    this.deltaindex = 0;
    this.isCircleLine = isCircleLine;
    this.init();
  }

  init() {
    stationCounter = 2;
    const loader = new GLTFLoader();

    // 이제 Promise를 사용하여 GLTF 모델 로딩을 대기합니다.
    const loadModel = new Promise((resolve) => {
      loader.load("./LowpolyModel/train/scene.gltf", (gltf) => {
        const trainModel = gltf.scene;
        trainModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
          }
        });
        trainModel.rotation.x = Math.PI / 180;
        trainModel.rotation.y = Math.PI / 2;
        trainModel.scale.set(1, 1, 1);
        this.scene.add(trainModel);

        this.trainModel = trainModel; // trainModel을 Train 클래스 속성으로 설정
        resolve(); // Promise를 해결하여 모델이 로드되었음을 알림
      });
    });

    // GLTF 모델이 로드된 후에 update 메서드 호출
    loadModel.then(() => {
      const startStation = this.stationList[0];

      if (startStation) {
        this.position = { x: startStation.x, y: startStation.y + 0.5 };
        this.currentStationIndex = 0;
        this.trainModel.position.set(this.position.x, 0.5, this.position.y);
      } else {
        console.error("No station available for the train.");
      }

      this.position = { x: startStation.x, y: startStation.y + 0.5 };
      this.currentStationIndex = 0;
      this.trainModel.position.set(this.position.x, 0.5, this.position.y);

      // 기차 초기 위치 설정 후 애니메이션 시작
      this.start();
    });
  }

  update() {
    const StationID = `Station${stationCounter}`; // StationID를 Station1, Station2, ...로 설정
    const currentStation = this.stationList[this.currentStationIndex];
    const nextStation = this.stationList[this.currentStationIndex + 1];

    // 열차가 다음 역으로 이동할 수 있는 경우에만 출발역의 ​​열차 수 감소
    if (currentStation && currentStation.train > 0 && nextStation) {
      currentStation.train -= 1; // Decrease the train count
      console.log(
        `People leaving station at (${currentStation.x}, ${currentStation.y}): ${currentStation.train}`
      );
      updateInfoHTML({
        mark: StationID + " Leaving Train",
        x: currentStation.x,
        y: currentStation.y,
        train: currentStation.train,
      });
    }

    if (nextStation) {
      const targetX = nextStation.x;
      const targetY = nextStation.y;
      const distance = this.trainModel.position.distanceTo(
        new THREE.Vector3(targetX, 0.5, targetY)
      );

      if (distance < this.speed) {
        // Update the train's position to the next station
        this.trainModel.position.set(targetX, 0.5, targetY);
        this.currentStationIndex++;

        // Increase train count at the arriving station
        nextStation.train += 1; // Increase the train count
        console.log(
          `Train arriving at station (${nextStation.x}, ${nextStation.y}): ${nextStation.train}`
        );

        updateInfoHTML({
          mark: StationID + " Arriving Train",
          x: nextStation.x,
          y: nextStation.y,
          train: nextStation.train,
        });
      } else {
        // Move the train towards the next station
        const direction = new THREE.Vector3(targetX, 0.5, targetY)
          .sub(this.trainModel.position)
          .normalize()
          .multiplyScalar(this.speed);

        this.trainModel.position.add(direction);
      }
    }
  }

  start() {
    this.isAnimating = true;
    this.animate();
  }

  stop() {
    this.isAnimating = false;
  }

  animate() {
    if (this.isAnimating) {
      this.update();
      requestAnimationFrame(() => this.animate());
    }
  }
}

let prevX = null;
let prevY = null;
let prevMark = null;

// 기차 info를 html로 변환
function updateInfoHTML(info) {
  const InfoDiv = document.getElementById("station-info");
  const InfoWrapper = document.createElement("div");
  const InfoHeader = document.createElement("div");
  InfoHeader.innerHTML = `<div style="font-weight: bold;">Train Information:</div>`;
  InfoWrapper.appendChild(InfoHeader);
  InfoDiv.appendChild(InfoWrapper);

  const HTML = document.createElement("div");
  HTML.innerHTML = `
        <div>${info.mark} - X: ${info.x}, Y: ${info.y}, Train: ${info.train}</div>
    `;

  if (info.mark.includes("Arriving")) {
    InfoWrapper.appendChild(HTML);
    prevMark = info.mark;
    prevX = info.x;
    prevY = info.y;
  } else if (
    info.mark.includes("Leaving") &&
    (info.x !== prevX || info.y !== prevY || info.mark !== prevMark)
  ) {
    InfoWrapper.appendChild(HTML);
    stationCounter++;
  }
}
