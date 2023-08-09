import { Component, Input, OnInit } from '@angular/core';
import { Observable, filter, from, reduce } from 'rxjs';

import { IGeocodeReferenceFeature } from '@tamu-gisc/geoprocessing-v5';

import { GeocodeReferenceFeatureLabel } from '../../../../../util/dictionaries';

@Component({
  selector: 'tamu-gisc-geocode-matched-reference-feature-table',
  templateUrl: './geocode-matched-reference-feature-table.component.html',
  styleUrls: ['./geocode-matched-reference-feature-table.component.scss']
})
export class GeocodeMatchedReferenceFeatureTableComponent implements OnInit {
  @Input()
  public matchedFeature: IGeocodeReferenceFeature;

  public filteredProps: Observable<{ [key: string]: unknown }>;

  public referenceFeatureDict = GeocodeReferenceFeatureLabel;

  public ngOnInit(): void {
    // Set filteredProps to be an object of key-value pairs of the matched feature, but only for properties found
    // in the reference feature dictionary.
    this.filteredProps = from(Object.entries(this.matchedFeature)).pipe(
      filter(([key]) => {
        return this.referenceFeatureDict[key] !== undefined;
      }),
      reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {})
    );
  }
}
