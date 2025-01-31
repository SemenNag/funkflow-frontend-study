import { Dimension3D } from '../types';
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
import { disposeGroup } from '../utils/disposeGroup.ts';

export class Floor {
  private size: Dimension3D;
  private position: Vector3;
  private group: Group;
  private buildingId: string;

  constructor(size: Dimension3D, position: Vector3, buildingId: string) {
    this.size = size;
    this.group = new Group();
    this.position = position;
    this.buildingId = buildingId;
  }

  public get object() {
    return this.group;
  }

  public render(parent: Object3D) {
    const geometry = new BoxGeometry(this.size.x, this.size.y, this.size.z);
    const edgesGeometry = new EdgesGeometry(geometry);
    const material = new MeshBasicMaterial({ color: 0xf1f3f5 });
    const edgesMaterial = new LineBasicMaterial({ color: 0x868e96 });

    const object = new Mesh(geometry, material);
    const edgesObject = new LineSegments(edgesGeometry, edgesMaterial);

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
    const geometry = new BoxGeometry(size.x, size.y, size.z);
    const edgesGeometry = new EdgesGeometry(geometry);

    (this.group.children[0] as Mesh).geometry.dispose();
    (this.group.children[0] as Mesh).geometry = geometry;

    if (position) (this.group.children[0] as Mesh).position.copy(position);

    (this.group.children[1] as LineSegments).geometry.dispose();
    (this.group.children[1] as LineSegments).geometry = edgesGeometry;

    if (position) (this.group.children[1] as Mesh).position.copy(position);

    this.size = size;
  }

  public destroy() {
    disposeGroup(this.group);
    this.group.removeFromParent();
  }
}
