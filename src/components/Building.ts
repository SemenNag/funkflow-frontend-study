import {
  Box3,
  BoxGeometry,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  Scene, Vector3
} from 'three';
import { disposeGroup } from '../utils/disposeGroup.ts';
import { BuildingInfo } from '../types';

export class Building {
  private static nextBuildingNumber = 1;
  private name: string;
  private size: {
    width: number;
    depth: number;
  };
  private floors: number;
  private floorHeight: number;
  private position: {
    x: number;
    z: number;
  };
  private readonly buildingGroup: Group;
  private buildingEdges: Group | null;

  constructor() {
    this.size = {
      width: 6,
      depth: 6,
    };
    this.floors = 3;
    this.floorHeight = 3;
    this.position = {
      x: 0,
      z: 0,
    };
    this.buildingGroup = new Group();
    this.buildingEdges = null;
    this.name = Building.getNextBuildingName();
  }

  private static getNextBuildingName() {
    return `Building ${Building.nextBuildingNumber++}`;
  }

  public get threeObject() {
    return this.buildingGroup;
  }

  public get buildingInfo(): BuildingInfo {
    return {
      size: { x: this.size.width, y: this.size.depth },
      floors: this.floors,
      floorsHeight: this.floorHeight,
      name: this.name,
    };
  }

  public setSize(x: number, y: number) {
    this.size.width = x;
    this.size.depth = y;
  }

  public setFloors(count: number) {
    this.floors = count;
  }

  public setFloorHeight(height: number) {
    this.floorHeight = height;
  }

  public setIsActive(value: boolean) {
    if (value) {
      this.buildingEdges = this.createBuildingEdges();

      this.buildingGroup.add(this.buildingEdges);
      return;
    }

    if (this.buildingEdges) {
      disposeGroup(this.buildingEdges);
      this.buildingEdges.clear();
      this.buildingGroup.remove(this.buildingEdges);
      this.buildingEdges = null;
    }
  }

  public render(scene: Scene) {
    const floorGeometry = new BoxGeometry(this.size.width, this.floorHeight, this.size.depth);
    const floorMaterial = new MeshBasicMaterial({ color: 0xf1f3f5 });
    const floorEdgeGeometry = new EdgesGeometry(floorGeometry);
    const floorEdgeMaterial = new LineBasicMaterial({ color: 0x868e96 });

    for (let i = 0; i < this.floors; i++) {
      const floor = new Mesh(floorGeometry, floorMaterial);
      const floorEdge = new LineSegments(floorEdgeGeometry, floorEdgeMaterial);

      floor.position.set(this.position.x, i * this.floorHeight + this.floorHeight / 2, this.position.z);
      floorEdge.position.set(this.position.x, i * this.floorHeight + this.floorHeight / 2, this.position.z);

      this.buildingGroup.add(floor);
      this.buildingGroup.add(floorEdge);
    }

    scene.add(this.buildingGroup);
  }

  private createBuildingEdges() {
    const edgeMaterial = new LineBasicMaterial({ color: 0x228be6 });
    const boundingBox = new Box3().setFromObject(this.buildingGroup);
    const size = new Vector3();
    const center = new Vector3();
    const group = new Group();

    boundingBox.getSize(size);
    boundingBox.getCenter(center);

    const boxGeometry = new BoxGeometry(size.x + 0.01, size.y + 0.01, size.z + 0.01);
    const edgeGeometry = new EdgesGeometry(boxGeometry);
    const edges = new LineSegments(edgeGeometry, edgeMaterial);

    edges.position.set(center.x, center.y, center.z);

    const cornerBoxMaterial = new MeshBasicMaterial({ color: 0x228be6 });
    const cornerBoxGeometry = new BoxGeometry(0.3, 0.3, 0.3);
    const cornerCoords = [
      new Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.min.z),
      new Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.max.z),
      new Vector3(boundingBox.min.x, boundingBox.max.y, boundingBox.min.z),
      new Vector3(boundingBox.min.x, boundingBox.max.y, boundingBox.max.z),
      new Vector3(boundingBox.max.x, boundingBox.min.y, boundingBox.min.z),
      new Vector3(boundingBox.max.x, boundingBox.min.y, boundingBox.max.z),
      new Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.min.z),
      new Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.max.z),
    ];

    for (const cornerCoord of cornerCoords) {
      const cornerBox = new Mesh(cornerBoxGeometry, cornerBoxMaterial);

      cornerBox.position.set(cornerCoord.x, cornerCoord.y, cornerCoord.z);
      group.add(cornerBox);
    }

    group.add(edges);

    return group;
  }

  public update() {
    // TODO
  }

  public dispose(scene: Scene) {
    if (this.buildingEdges) {
      disposeGroup(this.buildingEdges);
      this.buildingEdges.removeFromParent();
    }
    disposeGroup(this.buildingGroup);
    scene.remove(this.buildingGroup);
  }

  public static dispose() {
    this.nextBuildingNumber = 1;
  }
}
