import { TransformersMap, ApiResponseFormat, ApiBase } from '@tamu-gisc/geoprocessing-core';

import { ICensusIntersectionOptions, CensusIntersectionResult } from '../interfaces/v5.interfaces';

export class CensusIntersection extends ApiBase<
  TransformersMap<ICensusIntersectionOptions>,
  ICensusIntersectionOptions,
  CensusIntersectionResult
> {
  public responseType = ApiResponseFormat.Text;

  constructor(options: ICensusIntersectionOptions) {
    super(options);

    this.settings = {
      serviceUrl: {
        value: 'https://geoservices.tamu.edu/Api/CensusIntersection/V5/?',
        excludeParams: true
      },
      format: {
        value: 'json'
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
