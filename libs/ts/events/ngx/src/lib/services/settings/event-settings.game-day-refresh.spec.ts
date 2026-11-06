import { LayerSource } from '@tamu-gisc/common/types';

import { EventDefinitions } from '../../definitions/all.definitions';
import { WOMENS_BASKETBALL_LAYERS } from '../../definitions/womens-basketball.definitions';
import { AggiemapCustomMapConfiguration } from '../../interfaces/special-event.interface';
import { EventSettingsService } from './event-settings.service';

/**
 * Game-day refresh is declared per event, in the event's own configuration, and switched on per layer (#2581).
 *
 * Staff edit some maps' services on game day - a lot closed, a closure drawn - and a layer that polls its service shows
 * the change to a visitor who already has the map open. Football refreshes only its lots and Men's Basketball all three
 * of its layers, so the switch names layers rather than turning a whole map on. Women's Basketball declares it off, at
 * its owner's request.
 *
 * Exercised against the prototype, as `event-settings.development-sources.spec.ts` is: the method reads the event's
 * definition and nothing else.
 */
const served = (id: string) => {
  const subject = Object.create(EventSettingsService.prototype) as EventSettingsService;
  (subject as unknown as { _settingsSecondaryKey: string })._settingsSecondaryKey = id;

  return subject.eventLayerSources();
};

const servedFrom = (definition: Partial<AggiemapCustomMapConfiguration>) => {
  const subject = Object.create(EventSettingsService.prototype) as EventSettingsService;
  (subject as unknown as { getEventDefinitionById: () => unknown }).getEventDefinitionById = () => definition;

  return subject.eventLayerSources();
};

const feature = (id: string): LayerSource => ({ type: 'feature', id, url: `https://host/${id}`, native: { outFields: ['*'] } });

const nativeOf = (source: LayerSource) => (source as { native?: Record<string, unknown> }).native;

const configurationOf = (id: string) =>
  EventDefinitions.find((definition) => definition.configuration.id === id)?.configuration;

describe('game-day refresh (#2581)', () => {
  it('polls every minute only the layers it lists, when it is on, keeping the rest of their settings', () => {
    const lots = feature('lots');
    const routes = feature('routes');
    const sources = servedFrom({
      configuration: { gameDayRefresh: { enabled: true, layers: ['lots'] } } as AggiemapCustomMapConfiguration['configuration'],
      sources: [lots, routes]
    });

    expect(nativeOf(sources[0])).toStrictEqual({ outFields: ['*'], refreshInterval: 1 });
    expect(sources[1]).toBe(routes);
    // The definition itself is left alone, so a later read of it does not come back already refreshing.
    expect(nativeOf(lots)).toStrictEqual({ outFields: ['*'] });
  });

  it('polls nothing when it is off', () => {
    const lots = feature('lots');
    const sources = servedFrom({
      configuration: { gameDayRefresh: { enabled: false, layers: ['lots'] } } as AggiemapCustomMapConfiguration['configuration'],
      sources: [lots]
    });

    expect(sources[0]).toBe(lots);
  });

  it("is on for Football and Men's Basketball, and off for Women's Basketball", () => {
    expect(
      ['gameday-parking', 'mens-basketball', 'womens-basketball'].map((id) => [id, configurationOf(id)?.gameDayRefresh?.enabled])
    ).toEqual([
      ['gameday-parking', true],
      ['mens-basketball', true],
      ['womens-basketball', false]
    ]);
  });

  it("lists Women's Basketball's two layers, so switching it on is the only change needed", () => {
    expect(configurationOf('womens-basketball')?.gameDayRefresh?.layers).toEqual([
      WOMENS_BASKETBALL_LAYERS.ACCESSIBLE_PARKING,
      WOMENS_BASKETBALL_LAYERS.PARKING_LOTS
    ]);
    expect(served('womens-basketball').map((source) => nativeOf(source)?.['refreshInterval'])).toEqual([undefined, undefined]);
  });

  it('names only layers the map has, so a mistyped id cannot quietly switch nothing on', () => {
    for (const definition of EventDefinitions.filter((d) => d.configuration.gameDayRefresh)) {
      const ids = (definition.sources ?? []).map((source) => source.id);
      const missing = definition.configuration.gameDayRefresh?.layers.filter((id) => !ids.includes(id));

      expect({ map: definition.configuration.id, missing }).toEqual({ map: definition.configuration.id, missing: [] });
    }
  });

  it('serves every other map exactly the sources its definition declares, the same objects', () => {
    const others = EventDefinitions.filter(
      (d) => !d.configuration.gameDayRefresh?.enabled && d.sources && !d.developmentSources
    );

    for (const definition of others) {
      const sources = served(definition.configuration.id);
      const same = sources.length === definition.sources?.length && sources.every((s, i) => s === definition.sources?.[i]);

      expect({ map: definition.configuration.id, same }).toEqual({ map: definition.configuration.id, same: true });
    }
  });
});
