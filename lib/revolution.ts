import * as THREE from "three";

export default class Revolution {
  x: number;
  showRevolution: boolean;
  mesh: THREE.Mesh | null | undefined;

  constructor(planetMesh: THREE.Mesh, showRotation = false) {
    this.x = planetMesh.position.x;
    this.showRevolution = showRotation;
  }

  getMesh() {
    if (this.mesh === undefined || this.mesh === null) {
      const geometry = new THREE.BoxGeometry(this.x, 0.25, 0.25);
      const material = new THREE.MeshNormalMaterial();

      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.position.x = this.x / 2;
      this.mesh.visible = this.showRevolution;
    }

    return this.mesh;
  }
}
