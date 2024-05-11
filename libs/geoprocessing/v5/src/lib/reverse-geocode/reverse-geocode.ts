import { TransformersMap, ApiResponseType, ApiBase, ResponseFormat } from '@tamu-gisc/geoprocessing-core';

import { ReverseGeocodeResult, IReverseGeocoderOptions } from '../interfaces/v5.interfaces';

export class ReverseGeocode extends ApiBase<IReverseGeocoderTransformers, IReverseGeocoderOptions, ReverseGeocodeResult> {
  public responseType = ApiResponseType.Text;

  constructor(options: IReverseGeocoderOptions) {
    super(options);

    this.settings = {
      serviceHost: {
        value: 'https://geoservices.tamu.edu',
        excludeParams: true,
        target: ['serviceHost'],
        fn: function (host) {
          if (host !== undefined && host !== null && typeof host === 'string' && host.startsWith('http')) {
            this.value = host;
          }
        }
      },
      servicePath: {
        value: '/Api/ReverseGeocoding/V5/',
        excludeParams: true,
        target: ['servicePath'],
        fn: function (path) {
          if (path !== undefined && path !== null && typeof path === 'string') {
            this.value = path;
          }
        }
      },
      format: {
        value: ResponseFormat.JSON
      },
      version: {
        value: '5.0'
      }
    };

    this.setup();
  }
}

type IReverseGeocoderTransformers = TransformersMap<IReverseGeocoderOptions>;
