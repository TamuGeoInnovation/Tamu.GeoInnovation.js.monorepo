import { TransformersMap, ApiResponseFormat, ApiBase } from '@tamu-gisc/geoprocessing-core';

import { ReverseGeocodeResult, IReverseGeocoderOptions } from '../interfaces/v5.interfaces';

export class ReverseGeocode extends ApiBase<IReverseGeocoderTransformers, IReverseGeocoderOptions, ReverseGeocodeResult> {
  public responseType = ApiResponseFormat.Text;

  constructor(options: IReverseGeocoderOptions) {
    super(options);

    this.settings = {
      serviceUrl: {
        value: 'https://prod.geoservices.tamu.edu/Api/ReverseGeocoding/V5/?',
        excludeParams: true
      },
      format: {
        value: 'json'
      },
      version: {
        value: '5.0'
      }
    };

    this.setup();
  }
}

type IReverseGeocoderTransformers = TransformersMap<IReverseGeocoderOptions>;
