import { resolvePopupData } from './resolve-popup-data';

import esri = __esri;

/**
 * A `format: 'date'` field is a calendar date, stored by the service as midnight UTC (#3551). Formatted as an instant in
 * College Station, midnight UTC is 6 PM the day before, so every Construction map date read a day early. These run in
 * Central time (vitest.config.mts), where that happened.
 */
describe("resolvePopupData's dates (#3551)", () => {
  // ARFF Station on the Construction service, objectid 35375, as it was on 25 November 2026.
  const arff = { attributes: { startdate: 1735689600000, enddate: 1798675200000 } } as unknown as esri.Graphic;
  const fields = {
    startDate: { field: 'startdate', format: 'date' as const },
    endDate: { field: 'enddate', format: 'date' as const }
  };

  it('runs in Central time, where the fault shows', () => {
    expect(new Date(1735689600000).getDate()).toBe(31);
  });

  it('shows a date stored as midnight UTC as that calendar date', () => {
    expect(resolvePopupData(arff, fields, 'independent')).toEqual({
      startDate: 'January 1, 2025',
      endDate: 'December 31, 2026'
    });
  });

  it('leaves an empty or unreadable value as it is', () => {
    const odd = { attributes: { startdate: null, enddate: 'not a date' } } as unknown as esri.Graphic;

    expect(resolvePopupData(odd, fields, 'independent')).toEqual({ startDate: null, endDate: 'not a date' });
  });
});
