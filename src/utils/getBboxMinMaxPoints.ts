import { Vector3 } from 'three';

/**
 * Returns min and max points of bbox relative to the origin
 * @param size - size of bbox
 */
export function getBboxMinMaxPoints(size: Vector3) {
  const convertedMax = new Vector3();
  const convertedMin = new Vector3();

  convertedMin.x = -(size.x / 2);
  convertedMin.y = 0;
  convertedMin.z = -(size.z / 2);

  convertedMax.x = size.x / 2;
  convertedMax.y = size.y;
  convertedMax.z = size.z / 2;

  return { min: convertedMin, max: convertedMax };
}
