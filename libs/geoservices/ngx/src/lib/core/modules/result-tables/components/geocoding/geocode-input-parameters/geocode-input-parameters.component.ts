import { Component, Input, OnInit } from '@angular/core';
import { Observable, filter, from, reduce } from 'rxjs';

import { IGeocodeDeserializedInputParametersMap } from '@tamu-gisc/geoprocessing-v5';

import { GeocodeInputParameterLabel } from '../../../../../util/dictionaries';

@Component({
  selector: 'tamu-gisc-geocode-input-parameters',
  templateUrl: './geocode-input-parameters.component.html',
  styleUrls: ['./geocode-input-parameters.component.scss']
})
export class GeocodeInputParametersComponent implements OnInit {
  @Input()
  public parameters: IGeocodeDeserializedInputParametersMap;

  public filteredProps: Observable<{ [key: string]: unknown }>;
  public propsDict = GeocodeInputParameterLabel;

  public ngOnInit(): void {
    this.filteredProps = from(Object.entries(this.parameters)).pipe(
      // Filter only properties whose values are primitives and arrays
      filter(([, value]) => {
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
