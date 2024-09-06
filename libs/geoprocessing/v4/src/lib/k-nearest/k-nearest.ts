import { TransformersMap, ApiResponseType, ApiBase, ResponseFormat } from '@tamu-gisc/geoprocessing-core';

import { IKNearestOptions, IKNearestResult } from '../interfaces/v4.interfaces';

export class KNearest extends ApiBase<TransformersMap<IKNearestOptions>, IKNearestOptions, IKNearestResult> {
  public responseType = ApiResponseType.Text;

  constructor(options: IKNearestOptions) {
    super(options);

    this.settings = {
      serviceHost: {
        value: 'http://geoservices.tamu.edu',
        excludeParams: true
      },
      servicePath: {
        value: '/Services/KNearest/WebService/v04_01/HTTP/',
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
