export interface MoveDate {
  day: number;
  name: string;
}

export interface ResidenceHall {
  name: string;
  Bldg_Number: string[];
  zone?: string;
}

export interface ResidenceZone {
  name: string;
  halls: ResidenceHall[];
}

export interface ResidenceZones {
  [key: string]: ResidenceZone;
  southSide: ResidenceZone;
  northSide: ResidenceZone;
  whiteCreek: ResidenceZone;
}

export interface MoveInSettings {
  accessible: boolean;
  date: number;
  residence: ResidenceHall;
}
