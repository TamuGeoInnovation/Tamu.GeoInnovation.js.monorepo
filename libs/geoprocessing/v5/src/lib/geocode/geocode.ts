import { TransformersMap, ApiResponseType, ApiBase, ResponseFormat } from '@tamu-gisc/geoprocessing-core';

import { GeocodeResult, IGeocodeOptions } from '../interfaces/v5.interfaces';

export class Geocode extends ApiBase<TransformersMap<IGeocodeOptions>, IGeocodeOptions, GeocodeResult> {
  public responseType = ApiResponseType.Code;

  constructor(options: IGeocodeOptions) {
    super(options);

    this.settings = {
      version: {
        value: '5.0'
      },
      format: {
        value: ResponseFormat.JSON
      },
      censusYears: {
        value: undefined,
        fn: function (currentValue) {
          this.value = currentValue instanceof Array ? currentValue.join(',') : currentValue;
        }
      },
      census: {
        value: false,
        target: ['censusYears'],
        fn: function (currentValue, years) {
          this.value = (years !== undefined && years.length > 0) || false;
        }
      },
      serviceHost: {
        value: 'https://geoservices.tamu.edu',
        excludeParams: true,
        fn: function (currentValue) {
          if (
            currentValue !== undefined &&
            currentValue !== null &&
            typeof currentValue === 'string' &&
            currentValue.startsWith('http')
          ) {
            this.value = currentValue;
          }
        }
      },
      servicePath: {
        value: '/Api/Geocode/V5/',
        excludeParams: true,
        fn: function (currentValue) {
          if (currentValue !== undefined && currentValue !== null && typeof currentValue === 'string') {
            this.value = currentValue;
          }
        }
      },
      relaxableAttributes: {
        value: undefined,
        fn: function (currentValue) {
          this.value = currentValue ? currentValue.join(',') : currentValue;
        }
      },
      soundexableAttributes: {
        value: undefined,
        target: ['soundexableAttributes'],
        fn: function (currentValue) {
          this.value = currentValue ? currentValue.join(',') : currentValue;
        }
      },
      refs: {
        value: undefined,
        fn: function (currentValue) {
          this.value = currentValue instanceof Array ? currentValue.join(',') : this.value;
        }
      }
    };

    this.setup();
  }
}
