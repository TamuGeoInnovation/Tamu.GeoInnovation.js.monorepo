import { formatDate } from '@angular/common';

import { LayerSource } from '@tamu-gisc/common/types';
import { calendarDate } from '@tamu-gisc/common/utils/date';
import { getPropertyValue } from '@tamu-gisc/common/utils/object';
import { hasTemplateExpression, renderTemplateRows } from '@tamu-gisc/common/utils/string';

import esri = __esri;

type PopupDataDefinition = NonNullable<LayerSource['popupData']>;
type PopupDataResolutionStrategy = NonNullable<LayerSource['popupDataResolutionStrategy']>;
type PopupDataEntry = PopupDataDefinition[string];

/**
 * A layer's `popupData` resolved against one of its features: the values its popup shows, by key.
 *
 * The one place this is done. A popup opened by a click and one opened by a `?feature=` link both call it, so
 * the two read the same; a second copy kept for links drifted, showing dates as raw numbers and keeping rows
 * whose value is empty (#3536).
 */
export function resolvePopupData(
  graphic: esri.Graphic,
  popupData: PopupDataDefinition,
  strategy: PopupDataResolutionStrategy
): Record<string, unknown> {
  return Object.entries(popupData).reduce<Record<string, unknown>>((acc, [key, definition]) => {
    if (acc[key] !== undefined) {
      return acc;
    }

    acc[key] = resolvePopupDataEntry(graphic, definition, acc, strategy);

    return acc;
  }, {});
}

/**
 * Renders an epoch-millisecond date value as a long date, matching the `date: 'longDate'`
 * pipe used by the Angular popup components.
 *
 * Values that are nullish or not a valid date are returned untouched, so a missing or
 * unexpected attribute degrades to its original value rather than rendering "Invalid Date".
 */
function formatDateValue(value: unknown): unknown {
  if (value === null || value === undefined || value === '') {
    return value;
  }

  // A `format: 'date'` field holds a calendar date, which the service stores as midnight UTC; formatted as that
  // instant it read a day early in College Station (#3551).
  const date = calendarDate(value as string | number);

  if (isNaN(date)) {
    return value;
  }

  return formatDate(date, 'longDate', 'en-US');
}

function resolvePopupDataEntry(
  graphic: esri.Graphic,
  definition: PopupDataEntry,
  resolvedEntries: Record<string, unknown>,
  strategy: PopupDataResolutionStrategy
): unknown {
  if (typeof definition !== 'string') {
    const value = getPropertyValue(graphic.attributes, definition.field, definition.collapsed);

    return definition.format === 'date' ? formatDateValue(value) : value;
  }

  const lookup = getPopupDataLookup(graphic, resolvedEntries, strategy);

  if (hasTemplateExpression(definition)) {
    // Rows, not one string: a popup description lists its rows separated by newlines, and a row whose value
    // is empty used to render its label with nothing after it - "Type:" on a layer where the service leaves
    // `notes` empty, which reads as a fault in the map rather than an absent value (#2816).
    return renderTemplateRows({
      template: definition,
      lookup,
      options:
        strategy === 'cumulative'
          ? {
              nullishReplacement: '',
              trim: true
            }
          : undefined
    });
  }

  return getPropertyValue(lookup, definition);
}

function getPopupDataLookup(
  graphic: esri.Graphic,
  resolvedEntries: Record<string, unknown>,
  strategy: PopupDataResolutionStrategy
) {
  if (strategy === 'cumulative') {
    return {
      ...graphic,
      attributes: {
        ...(graphic.attributes || {}),
        ...resolvedEntries
      }
    };
  }

  return graphic;
}
