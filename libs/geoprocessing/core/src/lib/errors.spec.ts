import { AxiosError, AxiosHeaders, AxiosResponse } from 'axios';

import { GeoservicesError } from './errors';

describe('GeoservicesError', () => {
  // A request that gets no answer at all (refused, offline, blocked by CORS, timed out) is an AxiosError with no
  // response. Reading its status threw a TypeError instead, which has no toRenderableJSON, so geoservices' four
  // services pages logged "err.toRenderableJSON is not a function" and their Result tab stayed empty (#2267).
  it('describes a request that got no answer', () => {
    const error = new GeoservicesError(new AxiosError('Network Error', AxiosError.ERR_NETWORK));

    expect(JSON.parse(error.toRenderableJSON(true))).toEqual({
      statusCode: 0,
      type: 'Unknown error',
      message: 'An unknown error ocurred'
    });
  });

  it('describes an error the server answered with, as before', () => {
    const answer = { status: 401, statusText: 'Unauthorized', data: '', headers: {}, config: { headers: new AxiosHeaders() } };
    const answered = new AxiosError('Request failed with status code 401', AxiosError.ERR_BAD_REQUEST, undefined, undefined, answer as AxiosResponse);

    const error = new GeoservicesError(answered);

    expect(error.statusCode).toBe(401);
    expect(error.type).toBe('API key missing');
  });
});
