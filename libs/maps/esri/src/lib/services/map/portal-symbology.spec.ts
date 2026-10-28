import {
  declaresOwnRenderer,
  portalItemDataUrl,
  publishesDefaultSymbology,
  recordSymbologySource,
  rendererFieldsPresent,
  rendererForLayer,
  serviceClassRenderer,
  symbologySourceOf
} from './portal-symbology';

/**
 * Choosing a layer's real symbology (#1497).
 *
 * These are the decisions that would otherwise be silent: pointing at the wrong portal, or quietly
 * finding no renderer and leaving the flattened one in place, both look exactly like "nothing to do".
 */
describe('portal item symbology', () => {
  describe('which portal publishes a service', () => {
    it('uses the Enterprise portal on the same host as the service', () => {
      expect(portalItemDataUrl('https://arc.ts.tamu.edu/arcgis/rest/services/Hosted/X/FeatureServer/1', 'abc')).toBe(
        'https://arc.ts.tamu.edu/portal/sharing/rest/content/items/abc/data?f=json'
      );
      expect(portalItemDataUrl('https://gis.tamu.edu/arcgis/rest/services/Hosted/GalBase2/FeatureServer/0', 'd1')).toBe(
        'https://gis.tamu.edu/portal/sharing/rest/content/items/d1/data?f=json'
      );
    });

    it('uses ArcGIS Online for a service hosted there, whatever its host is called', () => {
      // An AGOL service lives on services1.arcgis.com but its item lives on arcgis.com. Deriving the
      // portal from the service host alone would look for the item in the wrong place.
      expect(
        portalItemDataUrl('https://services1.arcgis.com/oxXAea6csqnDZ6WT/arcgis/rest/services/P/FeatureServer/0', 'x')
      ).toBe('https://www.arcgis.com/sharing/rest/content/items/x/data?f=json');
    });

    it('answers null rather than guessing when there is nothing to go on', () => {
      expect(portalItemDataUrl('https://arc.ts.tamu.edu/arcgis/rest/services/X/FeatureServer/1', '')).toBeNull();
      expect(portalItemDataUrl('not a url', 'abc')).toBeNull();
    });
  });

  describe('which renderer belongs to a layer', () => {
    const data = {
      layers: [
        { id: 0, layerDefinition: { drawingInfo: { renderer: { type: 'CIMSymbolReference', tag: 'parking' } } } },
        { id: 1, layerDefinition: { drawingInfo: { renderer: { type: 'CIMSymbolReference', tag: 'entry-routes' } } } },
        { id: 4, layerDefinition: { drawingInfo: { renderer: { type: 'uniqueValue', tag: 'geofence' } } } }
      ]
    };

    it('matches on the sublayer number the service uses, not on position', () => {
      // The item lists 0, 1 and 4 - there is no layer 2 or 3. Taking the nth entry would give layer 4
      // the renderer meant for a layer that does not exist.
      expect(rendererForLayer(data, 1)).toEqual({ type: 'CIMSymbolReference', tag: 'entry-routes' });
      expect(rendererForLayer(data, 4)).toEqual({ type: 'uniqueValue', tag: 'geofence' });
    });

    it('answers null for a layer the item does not describe, which is normal', () => {
      expect(rendererForLayer(data, 2)).toBeNull();
      expect(rendererForLayer(data, undefined)).toBeNull();
      expect(rendererForLayer(null, 1)).toBeNull();
      expect(rendererForLayer({}, 1)).toBeNull();
      expect(rendererForLayer({ layers: [{ id: 1 }] }, 1)).toBeNull();
    });
  });

  describe('leaving a deliberate override alone', () => {
    it('recognises a map that has chosen its own renderer', () => {
      // Construction replaces the service's per-owner colours with one orange hatch on purpose.
      expect(declaresOwnRenderer({ native: { renderer: { type: 'simple' } } })).toBe(true);
    });

    it('treats anything else as unchosen', () => {
      expect(declaresOwnRenderer({ native: { outFields: ['*'] } })).toBe(false);
      expect(declaresOwnRenderer({ native: { renderer: null } })).toBe(false);
      expect(declaresOwnRenderer({})).toBe(false);
      expect(declaresOwnRenderer(undefined)).toBe(false);
    });
  });
});

/**
 * Telling a layer drawing ArcGIS's default symbol from one drawing a chosen one (#1578).
 */
describe('default symbology', () => {
  it('counts a service with no drawing info as publishing nothing usable', () => {
    expect(publishesDefaultSymbology({})).toBe(true);
    expect(publishesDefaultSymbology(undefined)).toBe(true);
  });

  it("counts ArcGIS's RedSphere default as publishing nothing usable, as AggiePrint's service does (#1576)", () => {
    expect(
      publishesDefaultSymbology({
        drawingInfo: { renderer: { type: 'simple', symbol: { type: 'esriPMS', url: 'RedSphere.png' } } }
      })
    ).toBe(true);
  });

  it('counts a chosen symbol, or a renderer with classes, as usable', () => {
    expect(
      publishesDefaultSymbology({
        drawingInfo: { renderer: { type: 'simple', symbol: { type: 'esriPMS', url: 'a1b2c3.png' } } }
      })
    ).toBe(false);
    expect(publishesDefaultSymbology({ drawingInfo: { renderer: { type: 'uniqueValue' } } })).toBe(false);
  });

  it('remembers where a layer got its symbology, and knows nothing of a layer it was not told about', () => {
    const layer = {};

    expect(symbologySourceOf(layer)).toBeUndefined();

    recordSymbologySource(layer, 'service');
    recordSymbologySource(layer, 'portal');

    expect(symbologySourceOf(layer)).toBe('portal');
  });
});

/**
 * Drawing every feature with one of the service's own symbols, when its renderer's values have gone
 * stale (#1992).
 */
describe('one class of a service renderer', () => {
  const wheelchair = { type: 'CIMSymbolReference', symbol: { type: 'CIMPointSymbol', tag: 'wheelchair' } };

  // Women's Basketball's Accessible Parking Spaces, as its portal item published it on 20 October 2026:
  // one class, whose values say `Disabled` where the spaces now say `Accessible`.
  const accessible = {
    type: 'uniqueValue',
    field1: 'type',
    field2: 'event',
    fieldDelimiter: ',',
    uniqueValueInfos: [
      { value: 'Disabled,Volleyball', label: 'Accessible Parking', symbol: wheelchair },
      { value: 'Disabled,Basketball', label: 'Accessible Parking', symbol: wheelchair }
    ]
  };

  it("draws every feature with the named class's symbol and label, testing no field", () => {
    expect(serviceClassRenderer(accessible, 'Accessible Parking')).toEqual({
      type: 'simple',
      label: 'Accessible Parking',
      symbol: wheelchair
    });
  });

  it('takes the class asked for, not the first', () => {
    // Indoor Track's Team Bus Parking: its one area is type `SPORTS`, which neither class names.
    const teamBus = {
      type: 'uniqueValue',
      field1: 'type',
      uniqueValueInfos: [
        { value: 'Team Drop Off', label: 'Team Drop Off', symbol: { tag: 'blue' } },
        { value: 'Team Bus Parking', label: 'Team Bus Parking', symbol: { tag: 'magenta' } }
      ]
    };

    expect(serviceClassRenderer(teamBus, 'Team Bus Parking')).toEqual({
      type: 'simple',
      label: 'Team Bus Parking',
      symbol: { tag: 'magenta' }
    });
  });

  it('answers null when the service no longer has that class, so the layer keeps what it publishes', () => {
    expect(serviceClassRenderer(accessible, 'Reserved Parking')).toBeNull();
    expect(serviceClassRenderer({ type: 'simple', symbol: wheelchair }, 'Accessible Parking')).toBeNull();
    expect(serviceClassRenderer(null, 'Accessible Parking')).toBeNull();
    expect(serviceClassRenderer(undefined, 'Accessible Parking')).toBeNull();
  });
});

/**
 * A portal renderer keyed on fields its layer no longer has draws nothing (#2500). The three baseball
 * renderers below are the production item's on 27 October 2026, against the republished layers' fields.
 */
describe('rendererFieldsPresent', () => {
  const symbol = { tag: 'any' };
  const republished = ['objectid', 'globalid', 'type', 'event', 'name'];

  const baseballSymbols = {
    type: 'uniqueValue',
    field1: 'type',
    field2: 'event',
    uniqueValueInfos: [{ value: 'Parking, Baseball', symbol }]
  };
  const gateRoadClosure = {
    type: 'uniqueValue',
    field1: 'baseball',
    uniqueValueInfos: [{ value: 'Gate', symbol }]
  };
  const lots = {
    type: 'uniqueValue',
    field1: 'baseball',
    uniqueValueInfos: [
      { value: 'AnyValid', symbol },
      { value: 'Permit', symbol },
      { value: 'SeasonPass', symbol }
    ]
  };

  it('rejects the renderer keyed on a field the republished layer lacks', () => {
    expect(rendererFieldsPresent(gateRoadClosure, ['objectid', 'type', 'event'])).toBe(false);
    expect(rendererFieldsPresent(lots, ['objectid', 'type'])).toBe(false);
  });

  it('rejects a renderer when any one of its fields is missing', () => {
    expect(rendererFieldsPresent(baseballSymbols, ['objectid', 'name'])).toBe(false);
    expect(rendererFieldsPresent({ ...baseballSymbols, field3: 'owner' }, republished)).toBe(false);
  });

  it('accepts a renderer whose fields are all on the layer', () => {
    expect(rendererFieldsPresent(baseballSymbols, republished)).toBe(true);
    expect(rendererFieldsPresent(gateRoadClosure, [...republished, 'baseball'])).toBe(true);
  });

  it('compares field names without regard to case', () => {
    expect(rendererFieldsPresent(gateRoadClosure, ['OBJECTID', 'BASEBALL'])).toBe(true);
    expect(rendererFieldsPresent({ type: 'classBreaks', field: 'Spaces' }, ['SPACES'])).toBe(true);
  });

  it('judges a class breaks renderer by its field', () => {
    expect(rendererFieldsPresent({ type: 'classBreaks', field: 'spaces' }, republished)).toBe(false);
    expect(rendererFieldsPresent({ type: 'classBreaks', field: 'name' }, republished)).toBe(true);
  });

  it('ignores empty field names', () => {
    expect(rendererFieldsPresent({ type: 'uniqueValue', field1: 'type', field2: '', field3: '' }, republished)).toBe(true);
  });

  it('judges a nested renderer by its own fields too', () => {
    const nested = {
      type: 'uniqueValue',
      field1: 'type',
      uniqueValueInfos: [{ value: 'Reserved', renderer: { type: 'uniqueValue', field1: 'baseball' } }]
    };

    expect(rendererFieldsPresent(nested, republished)).toBe(false);
    expect(rendererFieldsPresent(nested, [...republished, 'baseball'])).toBe(true);
  });

  it('passes an Arcade renderer, which keys on no field, whatever field1 says', () => {
    expect(rendererFieldsPresent({ type: 'uniqueValue', field1: 'baseball', valueExpression: '$feature.type' }, republished)).toBe(
      true
    );
    expect(rendererFieldsPresent({ type: 'classBreaks', field: 'spaces', valueExpression: '$feature.n' }, republished)).toBe(true);
  });

  it('passes renderers that key on no field, and shapes it does not know', () => {
    expect(rendererFieldsPresent({ type: 'simple', symbol, field1: 'baseball' }, republished)).toBe(true);
    expect(rendererFieldsPresent({ type: 'heatmap' }, republished)).toBe(true);
    expect(rendererFieldsPresent({ type: 'dotDensity', fields: [{ name: 'baseball' }] }, republished)).toBe(true);
    expect(rendererFieldsPresent({ type: 'somethingNew', field: 'baseball' }, republished)).toBe(true);
    expect(rendererFieldsPresent(null, republished)).toBe(true);
    expect(rendererFieldsPresent(undefined, republished)).toBe(true);
    expect(rendererFieldsPresent('not a renderer', republished)).toBe(true);
  });
});
