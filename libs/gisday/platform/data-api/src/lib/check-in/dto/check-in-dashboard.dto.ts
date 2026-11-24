import type { RsvpDashboard, RsvpDashboardEvent, RsvpDashboardPerson } from '../../user-rsvp/dto/rsvp-dashboard.dto';

/** One event's row on the check-in dashboard (#3006): its check-ins counted by person type, and its RSVPs beside them. */
export interface CheckInDashboardEvent extends RsvpDashboardEvent {
  /** How many RSVP'd, so turnout can be compared. */
  rsvps: number;
  /** Check-ins by someone with no RSVP to this event (#2893). The rest are the RSVPs that showed up. */
  walkIns: number;
}

/** One person who checked in, marked when they did so outside the session's time (#2893, #2635). */
export interface CheckInDashboardPerson extends RsvpDashboardPerson {
  outsideSessionTime: boolean;
}

/** The check-in dashboard: the RSVP dashboard's shape, `made` being when each check-in was made. */
export interface CheckInDashboard extends RsvpDashboard {
  events: Array<CheckInDashboardEvent>;
}
