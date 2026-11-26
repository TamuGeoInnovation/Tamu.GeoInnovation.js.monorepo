import { Provider, inject } from '@angular/core';

import { POPUP_SHARE_URL } from '@tamu-gisc/aggiemap/ngx/popups';

import { EventSettingsQuery } from '../../../services/settings/event-settings-query';

import esri = __esri;

/**
 * A readable name for a feature in a copied link, as `{ param, value }` - for example `{ param: 'bldg', value: '1234' }`,
 * which becomes `?bldg=1234`.
 */
export type ShareUrlIdentity = { param: string; value: string | number };

/**
 * The identity a feature has on this map by default: the first of the map's own search sources with a `urlQueryParam`
 * whose first match field has a value on the feature - so a map declaring `?zone=` matched on `zone_id` gets
 * `?zone=AP-7`. `null` with none, and the link keeps the generic `feature=<layerId>:<objectId>` form. That form is
 * right for a feature with nothing better to be called, and wrong as a default for anything a person would recognise:
 * it cannot be read or checked by hand, and the object id in it is not stable across a republish of the service
 * (#1481).
 */
export function searchSourceIdentity(settings: EventSettingsQuery, feature: esri.Graphic): ShareUrlIdentity | null {
  const attributes = feature?.attributes;
  const ownSources = settings.eventConfiguration()?.configuration?.searchSources ?? [];

  for (const source of ownSources) {
    const field = source.queryParams?.where?.keys?.[0];
    const value = field ? attributes?.[field] : undefined;

    if (source.urlQueryParam && value !== undefined && value !== null && `${value}`.trim() !== '') {
      return { param: source.urlQueryParam, value };
    }
  }

  return null;
}

/**
 * The link that reopens a feature on the event map it is on: this map's own address, the builder selections, and the
 * feature by its identity or, with none, by layer and object id. With neither, the map's address alone.
 */
export function eventShareUrl(
  settings: EventSettingsQuery,
  feature: esri.Graphic,
  identity: ShareUrlIdentity | null = searchSourceIdentity(settings, feature)
): string {
  const base = `${window.location.origin}${window.location.pathname}`;
  const layerId = feature?.attributes?.__featureLayerId || feature?.layer?.id;
  const objectId = objectIdValue(feature);
  const hasGenericReference = !!layerId && objectId !== null && objectId !== undefined && objectId !== '';

  if (!identity && !hasGenericReference) {
    return base;
  }

  const params = new URLSearchParams(window.location.search);

  clearExistingFeatureParams(settings, params);
  applyEventSettingParams(settings, params);

  if (identity) {
    params.set(identity.param, `${identity.value}`);
  } else {
    params.set('feature', `${layerId}:${objectId}`);
  }

  return `${base}?${params.toString()}`;
}

/**
 * The event maps' copy link for the markdown popups, which are AggieMap's and so cannot know about an event map's
 * address or builder (#3486). The map's route provides it beside `EventSettingsQuery`.
 */
export function provideEventPopupShareUrl(): Provider {
  return {
    provide: POPUP_SHARE_URL,
    useFactory: () => {
      const settings = inject(EventSettingsQuery);
      return (feature: esri.Graphic) => eventShareUrl(settings, feature);
    }
  };
}

/**
 * Builder selections are persisted in local storage rather than in the map url, so a link copied from a popup would
 * otherwise carry only the feature reference. Without the selections, the recipient lands on an unconfigured map and
 * gets bounced into the builder instead of the shared feature. Stamping the current selections onto the link lets the
 * settings guard restore them.
 *
 * Any setting already present in the url wins, as it is what the current map is actually showing.
 */
function applyEventSettingParams(settings: EventSettingsQuery, params: URLSearchParams): void {
  settings.queryParamsFromSettings?.forEach((value, key) => {
    if (!params.has(key)) {
      params.set(key, value);
    }
  });
}

function clearExistingFeatureParams(settings: EventSettingsQuery, params: URLSearchParams): void {
  params.delete('feature');

  // The map's own sources as well as the application's, so a campus link's `bldg`/`abbrv` is cleared before the fresh
  // one is set rather than both ending up in the URL (#1481).
  settings.configuredSearchSources().forEach((source) => {
    if (source.urlQueryParam) {
      params.delete(source.urlQueryParam);
    }

    source.urlQueryParamAliases?.forEach((alias) => {
      params.delete(alias);
    });
  });
}

function objectIdValue(feature: esri.Graphic): string | number | null {
  const attributes = feature?.attributes || {};
  const objectIdField = (feature?.layer as esri.FeatureLayer)?.objectIdField;
  const candidates = [objectIdField, '__featureObjectId', 'OBJECTID', 'ObjectID', 'objectid', 'FID'].filter(
    (candidate): candidate is string => typeof candidate === 'string' && candidate.length > 0
  );

  for (const candidate of candidates) {
    const value = attributes[candidate];

    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return null;
}
