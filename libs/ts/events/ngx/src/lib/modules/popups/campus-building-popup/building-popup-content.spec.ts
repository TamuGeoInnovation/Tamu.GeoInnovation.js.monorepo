import { BuildingPopupFields } from '../../../interfaces/special-event.interface';
import { DCBushSchoolConfiguration } from '../../../definitions/campus/dc-bush-school.definitions';
import { GalvestonConfiguration } from '../../../definitions/campus/galveston.definitions';
import { McAllenConfiguration } from '../../../definitions/campus/mcallen.definitions';
import { buildingPopupContent, buildingShareIdentity } from './building-popup-content';

/**
 * A satellite campus's building popup shows a title, number and address picked from that campus's own
 * fields (#1463). Before, it showed every raw attribute in a Property and Value table.
 *
 * Each case runs against a campus's real declaration, with attributes as its service returns them,
 * padding and capitals included, so a declaration naming a field the layer does not have shows here.
 */
const galveston = GalvestonConfiguration.buildingPopup as BuildingPopupFields;
const mcallen = McAllenConfiguration.buildingPopup as BuildingPopupFields;
const dc = DCBushSchoolConfiguration.buildingPopup as BuildingPopupFields;

/** Each campus's own building search source, which is what decides its copy link's parameter names. */
const galvestonSource = GalvestonConfiguration.searchSources?.[0];
const mcallenSource = McAllenConfiguration.searchSources?.[0];
const dcSource = DCBushSchoolConfiguration.searchSources?.[0];

describe('building popup content', () => {
  it('every satellite campus declares its building fields', () => {
    expect([galveston, mcallen, dc].every((fields) => fields !== undefined)).toBe(true);
  });

  describe('title', () => {
    it('uses the short name where the layer has one', () => {
      // Galveston's Student Center, as its service returns it.
      const content = buildingPopupContent(
        {
          name: 'Student Center',
          bldgname: 'Mary Moody Northern Student Cent                    ',
          bldgabbrev: '3004                ',
          abbrev: null,
          number: '3004'
        },
        galveston
      );

      expect(content.title).toBe('Student Center');
    });

    it('falls back to the building name, trimmed, when the name is blank', () => {
      const content = buildingPopupContent(
        { name: '   ', bldgname: 'Williams Library      ', bldgabbrev: 'WILL' },
        galveston
      );

      expect(content.title).toBe('Williams Library');
    });

    it('falls back to the abbreviation when there is no name of either kind', () => {
      // The worst case that still has something to show.
      const content = buildingPopupContent({ name: null, bldgname: null, bldgabbrev: 'SSSB', abbrev: null }, galveston);

      expect(content.title).toBe('SSSB');
    });

    it("uses McAllen's abbreviation when a building has no name", () => {
      expect(buildingPopupContent({ name: null, abbrev: 'HECM', number: 'M001' }, mcallen).title).toBe('HECM');
    });

    it("uses DC's building name, the only name field its layer has", () => {
      expect(buildingPopupContent({ bldgname: 'Bush School - DC', bldgabbr: 'TAMUDC' }, dc).title).toBe('Bush School - DC');
    });

    it('is left empty when no field has a value, for the popup to fall back to the layer title', () => {
      // Fifteen of Galveston's structures and three of McAllen's have every field empty.
      expect(
        buildingPopupContent({ name: null, bldgname: null, bldgabbrev: null, abbrev: null }, galveston).title
      ).toBeUndefined();
    });
  });

  describe('number and address', () => {
    it("formats Galveston's address as the main map does, title-casing the city", () => {
      const content = buildingPopupContent(
        { name: 'Student Center', number: '3004', address: '200 Seawolf Pw', city: 'GALVESTON        ', zip: '77554     ' },
        galveston
      );

      expect(content.number).toBe('3004');
      expect(content.address).toBe('200 Seawolf Pw, Galveston, TX 77554');
    });

    it('uses the state the campus declares', () => {
      const content = buildingPopupContent(
        { bldgname: 'Bush School - DC', address: '1620 L St NW, Ste 700', city: 'Washington', zip: '20036' },
        dc
      );

      expect(content.address).toBe('1620 L St NW, Ste 700, Washington, DC 20036');
    });

    it('shows no address when the feature has none, rather than stray commas', () => {
      const content = buildingPopupContent({ name: 'Storage', address: null, city: null, zip: '  ' }, galveston);

      expect(content.address).toBeUndefined();
    });

    it('shows the city line alone when there is no street', () => {
      expect(buildingPopupContent({ name: 'Pier', address: '', city: 'GALVESTON', zip: null }, galveston).address).toBe(
        'Galveston, TX'
      );
    });

    it('shows no address for McAllen, whose layer has no address fields', () => {
      const content = buildingPopupContent({ name: 'Higher Education Center', number: 'M001' }, mcallen);

      expect(content).toEqual({ title: 'Higher Education Center', number: 'M001', address: undefined });
    });
  });
});

/**
 * The copy link on a campus building popup (#1481).
 *
 * It used to copy `?feature=galveston-buildings-layer:3`: unreadable, and keyed on an ArcGIS object
 * id that is not stable across a republish of the service, so a link shared today could come to point
 * at a different building. These run against each campus's real declaration, so a campus that stops
 * declaring the parameters - and silently goes back to the old link - fails here.
 */
describe('building copy link', () => {
  it('names a Galveston building by its number', () => {
    const identity = buildingShareIdentity(
      { number: '3004', bldgabbrev: '3004                ', bldgname: 'Mary Moody Northern Student Cent    ' },
      galveston,
      galvestonSource
    );

    expect(identity).toEqual({ param: 'bldg', value: '3004' });
  });

  it('falls back to the abbreviation, in its own parameter, when a building has no number', () => {
    const identity = buildingShareIdentity({ number: '   ', bldgabbrev: 'OCNG' }, galveston, galvestonSource);

    expect(identity).toEqual({ param: 'abbrv', value: 'OCNG' });
  });

  it('trims the padding the campus services return', () => {
    // Galveston pads its text fields, which is why `buildingPopupContent` trims too. An untrimmed
    // value would travel into the URL as `%20`s and match nothing when the link was opened.
    expect(buildingShareIdentity({ number: '  1234  ' }, galveston, galvestonSource)).toEqual({
      param: 'bldg',
      value: '1234'
    });
  });

  it('works the same way for McAllen and the DC Bush School, on their own field names', () => {
    expect(buildingShareIdentity({ number: '12', abbrev: 'HEC' }, mcallen, mcallenSource)).toEqual({
      param: 'bldg',
      value: '12'
    });

    expect(buildingShareIdentity({ bldgabbr: 'BUSH' }, mcallen, mcallenSource)).toBeNull();

    expect(buildingShareIdentity({ number: '1', bldgabbr: 'BUSH' }, dc, dcSource)).toEqual({
      param: 'bldg',
      value: '1'
    });

    expect(buildingShareIdentity({ bldgabbr: 'BUSH' }, dc, dcSource)).toEqual({ param: 'abbrv', value: 'BUSH' });
  });

  it('keeps the generic link for a building with neither a number nor an abbreviation', () => {
    expect(buildingShareIdentity({ bldgname: 'Storage Shed' }, galveston, galvestonSource)).toBeNull();
  });

  it('keeps the generic link for a campus that declares no url parameter', () => {
    expect(buildingShareIdentity({ number: '3004' }, galveston, { urlQueryParamAliases: ['abbrv'] })).toBeNull();
    expect(buildingShareIdentity({ number: '3004' }, galveston, undefined)).toBeNull();
  });

  it('every satellite campus declares both parameter names, so every campus link is readable', () => {
    for (const source of [galvestonSource, mcallenSource, dcSource]) {
      expect(source?.urlQueryParam).toBe('bldg');
      expect(source?.urlQueryParamAliases).toEqual(['abbrv']);
    }
  });
});
