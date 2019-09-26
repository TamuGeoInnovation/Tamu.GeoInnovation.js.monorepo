import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { scan, startWith, switchMap } from 'rxjs/operators';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { FeatureSelectorService } from './selector.service';

@Injectable()
export class FeatureCollectorService extends FeatureSelectorService {
  public collection: Observable<any>;
  private _$resetSignal: Subject<any> = new Subject();

  constructor(private ms: EsriMapService) {
    super(ms);
  }

  public init(options?: IFeatureCollectionOptions): void {
    this.create();
  }

  private create() {
    this.collection = this._$resetSignal.pipe(
      startWith(true),
      switchMap(() =>
        this.feature.pipe(
          scan((acc, curr) => {
            return [...acc, ...curr];
          }, [])
        )
      )
    );
  }

  public reset() {
    this._$resetSignal.next();
  }
}

export interface IFeatureCollectionOptions {
  /**
   * Number of features to retain in the collector before popping them off the collection.
   *
   * When not set, the collector will collect until service destruction or the `reset` method is called.
   */
  buffer?: number;

  /**
   * Attribute property that is used to determine duplicates.
   */
  identifier?: string;

  /**
   * When true, duplicate features will be updated or deleted by splicing the collection.
   */
  spliceDuplicates?: boolean;

  /**
   * String Layer ID references for which the collector should limit feature collection from.
   *
   * If no layers provided, collector will collect from all map layers at the time of map event.
   */
  layers?: string | string[];
}
