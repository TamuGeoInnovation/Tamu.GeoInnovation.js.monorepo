import { Component, Input, OnInit } from '@angular/core';
import { Observable, map, of } from 'rxjs';

import { EnumeratorKeyValuePairs, FieldEnumerator } from '@tamu-gisc/common/utils/object';
import { CensusIntersectionField, ICensusIntersection } from '@tamu-gisc/geoprocessing-v5';

import { CensusIntersectionFeatureLabel } from '../../../../../util/dictionaries';

@Component({
  selector: 'tamu-gisc-census-intersection-result-table',
  templateUrl: './census-intersection-result-table.component.html',
  styleUrls: ['./census-intersection-result-table.component.scss']
})
export class CensusIntersectionResultTableComponent implements OnInit {
  @Input()
  public address: ICensusIntersection;

  public censusIntersectionDict = CensusIntersectionFeatureLabel;

  public filteredProps: Observable<EnumeratorKeyValuePairs>;

  private _excludedProps = [
    CensusIntersectionField.ExceptionMessage,
    CensusIntersectionField.ExceptionOccurred,
    CensusIntersectionField.CensusYear
  ];

  private _defaultOrder = [
    CensusIntersectionField.GeoLocationId,
    CensusIntersectionField.CensusBlock,
    CensusIntersectionField.CensusBlockGroup,
    CensusIntersectionField.CensusTract,
    CensusIntersectionField.CensusCountyFips,
    CensusIntersectionField.CensusPlaceFips,
    CensusIntersectionField.CensusMsaFips,
    CensusIntersectionField.CensusMcdFips,
    CensusIntersectionField.CensusCbsaFips,
    CensusIntersectionField.CensusCbsaMicro,
    CensusIntersectionField.CensusMetDivFips,
    CensusIntersectionField.CensusStateFips
  ];

  public ngOnInit(): void {
    this.filteredProps = of(this.address).pipe(
      map((address) => {
        return new FieldEnumerator(address).filter('exclude', this._excludedProps).order(this._defaultOrder);
      })
    );
  }
}

