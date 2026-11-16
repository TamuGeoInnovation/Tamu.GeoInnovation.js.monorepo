import type { RsvpDashboard, RsvpDashboardEvent } from '../../user-rsvp/dto/rsvp-dashboard.dto';

/** One event's row on the check-in dashboard (#3006): its check-ins counted by person type, and its RSVPs beside them. */
export interface CheckInDashboardEvent extends RsvpDashboardEvent {
  /** How many RSVP'd, so turnout can be compared. */
  rsvps: number;
}

/** The check-in dashboard: the RSVP dashboard's shape, `made` being when each check-in was made. */
export interface CheckInDashboard extends RsvpDashboard {
  events: Array<CheckInDashboardEvent>;
}
