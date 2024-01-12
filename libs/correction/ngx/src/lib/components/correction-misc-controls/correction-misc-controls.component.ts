import { Component, OnInit } from '@angular/core';
import { Observable, catchError, map, of, shareReplay, switchMap } from 'rxjs';

import { AlternateGeocode, CorrectionService, GeocodePoint } from '../../services/correction/correction.service';

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

  constructor(private readonly cs: CorrectionService) {}

  public ngOnInit(): void {
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
      })
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

          throw new Error('Unable to parse geocodes. Malformed JSON');
        }
      }),
      catchError(() => {
        return of([]);
      }),
      shareReplay()
    );
  }

  public applyCorrection() {
    this.cs.notifyApplyCorrection();
  }

  public applyAlternateGeocode(geocode: AlternateGeocode) {
    this.cs.recordAltGeocode(geocode);
  }
}
