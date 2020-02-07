import { ApiBase } from '../core/base';

import { GeocodeResult, IGeocoderOptions, TransformersMap, IAdvancedGeocoderFourZeroOneOptions } from '../core/types';
import { of } from 'rxjs';
import { GeoservicesError } from '../core/errors';

export class Geocoder extends ApiBase<GeocodingTransformers, IGeocoderOptions, GeocodeResult> {
  constructor(options: IGeocoderOptions) {
    super(options);

    this.settings = {
      version: {
        value: '4.01'
      },
      format: {
        value: 'json'
      },
      censusYear: {
        value: undefined,
        fn: function() {
          this.value = this.value instanceof Array ? this.value.join('|') : this.value;
        }
      },
      ratts: {
        value: undefined,
        fn: function() {
          this.value = this.value instanceof Array ? this.value.join(',') : this.value;
        }
      },
      souatts: {
        value: undefined,
        fn: function() {
          this.value = this.value instanceof Array ? this.value.join(',') : this.value;
        }
      },
      parsed: {
        value: false,
        excludeParams: true
      },
      urlVersion: {
        value: '',
        excludeParams: true,
        target: ['version'],
        fn: function(v: number) {
          this.value = `_V0${v.toString().replace('.', '_')}`;
        }
      },
      serviceType: {
        value: 'GeocoderWebServiceHttpNonParsed',
        excludeParams: true,
        target: 'parsed',
        fn: function(parsed) {
          if (parsed) {
            this.value = `GeocoderService`;
          }
        }
      },
      advancedQuery: {
        value: '',
        excludeParams: true,
        target: ['r', 'ratts', 'sub', 'sou', 'souatts', 'h', 'refs'],
        fn: function(...args) {
          // Test if any of advanced geocoding options were provided
          const anyAdvancedOption = args.findIndex((v) => v !== undefined) > -1;

          if (anyAdvancedOption) {
            this.value = 'Advanced';
          }
        }
      },

      responseFormat: {
        value: 'json',
        excludeParams: true,
        target: 'format',
        fn: function(f) {
          if (f === 'tsv' || f === 'csv') {
            this.value = 'text';
          }
        }
      },
      serviceUrl: {
        value: 'https://geoservices.tamu.edu/Services/Geocode/WebService/',
        excludeParams: true,
        target: ['urlVersion', 'serviceType', 'parsed', 'advancedQuery'],
        fn: function(version, type, parsed, advanced) {
          this.value = `${this.value}${type}${advanced}${version}${parsed ? '.asmx' : '.aspx'}?`;
        }
      }
    };

    this.setup();
  }

  public handleErrorOrResponse(response) {
    if (
      (response.response && response.response.QueryStatusCodeValue === '200') ||
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

/**
 * Internal class settings used to generate geocoding-specific defaults/values.
 */
interface IGeocoderSettings {
  urlVersion?: string;
  serviceType?: string;
  responseFormat?: string;
  advancedQuery?: string;
  parsed?: boolean;
}

interface GeocodingTransformers extends TransformersMap<IAdvancedGeocoderFourZeroOneOptions & IGeocoderSettings> {}
