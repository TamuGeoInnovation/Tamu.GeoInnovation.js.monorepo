import { Component, OnInit } from '@angular/core';

import { AltSearchHelper, SearchSelection } from '@tamu-gisc/ui-kits/ngx/search';
import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPoint } from '@tamu-gisc/maps/feature/trip-planner';

import { EventSettingsService } from '../../../../services/settings/event-settings.service';
import { EventConfiguration, EventSettings } from '../../../../interfaces/special-event.interface';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-sidebar-reference',
  templateUrl: './sidebar-reference.component.html',
  styleUrls: ['./sidebar-reference.component.scss']
})
export class SidebarReferenceComponent implements OnInit {
  public shareUrl: string;
  public hasSettings: boolean;
  public settings: EventSettings;
  public configuration: EventConfiguration;

  constructor(
    private readonly helper: AltSearchHelper,
    private readonly mapService: EsriMapService,
    private readonly eventSettingsService: EventSettingsService
  ) {}

  public ngOnInit(): void {
    this.hasSettings = this.eventSettingsService.queryParamsFromSettings !== null;
    this.configuration = this.eventSettingsService.eventConfiguration();
    this.shareUrl = `${window.location.origin}${window.location.pathname}?${this.eventSettingsService.queryParamsFromSettings}`;
  }

  public onSearchResult(result: SearchSelection<unknown>): void {
    this.helper.handleSearchResultFeatureSelection(result as SearchSelection<object>).subscribe((res) => {
      const tPoint = TripPoint.from(res as SearchSelection<esri.Graphic>);

      this.mapService.selectFeatures({
        graphics: [tPoint.toEsriGraphic()],
        shouldShowPopup: true,
        popupComponent: (res as SearchSelection<esri.Graphic>)?.result?.breadcrumbs.source.popupComponent
      });
    });
  }
}
