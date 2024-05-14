import { TransformersMap, ApiResponseType, ApiBase, ResponseFormat } from '@tamu-gisc/geoprocessing-core';

import { ReverseGeocodeResult, IReverseGeocoderOptions } from '../interfaces/v5.interfaces';

export class ReverseGeocode extends ApiBase<IReverseGeocoderTransformers, IReverseGeocoderOptions, ReverseGeocodeResult> {
  public responseType = ApiResponseType.Text;

  constructor(options: IReverseGeocoderOptions) {
    super(options);

    this.settings = {
      format: {
        value: ResponseFormat.JSON
      },
      version: {
        value: '5.0'
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
            return currentValue;
          }
        }
      },
      servicePath: {
        value: '/Api/ReverseGeocoding/V5/',
        excludeParams: true,
        fn: function (currentValue) {
          if (currentValue !== undefined && currentValue !== null && typeof currentValue === 'string') {
            return currentValue;
          }
        }
      }
    };

    this.setup();
  }
}

type IReverseGeocoderTransformers = TransformersMap<IReverseGeocoderOptions>;
