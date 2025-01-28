import {
  PerspectiveCamera,
  WebGLRenderer,
  Scene,
  Color,
  Vector3,
} from 'three';
import { Ground } from './Ground.ts';
import { Building } from './Building.ts';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class Application {
  private readonly camera: PerspectiveCamera;
  private readonly renderer: WebGLRenderer;
  private readonly scene: Scene;
  private readonly controls: OrbitControls;
  private buildings: Building[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    this.renderer = new WebGLRenderer({ canvas, antialias: true });
    this.controls = new OrbitControls(this.camera, canvas);

    this.init();
  }

  private init() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.position.set(15, 18, 15);
    this.controls.update();
    this.camera.lookAt(new Vector3(0, 0, 0));
    this.scene.background = new Color(0xffffff);

    new Ground(500, 500, 2).render(this.scene);
    this.addBuilding(); // Create default building
    this.renderer.setAnimationLoop(this.update.bind(this));
  }

  private update() {
    this.buildings.forEach((building) => building.update());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  public addBuilding() {
    const building = new Building();

    building.render(this.scene);
    this.buildings.push(building);
  }

  public deleteBuilding() {
    // TODO
  }
}
