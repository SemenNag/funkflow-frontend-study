export interface Dimension2D {
  x: number;
  y: number;
}

export interface Dimension3D extends Dimension2D {
  z: number;
}

export interface BuildingInfo {
  uuid: string;
  name: string;
  size: Dimension2D;
  floors: number;
  floorsHeight: number;
}

export interface IconProps {
  size?: 20 | 24;
}
