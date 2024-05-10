import { TransformersMap, ApiResponseType, ApiBase, ResponseFormat } from '@tamu-gisc/geoprocessing-core';

import { ICensusIntersectionOptions, CensusIntersectionResult } from '../interfaces/v5.interfaces';

export class CensusIntersection extends ApiBase<
  TransformersMap<ICensusIntersectionOptions>,
  ICensusIntersectionOptions,
  CensusIntersectionResult
> {
  public responseType = ApiResponseType.Text;

  constructor(options: ICensusIntersectionOptions) {
    super(options);

    this.settings = {
      serviceHost: {
        value: 'https://geoservices.tamu.edu',
        excludeParams: true
      },
      servicePath: {
        value: '/Api/CensusIntersection/V5/',
        excludeParams: true
      },
      format: {
        value: ResponseFormat.JSON
      },
      version: {
        value: '5.0'
      },
      censusYears: {
        target: 'censusYears',
        value: undefined,
        fn: function (years) {
          this.value = years instanceof Array ? years.join(',') : years;
        }
      }
    };

    this.setup();
  }
}
