// train.js

import * as THREE from '../../build/three.module.js';

export class Train {
    constructor(scene, stationRoadList, speed) {
        if (Train.instance) {
            // 이미 인스턴스가 존재하면 기존 인스턴스 반환
            return Train.instance;
        }
        this.scene = scene;
        this.stationRoadList = stationRoadList;
        this.speed = speed;
        this.init();
    }

    init() {
        const trainMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            roughness: 0.5,
            metalness: 0.8,
        });

        const trainGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1);
        this.mesh = new THREE.Mesh(trainGeometry, trainMaterial);
        this.mesh.rotation.x = -Math.PI / 2;
        this.scene.add(this.mesh);

        const startStationRoad = this.stationRoadList[0]; // Assuming there's at least one station road
        
        // 안전성을 위해 startStationRoad가 정의되었는지 확인
        if (startStationRoad) {
            this.position = { x: startStationRoad.x, y: startStationRoad.y + 0.5 };
            this.currentStationRoadIndex = 0;
            this.mesh.position.set(this.position.x, 0.5, this.position.y);
        } else {
            console.error("No station road available for the train.");
        }
    
    this.position = { x: startStationRoad.x, y: startStationRoad.y + 0.5 };
        this.currentStationRoadIndex = 0;
        this.mesh.position.set(this.position.x, 0.5, this.position.y);
    }

    update() {
        const nextStationRoad = this.stationRoadList[this.currentStationRoadIndex + 1];
    
        if (nextStationRoad) {
            const deltaX = nextStationRoad.x - this.position.x;
            const deltaY = nextStationRoad.y - this.position.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
            if (distance < this.speed) {
                // Move the train to the next station road
                this.position.x = nextStationRoad.x;
                this.position.y = nextStationRoad.y;
                this.currentStationRoadIndex++;
    
                // Update the train mesh position
                this.mesh.position.set(this.position.x, 0.5, this.position.y);
            } else {
                // Move the train towards the next station road
                const ratio = this.speed / distance;
                this.position.x += deltaX * ratio;
                this.position.y += deltaY * ratio;
    
                // Update the train mesh position
                this.mesh.position.set(this.position.x, 0.5, this.position.y);
            }
        }
    }

    start() {
        this.isAnimating = true;
        this.animate();
        this.render(); // 추가된 부분
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

    render() {
        this.scene.renderer.render(this.scene, this.scene.camera);
        requestAnimationFrame(() => this.render());
    }
}    
