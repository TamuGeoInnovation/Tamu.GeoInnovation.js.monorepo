import { Component, Input, OnInit } from '@angular/core';
import { Observable, map, of } from 'rxjs';

import { EnumeratorKeyValuePairs, FieldEnumerator } from '@tamu-gisc/common/utils/object';
import { GeocodeNAACCRField, GeocodeRecordField, IGeocodeRecord } from '@tamu-gisc/geoprocessing-v5';
import { GeocodeFieldLabel, GeocodeNaaccrFieldLabel } from '../../../../../util/dictionaries';

@Component({
  selector: 'tamu-gisc-geocode-result-table',
  templateUrl: './geocode-result-table.component.html',
  styleUrls: ['./geocode-result-table.component.scss']
})
export class GeocodeResultTableComponent implements OnInit {
  @Input()
  public geocode: IGeocodeRecord;

  public filteredProps: Observable<EnumeratorKeyValuePairs>;

  public geocodeTableDict = { ...GeocodeFieldLabel, ...GeocodeNaaccrFieldLabel };

  private _defaultOrder = [
    GeocodeRecordField.Latitude,
    GeocodeRecordField.Longitude,
    GeocodeRecordField.MatchType,
    GeocodeRecordField.GeocodeQualityType,
    GeocodeNAACCRField.CensusTractCertaintyCode,
    GeocodeNAACCRField.CensusTractCertaintyType,
    GeocodeNAACCRField.GisCoordinateQualityCode,
    GeocodeNAACCRField.GisCoordinateQualityType,
    GeocodeRecordField.MatchScore,
    GeocodeNAACCRField.MicroMatchStatus,
    GeocodeNAACCRField.PenaltyCode,
    GeocodeNAACCRField.PenaltyCodeSummary,
    GeocodeRecordField.FeatureMatchingResultType,
    GeocodeRecordField.FeatureMatchingGeographyType,
    GeocodeRecordField.MatchedLocationType
  ];

  private _excludedProps = [
    GeocodeRecordField.CensusRecords,
    GeocodeRecordField.MatchedAddress,
    GeocodeRecordField.ReferenceFeature,
    GeocodeRecordField.Naaccr,
    GeocodeRecordField.QueryStatusCodes,
    GeocodeNAACCRField.PenaltyCodeDetails,
    GeocodeRecordField.FeatureMatchingSelectionMethod,
    GeocodeRecordField.TieHandlingStrategyType
  ];

  public ngOnInit(): void {
    this.filteredProps = of(this.geocode).pipe(
      map((geocode) => {
        return new FieldEnumerator({ ...geocode.naaccr, ...geocode })
          .filter('exclude', this._excludedProps)
          .order(this._defaultOrder);
      })
    );
  }
}
