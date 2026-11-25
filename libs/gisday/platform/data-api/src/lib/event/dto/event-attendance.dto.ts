/** Either count, or both: one not sent is left as it is. */
export interface EventAttendanceDto {
  observedAttendeeStart?: number;
  observedAttendeeEnd?: number;
}
