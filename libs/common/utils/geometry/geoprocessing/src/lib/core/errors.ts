import { throwError, Observable } from 'rxjs';

import { GeocodeResult, NormalizedGeoservicesJsonError, NormalizedGeoservicesTextError, NormalizedXMLError } from './types';

export class GeoservicesError {
  private _code: number | string;
  private _response: object | string | XMLDocument;
  private _normalized: NormalizedGeoservicesJsonError | NormalizedGeoservicesTextError | NormalizedXMLError;

  constructor(badResponse: Responses | string | XMLDocument) {
    this._response = badResponse;

    if (typeof badResponse === 'string' && badResponse.length === 0) {
      this._normalized = '';

      this._textNormalize();
    } else if (badResponse instanceof Object && !(badResponse instanceof XMLDocument)) {
      this._code =
        badResponse.QueryStatusCodeValue !== undefined
          ? parseInt(badResponse.QueryStatusCodeValue, 10)
          : badResponse.QueryStatusCode;

      this._normalized = {};
      this._normalized.response = this._response as GeocodeResult;
      this._normalized.message = '';

      this._jsonNormalize();
    } else if (badResponse instanceof XMLDocument) {
      this._normalized = badResponse;
    } else {
      console.log('Expected bad response. Will not attempt to normalize.');
    }
  }

  private _jsonNormalize() {
    if (typeof this._normalized === 'object' && !(this._normalized instanceof XMLDocument)) {
      const e = this._error;
      this._normalized.error = e.type;
      this._normalized.statusCode = e.code;
    }
  }

  private _textNormalize() {
    if (typeof this._normalized === 'string') {
      this._normalized = 'API error';
    }
  }

  private get _error() {
    if (this._code === 400 || this._code === 'APIKeyError') {
      return {
        type: 'Unkown API key error',
        code: 400
      };
    } else if (this._code === 401 || this._code === 'APIKeyMissing') {
      return {
        type: 'API key missing',
        code: 401
      };
    } else if (this._code === 402 || this._code === 'APIKeyInvalid') {
      return {
        type: 'API key invalid',
        code: 402
      };
    } else if (this._code === 403 || this._code === 'APIKeyNotActivated') {
      return {
        type: 'API key not activated',
        code: 403
      };
    } else if (this._code === 450 || this._code === 'NonProfitError') {
      return {
        type: 'Non profit error',
        code: 450
      };
    } else if (this._code === 451 || this._code === 'NonProfitNotConfirmed') {
      return {
        type: 'Non profit not confirmed',
        code: 450
      };
    } else if (this._code === 470 || this._code === '	QuotaExceededError') {
      return {
        type: 'Quota exceeded error',
        code: 470
      };
    } else if (this._code === 471 || this._code === 'AnonymousQuotaExceeded') {
      return {
        type: 'Anonymous quota exceeded',
        code: 471
      };
    } else if (this._code === 472 || this._code === 'PaidQuotaExceeded') {
      return {
        type: 'Paid quota exceeded',
        code: 472
      };
    } else if (this._code === 480 || this._code === 'VersionMissing') {
      return {
        type: 'Version missing',
        code: 430
      };
    } else if (this._code === 481 || this._code === 'VersionInvalid') {
      return {
        type: 'Invalid version',
        code: 481
      };
    } else if (this._code === 500 || this._code === '	Failure') {
      return {
        type: 'Failure',
        code: 500
      };
    } else if (this._code === 501 || this._code === '	InternalError') {
      return {
        type: 'Internal server error',
        code: 501
      };
    } else {
      return {
        type: 'Unknown',
        code: 0
      };
    }
  }

  public throw(): Observable<never> {
    if (this._normalized) {
      return throwError(this._normalized);
    } else {
      console.log('Normalized error was not created.');
    }
  }
}

interface Responses {
  QueryStatusCodeValue?: string;
  QueryStatusCode?: string;
}
