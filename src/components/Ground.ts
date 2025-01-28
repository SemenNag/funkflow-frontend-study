import {
  BufferGeometry,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Scene,
  Vector3
} from 'three';

export class Ground {
  private readonly width: number;
  private readonly height: number;
  private readonly gridSize: number;

  constructor(width: number, height: number, gridSize: number) {
    this.width = width;
    this.height = height;
    this.gridSize = gridSize;
  }

  public render(scene: Scene) {
    const planeGeometry = new PlaneGeometry(this.width, this.height);
    const planeMaterial = new MeshBasicMaterial({
      color: 0xf8f9fa,
    });

    const plane = new Mesh(planeGeometry, planeMaterial);
    plane.position.set(0, 0, 0);
    plane.rotation.set(Math.PI / 2, 0, 0); // Rotate so that the plane lied on XZ plane
    scene.add(plane);

    const halfWidth = Math.round(this.width / 2);
    const halfHeight = Math.round(this.height / 2);
    const centralXLineMaterial = new LineBasicMaterial({ color: 0xfa5252, opacity: 0.5 });
    const centralZLineMaterial = new LineBasicMaterial({ color: 0x228be6, opacity: 0.5 });
    const xLineGeometry = new BufferGeometry().setFromPoints([
      new Vector3(-halfWidth, 0, 0),
      new Vector3(halfWidth, 0 , 0),
    ]);
    const zLineGeometry = new BufferGeometry().setFromPoints([
      new Vector3(0, 0, -halfHeight),
      new Vector3(0, 0 , halfHeight),
    ]);
    const xLine = new Line(xLineGeometry, centralXLineMaterial);
    const zLine = new Line(zLineGeometry, centralZLineMaterial);

    scene.add(xLine);
    scene.add(zLine);

    const gridLineMaterial = new LineBasicMaterial({ color: 0xdee2e6 });

    for (let x = -halfWidth; x < halfWidth; x += this.gridSize) {
      if (x === 0) continue; // Do not render central line as it has been rendered earlier

      const gridLineGeometry = new BufferGeometry().setFromPoints([
        new Vector3(x, 0, -halfWidth),
        new Vector3(x, 0, halfWidth),
      ]);
      const gridLine = new Line(gridLineGeometry, gridLineMaterial);

      scene.add(gridLine);
    }

    for (let z = -halfHeight; z < halfHeight; z += this.gridSize) {
      if (z === 0) continue; // Do not render central line as it has been rendered earlier

      const gridLineGeometry = new BufferGeometry().setFromPoints([
        new Vector3(-halfHeight, 0, z),
        new Vector3(halfHeight, 0, z),
      ]);
      const gridLine = new Line(gridLineGeometry, gridLineMaterial);

      scene.add(gridLine);
    }
  }
}
