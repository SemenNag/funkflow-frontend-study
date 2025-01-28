import { BufferGeometry, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, PlaneGeometry, Scene, Vector3 } from 'three';

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
      wireframe: true,
    });

    const plane = new Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = - Math.PI / 2;
    scene.add(plane);

    const centralXLineMaterial = new LineBasicMaterial({ color: 0xfa5252, opacity: 0.5 });
    const centralZLineMaterial = new LineBasicMaterial({ color: 0x228be6, opacity: 0.5 });
    const xLineGeometry = new BufferGeometry().setFromPoints([
      new Vector3(-this.width, 0, 0),
      new Vector3(this.width, 0 , 0),
    ]);
    const zLineGeometry = new BufferGeometry().setFromPoints([
      new Vector3(0, 0, -this.height),
      new Vector3(0, 0 , this.height),
    ]);
    const xLine = new Line(xLineGeometry, centralXLineMaterial);
    const zLine = new Line(zLineGeometry, centralZLineMaterial);

    scene.add(xLine);
    scene.add(zLine);

    const gridLineMaterial = new LineBasicMaterial({ color: 0xdee2e6 });
    const xLinesNumber = (this.width / this.gridSize) * 2;
    const zLinesNumber = (this.height / this.gridSize) * 2;

    for (let x = -this.width; x < xLinesNumber; x += this.gridSize) {
      if (x === 0) continue; // Do not render central line as it has been rendered earlier

      const gridLineGeometry = new BufferGeometry().setFromPoints([
        new Vector3(x, 0, -this.width),
        new Vector3(x, 0, this.width),
      ]);
      const gridLine = new Line(gridLineGeometry, gridLineMaterial);

      scene.add(gridLine);
    }

    for (let z = -this.height; z < zLinesNumber; z += this.gridSize) {
      if (z === 0) continue; // Do not render central line as it has been rendered earlier

      const gridLineGeometry = new BufferGeometry().setFromPoints([
        new Vector3(-this.height, 0, z),
        new Vector3(this.height, 0, z),
      ]);
      const gridLine = new Line(gridLineGeometry, gridLineMaterial);

      scene.add(gridLine);
    }
  }
}
