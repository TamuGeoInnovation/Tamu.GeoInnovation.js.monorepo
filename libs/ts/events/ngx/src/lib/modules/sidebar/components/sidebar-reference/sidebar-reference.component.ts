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
  public moveInSummary: string | null = null;

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
    this.shareUrl = `${window.location.origin}${window.location.pathname}?${this.eventSettingsService.queryParamsFromSettings}`;
    this.mergedSettings = this.eventSettingsService.getMergedSettings();

    if (this.configuration?.id === 'move-in') {
      const selectedDate = this.mergedSettings.find((s) => s.key === 'move-in-date')?.option?.label;
      const selectedHall = this.mergedSettings.find((s) => s.key === 'move-in-residence-hall')?.option?.label;
      const selectedAccessible = this.mergedSettings.find((s) => s.key === 'move-in-accessible-parking')?.option?.label;

      if (selectedDate && selectedHall) {
        this.moveInSummary = `${selectedDate} @ ${selectedHall}${
          selectedAccessible === 'Yes' ? ' with accessible parking accommodations.' : '.'
        }`;
      }
    }
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
