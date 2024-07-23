export interface MoveDate {
  day: number;
  month: number;
}

export interface MoveDates {
  in: MoveDate[];
  out: MoveDate[];
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
  date: string;
  residence: ResidenceHall;
}
