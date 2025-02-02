import { Line, Mesh } from 'three';

/**
 * Disposes all object resources that occupy GPU resources
 * @param obj - object to dispose
 */
export function disposeObject(obj: Mesh | Line) {
  if (Array.isArray(obj.material)) {
    obj.material.forEach((mat) => mat.dispose());
  } else {
    obj.material.dispose();
  }

  obj.geometry.dispose();
}
