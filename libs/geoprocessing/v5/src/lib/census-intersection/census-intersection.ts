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
      format: {
        value: ResponseFormat.JSON
      },
      version: {
        value: '5.0'
      },
      censusYears: {
        value: undefined,
        fn: function (currentValue) {
          return currentValue instanceof Array ? currentValue.join(',') : currentValue;
        }
      },
      serviceHost: {
        value: 'https://geoservices.tamu.edu',
        excludeParams: true,
        fn: function (currentValue) {
          if (
            currentValue !== undefined &&
            currentValue !== null &&
            typeof currentValue === 'string' &&
            currentValue.startsWith('http')
          ) {
            return currentValue;
          }
        }
      },
      servicePath: {
        value: '/Api/CensusIntersection/V5/',
        excludeParams: true,
        fn: function (currentValue) {
          if (currentValue !== undefined && currentValue !== null && typeof currentValue === 'string') {
            return currentValue;
          }
        }
      }
    };

    this.setup();
  }
}
