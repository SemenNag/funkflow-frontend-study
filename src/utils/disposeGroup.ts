import { Group, Line, LineSegments, Mesh } from 'three';

export function disposeGroup(group: Group) {
  group.traverse((child) => {
    if (!(child instanceof Mesh) && !(child instanceof Line) && !(child instanceof LineSegments)) return;

    if (Array.isArray(child.material)) {
      child.material.forEach((mat) => mat.dispose());
    } else {
      child.material.dispose();
    }

    child.geometry.dispose();
  });
}
