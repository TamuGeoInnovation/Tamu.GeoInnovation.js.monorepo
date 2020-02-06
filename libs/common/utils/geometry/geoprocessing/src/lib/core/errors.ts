import { throwError, Observable } from 'rxjs';

import { GeocodeResult } from './types';

export class GeoservicesError {
  private _code: number;
  private _response: GeocodeResult | string | XMLDocument;
  private _normalized: NormalizedGeoservicesJsonError | NormalizedGeoservicesTextError | NormalizedXMLError;

  constructor(badResponse: GeocodeResult | string | XMLDocument) {
    this._response = badResponse;

    if (typeof badResponse === 'string' && badResponse.length === 0) {
      this._normalized = '';

      this._textNormalize();
    } else if (badResponse instanceof Object && !(badResponse instanceof XMLDocument)) {
      this._code = parseInt(badResponse.QueryStatusCodeValue, 10);

      this._normalized = {};
      this._normalized.statusCode = this._code;
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
      if (this._code === 400) {
        this._normalized.error = this._error;
      } else if (this._code === 401) {
        this._normalized.error = this._error;
      } else if (this._code === 402) {
        this._normalized.error = this._error;
      } else if (this._code === 403) {
        this._normalized.error = this._error;
      } else if (this._code === 450) {
        this._normalized.error = this._error;
      } else if (this._code === 451) {
        this._normalized.error = this._error;
      } else if (this._code === 470) {
        this._normalized.error = this._error;
      } else if (this._code === 471) {
        this._normalized.error = this._error;
      } else if (this._code === 472) {
        this._normalized.error = this._error;
      } else if (this._code === 480) {
        this._normalized.error = this._error;
      } else if (this._code === 481) {
        this._normalized.error = this._error;
      } else if (this._code === 500) {
        this._normalized.error = this._error;
      } else if (this._code === 501) {
        this._normalized.error = this._error;
      } else if (this._code === 0) {
        this._normalized.error = this._error;
      }
    }
  }

  private _textNormalize() {
    if (typeof this._normalized === 'string') {
      this._normalized = 'API error';
    }
  }

  private get _error() {
    if (this._code === 400) {
      return 'Unkown API key error';
    } else if (this._code === 401) {
      return 'API key missing';
    } else if (this._code === 402) {
      return 'API key invalid';
    } else if (this._code === 403) {
      return 'API key not activated';
    } else if (this._code === 450) {
      return 'Non profit error';
    } else if (this._code === 451) {
      return 'Non profit not confirmed';
    } else if (this._code === 470) {
      return 'Quota exceeded error';
    } else if (this._code === 471) {
      return 'Antonymous quota exceeded';
    } else if (this._code === 472) {
      return 'Paid quota exceeded';
    } else if (this._code === 480) {
      return 'Version missing';
    } else if (this._code === 481) {
      return 'Invalid version';
    } else if (this._code === 500) {
      return 'Failure';
    } else if (this._code === 501) {
      return 'Internal server error';
    } else if (this._code === 0) {
      return 'Unknown';
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

interface NormalizedGeoservicesJsonError {
  statusCode?: number;
  error?: string;
  message?: string;
  response?: GeocodeResult;
}

type NormalizedGeoservicesTextError = string;

type NormalizedXMLError = XMLDocument;
