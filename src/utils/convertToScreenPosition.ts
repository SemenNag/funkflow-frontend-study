import { PerspectiveCamera, Vector3 } from 'three';

/**
 * Converts 3D NDC coordinates to screen position coordinates
 * @param vector - a point that should be converted to screen coords
 * @param camera
 * @param width
 * @param height
 */
export function convertToScreenPosition(vector: Vector3, camera: PerspectiveCamera, width: number, height: number) {
  // Convert world position to screen space
  vector.project(camera);

  const halfWidth = width / 2;
  const halfHeight = height / 2;

  // Convert normalized device coordinates to pixel coordinates
  return {
    x: (vector.x * halfWidth) + halfWidth,
    y: (-vector.y * halfHeight) + halfHeight
  };
}
