import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, map, of, shareReplay, switchMap, take } from 'rxjs';

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
  public correctionType: Observable<'Manual Correction' | string>;
  public correctionIsPointClick: Observable<boolean>;
  public form: FormGroup;

  // These should come from the geoprocessing lib but those changes have not been merged yet.
  public readonly matchGeographyTypes = [
    { value: 'Unknown', label: 'Unknown' },
    { value: 'GPS', label: 'GPS' },
    { value: 'BuildingCentroid', label: 'Building Centroid' },
    { value: 'Building', label: 'Building' },
    { value: 'BuildingDoor', label: 'Building Door' },
    { value: 'Parcel', label: 'Parcel' },
    { value: 'StreetSegment', label: 'Street Segment' },
    { value: 'StreetIntersection', label: 'Street Intersection' },
    { value: 'StreetCentroid', label: 'Street Centroid' }
  ];

  constructor(private readonly cs: CorrectionService, private readonly fb: FormBuilder) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      QANotes: [''],
      NewQuality: [null]
    });

    // When a new row is selected, reset the form and patch the values from the selected row.
    // These will be visible once a correction is applied (map click or alternate geocode selection)
    this.cs.selectedRow.pipe().subscribe((row) => {
      this.form.reset();

      this.form.patchValue({
        // If the NewQuality is Manual Correction, the correction is a map click and the NewQuality should be null.
        // so the input field shows the default option.
        NewQuality: row['NewQuality'] === 'Manual Correction' ? null : row['NewQuality'],
        QANotes: row['QANotes']
      });
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
      shareReplay(1)
    );

    this.correctionType = this.cs.correction.pipe(
      map((correction) => {
        if (correction) {
          return correction['NewQuality'];
        } else {
          return null;
        }
      }),
      shareReplay(1)
    );

    this.correctionIsPointClick = this.correctionType.pipe(
      map((type) => {
        if (type) {
          return type === 'Manual Correction';
        } else {
          return false;
        }
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

    this.correctionIsPointClick.pipe(take(1)).subscribe((isPointClick) => {
      // If the correction is an output geocode, remove the NewQuality property from the notes.
      // The property will be inherited from the output geocode.
      if (!isPointClick) {
        delete notes['NewQuality'];
      }

      this.cs.notifyApplyCorrection(notes);
    });
  }
}
