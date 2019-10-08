import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable, Subject, from, combineLatest, of } from 'rxjs';
import { pluck, shareReplay, switchMap, filter, toArray, reduce, take, tap } from 'rxjs/operators';

import { LayerListService, LayerListItem } from '@tamu-gisc/maps/feature/layer-list';
import { makeWhere } from '@tamu-gisc/common/utils/database';

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
   *
   * Used to query and retrieve valid attributes and valies.
   */
  @Input()
  public reference: string;

  @Input()
  public setDefinitionExpression: boolean;

  @Input()
  public executeFilterQuery: boolean;

  @Output()
  public completeFilter: EventEmitter<string> = new EventEmitter();

  /**
   * Resolved layer from layer list service.
   */
  public layer: Observable<LayerListItem<esri.FeatureLayer>>;

  /**
   * Field operator definition dictionary.
   *
   * Based on the field selected, the operator list will be populated to only show the allowed operators
   * for its respective data type.
   */
  private operators: EsriFieldOperator[] = [
    {
      description: 'Equal to',
      op: '=',
      types: ['oid', 'string', 'small-integer', 'integer', 'date']
    },
    {
      description: 'Less than',
      op: '<',
      types: ['oid', 'small-integer', 'integer', 'date']
    },
    {
      description: 'Less than or equal to',
      op: '<=',
      types: ['oid', 'small-integer', 'integer', 'date']
    },
    {
      description: 'Greater than',
      op: '>',
      types: ['oid', 'small-integer', 'integer', 'date']
    },
    {
      description: 'Greater than or equal to',
      op: '>=',
      types: ['oid', 'small-integer', 'integer', 'date']
    }
  ];

  /**
   * Subject emitting the user-selected Field.
   */
  public field: Subject<esri.Field> = new Subject();
  public operator: Subject<string> = new Subject();
  public value: Subject<any> = new Subject();

  /**
   * Observable stream returning an array limiting field
   * operators by the piped field `type`.
   */
  public allowedOperators = this.field.pipe(
    switchMap((field) => {
      return from(this.operators).pipe(
        filter((f) => {
          return f.types.includes(field.type);
        }),
        toArray()
      );
    })
  );

  /**
   * Observable that performs a query against the FeatureLayer to retrieve
   * all of the unique values for the user-selected layer attribute..
   */
  public fieldUniqueValues = this.field.pipe(
    switchMap((field) => {
      return this.layer.pipe(
        switchMap((listitem) => {
          return from((listitem.layer.queryFeatures({
            returnDistinctValues: true,
            outFields: [field.name],
            where: '1=1'
          }) as any) as Promise<esri.FeatureSet>);
        }),
        pluck('features'),
        take(1),
        switchMap((features) => from(features)),
        reduce((acc, curr) => {
          return [...acc, { value: curr.attributes[field.name] }];
        }, [])
      );
    })
  );

  /**
   * Generated definitionExpression applied to the layer to filter displayed features.
   */
  public filterExpression = combineLatest([this.field, this.operator, this.value])
    .pipe(
      switchMap((values) => {
        const [field, operator, value] = values;
        const where = makeWhere([field.name], [value], [operator], null, ['UPPER']);

        return of(where);
      }),
      switchMap((where) => combineLatest([of(where), this.layer.pipe(pluck('layer'))])),
      tap((args) => {
        if (Boolean(this.setDefinitionExpression)) {
          const [w, l] = args;

          l.definitionExpression = w;
        }
      })
    )
    .subscribe((res) => {
      this.completeFilter.emit(res[0]);
      console.log(`Definition Expression set to ${res[0]}`);
    });

  public ngOnInit() {
    // Initial subscription to the layer list service that will retrieve the referenced layer id
    // and watch provided layer primitive properties.
    this.layer = this.layerList.layers({ layers: this.reference, watchProperties: 'loaded' }).pipe(
      pluck('0'),
      shareReplay<LayerListItem<esri.FeatureLayer>>(1)
    );
  }
}

export interface EsriFieldOperator {
  /**
   * Friendly display name.
   */
  description: string;

  /**
   * SQL-like operator
   */
  op: string;

  /**
   * List of possible data types.
   */
  types: Array<
    | 'small-integer'
    | 'integer'
    | 'single'
    | 'double'
    | 'long'
    | 'string'
    | 'date'
    | 'oid'
    | 'geometry'
    | 'blob'
    | 'raster'
    | 'guid'
    | 'global-id'
    | 'xml'
  >;
}
