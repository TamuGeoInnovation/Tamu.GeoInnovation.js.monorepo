import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Geocoder } from '@tamu-gisc/common/utils/geometry/geoprocessing';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'tamu-gisc-geocoding',
  templateUrl: './geocoding.component.html',
  styleUrls: ['./geocoding.component.scss']
})
export class GeocodingComponent implements OnInit {
  private geocode: Geocoder;
  public result: Observable<string>;

  public geocodeForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.geocode = new Geocoder({
      apiKey: 'demo',
      version: '4.01',
      streetAddress: '9355 Burton Way',
      city: 'Beverly Hills',
      state: 'ca',
      zip: 99210
    });

    this.result = this.geocode.execute().pipe(switchMap((r) => of(JSON.stringify(r, null, '   '))));
  }

  public ngOnInit() {
    this.geocodeForm = this.fb.group({
      streetAddress: ['', Validators.required],
      city: [''],
      state: [''],
      zip: ['']
    });
  }

  public test(e) {
    const v = this.geocodeForm.getRawValue();

    debugger;
  }
}
