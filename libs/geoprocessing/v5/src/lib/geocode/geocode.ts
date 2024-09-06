import { TransformersMap, ApiResponseType, ApiBase, ResponseFormat } from '@tamu-gisc/geoprocessing-core';

import { CensusYear, GeocodeReferenceFeature, GeocodeResult, IGeocodeOptions } from '../interfaces/v5.interfaces';

export class Geocode extends ApiBase<TransformersMap<IGeocodeOptions>, IGeocodeOptions, GeocodeResult> {
  public responseType = ApiResponseType.Code;

  constructor(options: IGeocodeOptions) {
    super(options);

    this.settings = {
      version: {
        value: '5.0'
      },
      format: {
        value: ResponseFormat.JSON
      },
      censusYears: {
        value: undefined,
        fn: function (currentValue) {
          if (!currentValue) {
            return;
          }

          if (currentValue === CensusYear.AllAvailable) {
            return CensusYear.AllAvailable;
          }

          const validYears: Array<string> = currentValue.filter((y) => y !== undefined && y !== null && y !== '');

          if (validYears.length === 0) {
            return undefined;
          }

          return validYears instanceof Array ? validYears.join(',') : currentValue;
        }
      },
      census: {
        value: false,
        target: ['censusYears'],
        fn: function (currentValue, years) {
          if (!years) {
            return false;
          }

          if (years === CensusYear.AllAvailable) {
            return true;
          }

          return years.length > 0;
        }
      },
      relaxableAttributes: {
        value: undefined,
        fn: function (currentValue) {
          return currentValue ? currentValue.join(',') : currentValue;
        }
      },
      soundexableAttributes: {
        value: undefined,
        fn: function (currentValue) {
          return currentValue ? currentValue.join(',') : currentValue;
        }
      },
      refs: {
        value: [GeocodeReferenceFeature.PreComputedPoints],
        fn: function (currentValue, years) {
          let y = currentValue;

          if (years !== undefined && years !== null && years instanceof Array) {
            y = years;
          }

          return y.join(',');
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
        value: '/Api/Geocode/V5/',
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
