import { TransformersMap, ApiResponseFormat, ApiBase } from '@tamu-gisc/geoprocessing-core';

import { IAddressParsingOptions, IAddressParsingResult } from '../interfaces/v4.interfaces';

export class AddressProcessor extends ApiBase<
  TransformersMap<IAddressParsingOptions>,
  IAddressParsingOptions,
  IAddressParsingResult
> {
  public responseType = ApiResponseFormat.Text;

  constructor(options: IAddressParsingOptions) {
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
      }
    };

    this.setup();
  }
}
