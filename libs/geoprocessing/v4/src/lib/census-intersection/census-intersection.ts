import { TransformersMap, ApiResponseType, ApiBase, ResponseFormat } from '@tamu-gisc/geoprocessing-core';

import { ICensusIntersectionOptions, ICensusIntersectionResult } from '../interfaces/v4.interfaces';

export class CensusIntersection extends ApiBase<
  TransformersMap<ICensusIntersectionOptions>,
  ICensusIntersectionOptions,
  ICensusIntersectionResult
> {
  public responseType = ApiResponseType.Text;

  constructor(options: ICensusIntersectionOptions) {
    super(options);

    this.settings = {
      serviceUrl: {
        value: 'https://geoservices.tamu.edu/Services/CensusIntersection/WebService/v04_01/HTTP/?',
        excludeParams: true
      },
      format: {
        value: ResponseFormat.JSON
      },
      version: {
        value: '4.10'
      }
    };

    this.setup();
  }
}
