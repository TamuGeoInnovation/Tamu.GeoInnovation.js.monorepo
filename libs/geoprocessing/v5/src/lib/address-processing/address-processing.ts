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
        fn: function (currentValue) {
          return currentValue instanceof Array ? currentValue.join(',') : this.value;
        }
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
        value: '/Api/AddressNormalization/V5/',
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
