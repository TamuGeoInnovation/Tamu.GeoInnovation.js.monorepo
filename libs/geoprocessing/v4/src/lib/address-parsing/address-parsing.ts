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
      serviceUrl: {
        value: 'https://geoservices.tamu.edu/Api/AddressNormalization/V5/?',
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
