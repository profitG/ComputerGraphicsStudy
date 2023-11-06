import * as THREE from "../../build/three.module.js";
import { GLTFLoader } from "../../examples/jsm/loaders/GLTFLoader.js";

export class NewNPC {
  constructor(scene, camera, renderer, buildingList, stationList) {
    this._scene = scene;
    this._camera = camera;
    this._renderer = renderer;
    this._model;
    this._speed = 3;
    this._buildingList = buildingList;
    this._stationList = stationList;
    this._meshArray = [
      "./Model/characters/Purple.gltf",
      "./Model/characters/Yellow.gltf",
      "./Model/characters/Green.gltf",
      "./Model/characters/Skyblue.gltf",
      "./Model/characters/Pink.gltf",
    ];

    this._startBuildingIndex;
    this._endBuildingIndex;
    this._nearStationIndex;
    this._nearStationPosition;
    this._startBuildingToNearStationRadian;
    this._AnimRequestFrame = requestAnimationFrame(this.render.bind(this));
    this._decideModelAndDecideRoot();
  }

  _decideModelAndDecideRoot() {
    // 모델 메쉬 결정하고 시작 빌딩 결정
    var minDistanceToNearStation = Infinity;
    this._modelIndex = Math.floor(Math.random() * this._meshArray.length);
    this._startBuildingIndex = Math.floor(
      Math.random() * this._buildingList.length
    );
    this._buildingPosition = new THREE.Vector3(
      this._buildingList[this._startBuildingIndex].x,
      0,
      this._buildingList[this._startBuildingIndex].y
    );

    // 시작 빌딩과 가까운 역의 인덱스 찾기
    for (let i = 0; i < this._stationList.length; i++) {
      const stationPosition = new THREE.Vector3(
        this._stationList[i].x,
        0,
        this._stationList[i].y
      );
      const distance = this._buildingPosition.distanceTo(stationPosition);

      if (distance < minDistanceToNearStation) {
        minDistanceToNearStation = distance;
        this._nearStationIndex = i;
      }
    }

    // 가까운 역의 위치
    this._nearStationPosition = new THREE.Vector3(
      this._stationList[this._nearStationIndex].x,
      0,
      this._stationList[this._nearStationIndex].t
    );

    // 빌딩과 가까운 역과의 각도
    this._startBuildingToNearStationRadian = Math.atan2(
      this._buildingPosition.x - this._nearStationPosition.x,
      this._buildingPosition.z - this._nearStationPosition.z
    );
    console.log("라디안: " + this._startBuildingToNearStationRadian);

    // 모델 load
    new GLTFLoader().load(this._meshArray[this._modelIndex], (gltf) => {
      console.log("npc 로드 중이니?");
      this._model = gltf.scene;
      const model = gltf.scene;
      model.scale.set(80, 80, 80);

      // 모델 빌딩 위치에 생성
      model.position.set(
        this._buildingList[this._startBuildingIndex].x,
        0,
        this._buildingList[this._startBuildingIndex].y
      );

      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
        }
      });

      const animationClips = gltf.animations; //gltf.animations는 THREE.AnimationClip[] 타입의 배열
      const mixer = new THREE.AnimationMixer(model);
      const animationsMap = {};

      animationClips.forEach((clip) => {
        const name = clip.name;
        animationsMap[name] = mixer.clipAction(clip);
      });

      this._scene.add(this._model);

      this._mixer = mixer; // 애니메이션 play하려면 mixer 객체를 프레임마다 업데이트 해줘야 함!
      this._animationMap = animationsMap;
      this._currentAnimationAction = this._animationMap["Armature|Walk"];
      this._currentAnimationAction.play();
      this._AnimRequestFrame = requestAnimationFrame(this.render.bind(this));
    });
  }

  update(time) {
    time *= 0.001; // second unit
    if (this._mixer) {
      const deltaTime = time - this._previousTime;
      this._mixer.update(deltaTime);

      const rotateQuaternion = new THREE.Quaternion();
      rotateQuaternion.setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        this._startBuildingToNearStationRadian + Math.PI
      );

      this._model.quaternion.rotateTowards(
        rotateQuaternion,
        THREE.MathUtils.degToRad(20)
      );

      // 모델이 걷는 부분
      console.log(this._buildingPosition, this._nearStationPosition);
      const walkDirection = new THREE.Vector3().subVectors(
        this._nearStationPosition,
        this._buildingPosition
      );
      walkDirection.y = 0;
      walkDirection.normalize();

      const test = new THREE.Vector3().subVectors(
        this._model.position,
        this._nearStationPosition
      );
      console.log(test);
      if (Math.abs(test.x) < 3.0 && Math.abs(test.z) < 5.0) {
        console.log("아직");
        console.log(test);
      } else {
        const moveX = walkDirection.x * (this._speed * deltaTime);
        const moveZ = walkDirection.z * (this._speed * deltaTime);

        this._model.position.x += moveX;
        this._model.position.z += moveZ;
      }
    }
    this._previousTime = time;
  }

  render(time) {
    this.update(time);
    this._AnimRequestFrame = requestAnimationFrame(this.render.bind(this));
  }
}
