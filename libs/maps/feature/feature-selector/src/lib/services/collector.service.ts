import { Injectable } from '@angular/core';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { FeatureSelectorService } from './selector.service';
import { shareReplay, tap, scan, startWith, takeUntil, switchMap } from 'rxjs/operators';
import { ReplaySubject, Observable, Subject, of } from 'rxjs';

@Injectable()
export class FeatureCollectorService extends FeatureSelectorService {
  public collection: Observable<any>;
  private _resetSignal: Subject<any> = new Subject();

  constructor(private ms: EsriMapService) {
    super(ms);
  }

  public init(options: IFeatureCollectionOptions): void {
    this.create();
  }

  private create() {
    // this.collection = this.feature.pipe(
    //   takeUntil(this._resetSignal),
    //   startWith(undefined),
    //   scan((acc, curr) => {
    //     return [...acc, curr];
    //   }, [])
    // );

    this.collection = of(true).pipe(
      switchMap(() =>
        this.feature.pipe(
          takeUntil(this._resetSignal),
          startWith(undefined),
          scan((acc, curr) => {
            return [...acc, curr];
          }, [])
        )
      )
    );
  }

  public reset() {
    this._resetSignal.next();
  }
}

export interface IFeatureCollectionOptions {
  size: number;
}
