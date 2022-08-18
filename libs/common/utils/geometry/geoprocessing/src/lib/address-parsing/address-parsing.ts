import { IAddressParsingOptions, TransformersMap, IAddressParsingResult, ApiResponseFormat } from '../core/types';
import { ApiBase } from '../core/base';

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
        value: 'https://prod.geoservices.tamu.edu/Api/AddressNormalization/V5/?',
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
