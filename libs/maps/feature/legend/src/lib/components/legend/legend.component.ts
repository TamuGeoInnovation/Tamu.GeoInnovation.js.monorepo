import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, model } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { ResponsiveService, ResponsiveSnapshot } from '@tamu-gisc/dev-tools/responsive';

import { LegendService } from '../../services/legend.service';
import { LegendCollectionComponent } from '../legend-collection/legend-collection.component';
import { AsyncPipe } from '@angular/common';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [LegendCollectionComponent, AsyncPipe]
})
export class LegendComponent implements OnInit, OnDestroy {
  private legendService = inject(LegendService);
  private responsiveService = inject(ResponsiveService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private analytics = inject(Angulartics2, { optional: true });

  /**
   * Certain layers may have duplicate icon/label entries as a result of their unique value renderer definitions.
   *
   * This flag will de-duplicate the legend entries based on the layer title.
   */
  public readonly deduplicate = model(false);

  public readonly respectDefinitionExpression = model(false);

  public readonly allowVisibilityToggle = model(false);

  public readonly excludedLayerIds = model<string[]>([]);

  public readonly allowedLayerIds = model<string[]>([]);

  /**
   * Layer ids that should always appear in the legend even when they start hidden and have never
   * been toggled on. Defaults to none, preserving the "only show ever-visible layers" behavior.
   */
  public readonly forceShowLayerIds = model<string[]>([]);

  public readonly combineChildrenUnderPrimary = model(false);

  public legend: Observable<Array<esri.ActiveLayerInfo>>;

  public responsive: ResponsiveSnapshot;

  private _destroy$: Subject<boolean> = new Subject();

  public ngOnInit() {
    // Route data overrides the inputs, which is why they are models.
    const routeData = this.route.snapshot.data;
    if (routeData) {
      this.deduplicate.set(routeData['deduplicate'] ?? this.deduplicate());
      this.respectDefinitionExpression.set(routeData['respectDefinitionExpression'] ?? this.respectDefinitionExpression());
      this.allowVisibilityToggle.set(routeData['allowVisibilityToggle'] ?? this.allowVisibilityToggle());
      this.excludedLayerIds.set(routeData['excludedLayerIds'] ?? this.excludedLayerIds());
      this.allowedLayerIds.set(routeData['allowedLayerIds'] ?? this.allowedLayerIds());
      this.forceShowLayerIds.set(routeData['forceShowLayerIds'] ?? this.forceShowLayerIds());
      this.combineChildrenUnderPrimary.set(routeData['combineChildrenUnderPrimary'] ?? this.combineChildrenUnderPrimary());
    }

    this.legend = this.legendService.legend({
      excludedLayerIds: this.excludedLayerIds(),
      allowedLayerIds: this.allowedLayerIds(),
      forceShowLayerIds: this.forceShowLayerIds()
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
