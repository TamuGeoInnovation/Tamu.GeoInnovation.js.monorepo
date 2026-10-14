export enum COMPETITION_VALIDATION_STATUS {
  unverified = 'unverified',
  verified = 'verified',
  discarded = 'discarded'
}

/**
 * Metres outside a location's check-in zone that still count as inside it, for GPS error indoors
 * (#1766). The zone itself is on each event location, as `checkInZone`.
 */
export const CHECK_IN_ZONE_MARGIN = 30;

/**
 * The one event mode whose check-in needs the attendee inside its location's zone. Hybrid and
 * virtual events can be attended online.
 */
export const CHECK_IN_ZONE_EVENT_MODE = 'in-person';

/**
 * What an attendee outside the zone is told, by the API and by the page.
 *
 * @param venue The location's name, such as "TAMU Rudder Plaza", when it has one.
 */
export function checkInZoneMessage(venue?: string): string {
  return venue
    ? `You need to be inside the check-in zone at ${venue} to check in to this event.`
    : 'You need to be inside the check-in zone for this event to check in.';
}
