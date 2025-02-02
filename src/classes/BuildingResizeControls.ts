import { Camera, EventDispatcher, Line, Mesh, Plane, Raycaster, Vector2, Vector3 } from 'three';

import { normalizeCoords } from '../utils/normalizeCoords.ts';
import { BuildingDimensions, CornerName, LineSegmentName } from '../constants';

import { ActiveBuildingEdges } from './ActiveBuildingEdges.ts';

interface BuildingResizeControlsEventMap {
  resizestart: {};
  resizeend: {};
  resizewidth: { delta: number };
  resizedepth: { delta: number };
  resizefloors: { delta: number };
}

export class BuildingResizeControls extends EventDispatcher<BuildingResizeControlsEventMap> {
  private static allowedDimensionsByCornerName = {
    [CornerName.FarthestLeftLower]: [BuildingDimensions.Depth, BuildingDimensions.Width],
    [CornerName.ClosestLeftLower]: [BuildingDimensions.Depth, BuildingDimensions.Width],
    [CornerName.FarthestRightLower]: [BuildingDimensions.Depth, BuildingDimensions.Width],
    [CornerName.ClosestRightLower]: [BuildingDimensions.Depth, BuildingDimensions.Width],
    [CornerName.FarthestLeftUpper]: [BuildingDimensions.Depth, BuildingDimensions.Width, BuildingDimensions.Floors],
    [CornerName.ClosestLeftUpper]: [BuildingDimensions.Depth, BuildingDimensions.Width, BuildingDimensions.Floors],
    [CornerName.FarthestRightUpper]: [BuildingDimensions.Depth, BuildingDimensions.Width, BuildingDimensions.Floors],
    [CornerName.ClosestRightUpper]: [BuildingDimensions.Depth, BuildingDimensions.Width, BuildingDimensions.Floors],
  };

  private static allowedDimensionsByLineSegment = {
    [LineSegmentName.FarthestLower]: [BuildingDimensions.Depth],
    [LineSegmentName.ClosestLower]: [BuildingDimensions.Depth],
    [LineSegmentName.LeftLower]: [BuildingDimensions.Width],
    [LineSegmentName.RightLower]: [BuildingDimensions.Width],
    [LineSegmentName.FarthestLeft]: [BuildingDimensions.Width, BuildingDimensions.Depth],
    [LineSegmentName.ClosestLeft]: [BuildingDimensions.Width, BuildingDimensions.Depth],
    [LineSegmentName.FarthestRight]: [BuildingDimensions.Width, BuildingDimensions.Depth],
    [LineSegmentName.ClosestRight]: [BuildingDimensions.Width, BuildingDimensions.Depth],
    [LineSegmentName.FarthestUpper]: [BuildingDimensions.Depth, BuildingDimensions.Floors],
    [LineSegmentName.ClosestUpper]: [BuildingDimensions.Depth, BuildingDimensions.Floors],
    [LineSegmentName.LeftUpper]: [BuildingDimensions.Width, BuildingDimensions.Floors],
    [LineSegmentName.RightUpper]: [BuildingDimensions.Width, BuildingDimensions.Floors],
  };

  // inner handlers
  private readonly pointerDownHandler: (event: PointerEvent) => void;
  private readonly pointerUpHandler: (event: PointerEvent) => void;
  private readonly pointerMoveHandler: (event: PointerEvent) => void;

  private readonly canvas: HTMLCanvasElement;
  private readonly edges: ActiveBuildingEdges;
  private readonly raycaster: Raycaster;
  private readonly camera: Camera;

  private allowedDimensions: BuildingDimensions[];
  private traveledLengh: number;
  private floorsHeight: number;
  private intersectionPoint: Vector3;

  constructor(edges: ActiveBuildingEdges, floorsHeight: number, canvas: HTMLCanvasElement, camera: Camera) {
    super();

    this.canvas = canvas;
    this.edges = edges;

    this.pointerDownHandler = this.handlePointerDown.bind(this);
    this.pointerMoveHandler = this.handlePointerMove.bind(this);
    this.pointerUpHandler = this.handlePointerUp.bind(this);
    this.canvas.addEventListener('pointerdown', this.pointerDownHandler);
    this.canvas.addEventListener('pointerup', this.pointerUpHandler);

    this.raycaster = new Raycaster();
    this.camera = camera;
    this.allowedDimensions = [];
    this.traveledLengh = 0;
    this.floorsHeight = floorsHeight;
    this.intersectionPoint = new Vector3();
  }

  private handlePointerDown(event: PointerEvent) {
    const { x, y } = normalizeCoords(event.clientX, event.clientY, this.canvas);

    this.raycaster.setFromCamera(new Vector2(x, y), this.camera);

    const intersections = this.raycaster.intersectObjects(this.edges.object.children);

    if (intersections.length === 0) return;

    const intersection = intersections.find(({ object }) => (object instanceof Line && 'lineSegmentName' in object.userData) || object instanceof Mesh);

    if (!intersection) return;

    const intersectedObject = intersection.object;

    this.intersectionPoint.copy(intersection.point);
    this.dispatchEvent({ type: 'resizestart' });

    if (intersectedObject instanceof Mesh) {
      this.allowedDimensions = this.getAllowedDimensionsForCorner(intersectedObject);
    } else if (intersectedObject instanceof Line) {
      this.allowedDimensions = this.getAllowedDimensionsForLineSegment(intersectedObject);
    }

    this.canvas.addEventListener('pointermove', this.pointerMoveHandler);
  }

  private handlePointerMove(event: PointerEvent) {
    const { x, y } = normalizeCoords(event.clientX, event.clientY, this.canvas);
    const plane = new Plane();

    this.raycaster.setFromCamera(new Vector2(x, y), this.camera);
    this.camera.getWorldDirection(plane.normal);
    plane.constant = -this.intersectionPoint.dot(plane.normal);

    const newIntersectionPoint = new Vector3();

    if (this.raycaster.ray.intersectPlane(plane, newIntersectionPoint)) {
      const dx = Math.abs(this.intersectionPoint.x - newIntersectionPoint.x);
      const dy = Math.abs(this.intersectionPoint.y - newIntersectionPoint.y);
      const dz = Math.abs(this.intersectionPoint.z - newIntersectionPoint.z);

      if (dx > dy && dx > dz && this.allowedDimensions.includes(BuildingDimensions.Width)) {
        this.dispatchEvent({ type: 'resizewidth', delta: newIntersectionPoint.x - this.intersectionPoint.x });
      } else if (dz > dx && dz > dy && this.allowedDimensions.includes(BuildingDimensions.Depth)) {
        this.dispatchEvent({ type: 'resizedepth', delta: newIntersectionPoint.z - this.intersectionPoint.z });
      } else if (dy > dx && dy > dz && this.allowedDimensions.includes(BuildingDimensions.Floors)) {
        this.traveledLengh += dy;

        if (this.traveledLengh >= this.floorsHeight) {
          this.dispatchEvent({ type: 'resizefloors', delta: this.intersectionPoint.y - newIntersectionPoint.y > 0 ? -1 : 1 });
          this.traveledLengh = 0;
        }
      }

      this.intersectionPoint.copy(newIntersectionPoint);
    }
  }

  private handlePointerUp() {
    this.dispatchEvent({ type: 'resizeend' });
    this.canvas.removeEventListener('pointermove', this.pointerMoveHandler);
    this.traveledLengh = 0;
  }

  private getAllowedDimensionsForCorner(object: Mesh) {
    const cornerName: keyof typeof CornerName = object.userData.cornerName;

    return BuildingResizeControls.allowedDimensionsByCornerName[cornerName];
  }

  private getAllowedDimensionsForLineSegment(object: Line) {
    const lineSegmentName: keyof typeof LineSegmentName = object.userData.lineSegmentName;

    return BuildingResizeControls.allowedDimensionsByLineSegment[lineSegmentName];
  }

  public dispose() {
    this.canvas.removeEventListener('pointerdown', this.pointerDownHandler);
    this.canvas.removeEventListener('pointerup', this.pointerUpHandler);
  }
}
