export interface EventDate {
  day: number;
  month: number;
}

export type EventDates = EventDate[];

export interface RingDaySettings {
  accessible: boolean;
  date: string;
}

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
