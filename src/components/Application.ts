import {
  PerspectiveCamera,
  WebGLRenderer,
  Scene,
  Color,
  Vector3, Raycaster, Vector2,
} from 'three';
import { Ground } from './Ground.ts';
import { Building } from './Building.ts';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { convertToScreenPosition } from '../utils/convertToScreenPosition.ts';
import { BuildingInfo, Dimension2D } from '../types';

interface Handlers {
  handleOpenActiveBuildingPopover: (coords: Dimension2D, buildingInfo: BuildingInfo) => void;
  handleCloseActiveBuildingPopover: () => void;
}

export class Application {
  private readonly camera: PerspectiveCamera;
  private readonly renderer: WebGLRenderer;
  private readonly scene: Scene;
  private readonly controls: OrbitControls;

  private buildings: Building[] = [];
  private activeBuilding: Building | null = null;
  private canvas: HTMLCanvasElement;
  private handlers: Handlers;

  constructor(canvas: HTMLCanvasElement, handlers: Handlers) {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    this.renderer = new WebGLRenderer({ canvas, antialias: true });
    this.controls = new OrbitControls(this.camera, canvas);
    this.canvas = canvas;
    this.handlers = handlers;

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
    this.trackBuildingClick();
    this.renderer.setAnimationLoop(this.update.bind(this));
  }

  private update() {
    this.buildings.forEach((building) => building.update());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private trackBuildingClick() {
    this.canvas.addEventListener('pointerdown', this.selectBuildingByClick.bind(this));
  }

  public addBuilding() {
    const building = new Building();

    building.render(this.scene);
    this.buildings.push(building);
  }

  public deleteBuilding() {
    // TODO
  }

  public selectBuildingByClick(event: PointerEvent) {
    if (this.activeBuilding) {
      this.activeBuilding.setIsActive(false);
      this.handlers.handleCloseActiveBuildingPopover();
    }

    const normalizedX = (event.clientX / window.innerWidth) * 2 - 1;
    const normalizedY = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new Raycaster();
    const mousePosition = new Vector2(normalizedX, normalizedY);

    raycaster.setFromCamera(mousePosition, this.camera);

    const buildingObjects = this.buildings.map((building) => building.threeObject);
    const intersections = raycaster.intersectObjects(buildingObjects);

    if (intersections.length === 0) return;

    const intersectedBuildings = intersections.map(({ object }) => object.parent).filter((obj) => !!obj);
    // Squash all duplicated groups by Set and get the first one as the closest one
    const intersectedBuildingObject = [...new Set(intersectedBuildings).values()][0];
    const building = this.buildings.find((building) => building.threeObject.uuid === intersectedBuildingObject.uuid);

    this.activeBuilding = building ?? null;

    if (this.activeBuilding) {
      this.activeBuilding.setIsActive(true);
      const coords = convertToScreenPosition(
        this.activeBuilding.threeObject,
        this.camera,
        this.renderer.domElement.clientWidth,
        this.renderer.domElement.clientHeight,
      );
      this.handlers.handleOpenActiveBuildingPopover(coords, this.activeBuilding.buildingInfo);
    }
  }

  public destroy() {
    this.buildings.forEach((building) => building.dispose(this.scene));
    Building.dispose();
    this.controls.dispose();
    this.renderer.dispose();
  }
}
