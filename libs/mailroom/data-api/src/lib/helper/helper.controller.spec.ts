import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import FormData from 'form-data';
import got from 'got';

import { EnvironmentService } from '@tamu-gisc/common/nest/environment';
import { DEFAULT_UPLOAD_LIMITS } from '@tamu-gisc/common/nest/services';

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

describe('HelperController upload limits', () => {
  let app: INestApplication;
  let url: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [HelperController],
      providers: [{ provide: EnvironmentService, useValue: { value: jest.fn() } }]
    }).compile();

    app = module.createNestApplication({ logger: false });
    await app.listen(0, '127.0.0.1');
    url = await app.getUrl();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('answers 413 for a forwarded attachment over the shared file-size limit', async () => {
    // The platform's FormData and Blob, not the form-data package the tests above import.
    const form = new globalThis.FormData();
    form.append(
      'attachments',
      new Blob([new Uint8Array(DEFAULT_UPLOAD_LIMITS.fileSize + 1)], { type: 'application/octet-stream' }),
      'large.bin'
    );

    const response = await fetch(`${url}/mail`, { method: 'POST', body: form });

    expect(response.status).toBe(413);
  });
});
