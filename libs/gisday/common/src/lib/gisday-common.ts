export enum COMPETITION_VALIDATION_STATUS {
  unverified = 'unverified',
  verified = 'verified',
  discarded = 'discarded'
}

/**
 * Where an attendee must be to check in to an in-person event (#1766): the Memorial Student Center,
 * traced around the building, with `CHECK_IN_ZONE_MARGIN` metres added for GPS error indoors.
 * Rudder Tower is outside it. Hybrid and virtual events need no location.
 */
export const CHECK_IN_ZONE = [
  { latitude: 30.61134149709473, longitude: -96.34182507980555 },
  { latitude: 30.612176343177023, longitude: -96.34258857834743 },
  { latitude: 30.613240646827258, longitude: -96.340954566882 },
  { latitude: 30.612430828541257, longitude: -96.34027516032576 }
];

/**
 * Metres outside `CHECK_IN_ZONE` that still count as inside it.
 */
export const CHECK_IN_ZONE_MARGIN = 30;

/**
 * The one event mode whose check-in needs the attendee inside `CHECK_IN_ZONE`.
 */
export const CHECK_IN_ZONE_EVENT_MODE = 'in-person';

/**
 * What an attendee outside the zone is told, by the API and by the page.
 */
export const CHECK_IN_ZONE_MESSAGE =
  'You need to be inside the check-in zone, in the Memorial Student Center, to check in to this event.';
