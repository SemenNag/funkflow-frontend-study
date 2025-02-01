import { Vector3 } from 'three';

export function getBboxCorners(min: Vector3, max: Vector3) {
  return [
    new Vector3(min.x, min.y, min.z), // farthest left lower corner
    new Vector3(min.x, min.y, max.z), // closest left lower corner
    new Vector3(max.x, min.y, min.z), // farthest right lower corner
    new Vector3(max.x, min.y, max.z), // closest right lower corner
    new Vector3(min.x, max.y, min.z), // farthest left upper corner
    new Vector3(min.x, max.y, max.z), // closest left upper corner
    new Vector3(max.x, max.y, min.z), // farthest right upper corner
    new Vector3(max.x, max.y, max.z), // closest right upper corner
  ];
}
