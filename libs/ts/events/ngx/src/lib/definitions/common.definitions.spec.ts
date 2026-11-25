// The definitions, their popups and the settings service import one another. Loading the service
// first is the order the application loads them in; starting from a definition finds a popup's base
// class still undefined.
import '../services/settings/event-settings.service';

import { LayerSource } from '@tamu-gisc/common/types';

import { EventPopups } from '../modules/popups/popups';
import {
  arrowLineSymbol,
  athleticsDevelopmentSource,
  commonSymbols,
  RED_HATCH_LEGEND,
  toSvgDataUri
} from './common.definitions';
import { BeefCattleColdLayerSources, BEEF_CATTLE_LAYERS } from './beef-cattle-vendor.definitions';
import { FireSchoolColdLayerSources, FIRE_SCHOOL_LAYERS } from './fire-school.definitions';
import { GamesOfTexasColdLayerSources, GAMES_OF_TEXAS_LAYERS } from './games-of-texas.definitions';

/**
 * Every athletics map but Men's Basketball builds its layers here, so a change to the helper reaches all of
 * them. These hold its output to exactly the source each caller gets today, with no key added, not even an
 * undefined one: game-day refresh (#2581) is applied by the settings service, on top of what this builds.
 */
describe('athleticsDevelopmentSource', () => {
  const popup = {
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: { name: 'attributes.name', description: 'attributes.description' },
    visible: true,
    listMode: 'show'
  };

  it('builds the source an existing caller got before, exactly', () => {
    expect(athleticsDevelopmentSource({ id: 'a', url: 'https://host/FeatureServer/0' })).toStrictEqual({
      type: 'feature',
      id: 'a',
      url: 'https://host/FeatureServer/0',
      ...popup,
      native: { outFields: ['*'] }
    });
  });

  it('builds a titled, one-type source exactly as before', () => {
    expect(
      athleticsDevelopmentSource({ id: 'b', url: 'https://host/FeatureServer/1', title: 'Lots', onlyType: 'Lot' })
    ).toStrictEqual({
      type: 'feature',
      id: 'b',
      url: 'https://host/FeatureServer/1',
      title: 'Lots',
      ...popup,
      native: { outFields: ['*'], definitionExpression: "type = 'Lot'" }
    });
  });
});

/**
 * The red-hatch legend swatch, the SVG data URI and the arrow-tipped line are made here once (#2601). Each
 * map used to carry its own copy, and Games of Texas's swatch had already drifted from the other two.
 */
describe('shared symbols', () => {
  const legendOf = (sources: LayerSource[], id: string) => sources.find((s) => s.id === id)?.legend;

  it('gives every red-hatch layer the same legend swatch', () => {
    const swatches = [
      legendOf(BeefCattleColdLayerSources, BEEF_CATTLE_LAYERS.NO_PARKING_ZONES),
      legendOf(FireSchoolColdLayerSources, FIRE_SCHOOL_LAYERS.ROAD_CLOSURES),
      legendOf(GamesOfTexasColdLayerSources, GAMES_OF_TEXAS_LAYERS.ROAD_CLOSURES)
    ];

    for (const swatch of swatches) {
      expect(swatch).toStrictEqual(RED_HATCH_LEGEND);
    }
  });

  it('encodes an SVG as a data URI', () => {
    expect(toSvgDataUri("<svg a='1'/>")).toBe("data:image/svg+xml;charset=UTF-8,%3Csvg%20a%3D'1'%2F%3E");
  });

  it('builds an arrow-tipped line, and the common arrows from it', () => {
    expect(arrowLineSymbol({ color: 'red', width: 3, style: 'dash' })).toStrictEqual({
      type: 'simple-line',
      color: 'red',
      width: 3,
      style: 'dash',
      marker: { type: 'line-marker', style: 'arrow', color: 'red', placement: 'end' }
    });
    expect(commonSymbols.GREEN_ARROW).toStrictEqual(arrowLineSymbol({ color: 'rgb(56, 168, 0)', width: 2 }));
    expect(commonSymbols.RED_ARROW).toStrictEqual(arrowLineSymbol({ color: 'rgb(230, 0, 0)', width: 2 }));
  });
});
