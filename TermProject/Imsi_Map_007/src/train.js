import * as THREE from '../../build/three.module.js';
import { GLTFLoader } from '../../examples/jsm/loaders/GLTFLoader.js';

export class Train {
    constructor(scene, stationList, speed) {
        if (Train.instance) {
            // If an instance already exists, return the existing instance
            return Train.instance;
        }
        this.scene = scene;
        this.stationList = stationList;
        this.speed = speed;
        this.init();
    }

    init() {
        const loader = new GLTFLoader();
        
        // 이제 Promise를 사용하여 GLTF 모델 로딩을 대기합니다.
        const loadModel = new Promise((resolve) => {
            loader.load('./Model/nyct_r62r62a_subway_car/scene.gltf', (gltf) => {
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
        const nextStation = this.stationList[this.currentStationIndex + 1];
    
        if (nextStation) {
            const targetX = nextStation.x;
            const targetY = nextStation.y;
            const distance = this.trainModel.position.distanceTo(new THREE.Vector3(targetX, 0.5, targetY));
    
            if (distance < this.speed) {
                // 기차를 다음 역으로 이동
                this.trainModel.position.set(targetX, 0.5, targetY);
                this.currentStationIndex++;
            } else {
                // 기차를 다음 역으로 향해 이동
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
