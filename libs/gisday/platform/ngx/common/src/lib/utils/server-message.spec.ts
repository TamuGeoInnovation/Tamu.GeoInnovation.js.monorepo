import { HttpErrorResponse } from '@angular/common/http';

import { serverMessage } from './server-message';

/**
 * #2966. A refused save or upload showed only its status ("Error creating sponsor: 400"); the API's own message says why.
 */
describe('serverMessage', () => {
  const fallback = 'Error creating sponsor: 400';

  function refused(status: number, error: unknown) {
    return new HttpErrorResponse({ status, error });
  }

  it("gives the API's message when it is one string", () => {
    const err = refused(400, { statusCode: 400, message: 'The photo must be a PNG or JPEG image' });

    expect(serverMessage(err, fallback)).toBe('The photo must be a PNG or JPEG image');
  });

  it("gives every line of the API's message when it is a list", () => {
    const err = refused(400, { statusCode: 400, message: ['name should not be empty', 'website must be a URL'] });

    expect(serverMessage(err, fallback)).toBe('name should not be empty; website must be a URL');
  });

  it("gives the API's words when it refused because a deadline has passed (#2934)", () => {
    const err = refused(403, { statusCode: 403, message: 'Submissions closed on 1 November.' });

    expect(serverMessage(err, fallback)).toBe('Submissions closed on 1 November.');
  });

  it('gives the fallback when the response has no body, or a body with no message', () => {
    expect(serverMessage(refused(400, null), fallback)).toBe(fallback);
    expect(serverMessage(refused(400, { statusCode: 400 }), fallback)).toBe(fallback);
    expect(serverMessage(refused(400, { message: '' }), fallback)).toBe(fallback);
    expect(serverMessage(refused(400, { message: [] }), fallback)).toBe(fallback);
  });

  it('gives the fallback for a body that is text, such as a proxy page', () => {
    expect(serverMessage(refused(413, '<html>413 Request Entity Too Large</html>'), fallback)).toBe(fallback);
  });

  it('gives the fallback for a server failure, whose message is not a reason the user can act on', () => {
    expect(serverMessage(refused(500, { statusCode: 500, message: 'Internal server error' }), fallback)).toBe(fallback);
  });

  it('gives the fallback for an error that is not an HTTP response', () => {
    expect(serverMessage(new Error('boom'), fallback)).toBe(fallback);
    expect(serverMessage(undefined, fallback)).toBe(fallback);
  });
});
