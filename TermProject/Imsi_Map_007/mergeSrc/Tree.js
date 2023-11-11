import * as THREE from "../../build/three.module.js";
import { GLTFLoader } from "../../examples/jsm/loaders/GLTFLoader.js";

const TREE_MODEL_PATHS = [
    {
      path: "./LowpolyModel/tree/scene.gltf",
      scale: 0.35,
    },
  ];

export class TREE{
    // 생성자
    constructor(scene, x, y){
        this._roundX = Math.round(x);
        this._roundY = Math.round(y);
        this._scene = scene;
        this._model;

        this._createModel();
    }

    _createModel(){
        // 랜덤한 모델 선택
        const randomModelIndex = Math.floor(Math.random() * TREE_MODEL_PATHS.length);
        const selectedModel = TREE_MODEL_PATHS[randomModelIndex];

        // 메쉬 생성
        new GLTFLoader().load(selectedModel.path, (gltf) => {
            this._model = gltf.scene;
            this._model.scale.set(selectedModel.scale, selectedModel.scale, selectedModel.scale);

            this._model.position.set(this._roundX, 5, this._roundY);
      
            this._model.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.castShadow = true;
              }
            });
            this._scene.add(this._model);
        });
    }
}