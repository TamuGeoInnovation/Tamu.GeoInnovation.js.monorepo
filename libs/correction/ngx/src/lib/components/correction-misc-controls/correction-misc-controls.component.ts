import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, map, of, shareReplay, switchMap } from 'rxjs';

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
    { value: 'StreetCentroid', label: 'Street Centroid' },
    { value: 'USPSZipPlus5', label: 'USPSZip+5' },
    { value: 'USPSZipPlus4', label: 'USPSZip+4' },
    { value: 'USPSZipPlus3', label: 'USPSZip+' },
    { value: 'USPSZipPlus2', label: 'USPSZip+2' },
    { value: 'USPSZipPlus1', label: 'USPSZip+1' },
    { value: 'USPSZip', label: 'USPSZip' },
    { value: 'ZCTAPlus5', label: 'ZCTA+5' },
    { value: 'ZCTAPlus4', label: 'ZCTA+4' },
    { value: 'ZCTAPlus3', label: 'ZCTA+3' },
    { value: 'ZCTAPlus2', label: 'ZCTA+2' },
    { value: 'ZCTAPlus1', label: 'ZCTA+1' },
    { value: 'ZCTA', label: 'ZCTA' },
    { value: 'City', label: 'City' },
    { value: 'ConsolidatedCity', label: 'Consolidated City' },
    { value: 'MinorCivilDivision', label: 'MinorCivil Division' },
    { value: 'CountySubRegion', label: 'County Sub-region' },
    { value: 'County', label: 'County' },
    { value: 'State', label: 'State' },
    { value: 'Country', label: 'Country' }
    // { value: 'Unmatchable', label: 'Unmatchable' }
  ];

  constructor(private readonly cs: CorrectionService, private readonly fb: FormBuilder) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      QANotes: [''],
      FeatureMatchingGeographyType: ['']
    });

    // When a new row is selected, reset the form and patch the values from the selected row.
    // These will be visible once a correction is applied (map click or alternate geocode selection)
    this.cs.selectedRow.pipe().subscribe((row) => {
      this.form.reset();

      this.form.patchValue({
        FeatureMatchingGeographyType: row['FeatureMatchingGeographyType'],
        QANotes: row['QANotes']
      });

      // this.form.markAsPristine();
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
