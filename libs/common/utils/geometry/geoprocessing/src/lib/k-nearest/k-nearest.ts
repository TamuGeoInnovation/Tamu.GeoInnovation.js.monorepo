import { ApiBase } from '../core/base';
import { TransformersMap, IKNearestOptions, ApiResponseFormat, IKNearestResult } from '../core/types';

export class KNearest extends ApiBase<TransformersMap<IKNearestOptions>, IKNearestOptions, IKNearestResult> {
  public responseType = ApiResponseFormat.Text;

  constructor(options: IKNearestOptions) {
    super(options);

    this.settings = {
      serviceUrl: {
        value: 'http://geoservices.tamu.edu/Services/KNearest/WebService/v04_01/HTTP/?',
        excludeParams: true
      },
      format: {
        value: 'json'
      },
      version: {
        value: '4.10'
      }
    };

    this.setup();
  }
}
