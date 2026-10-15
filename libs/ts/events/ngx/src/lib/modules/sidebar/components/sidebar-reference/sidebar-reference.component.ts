import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AltSearchHelper, SearchSelection, SearchSource } from '@tamu-gisc/ui-kits/ngx/search';
import { EsriMapService } from '@tamu-gisc/maps/esri';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { TripPoint } from '@tamu-gisc/maps/feature/trip-planner';

import { EventSettingsService } from '../../../../services/settings/event-settings.service';
import { EventService } from '../../../../services/event/event.service';
import { EventConfiguration, EventSettings, ResolvedEventSettings } from '../../../../interfaces/special-event.interface';
import { SearchComponent } from '@tamu-gisc/ui-kits/ngx/search';
import { CopyComponent } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';
import { NgStyle, KeyValuePipe } from '@angular/common';
import { LayerListComponent } from '@tamu-gisc/maps/feature/layer-list';
import { LegendComponent } from '@tamu-gisc/maps/feature/legend';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-sidebar-reference',
  templateUrl: './sidebar-reference.component.html',
  styleUrls: ['./sidebar-reference.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SearchComponent, CopyComponent, NgStyle, LayerListComponent, LegendComponent, KeyValuePipe]
})
export class SidebarReferenceComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly helper = inject(AltSearchHelper);
  private readonly mapService = inject(EsriMapService);
  private readonly eventSettingsService = inject(EventSettingsService);
  private readonly environment = inject(EnvironmentService);
  private readonly eventService = inject(EventService);

  public shareUrl: string;
  public hasSettings: boolean;
  public settings: EventSettings;
  public mergedSettings: ResolvedEventSettings;
  public configuration: EventConfiguration | null;
  public legendAllowVisibilityToggle = false;
  public legendCombineChildrenUnderPrimary = false;
  public eventLayerIds: string[] = [];
  public legendForceShowLayerIds: string[] = [];
  public layerListOrderBy: 'title' | 'allowed' = 'title';
  public showResolvedSettingNotes = false;
  public hideLayerToggle = false;
  public searchSources?: SearchSource[];

  public ngOnInit(): void {
    this.hasSettings = this.eventSettingsService.queryParamsFromSettings !== null;
    this.configuration = this.eventSettingsService.eventConfiguration()?.configuration;
    this.showResolvedSettingNotes = this.configuration?.enableResolvedSettingNotes ?? false;
    this.legendAllowVisibilityToggle = this.configuration?.legendAllowVisibilityToggle ?? true;
    this.legendCombineChildrenUnderPrimary = this.configuration?.legendCombineChildrenUnderPrimary ?? false;
    this.layerListOrderBy = this.configuration?.referenceLayerListOrder === 'source' ? 'allowed' : 'title';
    this.legendForceShowLayerIds = this.configuration?.legendForceShowLayerIds ?? [];
    this.hideLayerToggle = this.configuration?.hideLayerToggle ?? false;
    // A map may declare sources only for its link parameters (`searchActive: false`); the sidebar
    // search then keeps the application-wide sources rather than searching nothing. One that searches
    // its own sources keeps the application-wide ones too when it asks to (`searchSourcesWithCampus`).
    const ownSources = this.configuration?.searchSources;
    const campusSources: SearchSource[] = this.configuration?.searchSourcesWithCampus
      ? (this.environment.value('SearchSources', true) ?? [])
      : [];
    this.searchSources = ownSources?.some((source) => source.searchActive) ? [...campusSources, ...ownSources] : undefined;
    const settings = this.eventSettingsService.settings();
    const options = this.eventSettingsService.eventOptions();
    this.eventLayerIds = this.eventSettingsService
      .eventLayerSources()
      .filter((source) => {
        for (const option of options) {
          const layerEffect = option.effects.layers?.find((l) => l.layerId === source.id);
          if (layerEffect?.conversions && settings) {
            const conversion = layerEffect.conversions.find((c) => c.input === settings[option.value]);
            if (conversion?.propOverrides?.visible === false) {
              return false;
            }
          }
        }
        return true;
      })
      .map((s) => s.id);
    this.shareUrl = `${window.location.origin}${window.location.pathname}?${this.eventSettingsService.queryParamsFromSettings}`;
    this.mergedSettings = this.eventSettingsService.getMergedSettings();
  }

  public onSearchResult(result: SearchSelection<unknown>): void {
    // A tent or named area from the map's own sources opens as the map's own feature, with its popup,
    // the way a `?tent=` or `?zone=` link does. Everything else is a campus result, handled below.
    const picked = (result.result as { breadcrumbs?: { source?: Partial<SearchSource> } })?.breadcrumbs?.source;
    const own = this.configuration?.searchSources?.find((source) => source.searchActive && source.source === picked?.source);

    if (own) {
      const fields = own.queryParams?.where?.keys ?? [];
      const attributes = (result.selection as { attributes?: Record<string, unknown> })?.attributes ?? {};
      const value = fields
        .map((field) => attributes[field])
        .find((candidate) => candidate !== null && candidate !== undefined && `${candidate}`.trim() !== '');

      if (value !== undefined) {
        this.eventService.selectFeatureByValue(`${value}`, fields);
        return;
      }
    }

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
