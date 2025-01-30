import { LineSegments, Mesh } from 'three';

export function disposeObject(obj: Mesh | LineSegments) {
  if (Array.isArray(obj.material)) {
    obj.material.forEach((mat) => mat.dispose());
  } else {
    obj.material.dispose();
  }

  obj.geometry.dispose();
}
