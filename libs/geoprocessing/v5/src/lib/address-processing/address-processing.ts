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
        excludeParams: true
      },
      servicePath: {
        value: '/Api/AddressNormalization/V5/',
        excludeParams: true
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
