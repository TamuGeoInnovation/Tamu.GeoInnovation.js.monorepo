import { Component, OnInit, OnDestroy, Optional, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { ResponsiveService, ResponsiveSnapshot } from '@tamu-gisc/dev-tools/responsive';

import { LegendService } from '../../services/legend.service';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss']
})
export class LegendComponent implements OnInit, OnDestroy {
  /**
   * Certain layers may have duplicate icon/label entries as a result of their unique value renderer definitions.
   *
   * This flag will de-duplicate the legend entries based on the layer title.
   */
  @Input()
  public deduplicate = false;

  @Input()
  public respectDefinitionExpression = false;

  @Input()
  public allowVisibilityToggle = false;

  @Input()
  public excludedLayerIds: string[] = [];

  @Input()
  public allowedLayerIds: string[] = [];

  /**
   * Layer ids that should always appear in the legend even when they start hidden and have never
   * been toggled on. Defaults to none, preserving the "only show ever-visible layers" behavior.
   */
  @Input()
  public forceShowLayerIds: string[] = [];

  @Input()
  public combineChildrenUnderPrimary = false;

  public legend: Observable<Array<esri.ActiveLayerInfo>>;

  public responsive: ResponsiveSnapshot;

  private _destroy$: Subject<void> = new Subject<void>();

  constructor(
    private legendService: LegendService,
    private responsiveService: ResponsiveService,
    private router: Router,
    private route: ActivatedRoute,
    @Optional() private analytics: Angulartics2
  ) {}

  public ngOnInit() {
    // Read route data to set input properties
    const routeData = this.route.snapshot.data;
    if (routeData) {
      this.deduplicate = routeData['deduplicate'] ?? this.deduplicate;
      this.respectDefinitionExpression = routeData['respectDefinitionExpression'] ?? this.respectDefinitionExpression;
      this.allowVisibilityToggle = routeData['allowVisibilityToggle'] ?? this.allowVisibilityToggle;
      this.excludedLayerIds = routeData['excludedLayerIds'] ?? this.excludedLayerIds;
      this.allowedLayerIds = routeData['allowedLayerIds'] ?? this.allowedLayerIds;
      this.forceShowLayerIds = routeData['forceShowLayerIds'] ?? this.forceShowLayerIds;
      this.combineChildrenUnderPrimary =
        routeData['combineChildrenUnderPrimary'] ?? this.combineChildrenUnderPrimary;
    }

    this.legend = this.legendService.legend({
      excludedLayerIds: this.excludedLayerIds,
      allowedLayerIds: this.allowedLayerIds,
      forceShowLayerIds: this.forceShowLayerIds
    });

    this.responsive = this.responsiveService.snapshot;
  }

  public ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public backAction(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
