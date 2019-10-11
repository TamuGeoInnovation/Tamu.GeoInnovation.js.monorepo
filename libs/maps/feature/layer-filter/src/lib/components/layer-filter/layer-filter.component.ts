import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable, Subject, from, combineLatest, of, iif, forkJoin, merge } from 'rxjs';
import { pluck, shareReplay, switchMap, filter, toArray, reduce, take, tap, map, mergeAll, startWith } from 'rxjs/operators';

import { EsriMapService, EsriModuleProviderService } from '@tamu-gisc/maps/esri';
import { LayerListService, LayerListItem } from '@tamu-gisc/maps/feature/layer-list';
import { makeWhere } from '@tamu-gisc/common/utils/database';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-layer-filter',
  templateUrl: './layer-filter.component.html',
  styleUrls: ['./layer-filter.component.scss']
})
export class LayerFilterComponent implements OnInit {
  constructor(
    private layerList: LayerListService,
    private moduleProvider: EsriModuleProviderService,
    private mapService: EsriMapService
  ) {}
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
  public filterGeometry: Observable<esri.Graphic>;

  @Input()
  public spatialRelationship: 'intersects' | 'contains' | 'disjoint' = 'intersects';

  @Input()
  public setDefinitionExpression: boolean;

  @Input()
  public executeFilterQuery: boolean;

  @Output()
  public filterCompleted: EventEmitter<string> = new EventEmitter();

  @Output()
  public filterQueryResults: EventEmitter<esri.Graphic[]> = new EventEmitter();

  /**
   * Resolved layer from layer list service.
   */
  public layer: Observable<esri.FeatureLayer>;

  private layerView: Observable<esri.LayerView>;

  private mapView: Observable<esri.View>;

  private featureFilterModule: Observable<esri.FeatureFilterConstructor>;

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
   * Subjects emitting the user-selected select values.
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
        switchMap((layer) => {
          return from((layer.queryFeatures({
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
   * Generated definitionExpression that will be used to apply to the feature layer view.
   */
  private filterExpression = combineLatest([this.field, this.operator, this.value]).pipe(
    map((values: any) => {
      const [field, operator, value] = values;
      const where = makeWhere([field.name], [value], [operator], null, ['UPPER']);

      return where;
    }),
    startWith('1=1')
  );

  //   switchMap((where) => combineLatest([of(where), this.layer.pipe(pluck('layer'))])),
  //   switchMap(([where, layer]) =>
  //     forkJoin([
  //       of(where),
  //       of(layer),
  //       iif(
  //         () => Boolean(this.executeFilterQuery),
  //         from((layer.queryFeatures({ where: where, outFields: ['*'] }) as any) as Promise<esri.FeatureSet>),
  //         of(false)
  //       )
  //     ])
  //   ),
  //   tap(([where, layer, queryResult]) => {
  //     if (Boolean(this.setDefinitionExpression)) {
  //       layer.definitionExpression = where;
  //     }
  //   })
  // )
  // .subscribe(([where, layer, queryResult]) => {
  //   this.filterCompleted.emit(where);

  //   if (Boolean(queryResult)) {
  //     this.filterQueryResults.emit((<esri.FeatureSet>queryResult).features);
  //   }
  //   console.log(`Definition Expression set to ${where}`);
  // });

  public ngOnInit() {
    // Get FeatureFilter class
    this.featureFilterModule = from(this.moduleProvider.require(['FeatureFilter'])).pipe(pluck('0'));

    // Get only the view from the map service store instance.
    this.mapView = this.mapService.store.pipe(pluck('view'));

    // Initial subscription to the layer list service that will retrieve the referenced layer id
    // and watch provided layer primitive properties.
    this.layer = this.layerList.layers({ layers: this.reference, watchProperties: 'loaded' }).pipe(
      pluck<LayerListItem<esri.Layer>[], esri.FeatureLayer>('0', 'layer'),
      filter((l) => l !== undefined),
      take(1),
      shareReplay(1)
    );

    // Once the map view and layer are loaded, get the layerview for the feature layer.
    this.layerView = combineLatest([this.mapView, this.layer]).pipe(
      switchMap(([view, layer]) => {
        return from((view.whenLayerView(layer) as any) as Promise<esri.LayerView>);
      })
    );

    combineLatest([this.filterExpression, this.featureFilterModule, this.filterGeometry])
      .pipe(
        switchMap(([where, FeatureFilter, graphic]) => {
          return forkJoin([
            of(
              new FeatureFilter({
                where: where,
                geometry: graphic ? graphic.geometry : undefined,
                spatialRelationship: this.spatialRelationship
              })
            ),
            this.layer,
            this.layerView
          ]);
        }),
        switchMap(([featureFilter, layer, layerview]) => {
          return forkJoin([
            featureFilter,
            layer
            // TODO: Requires ArcGIS JS 4.12
            // iif(
            //   () => this.executeFilterQuery,
            //   from((layer.queryFeatures(featureFilter.createQuery()) as any) as Promise<esri.FeatureSet>)
            // )
          ]);
        })
      )
      .subscribe((res) => {
        debugger;
      });
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
