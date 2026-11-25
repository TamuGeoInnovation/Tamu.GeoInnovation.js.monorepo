// The definitions, their popups and the settings service import one another. Loading the service
// first is the order the application loads them in; starting from a definition finds a popup's base
// class still undefined.
import '../services/settings/event-settings.service';

import { LayerSource } from '@tamu-gisc/common/types';

import { EventSettingsService } from '../services/settings/event-settings.service';
import * as football from './football-parking.definitions';

/**
 * Football lot status reaches the map without a reload (#1587).
 *
 * Staff change a lot's class during game day (to Lot Closed, for example) by editing the service.
 * The Football Parking Lots layers poll their service every minute, so a visitor with the map open
 * sees the change without reloading. Every exported list of layer sources is searched, so a lots
 * layer added later, or one moved to a new list, is held to the same rule.
 *
 * Read as the map is given them, through the settings service, since #2581 moved the refresh from the lots'
 * definition to the event's `gameDayRefresh` switch. Only the lots: nothing else on the map polls.
 */
const declared = Object.values(football)
  .filter((value): value is LayerSource[] => Array.isArray(value))
  .flat()
  .filter((source) => source?.title === 'Football Parking Lots')
  .map((source) => source.id);

const subject = Object.create(EventSettingsService.prototype) as EventSettingsService;
(subject as unknown as { _settingsSecondaryKey: string })._settingsSecondaryKey = 'gameday-parking';
const served = subject.eventLayerSources();
const refreshOf = (source: LayerSource) => (source.native as { refreshInterval?: number } | undefined)?.refreshInterval;
const lotsLayers = served.filter((source) => declared.includes(source.id));

describe('Football Parking Lots', () => {
  it('declares lots layers', () => {
    // The four vehicle modes and RV.
    expect(lotsLayers.length).toBe(5);
  });

  for (const source of lotsLayers) {
    it(`${source.id} refreshes every minute`, () => {
      expect(refreshOf(source)).toBe(1);
    });
  }

  it('is the only kind of football layer that refreshes', () => {
    expect(served.filter((source) => refreshOf(source) !== undefined).map((source) => source.id)).toEqual(
      lotsLayers.map((source) => source.id)
    );
  });
});
