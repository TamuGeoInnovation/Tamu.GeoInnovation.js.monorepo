import { TransformersMap, ApiResponseType, ApiBase, ResponseFormat } from '@tamu-gisc/geoprocessing-core';

import { IAddressProcessingOptions, AddressProcessingResult } from '../interfaces/v5.interfaces';

export class AddressProcessing extends ApiBase<
  TransformersMap<IAddressProcessingOptions>,
  IAddressProcessingOptions,
  AddressProcessingResult
> {
  public responseType = ApiResponseType.Text;

  constructor(options: IAddressProcessingOptions) {
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
        value: '/Api/AddressNormalization/V5/',
        excludeParams: true,
        target: ['servicePath'],
        fn: function (path) {
          if (path !== undefined && path !== null && typeof path === 'string') {
            this.value = path;
          }
        }
      },
      format: {
        value: ResponseFormat.JSON,
        excludeParams: true
      },
      responseFormat: {
        value: ResponseFormat.JSON
      },
      version: {
        value: '5.0'
      },
      addressFormat: {
        value: undefined,
        fn: function () {
          this.value = this.value instanceof Array ? this.value.join(',') : this.value;
        }
      }
    };

    this.setup();
  }
}
