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

export type MoveEventType = 'in' | 'out';

export interface QueryParamSettings {
  /**
   * Calendar day of the month
   */
  date: string;

  /**
   * Building number of the residence hall
   */
  residence: string;

  /**
   * Whether or not the user requires accessible accommodations
   */
  accessible?: string;
}
