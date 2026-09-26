import { inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { BaseDirectionsComponent } from '@tamu-gisc/aggiemap/ngx/popups';
import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';
import { SearchSource } from '@tamu-gisc/ui-kits/ngx/search';

import { EventSettingsService } from '../../../services/settings/event-settings.service';

import esri = __esri;

export abstract class BaseEventPopupComponent extends BaseDirectionsComponent {
  private readonly _eventSettingsService = inject(EventSettingsService);

  constructor(
    router: Router,
    route: ActivatedRoute,
    plannerService: TripPlannerService,
    analytics: Angulartics2,
    mapService: EsriMapService,
    private readonly env: EnvironmentService
  ) {
    super(router, route, plannerService, analytics, mapService);
  }

  protected override _makeShareUrl(): string {
    const origin = window.location.origin;
    const fragment = this._getShareUrlFragment();
    return fragment ? `${origin}${window.location.pathname}${fragment}` : `${origin}${window.location.pathname}`;
  }

  protected override _getShareUrlFragment(): string | null {
    const layerId = this.data?.attributes?.__featureLayerId || this.data?.layer?.id;
    const objectId = this._getObjectIdValue(this.data);

    if (!layerId || objectId === null || objectId === undefined || objectId === '') {
      return null;
    }

    const params = new URLSearchParams(window.location.search);

    this._clearExistingFeatureParams(params);
    this._applyEventSettingParams(params);
    params.set('feature', `${layerId}:${objectId}`);

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

    const searchSources = (this.env.value('SearchSources') || []) as SearchSource[];

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
