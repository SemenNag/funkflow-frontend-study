import {
  Group,
  Scene,
  Vector3
} from 'three';
import { BuildingInfo } from '../types';
import { Floor } from './Floor.ts';
import { ActiveBuildingEdges } from './ActiveBuildingEdges.ts';

export class Building {
  private static nextBuildingNumber = 1;
  private readonly name: string;
  private size: {
    width: number;
    depth: number;
  };
  private floors: Floor[];
  private floorsCount: number;
  private floorsHeight: number;
  private readonly buildingGroup: Group;
  private buildingEdges: ActiveBuildingEdges | null;

  constructor() {
    this.size = {
      width: 6,
      depth: 6,
    };
    this.floors = [];
    this.floorsCount = 3;
    this.floorsHeight = 3;
    this.buildingGroup = new Group();
    this.buildingEdges = null;
    this.name = Building.getNextBuildingName();
  }

  private static getNextBuildingName() {
    return `Building ${Building.nextBuildingNumber++}`;
  }

  public get object() {
    return this.buildingGroup;
  }

  public get edges() {
    return this.buildingEdges;
  }

  public get uuid() {
    return this.buildingGroup.uuid;
  }

  public get buildingInfo(): BuildingInfo {
    return {
      size: { x: this.size.width, y: this.size.depth },
      floors: this.floorsCount,
      floorsHeight: this.floorsHeight,
      name: this.name,
      uuid: this.uuid,
    };
  }

  public setSize(x: number, y: number) {
    this.size.width = x;
    this.size.depth = y;
    this.floors.forEach((floor) => floor.updateSize({
      x: this.size.width,
      y: this.floorsHeight,
      z: this.size.depth,
    }));

    if (this.buildingEdges) {
      this.buildingEdges.update();
    }
  }

  public setFloors(count: number) {
    if (count < 1) return;

    if (count > this.floorsCount) {
      const newFloors = count - this.floorsCount;
      const startYPosition = this.floorsCount * this.floorsHeight;

      for (let i = 0; i < newFloors; i++) {
        const floor = new Floor(
          {
            x: this.size.width,
            y: this.floorsHeight,
            z: this.size.depth,
          },
          new Vector3(0, i * this.floorsHeight + this.floorsHeight / 2 + startYPosition, 0),
          this.uuid,
        );

        floor.render(this.buildingGroup);
        this.floors.push(floor);
      }
    } else {
      let floorsToDelete = this.floorsCount - count;

      for (let i = this.floors.length - 1; floorsToDelete > 0; floorsToDelete--, i--) {
        this.floors[i].destroy();
      }

      this.floors = this.floors.slice(0, count);
    }

    if (this.buildingEdges) {
      this.buildingEdges.update();
    }

    this.floorsCount = count;
  }

  public setFloorsHeight(height: number) {
    this.floorsHeight = height;
    this.floors.forEach((floor, index) => floor.updateSize(
      {
        x: this.size.width,
        y: this.floorsHeight,
        z: this.size.depth,
      },
      new Vector3(0, index * this.floorsHeight + this.floorsHeight / 2, 0),
    ));

    if (this.buildingEdges) {
      this.buildingEdges.update();
    }
  }

  public setIsActive(value: boolean) {
    if (value) {
      this.buildingEdges = new ActiveBuildingEdges(this.buildingGroup);
      this.buildingEdges.render();
      this.buildingGroup.add(this.buildingEdges.object);
      return;
    }

    if (this.buildingEdges) {
      this.buildingEdges.destroy();
      this.buildingEdges = null;
    }
  }

  public render(scene: Scene) {
    for (let i = 0; i < this.floorsCount; i++) {
      const floor = new Floor(
        { x: this.size.width, y: this.floorsHeight, z: this.size.depth },
        new Vector3(0, i * this.floorsHeight + this.floorsHeight / 2, 0),
        this.uuid,
      );

      floor.render(this.buildingGroup);
      this.floors.push(floor);
    }


    scene.add(this.buildingGroup);
  }

  public destroy() {
    if (this.buildingEdges) {
      this.buildingEdges.destroy();
    }

    this.floors.forEach((floor) => floor.destroy());
    this.floors = [];
    this.buildingGroup.removeFromParent();
  }

  public static reset() {
    this.nextBuildingNumber = 1;
  }
}
