import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, map, of, shareReplay, switchMap, tap } from 'rxjs';

import {
  AlternateGeocode,
  CorrectionMiscFields,
  CorrectionService,
  GeocodePoint
} from '../../services/correction/correction.service';

@Component({
  selector: 'tamu-gisc-correction-misc-controls',
  templateUrl: './correction-misc-controls.component.html',
  styleUrls: ['./correction-misc-controls.component.scss']
})
export class CorrectionMiscControlsComponent implements OnInit {
  public showInitialInstructions = this.cs.dataPopulated;
  public selectedRow = this.cs.selectedRow;
  public alternateGeocodes: Observable<Array<AlternateGeocode>>;
  public coordinateOverride: Observable<GeocodePoint>;
  public form: FormGroup;

  constructor(private readonly cs: CorrectionService, private readonly fb: FormBuilder) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      QANotes: ['']
    });

    this.coordinateOverride = this.cs.correction.pipe(
      map((correction) => {
        if (correction) {
          return {
            lat: correction['NewLatitude'],
            lon: correction['NewLongitude']
          };
        } else {
          return null;
        }
      }),
      // When a new correction is received, we want to reset the form.
      tap(() => {
        this.form.reset();
      }),
      shareReplay(1)
    );

    this.alternateGeocodes = this.selectedRow.pipe(
      map((row) => {
        if (row) {
          return row['OutputGeocodes'];
        }
      }),
      switchMap((geocodes: string) => {
        try {
          const parsed = JSON.parse(geocodes);

          // `parsed` will have an inner `OutputGeocodes` property if there are any additional geocodes.
          if (parsed && !parsed['OutputGeocodes']) {
            return of([]);
          }

          // `parsed.OutputGeocodes` will be an array where the first element is a keyed object of alternate geocodes.
          // They follow the pattern OutputGeocodeN where N is the index of the geocode. Assume there is at least one geocode at this point.
          // We want to extract a list of these geocodes and return them as an array.

          const extracted = Object.entries(parsed['OutputGeocodes'][0]).map(([, value]) => {
            return value;
          });

          if (geocodes && extracted instanceof Array) {
            return of(extracted);
          } else {
            return of([]);
          }
        } catch (err) {
          console.log(`Malformed JSON:\n\n ${geocodes}`);

          return of([]);
        }
      }),
      shareReplay()
    );
  }

  public applyAlternateGeocode(geocode: AlternateGeocode) {
    this.cs.recordAltGeocode(geocode);
  }

  public applyCorrection() {
    const notes: CorrectionMiscFields = this.form.getRawValue();

    this.cs.notifyApplyCorrection(notes);
  }
}
