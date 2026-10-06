import { BuildingPopupFields } from '../../../interfaces/special-event.interface';
import { DCBushSchoolConfiguration } from '../../../definitions/campus/dc-bush-school.definitions';
import { GalvestonConfiguration } from '../../../definitions/campus/galveston.definitions';
import { McAllenConfiguration } from '../../../definitions/campus/mcallen.definitions';
import { buildingPopupContent } from './building-popup-content';

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
