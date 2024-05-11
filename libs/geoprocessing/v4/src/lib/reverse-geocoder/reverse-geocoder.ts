import { TransformersMap, ApiResponseType, ApiBase, ResponseFormat } from '@tamu-gisc/geoprocessing-core';

import { IReverseGeocodeResult, IReverseGeocoderOptions } from '../interfaces/v4.interfaces';

export class ReverseGeocoder extends ApiBase<IReverseGeocoderTransformers, IReverseGeocoderOptions, IReverseGeocodeResult> {
  public responseType = ApiResponseType.Text;

  constructor(options: IReverseGeocoderOptions) {
    super(options);

    this.settings = {
      serviceHost: {
        value: 'https://geoservices.tamu.edu',
        excludeParams: true
      },
      servicePath: {
        value: '/Services/ReverseGeocoding/WebService/v04_01/HTTP/default.aspx',
        excludeParams: true
      },
      format: {
        value: ResponseFormat.JSON
      },
      version: {
        value: '4.10'
      }
    };

    this.setup();
  }
}

type IReverseGeocoderTransformers = TransformersMap<IReverseGeocoderOptions>;
