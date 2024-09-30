import { Component, OnInit } from '@angular/core';

import { AltSearchHelper, SearchSelection } from '@tamu-gisc/ui-kits/ngx/search';
import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPoint } from '@tamu-gisc/maps/feature/trip-planner';

import { MoveInOutSettingsService } from '../../../map/services/move-in-out-settings/move-in-out-settings.service';
import { MoveInSettings } from '../../../../interfaces/ring-day.interface';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-sidebar-reference',
  templateUrl: './sidebar-reference.component.html',
  styleUrls: ['./sidebar-reference.component.scss']
})
export class SidebarReferenceComponent implements OnInit {
  public shareUrl: string;
  public hasSettings: boolean;
  public settings: MoveInSettings;
  public moveDate: Date | undefined;

  constructor(
    private readonly helper: AltSearchHelper,
    private readonly mapService: EsriMapService,
    private readonly mioSettings: MoveInOutSettingsService
  ) {}

  public ngOnInit(): void {
    this.hasSettings = this.mioSettings.queryParamsFromSettings !== null;
    this.settings = this.mioSettings.settings;
    this.shareUrl = `${window.location.origin}${window.location.pathname}?${this.mioSettings.queryParamsFromSettings}`;
    this.moveDate = this.mioSettings.getMoveDateEventAsDate('in');
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
