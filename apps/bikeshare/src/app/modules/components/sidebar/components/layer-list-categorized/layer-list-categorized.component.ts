import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { from, Subject } from 'rxjs';
import { mergeMap, groupBy, reduce, map, toArray, takeUntil } from 'rxjs/operators';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { LegendService } from '../../../../services/ui/legend.service';
import { LayerListService, LayerListCategory } from '../../../../services/ui/layer-list.service';
import { RouterHistoryService } from '../../../../services/router-history.service';
import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';

import { LayerListComponent } from '../layer-list/layer-list.component';

import { Angulartics2 } from 'angulartics2';

@Component({
  selector: 'layer-list-categorized',
  templateUrl: './layer-list-categorized.component.html',
  styleUrls: ['../layer-list/layer-list.component.scss']
})
export class LayerListCategorizedComponent extends LayerListComponent implements OnInit, OnDestroy {
  public categorized: Array<LayerListCategory>;

  private _$destroy: Subject<any> = new Subject();

  constructor(
    private lyrs: LayerListService,
    private ms: EsriMapService,
    private legs: LegendService,
    private anl: Angulartics2,
    private res: ResponsiveService,
    private loc: Location,
    private rtr: Router,
    private rt: ActivatedRoute,
    private hs: RouterHistoryService
  ) {
    super(lyrs, ms, legs, anl, res, loc, rtr, rt, hs);
  }

  public ngOnInit() {
    super.ngOnInit();

    // Create a subscription to the layer list store value
    // and transform the value into a layer list category object array.
    this.lyrs.store
      .pipe(
        mergeMap((arr) =>
          from(arr).pipe(
            groupBy((item) => item.category),
            mergeMap((group) => group.pipe(reduce((acc: any, cur: any) => [...acc, cur], []))),
            map((val) => {
              return {
                layers: [...val],
                title: val[0].category,
                expanded: false
              };
            }),
            toArray(),
            takeUntil(this._$destroy)
          )
        )
      )
      .subscribe((categories: LayerListCategory[]) => {
        // Once we have all the layer categories (LayerListCategory objects), transfer any expanded properties to keep
        // expanded categories expanded after the re-render triggered by model update.
        this.merge(categories);
      });
  }

  public ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
  }

  /**
   * Compares and transfers old "expanded" category values to updated categorized
   * layers to prevent categories from collapsing on view re-render
   *
   * @param {LayerListCategory[]} categories
   * @memberof LayerListCategorizedComponent
   */
  public merge(categories: LayerListCategory[]) {
    if (categories && categories.length > 0) {
      this.categorized = categories.map(
        (cat): LayerListCategory => {
          if (this.categorized && this.categorized.length > 0) {
            const existingCategory = this.categorized.find((l) => l.title === cat.title);
            if (existingCategory) {
              return {
                title: cat.title,
                expanded: existingCategory.expanded,
                layers: cat.layers
              };
            } else {
              return cat;
            }
          } else {
            return cat;
          }
        }
      );
    } else {
      this.categorized = categories;
    }
  }
}
