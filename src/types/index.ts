export interface Dimension2D {
  x: number;
  y: number;
}

export interface BuildingInfo {
  name: string;
  size: Dimension2D;
  floors: number;
  floorsHeight: number;
}
