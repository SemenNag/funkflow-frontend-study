import {
  Box3,
  BoxGeometry,
  BufferGeometry,
  EdgesGeometry,
  Group,
  Line,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Vector3
} from 'three';

import { disposeGroup } from '../utils/disposeGroup.ts';
import { getBboxMinMaxPoints } from '../utils/getBboxMinMaxPoints.ts';
import { getBboxCornersCoords } from '../utils/getBboxCornersCoords.ts';
import { CornerName, LineSegmentName } from '../constants';

export class ActiveBuildingEdges {
  private static cornerNameByIndex: Record<number, CornerName> = {
    0: CornerName.FarthestLeftLower,
    1: CornerName.ClosestLeftLower,
    2: CornerName.FarthestRightLower,
    3: CornerName.ClosestRightLower,
    4: CornerName.FarthestLeftUpper,
    5: CornerName.ClosestLeftUpper,
    6: CornerName.FarthestRightUpper,
    7: CornerName.ClosestRightUpper,
  };

  private static lineSegmentNameByIndex: Record<number, LineSegmentName> = {
    0: LineSegmentName.FarthestLower,
    1: LineSegmentName.ClosestLower,
    2: LineSegmentName.LeftLower,
    3: LineSegmentName.RightLower,
    4: LineSegmentName.FarthestLeft,
    5: LineSegmentName.ClosestLeft,
    6: LineSegmentName.FarthestRight,
    7: LineSegmentName.ClosestRight,
    8: LineSegmentName.FarthestUpper,
    9: LineSegmentName.ClosestUpper,
    10: LineSegmentName.LeftUpper,
    11: LineSegmentName.RightUpper,
  };

  private readonly parent: Object3D;
  private readonly group: Group;
  private edges: LineSegments | undefined;

  constructor(parent: Object3D) {
    this.parent = parent;
    this.group = new Group();
  }

  public get object() {
    return this.group;
  }

  public get bbox() {
    // To get clear bbox edges should be removed first
    this.group.removeFromParent();

    const bbox = new Box3().setFromObject(this.parent);

    this.parent.add(this.group);

    return bbox;
  }

  private get cornerCoords() {
    const { min, max } = getBboxMinMaxPoints(this.bboxSize);

    return getBboxCornersCoords(min, max);
  }

  private get linesCoords(): Array<[Vector3, Vector3]> {
    const cornersCoords = this.cornerCoords;

    return [
      [cornersCoords[0], cornersCoords[2]], // farthest lower
      [cornersCoords[1], cornersCoords[3]], // closest lower
      [cornersCoords[0], cornersCoords[1]], // left lower
      [cornersCoords[2], cornersCoords[3]], // right lower

      [cornersCoords[0], cornersCoords[4]], // farthest left
      [cornersCoords[1], cornersCoords[5]], // closest left
      [cornersCoords[2], cornersCoords[6]], // farthest right
      [cornersCoords[3], cornersCoords[7]], // closest right

      [cornersCoords[4], cornersCoords[6]], // farthest upper
      [cornersCoords[5], cornersCoords[7]], // closest upper
      [cornersCoords[4], cornersCoords[5]], // left upper
      [cornersCoords[6], cornersCoords[7]], // right upper
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

    // make XZ coords zero as relative coords to Building Group
    center.x = 0;
    center.z = 0;

    return center;
  }

  public render() {
    const material = new LineBasicMaterial({ color: 0x228be6 });
    const size = this.bboxSize;
    const center = this.bboxCenter;

    // addition edges to group
    const geometry = new BoxGeometry(size.x + 0.01, size.y + 0.01, size.z + 0.01);
    const edgeGeometry = new EdgesGeometry(geometry);
    const edges = new LineSegments(edgeGeometry, material);
    edges.position.set(center.x, center.y, center.z);
    this.group.add(edges);
    this.edges = edges;

    // addition helper lines for resize controls
    const lineMaterial = new LineBasicMaterial({ transparent: true });
    this.linesCoords.forEach((lineCoords, index) => {
      const lineGeometry = new BufferGeometry().setFromPoints(lineCoords);
      const line = new Line(lineGeometry, lineMaterial);

      line.userData.lineSegmentName = ActiveBuildingEdges.lineSegmentNameByIndex[index];

      this.group.add(line);
    });

    // addition corner boxes
    const cornerBoxMaterial = new MeshBasicMaterial({ color: 0x228be6 });
    const cornerBoxGeometry = new BoxGeometry(0.3, 0.3, 0.3);
    this.cornerCoords.forEach((cornerCoords, index) => {
      const cornerBox = new Mesh(cornerBoxGeometry, cornerBoxMaterial);

      cornerBox.position.set(cornerCoords.x, cornerCoords.y, cornerCoords.z);
      cornerBox.userData.cornerName = ActiveBuildingEdges.cornerNameByIndex[index];
      this.group.add(cornerBox);
    });

    this.parent.add(this.group);
  }

  public update() {
    if (!this.edges) return;

    const size = this.bboxSize;
    const center = this.bboxCenter;

    // update edges
    const geometry = new BoxGeometry(size.x + 0.01, size.y + 0.01, size.z + 0.01);
    const edgesGeometry = new EdgesGeometry(geometry);
    this.edges.geometry.dispose();
    this.edges.geometry = edgesGeometry;
    this.edges.position.set(center.x, center.y, center.z);

    // update corner boxes
    const cornerBoxes = this.group.children.filter((child) => child instanceof Mesh);
    this.cornerCoords.forEach((coords, index) => {
      cornerBoxes[index].position.set(coords.x, coords.y, coords.z);
    });

    // update helper lines for resize controls
    const lineSegments = this.group.children
      .filter<Line>((child): child is Line => child instanceof Line && child.userData.lineSegmentName);
    const linesCoords = this.linesCoords;
    lineSegments.forEach((lineSegment, index) => {
      const geometry = new BufferGeometry().setFromPoints(linesCoords[index]);

      lineSegment.geometry.dispose();
      lineSegment.geometry = geometry;
    });
  }

  public destroy() {
    disposeGroup(this.group);
    this.group.clear();
    this.group.removeFromParent();
  }
}
