import { Component, OnInit, Input } from '@angular/core';
import { Observable, Subject, BehaviorSubject, combineLatest, from, of } from 'rxjs';
import { pluck, shareReplay, switchMap, filter, toArray, take } from 'rxjs/operators';

import { LayerListService, LayerListItem } from '@tamu-gisc/maps/feature/layer-list';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-layer-filter',
  templateUrl: './layer-filter.component.html',
  styleUrls: ['./layer-filter.component.scss']
})
export class LayerFilterComponent implements OnInit {
  constructor(private layerList: LayerListService) {}
  /**
   * Layer ID reference.
   *
   * The layer must exist as part of the `LayerSources` definition in the application enviroinment.
   */
  @Input()
  public reference: string;

  /**
   * Resolved layer from layer list service.
   */
  public layer: Observable<LayerListItem<esri.FeatureLayer>>;

  private operators = [
    {
      description: 'Equal to',
      op: '=',
      types: [
        'esriFieldTypeOID',
        'esriFieldTypeString',
        'esriFieldTypeSmallInteger',
        'esriFieldTypeInteger',
        'esriFieldTypeDate'
      ]
    },
    {
      description: 'Less than',
      op: '<',
      types: ['esriFieldTypeOID', 'esriFieldTypeSmallInteger', 'esriFieldTypeInteger', 'esriFieldTypeDate']
    },
    {
      description: 'Less than or equal to',
      op: '<=',
      types: ['esriFieldTypeOID', 'esriFieldTypeSmallInteger', 'esriFieldTypeInteger', 'esriFieldTypeDate']
    },
    {
      description: 'Greater than',
      op: '>',
      types: ['esriFieldTypeOID', 'esriFieldTypeSmallInteger', 'esriFieldTypeInteger', 'esriFieldTypeDate']
    },
    {
      description: 'Greater than or equal to',
      op: '>=',
      types: ['esriFieldTypeOID', 'esriFieldTypeSmallInteger', 'esriFieldTypeInteger', 'esriFieldTypeDate']
    }
  ];

  public field: Subject<string> = new Subject();

  public allowedOperators = this.field.pipe(
    switchMap((type) => {
      return from(this.operators).pipe(
        filter((o: any) => {
          return o.types.includes(type);
        }),
        toArray()
      );
    })
  );

  public fieldUniqueValues = this.field
    .pipe(
      switchMap((type) => {
        return this.layer.pipe(
          switchMap((listitem) => {
            return from((listitem.layer.queryFeatures({
              returnDistinctValues: true,
              outFields: ['Species'],
              where: '1=1'
            }) as any) as Promise<any>);
          })
        );
      })
    )
    .subscribe((res) => {
      debugger;
    });

  public ngOnInit() {
    this.layer = this.layerList.layers({ layers: this.reference, watchProperties: 'loaded' }).pipe(
      pluck('0'),
      shareReplay<LayerListItem<esri.FeatureLayer>>(1)
    );
  }
}
