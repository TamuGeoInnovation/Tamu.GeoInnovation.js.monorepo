import FormData from 'form-data';
import got from 'got';

import { EnvironmentService } from '@tamu-gisc/common/nest/environment';

import { HelperController } from './helper.controller';

jest.mock('got', () => jest.fn());

/**
 * The helper forwards a contact form to mailroom. It used to forward every field of the request,
 * so `raw`, `headers` or `envelope` reached mailroom as the caller sent them (#2121).
 */
describe('HelperController', () => {
  const settings = {
    mailroomToAddress: 'inbox@tamu.edu',
    mailroomFromAddress: 'noreply@tamu.edu',
    mailroomUrl: 'http://mailroom',
    rejectUnauthorized: true
  };

  let controller: HelperController;

  /** The forwarded form, as the text mailroom receives. */
  const forwarded = () => ((got as unknown as jest.Mock).mock.calls[0][1].body as FormData).getBuffer().toString();

  const res = { status: () => ({ json: (body: unknown) => body }) };

  beforeEach(() => {
    (got as unknown as jest.Mock).mockReset().mockResolvedValue({ statusCode: 200, body: '{}' });
    controller = new HelperController({ value: (key: string) => settings[key] } as unknown as EnvironmentService);
  });

  it('forwards the subject and body, with the fixed addresses', async () => {
    await controller.forwardMail(
      { from: 'visitor@example.com', subject: 'Hello', text: 'Plain', html: '<p>Hi</p>' },
      [],
      res
    );

    const form = forwarded();

    for (const value of ['Hello', 'Plain', '<p>Hi</p>', 'visitor@example.com', 'inbox@tamu.edu', 'noreply@tamu.edu']) {
      expect(form).toContain(value);
    }
  });

  it('does not forward raw, envelope, headers or any other field', async () => {
    await controller.forwardMail(
      {
        from: 'visitor@example.com',
        subject: 'Hello',
        text: 'Plain',
        raw: 'RAWMESSAGE',
        envelope: 'ENVELOPE',
        headers: 'HEADERS',
        bcc: 'hidden@example.com'
      },
      [],
      res
    );

    const form = forwarded();

    for (const name of ['raw', 'envelope', 'headers', 'bcc']) {
      expect(form).not.toContain(`name="${name}"`);
    }
  });
});
