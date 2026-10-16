export enum COMPETITION_VALIDATION_STATUS {
  unverified = 'unverified',
  verified = 'verified',
  discarded = 'discarded'
}

/**
 * The most of a phone's reported accuracy, in metres, that counts towards reaching a location's
 * check-in zone (#1766). An attendee counts as inside when the circle their phone reports, their
 * position with its accuracy as the radius, touches the zone.
 *
 * A phone with GPS usually reports a few metres to a few tens of metres, and more indoors, so 100 m
 * lets in an attendee deep inside a large building like the Memorial Student Center. A position
 * from cell towers alone can report kilometres; the cap means a position that vague cannot reach
 * the zone from across town.
 */
export const CHECK_IN_MAX_ACCURACY = 100;

/**
 * The one event mode whose check-in needs the attendee inside its location's zone. Hybrid and
 * virtual events can be attended online.
 */
export const CHECK_IN_ZONE_EVENT_MODE = 'in-person';

/**
 * What an attendee outside the zone is told.
 *
 * @param venue The location's name, such as "TAMU Rudder Plaza", when it has one.
 */
export function checkInZoneMessage(venue?: string): string {
  return venue
    ? `You need to be inside the check-in zone at ${venue} to check in to this event.`
    : 'You need to be inside the check-in zone for this event to check in.';
}
