import { Component, OnInit, OnDestroy, Optional, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { ResponsiveService, ResponsiveSnapshot } from '@tamu-gisc/dev-tools/responsive';
import { LegendItem } from '@tamu-gisc/common/types';

import { LegendService } from '../../services/legend.service';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss']
})
export class LegendComponent implements OnInit, OnDestroy {
  /**
   * Describes the order to display static LegendSources. Defaults to `top`.
   */
  @Input()
  public staticElementsPosition: 'top' | 'bottom' = 'top';

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

    // Since this component can be used stand-alone as part of an applications routing, the same static element
    // positioning can be set via the route data.
    if (this.route.snapshot.data && this.route.snapshot.data.staticElementsPosition) {
      this.staticElementsPosition = this.route.snapshot.data.staticElementsPosition;
    }
  }

  public ngOnDestroy() {
    this._destroy$.next(undefined);
    this._destroy$.complete();
  }

  public backAction(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
