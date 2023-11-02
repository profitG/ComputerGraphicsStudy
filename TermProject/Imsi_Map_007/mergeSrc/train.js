import * as THREE from '../../build/three.module.js';
import { GLTFLoader } from '../../examples/jsm/loaders/GLTFLoader.js';

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
        const loader = new GLTFLoader();
        
        // 이제 Promise를 사용하여 GLTF 모델 로딩을 대기합니다.
        const loadModel = new Promise((resolve) => {
            loader.load('./Model/lowpoly_3d_train/scene.gltf', (gltf) => {
                const trainModel = gltf.scene;
                trainModel.rotation.x = Math.PI / 180;
                trainModel.rotation.y = Math.PI / 2;
                trainModel.scale.set(0.1, 0.1, 0.1);
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
        if(this.isCircleLine){
            this.deltaindex = 1;
        }
        else
        {
            if(this.isLastStation%2 == 0){
                this.deltaindex = 1
            }
            else{
                this.deltaindex = -1;
            }
            // console.log(this.isLastStation);
        }
        let nextStation;
        if(this.isCircleLine)
        {
            nextStation = this.stationList[(this.currentStationIndex + this.deltaindex)%this.stationList.length];
        }
        else{
            nextStation = this.stationList[this.currentStationIndex + this.deltaindex];
        }
        if (nextStation) {
            const targetX = nextStation.x;
            const targetY = nextStation.y;
            const distance = this.trainModel.position.distanceTo(new THREE.Vector3(targetX, 0.5, targetY));
    
            if (distance < this.speed) {
                // 기차를 다음 역으로 이동
                this.trainModel.position.set(targetX, 0.5, targetY);
                if(this.isCircleLine){
                    this.currentStationIndex++;
                }
                else{
                    this.currentStationIndex += this.deltaindex;
                }
                this.stationList[this.currentStationIndex % this.stationList.length].trainarrived = true;
                // console.log("arrive");
                // for(let i = 0; i<3; i++){
                //     console.log(i, this.stationList[i].trainarrived);
                // }

                this.stop(); // 애니메이션을 일시 중지
                setTimeout(() => {
                    this.start(); // 2초 후 애니메이션을 다시 시작
                    this.stationList[this.currentStationIndex % this.stationList.length].trainarrived = false;
                    // console.log("start");
                }, 500); // 2초 대기

            } else {
                // 기차를 다음 역으로 향해 이동
                const direction = new THREE.Vector3(targetX, 0.5, targetY)
                    .sub(this.trainModel.position)
                    .normalize()
                    .multiplyScalar(this.speed);
                this.trainModel.lookAt(this.trainModel.position.x + direction.x, 0.5, this.trainModel.position.z + direction.z);

                this.trainModel.position.add(direction);
            }
        }
        else{
            this.isLastStation ++;
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
