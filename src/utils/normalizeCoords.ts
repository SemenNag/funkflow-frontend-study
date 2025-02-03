/**
 * Normalizes coords to range -1..1 for both axis
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param canvas - HTML element where the scene rendered
 */
export function normalizeCoords(x: number, y: number, canvas: HTMLCanvasElement) {
  return {
    x: (x / canvas.clientWidth) * 2 - 1,
    y: -(y / canvas.clientHeight) * 2 + 1,
  };
}
