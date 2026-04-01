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
  public combineChildrenUnderPrimary = false;

  @Input()
  public useBikeRackLegendTransform: boolean | undefined = undefined;

  @Input()
  public legendSrcOverrides: Record<string, string> | undefined = undefined;

  public legend: Observable<Array<esri.ActiveLayerInfo>>;

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
    // Read route data to set input properties
    const routeData = this.route.snapshot.data;
    if (routeData) {
      this.deduplicate = routeData['deduplicate'] ?? this.deduplicate;
      this.respectDefinitionExpression = routeData['respectDefinitionExpression'] ?? this.respectDefinitionExpression;
      this.allowVisibilityToggle = routeData['allowVisibilityToggle'] ?? this.allowVisibilityToggle;
      this.excludedLayerIds = routeData['excludedLayerIds'] ?? this.excludedLayerIds;
      this.combineChildrenUnderPrimary =
        routeData['combineChildrenUnderPrimary'] ?? this.combineChildrenUnderPrimary;
      this.useBikeRackLegendTransform =
        routeData['useBikeRackLegendTransform'] ?? this.useBikeRackLegendTransform;
      this.legendSrcOverrides = routeData['legendSrcOverrides'] ?? this.legendSrcOverrides;
    }

    this.legend = this.legendService.legend({
      respectLayerVisibility: !this.allowVisibilityToggle,
      excludedLayerIds: this.excludedLayerIds
    });

    this.responsive = this.responsiveService.snapshot;
  }

  public ngOnDestroy() {
    this._destroy$.next(undefined);
    this._destroy$.complete();
  }

  public backAction(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
