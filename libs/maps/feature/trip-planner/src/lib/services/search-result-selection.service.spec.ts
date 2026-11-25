import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { AltSearchHelper, SearchSelection } from '@tamu-gisc/ui-kits/ngx/search';

import { SearchResultSelectionService } from './search-result-selection.service';

/**
 * One "show a search result on the map with its popup", in place of the copy in three components (#3484).
 *
 * Each copy resolved the result, built a `TripPoint`, and called `selectFeatures` with its graphic and the popup
 * component the search source declares. What is asserted here is what a visitor would notice if any of it were wrong:
 * the right geometry and attributes reach the map, the popup is asked for, and it is the source's own popup.
 */
describe('SearchResultSelectionService', () => {
  const popupComponent = class FakePopup {};

  const selection = (overrides: Record<string, unknown> = {}) =>
    ({
      type: 'search',
      index: 0,
      selection: {
        attributes: { Name: 'Evans Library', Number: '0468' },
        geometry: { x: -96.3406, y: 30.6168, spatialReference: { wkid: 4326 } }
      },
      result: { breadcrumbs: { source: { popupComponent } } },
      ...overrides
    }) as unknown as SearchSelection<__esri.Graphic>;

  let calls: Array<Record<string, unknown>>;

  const build = (resolved: SearchSelection<__esri.Graphic>) => {
    calls = [];
    const selectFeatures = (args: unknown) => calls.push(args as Record<string, unknown>);

    TestBed.configureTestingModule({
      providers: [
        { provide: AltSearchHelper, useValue: { handleSearchResultFeatureSelection: () => of(resolved) } },
        { provide: EsriMapService, useValue: { selectFeatures } }
      ]
    });

    return TestBed.inject(SearchResultSelectionService);
  };

  afterEach(() => TestBed.resetTestingModule());

  it('draws the resolved result on the map', () => {
    const service = build(selection());

    service.show(selection());

    expect(calls.length).toBe(1);
    expect((calls[0]['graphics'] as Array<{ attributes: Record<string, unknown> }>)[0].attributes).toEqual({
      Name: 'Evans Library',
      Number: '0468'
    });
  });

  it('asks for the popup, which is the whole point of choosing a result', () => {
    const service = build(selection());

    service.show(selection());

    expect(calls[0]['shouldShowPopup']).toBe(true);
  });

  it("opens the popup the result's own search source declares", () => {
    const service = build(selection());

    service.show(selection());

    expect(calls[0]['popupComponent']).toBe(popupComponent);
  });

  it('still draws a result that resolved without breadcrumbs, with no popup component', () => {
    // The event maps' copy guarded this and the other two did not, so the guarded form is the one kept.
    const service = build(selection({ result: undefined }));

    expect(() => service.show(selection())).not.toThrow();
    expect(calls.length).toBe(1);
    expect(calls[0]['popupComponent']).toBeUndefined();
  });

  it('carries the geometry through to the graphic, typed as the map needs it', () => {
    const service = build(selection());

    service.show(selection());

    const graphic = (calls[0]['graphics'] as Array<{ geometry: Record<string, unknown> }>)[0];

    expect(graphic.geometry['x']).toBe(-96.3406);
    expect(graphic.geometry['y']).toBe(30.6168);
    expect(graphic.geometry['type']).toBe('point');
  });
});
