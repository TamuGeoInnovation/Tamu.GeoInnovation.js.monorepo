import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AltSearchHelper, SearchSelection } from '@tamu-gisc/ui-kits/ngx/search';
import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPoint } from '@tamu-gisc/maps/feature/trip-planner';

import { EventSettingsService } from '../../../../services/settings/event-settings.service';
import { EventConfiguration, EventSettings, ResolvedEventSettings } from '../../../../interfaces/special-event.interface';

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
  public mergedSettings: ResolvedEventSettings;
  public configuration: EventConfiguration | null;
  public legendAllowVisibilityToggle = false;
  public legendCombineChildrenUnderPrimary = false;
  public legendExcludedLayerIds: string[] = [];
  public showResolvedSettingNotes = false;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly helper: AltSearchHelper,
    private readonly mapService: EsriMapService,
    private readonly eventSettingsService: EventSettingsService
  ) {}

  public ngOnInit(): void {
    this.hasSettings = this.eventSettingsService.queryParamsFromSettings !== null;
    this.configuration = this.eventSettingsService.eventConfiguration()?.configuration;
    this.showResolvedSettingNotes = this.configuration?.enableResolvedSettingNotes ?? false;
    this.legendAllowVisibilityToggle = this.configuration?.legendAllowVisibilityToggle ?? false;
    this.legendCombineChildrenUnderPrimary = this.configuration?.legendCombineChildrenUnderPrimary ?? false;
    this.legendExcludedLayerIds = this.configuration?.legendExcludedLayerIds ?? [];
    this.shareUrl = `${window.location.origin}${window.location.pathname}?${this.eventSettingsService.queryParamsFromSettings}`;
    this.mergedSettings = this.eventSettingsService.getMergedSettings();
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

  public navigateSettingsReview(): void {
    this.router.navigate(['builder/review'], {
      relativeTo: this.route.parent?.parent?.parent?.parent
    });
  }
}
