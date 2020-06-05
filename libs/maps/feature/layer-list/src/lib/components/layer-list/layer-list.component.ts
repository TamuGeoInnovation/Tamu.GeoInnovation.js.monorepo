import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, RouterEvent } from '@angular/router';
import { Location } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { takeUntil, shareReplay } from 'rxjs/operators';

// import { Angulartics2 } from 'angulartics2';
import { v4 as guid } from 'uuid';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { EsriMapService } from '@tamu-gisc/maps/esri';
import { LayerListService, LayerListItem } from '../../services/layer-list.service';
import { ResponsiveService, ResponsiveSnapshot } from '@tamu-gisc/dev-tools/responsive';

import { RouterHistoryService } from '@tamu-gisc/common/ngx/router';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-layer-list',
  templateUrl: './layer-list.component.html',
  styleUrls: ['./layer-list.component.scss']
})
export class LayerListComponent implements OnInit, OnDestroy {
  public layers: Observable<{}>;

  public responsive: ResponsiveSnapshot;

  private _lastRoute: string;
  private _layerSources;

  private _destroy$: Subject<boolean> = new Subject();

  constructor(
    private layerListService: LayerListService,
    private mapService: EsriMapService,
    // private analytics: Angulartics2,
    private responsiveService: ResponsiveService,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private history: RouterHistoryService,
    private environment: EnvironmentService
  ) {}

  public ngOnInit() {
    this._layerSources = this.environment.value('LayerSources');

    this.layers = this.layerListService.layers();
    this.responsive = this.responsiveService.snapshot;

    this.history
      .last()
      .pipe(takeUntil(this._destroy$))
      .subscribe((event: RouterEvent) => {
        this._lastRoute = event.url;
      });
  }

  public ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public toggleLayer(listItem: LayerListItem<esri.Layer>): void {
    // If the list item contains an initialized layer, flip the visible value.
    if (listItem.layer) {
      listItem.layer.visible = !listItem.layer.visible;

      // Send layer to legend service to check if it should be removed form the legend.
      // this.legendService.toggleLayerLegendItems(listItem.layer);

      const label = {
        guid: guid(),
        date: Date.now(),
        value: {
          layer: listItem.layer.title,
          visible: listItem.layer.visible
        }
      };

      // // Reporting string with existing layer details.
      // this.analytics.eventTrack.next({
      //   action: 'Layer Toggle',
      //   properties: {
      //     category: 'UI Interaction',
      //     label: JSON.stringify(label)
      //   }
      // });
    } else {
      // If the list does not contain an initialized layer, attempt and find the source by reference id.
      const source = this._layerSources.find((src) => src.id === listItem.id);

      // If source is found, create a layer from it.
      if (source) {
        this.mapService.findLayerOrCreateFromSource(source).then((layer) => {
          const label = {
            guid: guid(),
            date: Date.now(),
            value: {
              layer: layer.title,
              visible: layer.visible
            }
          };

          // // Report the event when we have a layer value
          // this.analytics.eventTrack.next({
          //   action: 'Layer Toggle',
          //   properties: {
          //     category: 'UI Interaction',
          //     label: JSON.stringify(label)
          //   }
          // });
        });
      }
    }
  }

  public backAction(): void {
    // if (this._lastRoute) {
    //   this.router.navigate([this._lastRoute]);
    // } else {
    //   this.location.back();
    // }

    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
