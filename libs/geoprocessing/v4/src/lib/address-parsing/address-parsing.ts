import { TransformersMap, ApiResponseType, ApiBase, ResponseFormat } from '@tamu-gisc/geoprocessing-core';

import { IAddressParsingOptions, IAddressParsingResult } from '../interfaces/v4.interfaces';

export class AddressProcessor extends ApiBase<
  TransformersMap<IAddressParsingOptions>,
  IAddressParsingOptions,
  IAddressParsingResult
> {
  public responseType = ApiResponseType.Text;

  constructor(options: IAddressParsingOptions) {
    super(options);

    this.settings = {
      serviceHost: {
        value: 'geoservices.tamu.edu',
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
      }
    };

    this.setup();
  }
}
