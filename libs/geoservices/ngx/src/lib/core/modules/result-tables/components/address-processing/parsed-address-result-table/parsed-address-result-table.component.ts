import { Component, Input, OnInit } from '@angular/core';
import { Observable, from, reduce } from 'rxjs';

import { IParsedAddress } from '@tamu-gisc/geoprocessing-v5';

import { ADDRESS_PROCESSING_PARSED_ADDRESS } from '../../../../../util/dictionaries';

@Component({
  selector: 'tamu-gisc-parsed-address-result-table',
  templateUrl: './parsed-address-result-table.component.html',
  styleUrls: ['./parsed-address-result-table.component.scss']
})
export class ParsedAddressResultTableComponent implements OnInit {
  /**
   * Determines the type of table to display. Simple omits some address properties.
   *
   * Defaults to `simple`.
   */
  @Input()
  public type: 'simple' | 'expanded' = 'simple';

  @Input()
  public address: IParsedAddress;

  public parsedAddressDict = ADDRESS_PROCESSING_PARSED_ADDRESS;

  private _simpleProps = [
    'addressFormatType',
    'number',
    'numberFractional',
    'preDirectional',
    'preQualifier',
    'preType',
    'preArticle',
    'name',
    'postArticle',
    'suffix',
    'postQualifier',
    'postDirectional',
    'suiteType',
    'suiteNumber'
  ];

  public filteredProps: Observable<{ [key: string]: unknown }>;

  public ngOnInit(): void {
    this.filteredProps = from(Object.entries(this.address)).pipe(
      reduce((acc, curr) => {
        const [propName, value] = curr;

        if (this.type === 'simple') {
          if (this._simpleProps.includes(propName) === true) {
            acc[propName] = value;
          }
        } else {
          acc[propName] = value;
        }

        return acc;
      }, {})
    );
  }
}

