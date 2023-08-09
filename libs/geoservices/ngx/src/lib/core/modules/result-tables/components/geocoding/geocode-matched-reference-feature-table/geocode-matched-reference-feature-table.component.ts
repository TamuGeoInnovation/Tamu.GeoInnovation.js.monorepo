import { Component, Input, OnInit } from '@angular/core';
import { Observable, map, of } from 'rxjs';

import { GeocodeReferenceFeatureField, IGeocodeReferenceFeature } from '@tamu-gisc/geoprocessing-v5';
import { EnumeratorKeyValuePairs, FieldEnumerator } from '@tamu-gisc/common/utils/object';

import { GeocodeReferenceFeatureLabel } from '../../../../../util/dictionaries';

@Component({
  selector: 'tamu-gisc-geocode-matched-reference-feature-table',
  templateUrl: './geocode-matched-reference-feature-table.component.html',
  styleUrls: ['./geocode-matched-reference-feature-table.component.scss']
})
export class GeocodeMatchedReferenceFeatureTableComponent implements OnInit {
  @Input()
  public matchedFeature: IGeocodeReferenceFeature;

  public filteredProps: Observable<EnumeratorKeyValuePairs>;

  public referenceFeatureDict = GeocodeReferenceFeatureLabel;

  private _excludedProps = [GeocodeReferenceFeatureField.Address, GeocodeReferenceFeatureField.Geometry];

  private _defaultOrder = [
    GeocodeReferenceFeatureField.Source,
    GeocodeReferenceFeatureField.Vintage,
    GeocodeReferenceFeatureField.Area,
    GeocodeReferenceFeatureField.AreaType,
    GeocodeReferenceFeatureField.GeometrySRID,
    GeocodeReferenceFeatureField.PrimaryIdField,
    GeocodeReferenceFeatureField.PrimaryIdValue,
    GeocodeReferenceFeatureField.SecondaryIdField,
    GeocodeReferenceFeatureField.SecondaryIdValue,
    GeocodeReferenceFeatureField.ServerName
  ];

  public ngOnInit(): void {
    // Set filteredProps to be an object of key-value pairs of the matched feature, but only for properties found
    // in the reference feature dictionary.
    this.filteredProps = of(this.matchedFeature).pipe(
      map((feature) => {
        return new FieldEnumerator(feature).filter('exclude', this._excludedProps).order(this._defaultOrder);
      })
    );
  }
}
