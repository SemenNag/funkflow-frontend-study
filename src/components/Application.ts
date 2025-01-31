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

  public deleteActiveBuilding() {
    if (!this.activeBuilding) return;

    const index = this.buildings.findIndex((building) => building.uuid === this.activeBuilding?.uuid);

    if (index === -1) return;

    this.buildings.splice(index, 1);
    this.activeBuilding.destroy();
    this.activeBuilding = null;
    this.handlers.handleCloseActiveBuildingPopover();
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

    const buildingObjects = this.buildings.map((building) => building.object);
    const intersections = raycaster.intersectObjects(buildingObjects, true);

    if (intersections.length === 0) return;

    const intersectedBuildingIds = intersections
      .filter(({ object }) => !!object.userData.isPartOfBuilding)
      .map<string>(({ object }) => object.userData.buildingId);

    // Squash all duplicated building ids by Set and get the first one as the closest one
    const intersectedBuildingId = [...new Set(intersectedBuildingIds).values()][0];
    const building = this.buildings.find((building) => building.object.uuid === intersectedBuildingId);

    this.activeBuilding = building ?? null;

    if (this.activeBuilding) {
      this.activeBuilding.setIsActive(true);
      const coords = convertToScreenPosition(
        this.activeBuilding.object,
        this.camera,
        this.renderer.domElement.clientWidth,
        this.renderer.domElement.clientHeight,
      );
      this.handlers.handleOpenActiveBuildingPopover(coords, this.activeBuilding.buildingInfo);
    }
  }

  public setBuildingSize(uuid: string, size: Dimension2D) {
    const building = this.buildings.find((building) => building.object.uuid === uuid);

    if (!building) return;

    building.setSize(size.x, size.y);
  }

  public setBuildingFloors(uuid: string, floors: number) {
    const building = this.buildings.find((building) => building.object.uuid === uuid);

    if (!building) return;

    building.setFloors(floors);
  }

  public setBuildingFloorHeight(uuid: string, floorHeight: number) {
    const building = this.buildings.find((building) => building.object.uuid === uuid);

    if (!building) return;

    building.setFloorHeight(floorHeight);
  }

  public destroy() {
    this.buildings.forEach((building) => building.destroy());
    this.buildings = [];
    Building.reset();
    this.controls.dispose();
    this.renderer.dispose();
  }
}
