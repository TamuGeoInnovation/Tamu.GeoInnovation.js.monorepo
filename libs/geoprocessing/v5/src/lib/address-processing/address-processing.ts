import { TransformersMap, ApiResponseFormat, ApiBase } from '@tamu-gisc/geoprocessing-core';

import { IAddressProcessingOptions, AddressProcessingResult } from '../interfaces/v5.interfaces';

export class AddressProcessing extends ApiBase<
  TransformersMap<IAddressProcessingOptions>,
  IAddressProcessingOptions,
  AddressProcessingResult
> {
  public responseType = ApiResponseFormat.Text;

  constructor(options: IAddressProcessingOptions) {
    super(options);

    this.settings = {
      serviceUrl: {
        value: 'https://geoservices.tamu.edu/Api/AddressNormalization/V5/?',
        excludeParams: true
      },
      format: {
        value: 'json',
        excludeParams: true
      },
      responseFormat: {
        value: 'json'
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