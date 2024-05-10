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
        fn: function () {
          this.value = this.value instanceof Array ? this.value.join(',') : this.value;
        }
      },
      census: {
        value: false,
        target: ['censusYears'],
        fn: function (years) {
          this.value = (years !== undefined && years.length > 0) || false;
        }
      },
      serviceHost: {
        value: 'https://geoservices.tamu.edu',
        excludeParams: true
      },
      servicePath: {
        value: '/Api/Geocode/V5/',
        excludeParams: true
      },
      relaxableAttributes: {
        value: undefined,
        target: ['relaxableAttributes'],
        fn: function (attrs) {
          this.value = attrs ? attrs.join(',') : attrs;
        }
      },
      soundexableAttributes: {
        value: undefined,
        target: ['soundexableAttributes'],
        fn: function (attrs) {
          this.value = attrs ? attrs.join(',') : attrs;
        }
      },
      refs: {
        value: undefined,
        fn: function () {
          this.value = this.value instanceof Array ? this.value.join(',') : this.value;
        }
      }
    };

    this.setup();
  }
}
