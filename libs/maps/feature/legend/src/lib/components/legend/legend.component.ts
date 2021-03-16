import { Component, OnInit, OnDestroy, Optional } from '@angular/core';
import { Router, ActivatedRoute, RouterEvent } from '@angular/router';
import { Location } from '@angular/common';
import { forkJoin, fromEvent, fromEventPattern, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { Angulartics2 } from 'angulartics2';
import { v4 as guid } from 'uuid';

import { RouterHistoryService } from '@tamu-gisc/common/ngx/router';
import { ResponsiveService, ResponsiveSnapshot } from '@tamu-gisc/dev-tools/responsive';
import { LegendService } from '../../services/legend.service';

import { LegendItem } from '@tamu-gisc/common/types';
import { EsriMapService, EsriModuleProviderService, MapServiceInstance } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss']
})
export class LegendComponent implements OnInit, OnDestroy {
  public legend: Observable<LegendItem[]>;
  public legendItems: Observable<Array<esri.ActiveLayerInfo>>;

  public responsive: ResponsiveSnapshot;

  private _lastRoute: string;

  private _destroy$: Subject<boolean> = new Subject();

  private model: esri.LegendViewModel;
  private _handle: esri.Handle;

  constructor(
    private legendService: LegendService,
    private responsiveService: ResponsiveService,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private history: RouterHistoryService,
    private moduleProvider: EsriModuleProviderService,
    private mapService: EsriMapService
  ) {}

  public ngOnInit() {
    this.legend = this.legendService.store;
    this.responsive = this.responsiveService.snapshot;

    this.history
      .last()
      .pipe(takeUntil(this._destroy$))
      .subscribe((event: RouterEvent) => {
        this._lastRoute = event.url;
      });

    forkJoin([this.moduleProvider.require(['LegendViewModel']), this.mapService.store]).subscribe(
      ([[LegendViewModel], instances]: [[esri.LegendViewModelConstructor], MapServiceInstance]) => {
        this.model = new LegendViewModel({
          view: instances.view
        });

        // Create add/remove watch handlers for the activeLayerInfos property of the view model.
        // These are used to create a subscribable event stream.
        const add = (handler) => {
          if (this._handle === undefined) {
            this._handle = this.model.activeLayerInfos.on('change', handler);
          }
        };

        const remove = (handler): void => {
          if (this._handle) {
            this._handle.remove();
          }
        };

        // For every item, attempt to create a layer
        this.legendItems = fromEventPattern(add, remove).pipe(
          map((event: IActiveLayerInfosChangeEvent) => {
            return event.target.toArray();
          })
        );
      }
    );
  }

  public ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Reports any legend clicks to Google Analytics
   */
  // public analyticsReport(item: LegendItem): void {
  //   const label = {
  //     guid: guid(),
  //     date: Date.now(),
  //     value: item.title
  //   };

  //   this.analytics.eventTrack.next({
  //     action: 'Legend Click',
  //     properties: {
  //       category: 'UI Interaction',
  //       label: JSON.stringify(label)
  //     }
  //   });
  // }

  public backAction(): void {
    // if (this._lastRoute) {
    //   this.router.navigate([this._lastRoute]);
    // } else {
    //   this.location.back();
    // }

    this.router.navigate(['../'], { relativeTo: this.route });
  }
}

interface IActiveLayerInfosChangeEvent {
  added: Array<esri.ActiveLayerInfo>;
  moved: Array<esri.ActiveLayerInfo>;
  removed: Array<esri.ActiveLayerInfo>;
  target: esri.LegendViewModel['activeLayerInfos'];
}
