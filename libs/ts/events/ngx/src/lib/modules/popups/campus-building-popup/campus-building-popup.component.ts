import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';

import { BaseEventPopupComponent } from '../base-event-popup/base-event-popup.component';
import { EventSettingsQuery } from '../../../services/settings/event-settings-query';
import { BuildingPopupContent, buildingPopupContent, buildingShareIdentity } from './building-popup-content';
import { CopyComponent } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

/**
 * A satellite campus's building popup, laid out as the main map's: title, building number, address and a
 * copy link (#1463).
 *
 * Each campus publishes its buildings with different fields, so the fields come from the campus's
 * `buildingPopup` declaration rather than from this component. They are read from the map's
 * definition, not from the clicked layer, because a building chosen from search arrives with no layer.
 *
 * No "Directions To Here": routing covers only the College Station network, which is why the campus
 * maps show no Directions tab either.
 */
@Component({
    selector: 'tamu-gisc-campus-building-popup',
    templateUrl: './campus-building-popup.component.html',
    styleUrls: ['../markdown-popup/markdown-popup.component.scss'],
    imports: [CopyComponent]
})
export class CampusBuildingPopupComponent extends BaseEventPopupComponent implements OnInit {
  public content: BuildingPopupContent = {};

  private readonly _settings = inject(EventSettingsQuery);

  constructor(
    router: Router,
    route: ActivatedRoute,
    plannerService: TripPlannerService,
    analytics: Angulartics2,
    mapService: EsriMapService
  ) {
    super(router, route, plannerService, analytics, mapService);
  }

  /**
   * The copy link names the building by its number, or by its abbreviation where it has no number,
   * rather than by the layer and object id it happens to sit at (#1481).
   *
   * Both the parameter names and the fields come from the campus's own declaration - the search
   * source for the names, `buildingPopup` for the fields - so nothing here is specific to one campus,
   * and a campus that declares neither keeps the generic `feature=` link.
   */
  protected override _getShareUrlIdentity(): { param: string; value: string | number } | null {
    const configuration = this._settings.eventConfiguration().configuration;
    const source = configuration?.searchSources?.find((searchSource) => searchSource.urlQueryParam !== undefined);

    return buildingShareIdentity(this.data?.attributes, configuration?.buildingPopup, source);
  }

  public override ngOnInit(): void {
    const fields = this._settings.eventConfiguration().configuration?.buildingPopup;

    if (fields) {
      // The copy link names the feature's layer. A search result has none, so give it the buildings
      // layer, the same marker the event service sets on a feature it opens from a link.
      if (!this.data.layer && !this.data.attributes?.__featureLayerId) {
        this.data.attributes = { ...this.data.attributes, __featureLayerId: fields.layerId };
      }

      this.content = buildingPopupContent(this.data.attributes, fields);
    }

    // A structure with no name, number or abbreviation at all still gets a heading.
    this.content.title = this.content.title ?? this.data.layer?.title;

    super.ngOnInit();
  }
}
