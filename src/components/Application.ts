import {
  PerspectiveCamera,
  WebGLRenderer,
  Scene,
  Color,
  Vector3,
  Raycaster,
  Vector2,
  Group,
  Box3,
} from 'three';
import { Ground } from './Ground.ts';
import { Building } from './Building.ts';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { convertToScreenPosition } from '../utils/convertToScreenPosition.ts';
import { BuildingInfo, Dimension2D } from '../types';
import { normalizeCoords } from '../utils/normalizeCoords.ts';
import { DragControls } from 'three/addons/controls/DragControls.js';
import { getBboxCorners } from '../utils/getBboxCorners.ts';

interface Handlers {
  handleOpenActiveBuildingPopover: (coords: Dimension2D, buildingInfo: BuildingInfo) => void;
  handleCloseActiveBuildingPopover: () => void;
}

export class Application {
  private readonly camera: PerspectiveCamera;
  private readonly renderer: WebGLRenderer;
  private readonly scene: Scene;
  private readonly controls: OrbitControls;

  private buildings: Building[];
  private activeBuilding: Building | null = null;
  private readonly canvas: HTMLCanvasElement;
  private handlers: Handlers;

  private raycaster: Raycaster;
  private dragControls: DragControls | undefined;

  private handlePointerDownRef: ((event: PointerEvent) => void);
  private handlePointerUpRef: ((event: PointerEvent) => void);

  constructor(canvas: HTMLCanvasElement, handlers: Handlers) {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    this.renderer = new WebGLRenderer({ canvas, antialias: true });
    this.controls = new OrbitControls(this.camera, canvas);
    this.canvas = canvas;
    this.handlers = handlers;

    this.buildings = [];
    this.raycaster = new Raycaster();

    this.handlePointerDownRef = this.handlePointerDown.bind(this);
    this.handlePointerUpRef = this.handlePointerUp.bind(this);
    this.canvas.addEventListener('pointerdown', this.handlePointerDownRef);
    this.canvas.addEventListener('pointerup', this.handlePointerUpRef);

    this.render();
  }

  private render() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.position.set(15, 18, 15);
    this.controls.update();
    this.camera.lookAt(new Vector3(0, 0, 0));
    this.scene.background = new Color(0xffffff);

    new Ground(500, 500, 2).render(this.scene);
    this.addBuilding(); // Create default building
    this.updateDragControls();
    this.renderer.setAnimationLoop(this.update.bind(this));
  }

  private update() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private handlePointerDown(event: PointerEvent) {
    if (this.activeBuilding) {
      this.activeBuilding.setIsActive(false);
      this.closeActiveBuildingPopover();
      this.activeBuilding = null;
    }

    const { x, y } = normalizeCoords(event.clientX, event.clientY, this.canvas);

    this.raycaster.setFromCamera(new Vector2(x, y), this.camera);

    const buildingObjects = this.buildings.map((building) => building.object);
    const intersections = this.raycaster.intersectObjects(buildingObjects, true);

    if (intersections.length === 0) return;

    const intersectedBuildingIds = intersections
      .filter(({ object }) => !!object.userData.isPartOfBuilding)
      .map<string>(({ object }) => object.userData.buildingId);

    // Squash all duplicated building ids by Set and get the first one as the closest one
    const intersectedBuildingId = [...new Set(intersectedBuildingIds).values()][0];
    const building = this.buildings.find((building) => building.object.uuid === intersectedBuildingId);

    this.activeBuilding = building ?? null;
    this.activeBuilding?.setIsActive(true);
    this.openActiveBuildingPopover();
  }

  private handlePointerUp() {
    if (this.dragControls && this.activeBuilding) {
      this.dragControls.dispatchEvent({ type: 'dragend', object: this.activeBuilding.object });
    }
  }

  private openActiveBuildingPopover() {
    if (!this.activeBuilding) return;

    const bbox = new Box3().setFromObject(this.activeBuilding.object);
    const cornersCoordsOnScreen = getBboxCorners(bbox.min, bbox.max)
      .map((coords) => convertToScreenPosition(coords, this.camera, this.canvas.clientWidth, this.canvas.clientHeight));

    // Find the most right X coordinate
    const { x } = cornersCoordsOnScreen.reduce((mostRightPoint, point) => {
        if (mostRightPoint.x < point.x) return point;

        return mostRightPoint;
    });

    // Find average Y coordinate
    const sum = cornersCoordsOnScreen.reduce((sum, coords) => {
      return sum + coords.y;
    }, 0);
    const y = sum / 8;

    this.handlers.handleOpenActiveBuildingPopover({ x, y }, this.activeBuilding.buildingInfo);
  }

  private closeActiveBuildingPopover() {
    this.handlers.handleCloseActiveBuildingPopover();
  }

  private updateDragControls() {
    if (this.dragControls) {
      this.dragControls.dispose();
    }

    this.dragControls = new DragControls(this.buildings.map((build) => build.object), this.camera, this.canvas);
    this.dragControls.transformGroup = true;
    this.dragControls.addEventListener('dragstart', () => {
      this.controls.enabled = false;
    });
    this.dragControls.addEventListener('drag', ({ object }) => {
      this.closeActiveBuildingPopover();
      if (object instanceof Group) {
        object.position.y = 0;
      }
    });
    this.dragControls.addEventListener('dragend', () => {
      this.controls.enabled = true;
      this.openActiveBuildingPopover();
    });
  }

  public addBuilding() {
    const building = new Building();

    building.render(this.scene);
    this.buildings.push(building);

    this.updateDragControls();
  }

  public deleteActiveBuilding() {
    if (!this.activeBuilding) return;

    const index = this.buildings.findIndex((building) => building.uuid === this.activeBuilding?.uuid);

    if (index === -1) return;

    this.buildings.splice(index, 1);
    this.activeBuilding.destroy();
    this.activeBuilding = null;
    this.closeActiveBuildingPopover();
    this.updateDragControls();
  }

  public setActiveBuildingSize(size: Dimension2D) {
    if (!this.activeBuilding) return;

    this.activeBuilding.setSize(size.x, size.y);
  }

  public setActiveBuildingFloors(floors: number) {
    if (!this.activeBuilding) return;

    this.activeBuilding.setFloors(floors);
  }

  public setActiveBuildingFloorsHeight(floorHeight: number) {
    if (!this.activeBuilding) return;

    this.activeBuilding.setFloorsHeight(floorHeight);
  }

  public destroy() {
    this.buildings.forEach((building) => building.destroy());
    this.buildings = [];
    Building.reset();
    this.controls.dispose();
    if (this.dragControls) this.dragControls.dispose();
    this.renderer.dispose();

    this.canvas.removeEventListener('pointerdown', this.handlePointerDownRef);
    this.canvas.removeEventListener('pointerup', this.handlePointerUpRef);
  }
}
