import { Component, Input, OnInit } from '@angular/core';
import { Observable, filter, from, reduce } from 'rxjs';

import { IGeocodeDeserializedInputParametersMap } from '@tamu-gisc/geoprocessing-v5';

import { GEOCODE_INPUT_PARAMS } from '../../../../../util/dictionaries';

@Component({
  selector: 'tamu-gisc-geocode-input-parameters',
  templateUrl: './geocode-input-parameters.component.html',
  styleUrls: ['./geocode-input-parameters.component.scss']
})
export class GeocodeInputParametersComponent implements OnInit {
  @Input()
  public parameters: IGeocodeDeserializedInputParametersMap;

  public filteredProps: Observable<{ [key: string]: unknown }>;
  public propsDict = GEOCODE_INPUT_PARAMS;

  public ngOnInit(): void {
    this.filteredProps = from(Object.entries(this.parameters)).pipe(
      // Filter only properties whose values are primitives and arrays
      filter(([key, value]) => {
        return value instanceof Object === false || Array.isArray(value) === true;
      }),

      // Reduce the array of properties into an object
      reduce((acc, [propName, value]) => {
        // if the property is an array, join it into a string
        if (Array.isArray(value)) {
          acc[propName] = value.join(',\n');
        } else {
          acc[propName] = value;
        }

        return acc;
      }, {})
    );
  }
}

