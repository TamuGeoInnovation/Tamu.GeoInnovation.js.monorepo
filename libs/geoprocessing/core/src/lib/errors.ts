import { AxiosError, AxiosResponse } from 'axios';
import { getXmlStatusCode } from './utils';

export class GeoservicesError extends Error {
  public statusCode: number;
  public message: string;
  public type: string;
  public response: Responses | string | XMLDocument | AxiosError;

  constructor(badResponse: AxiosResponse<Responses | string | XMLDocument> | AxiosError) {
    super();

    // Handle errors thrown by Axios
    if (badResponse instanceof AxiosError) {
      this.response = badResponse;
      this.statusCode = badResponse.response.status;
      this.type = badResponse.response.statusText;
      this.message = badResponse.message;
    }

    // Handle JSON error responses
    else if (badResponse.config.responseType === 'json') {
      this.statusCode = (badResponse.data as Responses).statusCode;
      this.response = badResponse.data;
    }

    // Handle text-based error responses
    else if (badResponse.config.responseType === 'text' && (badResponse.data as string).length === 0) {
      this.statusCode = 0;
      this.response = badResponse.data;
    }

    // Handle XML error responses
    else if (badResponse.config.responseType === 'document') {
      let serializedDocument: string;

      // Browser will be an object. Need to serialize into string.
      try {
        if (window !== undefined && typeof badResponse.data === 'object') {
          serializedDocument = new XMLSerializer().serializeToString(badResponse.data as Node);
        }
      } catch (e) {
        serializedDocument = badResponse.data as string;
      }

      this.statusCode = getXmlStatusCode(serializedDocument);
      this.response = serializedDocument;
    }

    //
    else {
      console.warn('Expected known error response but got unknown response.');
    }

    this.errorNormalize();
  }

  private errorNormalize() {
    const e = this._error;

    this.type = e.type;
    this.statusCode = e.code;
    this.message = e.message;
  }

  private get _error() {
    if (this.statusCode === 400 || this.type === 'APIKeyError') {
      return {
        type: 'Unknown API key error',
        message: 'Please ensure your API key is correct and try again.',
        code: 400
      };
    } else if (this.statusCode === 401 || this.type === 'APIKeyMissing') {
      return {
        type: 'API key missing',
        message: 'Get your free api key @ https://geoservices.tamu.edu/UserServices/Profile/',
        code: 401
      };
    } else if (this.statusCode === 402 || this.type === 'APIKeyInvalid') {
      return {
        type: 'API key invalid',
        message: 'Please confirm your API key @ https://geoservices.tamu.edu/UserServices/Profile/',
        code: 402
      };
    } else if (this.statusCode === 403 || this.type === 'APIKeyNotActivated') {
      return {
        type: 'API key not activated',
        message: '',
        code: 403
      };
    } else if (this.statusCode === 450 || this.type === 'NonProfitError') {
      return {
        type: 'Non profit error',
        message: '',
        code: 450
      };
    } else if (this.statusCode === 451 || this.type === 'NonProfitNotConfirmed') {
      return {
        type: 'Non profit not confirmed',
        message: '',
        code: 450
      };
    } else if (this.statusCode === 470 || this.type === '	QuotaExceededError') {
      return {
        type: 'Quota exceeded error',
        message: '',
        code: 470
      };
    } else if (this.statusCode === 471 || this.type === 'AnonymousQuotaExceeded') {
      return {
        type: 'Anonymous quota exceeded',
        message: '',
        code: 471
      };
    } else if (this.statusCode === 472 || this.type === 'PaidQuotaExceeded') {
      return {
        type: 'Paid quota exceeded',
        message: '',
        code: 472
      };
    } else if (this.statusCode === 480 || this.type === 'VersionMissing') {
      return {
        type: 'Version missing',
        message: '',
        code: 430
      };
    } else if (this.statusCode === 481 || this.type === 'VersionInvalid') {
      return {
        type: 'Invalid version',
        message: '',
        code: 481
      };
    } else if (this.statusCode === 500 || this.type === '	Failure') {
      return {
        type: 'Failure',
        message: '',
        code: 500
      };
    } else if (this.statusCode === 501 || this.type === '	InternalError') {
      return {
        type: 'Internal server error',
        message: '',
        code: 501
      };
    } else {
      return {
        type: 'Unknown error',
        message: 'An unknown error ocurred',
        code: 0
      };
    }
  }

  public toRenderableJSON(omitResponse?: boolean) {
    const copy = JSON.parse(JSON.stringify(this));

    if (omitResponse) {
      delete copy.response;
    }

    return JSON.stringify(copy, null, '   ');
  }
}

interface Responses {
  statusCode?: number;
  error?: string;
}
