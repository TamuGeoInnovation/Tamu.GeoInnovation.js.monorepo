import { Component, OnInit } from '@angular/core';

import { AltSearchHelper, SearchSelection } from '@tamu-gisc/ui-kits/ngx/search';
import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPoint } from '@tamu-gisc/maps/feature/trip-planner';

import { GameDaySettingsService } from '../../../map/services/settings/game-day-settings.service';
import { FootballSettings, GAMEDAY_EVENT_NAMES, SHOWDOWN_EVENT } from '../../../../interfaces/football.interface';


@Component({
  selector: 'tamu-gisc-sidebar-reference',
  templateUrl: './sidebar-reference.component.html',
  styleUrls: ['./sidebar-reference.component.scss']
})
export class SidebarReferenceComponent implements OnInit {
  public shareUrl: string;
  public hasSettings: boolean;
  public settings: FootballSettings;
  public eventName: SHOWDOWN_EVENT;
  public eventNames = GAMEDAY_EVENT_NAMES;

  constructor(
    private readonly helper: AltSearchHelper,
    private readonly mapService: EsriMapService,
    private readonly eventSettingsService: GameDaySettingsService
  ) {}

  public ngOnInit(): void {
    this.hasSettings = this.eventSettingsService.queryParamsFromSettings !== null;
    this.settings = this.eventSettingsService.settings;
    this.shareUrl = `${window.location.origin}${window.location.pathname}?${this.eventSettingsService.queryParamsFromSettings}`;
    this.eventName = this.eventSettingsService.savedEventType;
  }

  public onSearchResult(result: SearchSelection<unknown>): void {
    this.helper.handleSearchResultFeatureSelection(result as SearchSelection<object>).subscribe((res) => {
      const tPoint = TripPoint.from(res as SearchSelection<__esri.Graphic>);

      this.mapService.selectFeatures({
        graphics: [tPoint.toEsriGraphic()],
        shouldShowPopup: true,
        popupComponent: (res as SearchSelection<__esri.Graphic>)?.result?.breadcrumbs.source.popupComponent
      });
    });
  }
}
