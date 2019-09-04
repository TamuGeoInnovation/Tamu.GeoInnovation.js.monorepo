import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Angulartics2 } from 'angulartics2';
import * as guid from 'uuid/v4';

import { RouterHistoryService } from '../../../../services/router-history.service';
import { ResponsiveService, ResponsiveSnapshot } from '@tamu-gisc/dev-tools/responsive';
import { LegendService } from '../../../../services/ui/legend.service';

import { LegendItem } from '@tamu-gisc/common/types';

@Component({
  selector: 'legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss']
})
export class LegendComponent implements OnInit, OnDestroy {
  public legend: Observable<LegendItem[]>;

  public responsive: ResponsiveSnapshot;

  private _lastRoute: string;

  private _destroy$: Subject<boolean> = new Subject();

  constructor(
    private legendService: LegendService,
    private analytics: Angulartics2,
    private responsiveService: ResponsiveService,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private history: RouterHistoryService
  ) {}

  public ngOnInit() {
    this.legend = this.legendService.store;
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

  /**
   * Reports any legend clicks to Google Analytics
   *
   * @memberof LegendComponent
   */
  public analyticsReport(item: LegendItem): void {
    const label = {
      guid: guid(),
      date: Date.now(),
      value: item.title
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
    // if (this._lastRoute) {
    //   this.router.navigate([this._lastRoute]);
    // } else {
    //   this.location.back();
    // }

    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
