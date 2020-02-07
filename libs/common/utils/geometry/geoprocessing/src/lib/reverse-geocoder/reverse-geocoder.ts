import { of } from 'rxjs';

import { ApiBase } from '../core/base';
import { TransformersMap, IReverseGeocoderOptions, GeocodeResult } from '../core/types';
import { GeoservicesError } from '../core/errors';

export class ReverseGeocoder extends ApiBase<IReverseGeocoderTransformers, IReverseGeocoderOptions, GeocodeResult> {
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

  public handleErrorOrResponse(response) {
    if (
      (response.response && response.response.QueryStatusCode === 'Success') ||
      (typeof response.response === 'string' && response.response.length > 0) ||
      (response.response instanceof XMLDocument &&
        response.response.getElementsByTagName('QueryStatusCodeValue')[0].textContent === '200')
    ) {
      return of(response.response);
    } else {
      return new GeoservicesError(response.response).throw();
    }
  }
}

interface IReverseGeocoderTransformers extends TransformersMap<IReverseGeocoderOptions> {}
