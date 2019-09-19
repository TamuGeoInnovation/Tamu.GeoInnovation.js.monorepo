import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Angulartics2 } from 'angulartics2';
import * as guid from 'uuid/v4';

import { ResponsiveService, ResponsiveSnapshot } from '@tamu-gisc/dev-tools/responsive';
import { RouterHistoryService } from '../../../../services/router-history.service';
import { LayerListService } from '../../../../services/ui/layer-list.service';
import { EsriMapService } from '@tamu-gisc/maps/esri';
import { LegendService } from '../../../../services/ui/legend.service';

import { LayerListItem } from '../../../../services/ui/layer-list.service';

import { LayerSources } from '../../../../../../environments/environment';

import esri = __esri;

@Component({
  selector: 'layer-list',
  templateUrl: './layer-list.component.html',
  styleUrls: ['./layer-list.component.scss']
})
export class LayerListComponent implements OnInit, OnDestroy {
  public layers: Observable<any>;

  public responsive: ResponsiveSnapshot;

  private _lastRoute: string;

  private _destroy$: Subject<boolean> = new Subject();

  constructor(
    private layerListService: LayerListService,
    private mapService: EsriMapService,
    private legendService: LegendService,
    private analytics: Angulartics2,
    private responsiveService: ResponsiveService,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private history: RouterHistoryService
  ) {}

  public ngOnInit() {
    this.layers = this.layerListService.store;
    this.responsive = this.responsiveService.snapshot;

    this.history
      .last()
      .pipe(takeUntil(this._destroy$))
      .subscribe((event: any) => {
        this._lastRoute = event.url;
      });
  }

  public ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public toggleLayer(listItem: LayerListItem): void {
    // If the list item contains an initialized layer, flip the visible value.
    if (listItem.layer) {
      listItem.layer.visible = !listItem.layer.visible;

      // Send layer to legend service to check if it should be removed form the legend.
      this.legendService.toggleLayerLegendItems(listItem.layer);

      const label = {
        guid: guid(),
        date: Date.now(),
        value: {
          layer: listItem.layer.title,
          visible: listItem.layer.visible
        }
      };

      // Reporting string with existing layer details.
      this.analytics.eventTrack.next({
        action: 'Layer Toggle',
        properties: {
          category: 'UI Interaction',
          label: JSON.stringify(label)
        }
      });
    } else {
      // If the list does not contain an initialized layer, attempt and find the source by reference id.
      const source = LayerSources.find((src) => src.id === listItem.id);

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

          // Report the event when we have a layer value
          this.analytics.eventTrack.next({
            action: 'Layer Toggle',
            properties: {
              category: 'UI Interaction',
              label: JSON.stringify(label)
            }
          });
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
