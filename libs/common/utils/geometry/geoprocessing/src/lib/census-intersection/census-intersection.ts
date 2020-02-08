import { ApiBase } from '../core/base';

import { TransformersMap, ICensusIntersectionOptions, ApiResponseFormat, ICensusIntersectionResult } from '../core/types';

export class CensusIntersection extends ApiBase<
  TransformersMap<ICensusIntersectionOptions>,
  ICensusIntersectionOptions,
  ICensusIntersectionResult
> {
  public responseType = ApiResponseFormat.Text;

  constructor(options: ICensusIntersectionOptions) {
    super(options);

    this.settings = {
      serviceUrl: {
        value: 'https://geoservices.tamu.edu/Services/CensusIntersection/WebService/v04_01/HTTP/?',
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
