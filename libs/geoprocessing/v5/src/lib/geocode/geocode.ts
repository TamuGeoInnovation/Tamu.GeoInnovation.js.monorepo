import { TransformersMap, ApiResponseFormat, ApiBase } from '@tamu-gisc/geoprocessing/core';
import { GeocodeResult, IGeocodeOptions } from '../interfaces/v5.interfaces';

export class Geocode extends ApiBase<TransformersMap<IGeocodeOptions>, IGeocodeOptions, GeocodeResult> {
  public responseType = ApiResponseFormat.Code;

  constructor(options: IGeocodeOptions) {
    super(options);

    this.settings = {
      version: {
        value: '5.0'
      },
      format: {
        value: 'json'
      },
      censusYears: {
        value: undefined,
        fn: function () {
          this.value = this.value instanceof Array ? this.value.join(',') : this.value;
        }
      },
      serviceUrl: {
        value: 'https://prod.geoservices.tamu.edu/Api/Geocode/V5/?',
        excludeParams: true
      },
      relaxableAttributes: {
        value: undefined,
        target: ['relaxableAttributes'],
        fn: (attrs) => {
          return attrs ? attrs.join(',') : attrs;
        }
      },
      soundexableAttributes: {
        value: undefined,
        target: ['soundexableAttributes'],
        fn: (attrs) => {
          return attrs ? attrs.join(',') : attrs;
        }
      }
    };

    this.setup();
  }
}
