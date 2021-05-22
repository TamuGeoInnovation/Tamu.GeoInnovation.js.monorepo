import { ApiBase } from '../core/base';

import { TransformersMap, IReverseGeocoderOptions, IGeocodeResult, ApiResponseFormat } from '../core/types';

export class ReverseGeocoder extends ApiBase<IReverseGeocoderTransformers, IReverseGeocoderOptions, IGeocodeResult> {
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

interface IReverseGeocoderTransformers extends TransformersMap<IReverseGeocoderOptions> {}
