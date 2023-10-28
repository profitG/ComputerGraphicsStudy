import * as THREE from '../../build/three.module.js';

const assets = {
    'road': (x,y) => {
        const material = new THREE.MeshLamberMaterial({ color: 0xbb5555 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData = { id: 'road' ,x , y }
        mesh.position.set ( x, 0.5, y );
        return mesh;
    }
};