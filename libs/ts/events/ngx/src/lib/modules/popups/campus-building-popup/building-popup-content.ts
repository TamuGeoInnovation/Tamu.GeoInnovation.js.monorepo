import { TitleCasePipe } from '@angular/common';

import { BuildingPopupFields } from '../../../interfaces/special-event.interface';

/** A readable deep link for one building: the query parameter to use, and the value to put in it. */
export interface BuildingShareIdentity {
  param: string;
  value: string;
}

/**
 * The part of a search source this needs: what its features are addressed by in a URL. Declared
 * structurally rather than as `SearchSource` so the helper stays pure and this module keeps no
 * dependency on the search library.
 */
export interface BuildingShareSource {
  urlQueryParam?: string;
  urlQueryParamAliases?: string[];
}

/**
 * What the shared building popup shows, already chosen and formatted. Anything the feature has no value
 * for is left out, so the popup shows nothing rather than an empty line or a stray comma.
 */
export interface BuildingPopupContent {
  title?: string;
  number?: string;
  address?: string;
}

/**
 * Picks a building's title, number and address out of its attributes, using a map's declared fields.
 *
 * Values are trimmed, because the Galveston layer pads its text fields with trailing spaces, and an
 * empty or blank value counts as missing, so the title falls through to the next field. City names
 * are title-cased, as the main map's building popup does, because Galveston stores them in capitals.
 */
export function buildingPopupContent(
  attributes: Record<string, unknown> | undefined,
  fields: BuildingPopupFields
): BuildingPopupContent {
  const value = (field: string | undefined): string | undefined => {
    const raw = field ? attributes?.[field] : undefined;
    const text = raw === undefined || raw === null ? '' : `${raw}`.trim();

    return text.length > 0 ? text : undefined;
  };

  const street = value(fields.address?.street);
  const city = value(fields.address?.city);
  const zip = value(fields.address?.zip);

  const cityLine = city
    ? `${new TitleCasePipe().transform(city)}, ${fields.address?.state}${zip ? ` ${zip}` : ''}`
    : undefined;
  const address = [street, cityLine].filter((part) => part !== undefined).join(', ');

  return {
    title: fields.title.map((field) => value(field)).find((title) => title !== undefined),
    number: value(fields.number),
    address: address.length > 0 ? address : undefined
  };
}

/**
 * The readable copy link for a building: `?bldg=1234`, or `?abbrv=OCNG` where the building has no
 * number (#1481).
 *
 * Campus popups otherwise copy the generic `feature=<layerId>:<objectId>` form, which is unreadable
 * and, worse, keyed on an ArcGIS object id that is not stable across a republish of the service - so
 * a link shared today can come to point at a different building.
 *
 * The parameter names come from the campus's own search source rather than from here, because that
 * same declaration is what `EventService.selectFeatureByConfiguredParam` reads when the link is
 * opened. One declaration decides both ends, so a link this emits is a link that resolves.
 *
 * Returns null when the campus declares no `urlQueryParam`, or when the building has neither a number
 * nor an abbreviation. The caller then keeps the generic form, which is the right fallback for a
 * feature with nothing better to be called.
 */
export function buildingShareIdentity(
  attributes: Record<string, unknown> | undefined,
  fields: BuildingPopupFields | undefined,
  source: BuildingShareSource | undefined
): BuildingShareIdentity | null {
  const param = source?.urlQueryParam;

  if (!param || !fields) {
    return null;
  }

  const value = (field: string | undefined): string | undefined => {
    const raw = field ? attributes?.[field] : undefined;
    const text = raw === undefined || raw === null ? '' : `${raw}`.trim();

    return text.length > 0 ? text : undefined;
  };

  const number = value(fields.number);

  if (number !== undefined) {
    return { param, value: number };
  }

  const abbreviation = value(fields.abbreviation);

  if (abbreviation === undefined) {
    return null;
  }

  // The abbreviation goes in the first alias (`abbrv`) where the campus declares one, so a link says
  // what kind of value it carries. Both forms resolve either way: the source matches its value
  // against every field it searches on.
  return { param: source?.urlQueryParamAliases?.[0] ?? param, value: abbreviation };
}
