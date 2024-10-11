import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";

export default class Scene {
  fov: number;
  scene: THREE.Scene;
  stats: Stats;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  renderer: THREE.WebGLRenderer;

  constructor(
    fov = 36,
    camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    stats: Stats,
    controls: OrbitControls,
    renderer: THREE.WebGLRenderer,
  ) {
    this.fov = fov;
    this.scene = scene;
    this.stats = stats;
    this.camera = camera;
    this.controls = controls;
    this.renderer = renderer;
  }

  init() {
    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      window.innerWidth / window.innerHeight,
      1,
      1000,
    );
    this.camera.position.z = 128;

    this.scene = new THREE.Scene();

    // const spaceTexture = new THREE.TextureLoader().load("background.jpg");

    // this.scene.background = spaceTexture;

    // specify a canvas which is already created in the HTML file and tagged by an id
    // aliasing enabled
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById("orrery") as HTMLCanvasElement,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);

    // ambient light which is for the whole scene
    // let ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    // ambientLight.castShadow = false;
    // this.scene.add(ambientLight);

    // spot light which is illuminating the chart directly
    // let spotLight = new THREE.SpotLight(0xffffff, 0.55);
    // spotLight.castShadow = true;
    // spotLight.position.set(0, 40, 10);
    // this.scene.add(spotLight);

    // if window resizes
    window.addEventListener("resize", () => this.onWindowResize(), false);
  }

  animate() {
    // requestAnimationFrame(this.animate.bind(this));
    window.requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.stats.update();
    // this.controls.update();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
