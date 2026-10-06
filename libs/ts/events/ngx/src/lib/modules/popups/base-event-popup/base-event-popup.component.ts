import { inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { BaseDirectionsComponent } from '@tamu-gisc/aggiemap/ngx/popups';
import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';

import { EventSettingsQuery } from '../../../services/settings/event-settings-query';

import esri = __esri;

export abstract class BaseEventPopupComponent extends BaseDirectionsComponent {
  private readonly _eventSettingsService = inject(EventSettingsQuery);

  constructor(
    router: Router,
    route: ActivatedRoute,
    plannerService: TripPlannerService,
    analytics: Angulartics2,
    mapService: EsriMapService
  ) {
    super(router, route, plannerService, analytics, mapService);
  }

  protected override _makeShareUrl(): string {
    const origin = window.location.origin;
    const fragment = this._getShareUrlFragment();
    return fragment ? `${origin}${window.location.pathname}${fragment}` : `${origin}${window.location.pathname}`;
  }

  /**
   * A readable name for this feature in a copied link, as `{ param, value }` - for example
   * `{ param: 'bldg', value: '1234' }`, which a popup's copy button turns into `?bldg=1234`.
   *
   * The default is none, which keeps the generic `feature=<layerId>:<objectId>` form. That form is
   * right for a feature with nothing better to be called, and wrong as a default for anything a
   * person would recognise: it cannot be read or checked by hand, and the object id in it is not
   * stable across a republish of the service (#1481).
   *
   * A subclass returning an identity gets every other part of the link unchanged - the builder
   * selections stamped onto it, and the clearing of any stale feature parameter already in the URL.
   */
  protected _getShareUrlIdentity(): { param: string; value: string | number } | null {
    return null;
  }

  protected override _getShareUrlFragment(): string | null {
    const identity = this._getShareUrlIdentity();
    const layerId = this.data?.attributes?.__featureLayerId || this.data?.layer?.id;
    const objectId = this._getObjectIdValue(this.data);
    const hasGenericReference = !!layerId && objectId !== null && objectId !== undefined && objectId !== '';

    if (!identity && !hasGenericReference) {
      return null;
    }

    const params = new URLSearchParams(window.location.search);

    this._clearExistingFeatureParams(params);
    this._applyEventSettingParams(params);

    if (identity) {
      params.set(identity.param, `${identity.value}`);
    } else {
      params.set('feature', `${layerId}:${objectId}`);
    }

    return `?${params.toString()}`;
  }

  /**
   * Builder selections are persisted in local storage rather than in the map url, so a link copied
   * from a popup would otherwise carry only the feature reference. Without the selections, the
   * recipient lands on an unconfigured map and gets bounced into the builder instead of the shared
   * feature. Stamping the current selections onto the link lets the settings guard restore them.
   *
   * Any setting already present in the url wins, as it is what the current map is actually showing.
   */
  private _applyEventSettingParams(params: URLSearchParams): void {
    const settingParams = this._eventSettingsService.queryParamsFromSettings;

    if (!settingParams) {
      return;
    }

    settingParams.forEach((value, key) => {
      if (!params.has(key)) {
        params.set(key, value);
      }
    });
  }

  private _clearExistingFeatureParams(params: URLSearchParams): void {
    params.delete('feature');

    // The map's own sources as well as the application's, so a campus link's `bldg`/`abbrv` is
    // cleared before the fresh one is set rather than both ending up in the URL (#1481).
    const searchSources = this._eventSettingsService.configuredSearchSources();

    searchSources.forEach((source) => {
      if (source.urlQueryParam) {
        params.delete(source.urlQueryParam);
      }

      source.urlQueryParamAliases?.forEach((alias) => {
        params.delete(alias);
      });
    });
  }

  private _getObjectIdValue(graphic: esri.Graphic): string | number | null {
    const attributes = graphic?.attributes || {};
    const objectIdField = (graphic?.layer as esri.FeatureLayer)?.objectIdField;
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
}
