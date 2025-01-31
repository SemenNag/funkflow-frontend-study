import {
  Box3,
  BoxGeometry,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments, Mesh,
  MeshBasicMaterial,
  Object3D,
  Vector3
} from 'three';
import { disposeGroup } from '../utils/disposeGroup.ts';

export class ActiveBuildingEdges {
  private readonly parent: Object3D;
  private readonly group: Group;

  constructor(parent: Object3D) {
    this.parent = parent;
    this.group = new Group();
  }

  public get object() {
    return this.group;
  }

  private get bbox() {
    this.group.removeFromParent();

    const bbox = new Box3().setFromObject(this.parent);

    this.parent.add(this.group);

    return bbox;
  }

  private get cornerCoords() {
    return [
      new Vector3(this.bbox.min.x, this.bbox.min.y, this.bbox.min.z),
      new Vector3(this.bbox.min.x, this.bbox.min.y, this.bbox.max.z),
      new Vector3(this.bbox.min.x, this.bbox.max.y, this.bbox.min.z),
      new Vector3(this.bbox.min.x, this.bbox.max.y, this.bbox.max.z),
      new Vector3(this.bbox.max.x, this.bbox.min.y, this.bbox.min.z),
      new Vector3(this.bbox.max.x, this.bbox.min.y, this.bbox.max.z),
      new Vector3(this.bbox.max.x, this.bbox.max.y, this.bbox.min.z),
      new Vector3(this.bbox.max.x, this.bbox.max.y, this.bbox.max.z),
    ];
  }

  private get bboxSize() {
    const size = new Vector3();

    this.bbox.getSize(size);

    return size;
  }

  private get bboxCenter() {
    const center = new Vector3();

    this.bbox.getCenter(center);

    return center;
  }

  public render(parent: Object3D) {
    const material = new LineBasicMaterial({ color: 0x228be6 });
    const size = this.bboxSize;
    const center = this.bboxCenter;

    const geometry = new BoxGeometry(size.x + 0.01, size.y + 0.01, size.z + 0.01);
    const edgeGeometry = new EdgesGeometry(geometry);
    const edges = new LineSegments(edgeGeometry, material);

    edges.position.set(center.x, center.y, center.z);

    const cornerBoxMaterial = new MeshBasicMaterial({ color: 0x228be6 });
    const cornerBoxGeometry = new BoxGeometry(0.3, 0.3, 0.3);

    this.group.add(edges);

    for (const cornerCoord of this.cornerCoords) {
      const cornerBox = new Mesh(cornerBoxGeometry, cornerBoxMaterial);

      cornerBox.position.set(cornerCoord.x, cornerCoord.y, cornerCoord.z);
      this.group.add(cornerBox);
    }

    parent.add(this.group);
  }

  public update() {
    const size = this.bboxSize;
    const center = this.bboxCenter;

    const geometry = new BoxGeometry(size.x + 0.01, size.y + 0.01, size.z + 0.01);
    const edgesGeometry = new EdgesGeometry(geometry);

    (this.group.children[0] as LineSegments).geometry.dispose();
    (this.group.children[0] as LineSegments).geometry = edgesGeometry;
    (this.group.children[0] as LineSegments).position.set(center.x, center.y, center.z);

    const cornerBoxes = (this.group.children.filter((child) => child instanceof Mesh));

    this.cornerCoords.forEach((coords, index) => {
      cornerBoxes[index].position.set(coords.x, coords.y, coords.z);
    });
  }

  public destroy() {
    disposeGroup(this.group);
    this.group.clear();
    this.group.removeFromParent();
  }
}
