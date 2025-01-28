import {
  PerspectiveCamera,
  WebGLRenderer,
  Scene,
  Color,
  Vector3,
} from 'three';
import { Ground } from './Ground.ts';

export class Application {
  private readonly camera: PerspectiveCamera;
  private readonly renderer: WebGLRenderer;
  private readonly scene: Scene;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    this.renderer = new WebGLRenderer({ canvas });

    this.init();
  }

  private init() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.position.set(10, 12, 10);
    this.camera.lookAt(new Vector3(0, 0, 0));
    this.scene.background = new Color(0xffffff);

    new Ground(500, 500, 2).render(this.scene);
    this.renderer.setAnimationLoop(this.update.bind(this));
  }

  private update() {
    this.renderer.render(this.scene, this.camera);
  }
}
