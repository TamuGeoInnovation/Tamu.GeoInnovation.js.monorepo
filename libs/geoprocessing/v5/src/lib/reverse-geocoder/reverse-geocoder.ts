import { TransformersMap, ApiResponseFormat, ApiBase } from '@tamu-gisc/geoprocessing/core';

import { IReverseGeocodeResult, IReverseGeocoderOptions } from '../interfaces/v4.interfaces';

export class ReverseGeocoder extends ApiBase<IReverseGeocoderTransformers, IReverseGeocoderOptions, IReverseGeocodeResult> {
  public responseType = ApiResponseFormat.Text;

  constructor(options: IReverseGeocoderOptions) {
    super(options);

    this.settings = {
      serviceUrl: {
        value: 'https://geoservices.tamu.edu/Services/ReverseGeocoding/WebService/v04_01/HTTP/default.aspx?',
        excludeParams: true
      },
      format: {
        value: 'json'
      },
      version: {
        value: '4.10'
      }
    };

    this.setup();
  }
}

type IReverseGeocoderTransformers = TransformersMap<IReverseGeocoderOptions>;
