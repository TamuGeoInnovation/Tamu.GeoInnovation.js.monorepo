import { TransformersMap, ApiResponseType, ApiBase, ResponseFormat } from '@tamu-gisc/geoprocessing-core';

import { ReverseGeocodeResult, IReverseGeocoderOptions } from '../interfaces/v5.interfaces';

export class ReverseGeocode extends ApiBase<IReverseGeocoderTransformers, IReverseGeocoderOptions, ReverseGeocodeResult> {
  public responseType = ApiResponseType.Text;

  constructor(options: IReverseGeocoderOptions) {
    super(options);

    this.settings = {
      serviceHost: {
        value: 'https://geoservices.tamu.edu',
        excludeParams: true
      },
      servicePath: {
        value: '/Api/ReverseGeocoding/V5/',
        excludeParams: true
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
