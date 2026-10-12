// The definitions, their popups and the settings service import one another. Loading the service
// first is the order the application loads them in; starting from a definition finds a popup's base
// class still undefined.
import '../services/settings/event-settings.service';

import { eventHasPassed } from '@tamu-gisc/common/utils/date';
import { MoveOut, SpringMoveOut, SummerOneMoveOut, SummerTwoMoveOut } from './move-out.definitions';

/**
 * Move-out happens three times a year and the map said nothing about which (#1691).
 *
 * One undated map covered all three periods, so it could never say its event was over and sat on the
 * campus events page all year. These are the three dated ones that replace it.
 *
 * The dates themselves are a judgement - Residence Life has not published 2027's, so they are
 * matched to 2026's by weekday - but that each period is dated at all, and dated differently from
 * its neighbours, is not. That is what this holds.
 */
describe('Move Out', () => {
  const periods = [SpringMoveOut, SummerOneMoveOut, SummerTwoMoveOut];

  it('offers a period for spring, Summer I and Summer II', () => {
    expect(periods.map((period) => period.configuration.name)).toEqual([
      'Spring Move Out',
      'Summer I Move Out',
      'Summer II Move Out'
    ]);
  });

  for (const period of periods) {
    it(`${period.configuration.name} carries its own dates`, () => {
      // Without dates `eventHasPassed` always answers false, which is the fault being fixed: the map
      // can never tell a visitor that the information in front of them is stale.
      expect(period.configuration.eventDates?.length).toBeGreaterThan(0);
    });

    it(`${period.configuration.name} is listed on the campus events page`, () => {
      expect(period.discover?.visible).not.toBe(false);
      expect(period.discover?.type).toBe('event');
    });
  }

  it('gives each period its own route', () => {
    const ids = periods.map((period) => period.configuration.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('dates no two periods the same', () => {
    const dates = periods.map((period) => (period.configuration.eventDates ?? []).join());

    expect(new Set(dates).size).toBe(dates.length);
  });

  it('says each period is over once its dates are past', () => {
    for (const period of periods) {
      const dates = period.configuration.eventDates ?? [];

      expect(eventHasPassed(dates, Date.parse('2099-01-01T12:00:00-06:00'))).toBe(true);
      expect(eventHasPassed(dates, Date.parse('2020-01-01T12:00:00-06:00'))).toBe(false);
    }
  });

  it('keeps the undated map off the campus events page', () => {
    // It still answers on its own route, so nothing that linked to it breaks; it is only unlisted,
    // so the page offers one entry per move-out rather than three and an undated fourth.
    expect(MoveOut.discover?.visible).toBe(false);
  });
});
