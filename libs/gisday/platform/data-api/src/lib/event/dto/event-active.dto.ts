/** Puts events on the public schedule, or takes them off it (#2092). */
export interface EventActiveDto {
  guids: Array<string>;
  active: boolean;
}
