import { IAddressParsingOptions, TransformersMap, IAddressParsingResult, ApiResponseFormat } from '../core/types';
import { ApiBase } from '../core/base';

export class AddressParser extends ApiBase<
  TransformersMap<IAddressParsingOptions>,
  IAddressParsingOptions,
  IAddressParsingResult
> {
  public responseType = ApiResponseFormat.Text;

  constructor(options: IAddressParsingOptions) {
    super(options);

    this.settings = {
      serviceUrl: {
        value: 'https://geoservices.tamu.edu/Services/AddressNormalization/WebService/v04_01/Rest/?',
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
        value: '4.10'
      }
    };

    this.setup();
  }
}
