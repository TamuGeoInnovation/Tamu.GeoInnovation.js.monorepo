import { CheckInZoneRefusal } from '@tamu-gisc/gisday/common';

import { isCheckInZoneRefusal } from './checkin.service';

describe('isCheckInZoneRefusal', () => {
  it('recognises a refusal for being outside the zone, or for giving no location', () => {
    expect(isCheckInZoneRefusal({ status: 403, error: { reason: CheckInZoneRefusal.OutsideZone } })).toBe(true);
    expect(isCheckInZoneRefusal({ status: 403, error: { reason: CheckInZoneRefusal.NoLocation } })).toBe(true);
  });

  it('does not offer to override any other refusal', () => {
    // Too early: the attendee must wait, not override it.
    expect(isCheckInZoneRefusal({ status: 403, error: {} })).toBe(false);
    expect(isCheckInZoneRefusal({ status: 422, error: { reason: CheckInZoneRefusal.OutsideZone } })).toBe(false);
    expect(isCheckInZoneRefusal({ status: 403, error: { reason: 'something-else' } })).toBe(false);
    expect(isCheckInZoneRefusal(undefined)).toBe(false);
  });
});
