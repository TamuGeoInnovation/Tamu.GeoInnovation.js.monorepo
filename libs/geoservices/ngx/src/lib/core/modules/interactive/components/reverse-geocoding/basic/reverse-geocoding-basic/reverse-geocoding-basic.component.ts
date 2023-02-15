import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { delay, map, mapTo, Observable, pipe, shareReplay, startWith, Subject, switchMap, tap } from 'rxjs';

import { STATES_TITLECASE } from '@tamu-gisc/common/datasets/geographic';
import { ReverseGeocode } from '@tamu-gisc/geoprocessing-v5';

@Component({
  selector: 'tamu-gisc-reverse-geocoding-basic',
  templateUrl: './reverse-geocoding-basic.component.html',
  styleUrls: ['./reverse-geocoding-basic.component.scss']
})
export class ReverseGeocodingBasicComponent implements OnInit {
  public states = STATES_TITLECASE;
  public form: FormGroup;

  public querySubmit: Subject<null> = new Subject();
  public processing: Observable<boolean>;
  public buttonLanguage: Observable<string>;

  public result: Observable<any>;

  constructor(private readonly fb: FormBuilder) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      lat: [null, Validators.required],
      lon: [null, Validators.required],
      state: [null]
    });

    // this.result = this.querySubmit.pipe(this.getQuery(this.form.getRawValue()), shareReplay());
    this.result = this.querySubmit.pipe(
      delay(2500),
      mapTo({
        address: '1234 Main St',
        city: 'Austin',
        state: 'TX',
        zip: '78701'
      }),
      tap((r) => {
        this.querySubmit.next(undefined);
      })
    );

    this.processing = this.querySubmit.pipe(
      map((r) => {
        console.log('sffs');

        return r === null;
      }),
      startWith(false),
      shareReplay()
    );

    this.buttonLanguage = this.processing.pipe(
      map((processing) => {
        return processing ? 'Processing...' : 'Solve';
      })
    );
  }

  public processInteractiveQuery() {
    this.querySubmit.next(null);
  }

  public getQuery(fv: any) {
    return pipe(
      switchMap(() => {
        return new ReverseGeocode({
          apiKey: 'demo',
          latitude: fv.lat,
          longitude: fv.lon,
          state: fv.state || undefined
        }).asObservable();
      })
    );
  }
}

