import { Component, OnInit } from '@angular/core';

import { AltSearchHelper, SearchSelection } from '@tamu-gisc/ui-kits/ngx/search';
import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPoint } from '@tamu-gisc/maps/feature/trip-planner';

import { MoveInOutSettingsService } from '../../../map/services/move-in-out-settings/move-in-out-settings.service';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-sidebar-reference',
  templateUrl: './sidebar-reference.component.html',
  styleUrls: ['./sidebar-reference.component.scss']
})
export class SidebarReferenceComponent<T extends esri.Graphic> implements OnInit {
  public shareUrl: string;
  public hasSettings: boolean;

  constructor(
    private readonly helper: AltSearchHelper,
    private readonly mapService: EsriMapService,
    private readonly mioSettings: MoveInOutSettingsService
  ) {}

  public ngOnInit(): void {
    this.hasSettings = this.mioSettings.queryParamsFromSettings !== null;
    this.shareUrl = `${window.location.href}/?${this.mioSettings.queryParamsFromSettings}`;
  }

  public onSearchResult(result: SearchSelection<T>) {
    this.helper.handleSearchResultFeatureSelection(result).subscribe((res) => {
      const tPoint = TripPoint.from(res);

      this.mapService.selectFeatures({
        graphics: [tPoint.toEsriGraphic()],
        shouldShowPopup: true,
        popupComponent: res.result.breadcrumbs.source.popupComponent
      });
    });
  }
}

