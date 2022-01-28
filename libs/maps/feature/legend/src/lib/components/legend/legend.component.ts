import { Component, OnInit, OnDestroy, Optional } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';

import { Angulartics2 } from 'angulartics2';
import { v4 as guid } from 'uuid';

import { ResponsiveService, ResponsiveSnapshot } from '@tamu-gisc/dev-tools/responsive';

import { LegendService } from '../../services/legend.service';

import esri = __esri;
import { LegendItem } from '@tamu-gisc/common/types';

@Component({
  selector: 'tamu-gisc-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss']
})
export class LegendComponent implements OnInit, OnDestroy {
  public legend: Observable<Array<esri.ActiveLayerInfo>>;
  public staticLegend: Array<LegendItem>;

  public responsive: ResponsiveSnapshot;

  private _destroy$: Subject<boolean> = new Subject();

  constructor(
    private legendService: LegendService,
    private responsiveService: ResponsiveService,
    private router: Router,
    private route: ActivatedRoute,
    @Optional() private analytics: Angulartics2
  ) {}

  public ngOnInit() {
    this.legend = this.legendService.legend();
    this.staticLegend = this.legendService.staticLegendItems;

    this.responsive = this.responsiveService.snapshot;
  }

  public ngOnDestroy() {
    this._destroy$.next(undefined);
    this._destroy$.complete();
  }

  /**
   * Reports any legend clicks to Google Analytics
   */
  public analyticsReport(title: string): void {
    const label = {
      guid: guid(),
      date: Date.now(),
      value: title
    };

    this.analytics.eventTrack.next({
      action: 'Legend Click',
      properties: {
        category: 'UI Interaction',
        label: JSON.stringify(label)
      }
    });
  }

  public backAction(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
