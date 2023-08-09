import { Component, Input, OnInit } from '@angular/core';
import { Observable, map, of } from 'rxjs';

import { EnumeratorKeyValuePairs, FieldEnumerator } from '@tamu-gisc/common/utils/object';
import { CensusIntersectionRecordField, ICensusIntersectionRecord } from '@tamu-gisc/geoprocessing-v5';

import { CensusIntersectionFeatureLabel } from '../../../../../util/dictionaries';

@Component({
  selector: 'tamu-gisc-census-intersection-result-table',
  templateUrl: './census-intersection-result-table.component.html',
  styleUrls: ['./census-intersection-result-table.component.scss']
})
export class CensusIntersectionResultTableComponent implements OnInit {
  @Input()
  public address: ICensusIntersectionRecord;

  public filteredProps: Observable<EnumeratorKeyValuePairs>;

  public censusIntersectionDict = CensusIntersectionFeatureLabel;

  private _excludedProps = [
    CensusIntersectionRecordField.ExceptionMessage,
    CensusIntersectionRecordField.ExceptionOccurred,
    CensusIntersectionRecordField.CensusYear
  ];

  private _defaultOrder = [
    CensusIntersectionRecordField.GeoLocationId,
    CensusIntersectionRecordField.CensusBlock,
    CensusIntersectionRecordField.CensusBlockGroup,
    CensusIntersectionRecordField.CensusTract,
    CensusIntersectionRecordField.CensusCountyFips,
    CensusIntersectionRecordField.CensusPlaceFips,
    CensusIntersectionRecordField.CensusMsaFips,
    CensusIntersectionRecordField.CensusMcdFips,
    CensusIntersectionRecordField.CensusCbsaFips,
    CensusIntersectionRecordField.CensusCbsaMicro,
    CensusIntersectionRecordField.CensusMetDivFips,
    CensusIntersectionRecordField.CensusStateFips
  ];

  public ngOnInit(): void {
    this.filteredProps = of(this.address).pipe(
      map((address) => {
        return new FieldEnumerator(address).filter('exclude', this._excludedProps).order(this._defaultOrder);
      })
    );
  }
}

