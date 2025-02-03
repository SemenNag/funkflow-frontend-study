import {
  BoxGeometry,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  Object3D, Vector3,
} from 'three';

import { Dimension3D } from '../types';
import { disposeGroup } from '../utils/disposeGroup.ts';

export class Floor {
  private size: Dimension3D;
  private readonly position: Vector3;
  private readonly group: Group;
  private readonly buildingId: string;
  private edgesFloor: LineSegments | undefined;
  private meshFloor: Mesh | undefined;

  constructor(size: Dimension3D, position: Vector3, buildingId: string) {
    this.size = size;
    this.group = new Group();
    this.position = position;
    this.buildingId = buildingId;
  }

  public render(parent: Object3D) {
    const geometry = new BoxGeometry(this.size.x, this.size.y, this.size.z);
    const edgesGeometry = new EdgesGeometry(geometry);
    const material = new MeshBasicMaterial({ color: 0xf1f3f5 });
    const edgesMaterial = new LineBasicMaterial({ color: 0x868e96 });

    const object = new Mesh(geometry, material);
    const edgesObject = new LineSegments(edgesGeometry, edgesMaterial);

    this.meshFloor = object;
    this.edgesFloor = edgesObject;

    object.userData.isPartOfBuilding = true;
    object.userData.buildingId = this.buildingId;
    edgesObject.userData.isPartOfBuilding = true;
    edgesObject.userData.buildingId = this.buildingId;

    object.position.copy(this.position);
    edgesObject.position.copy(this.position);

    this.group.add(object);
    this.group.add(edgesObject);

    parent.add(this.group);
  }

  public updateSize(size: Dimension3D, position?: Vector3) {
    if (!this.meshFloor || !this.edgesFloor) return;

    const geometry = new BoxGeometry(size.x, size.y, size.z);
    const edgesGeometry = new EdgesGeometry(geometry);

    this.meshFloor.geometry.dispose();
    this.meshFloor.geometry = geometry;

    if (position) this.meshFloor.position.copy(position);

    this.edgesFloor.geometry.dispose();
    this.edgesFloor.geometry = edgesGeometry;

    if (position) this.edgesFloor.position.copy(position);

    this.size = size;
  }

  public destroy() {
    disposeGroup(this.group);
    this.group.clear();
    this.group.removeFromParent();
  }
}
