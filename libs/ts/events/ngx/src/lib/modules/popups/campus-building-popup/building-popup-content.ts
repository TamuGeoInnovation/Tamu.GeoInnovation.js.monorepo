import { TitleCasePipe } from '@angular/common';

import { BuildingPopupFields } from '../../../interfaces/special-event.interface';

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
