import { Object3D, PerspectiveCamera, Vector3 } from 'three';

export function convertToScreenPosition(object: Object3D, camera: PerspectiveCamera, width: number, height: number) {
  const vector = new Vector3();

  // Get object's world position
  vector.setFromMatrixPosition(object.matrixWorld);

  // Convert world position to screen space
  vector.project(camera);

  // Convert normalized device coordinates to pixel coordinates
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  return {
    x: (vector.x * halfWidth) + halfWidth,
    y: (-vector.y * halfHeight) + halfHeight
  };
}
