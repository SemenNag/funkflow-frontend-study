import { Group, Line, LineSegments, Mesh } from 'three';
import { disposeObject } from './disposeObject.ts';

/**
 * Disposes all group's children that occupies GPU resources
 * @param group
 */
export function disposeGroup(group: Group) {
  group.traverse((child) => {
    if (!(child instanceof Mesh) && !(child instanceof Line) && !(child instanceof LineSegments)) return;

    disposeObject(child);
  });
}
