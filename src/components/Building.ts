import {
  BoxGeometry,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  Scene
} from 'three';

export class Building {
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

  public render(scene: Scene) {
    const group = new Group();
    const floorGeometry = new BoxGeometry(this.size.width, this.floorHeight, this.size.depth);
    const floorMaterial = new MeshBasicMaterial({ color: 0xf1f3f5 });
    const floorEdgeGeometry = new EdgesGeometry(floorGeometry);
    const floorEdgeMaterial = new LineBasicMaterial({ color: 0x868e96 });

    for (let i = 0; i < this.floors; i++) {
      const floor = new Mesh(floorGeometry, floorMaterial);
      const floorEdge = new LineSegments(floorEdgeGeometry, floorEdgeMaterial);

      floor.position.set(this.position.x, i * this.floorHeight, this.position.z);
      floorEdge.position.set(this.position.x, i * this.floorHeight, this.position.z);

      group.add(floor);
      group.add(floorEdge);
    }

    group.position.set(this.position.x, this.floorHeight / 2 + 0.01, this.position.z);

    scene.add(group);
  }

  public update() {
    // TODO
  }
}
