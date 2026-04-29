import { ActivatedRoute, Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { BaseDirectionsComponent } from '@tamu-gisc/aggiemap/ngx/popups';
import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';
import { SearchSource } from '@tamu-gisc/ui-kits/ngx/search';

import esri = __esri;

export abstract class BaseEventPopupComponent extends BaseDirectionsComponent {
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
    const lotValue = this._getLotValue(this.data);

    if (lotValue !== null) {
      const params = new URLSearchParams(window.location.search);

      this._clearExistingFeatureParams(params);
      params.set('lot', lotValue);

      return `?${params.toString()}`;
    }

    if (!layerId || objectId === null || objectId === undefined || objectId === '') {
      return null;
    }

    const params = new URLSearchParams(window.location.search);

    this._clearExistingFeatureParams(params);
    params.set('feature', `${layerId}:${objectId}`);

    return `?${params.toString()}`;
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

  private _getLotValue(graphic: esri.Graphic): string | null {
    if (!this._isLotFeature(graphic)) {
      return null;
    }

    const attributes = graphic?.attributes || {};
    const candidates = [attributes['Name'], attributes['LotName'], attributes['name']]
      .filter((value): value is string | number => value !== undefined && value !== null && `${value}`.trim().length > 0)
      .map((value) => `${value}`.trim());

    for (const candidate of candidates) {
      const normalized = candidate.replace(/^Lot\s+/i, '').replace(/^0+(\d)/, '$1');

      if (normalized.length > 0) {
        return normalized;
      }
    }

    return null;
  }

  private _isLotFeature(graphic: esri.Graphic): boolean {
    const layerId = graphic?.attributes?.__featureLayerId || graphic?.layer?.id || '';
    const layerTitle = graphic?.layer?.title || '';
    const attributes = graphic?.attributes || {};
    const nameLikeValue = attributes['Name'] || attributes['LotName'] || attributes['name'];
    const haystack = `${layerId} ${layerTitle}`.toLowerCase();

    return (haystack.includes('parking') || haystack.includes('lot')) && nameLikeValue !== undefined && nameLikeValue !== null;
  }
}
