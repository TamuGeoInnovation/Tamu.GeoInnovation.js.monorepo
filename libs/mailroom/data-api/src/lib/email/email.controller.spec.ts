import { Mailer } from '../mailer/mailer.util';

import { EmailController } from './email.controller';

/**
 * Mailroom used to hand the request body straight to nodemailer's `sendMail`. Nodemailer acts on
 * far more than to, subject and body: an attachment with a `path` or `href` reads a file or URL on
 * the server, and `raw`, `envelope` and `headers` replace the message or its routing (#2121).
 *
 * These go through the real endpoints and look at what reaches `sendMail`.
 */
describe('EmailController', () => {
  let controller: EmailController;
  let sendMail: jest.Mock;

  /** What the endpoint handed to nodemailer. */
  const sent = () => sendMail.mock.calls[0][0];

  const message = {
    from: '"GIS Day" <gisday@tamu.edu>',
    to: 'someone@tamu.edu',
    cc: 'a@tamu.edu, b@tamu.edu',
    bcc: 'c@tamu.edu',
    replyTo: 'visitor@example.com',
    subject: 'Hello',
    text: 'Plain body',
    html: '<p>HTML body</p>'
  };

  /** Everything nodemailer would act on that a caller must not be able to set. */
  const hostile = {
    attachments: [{ path: '/etc/passwd' }, { href: 'http://169.254.169.254/latest/meta-data/' }],
    raw: 'From: spoof@example.com\r\n\r\nraw message',
    envelope: { from: 'bounce@example.com', to: 'everyone@example.com' },
    headers: { 'X-Injected': 'yes' },
    list: { unsubscribe: 'http://example.com' },
    disableFileAccess: false,
    disableUrlAccess: false
  };

  const upload = {
    fieldname: 'attachments',
    originalname: 'map.png',
    mimetype: 'image/png',
    buffer: Buffer.from('png bytes'),
    size: 9
  } as Express.Multer.File;

  beforeEach(() => {
    sendMail = jest.fn().mockResolvedValue({ accepted: ['someone@tamu.edu'], rejected: [] });
    (Mailer as unknown as { transporter: unknown }).transporter = { sendMail };
    controller = new EmailController(undefined);
  });

  describe('POST /', () => {
    it('keeps the addresses, subject and body of a normal message', async () => {
      await controller.sendEmail({ ...message });

      expect(sent()).toEqual(message);
    });

    it('passes no attachment path or href, raw, envelope, headers or other option from the caller', async () => {
      await controller.sendEmail({ ...message, ...hostile } as never);

      expect(sent()).toEqual(message);
      for (const key of Object.keys(hostile)) {
        expect(sent()).not.toHaveProperty(key);
      }
    });

    it('does not pass a body given as an object, which nodemailer would read as a path or href', async () => {
      await controller.sendEmail({ ...message, html: { path: '/etc/passwd' } } as never);

      expect(sent()).not.toHaveProperty('html');
    });

    it('refuses an address that is not an email address and sends nothing', async () => {
      await expect(controller.sendEmail({ ...message, to: 'not an address' })).rejects.toThrow(/to/);

      expect(sendMail).not.toHaveBeenCalled();
    });
  });

  describe('POST /form', () => {
    it('keeps the message and sends an uploaded file as its content', async () => {
      await controller.sendEmailFromFormWithAttachments([upload], { ...message });

      expect(sent()).toEqual({
        ...message,
        attachments: [{ filename: 'map.png', content: upload.buffer, contentType: 'image/png' }]
      });
    });

    it('sends only the uploaded files, never attachments, raw, envelope or headers from the body', async () => {
      await controller.sendEmailFromFormWithAttachments([upload], { ...message, ...hostile } as never);

      for (const key of Object.keys(hostile).filter((k) => k !== 'attachments')) {
        expect(sent()).not.toHaveProperty(key);
      }
      expect(sent().attachments).toEqual([{ filename: 'map.png', content: upload.buffer, contentType: 'image/png' }]);
    });
  });
});

describe('Mailer.build', () => {
  it('turns off file and URL access on the transport', () => {
    Mailer.build('tamu-relay', true);

    const options = (Mailer as unknown as { transporter: { options: Record<string, unknown> } }).transporter.options;

    expect(options.disableFileAccess).toBe(true);
    expect(options.disableUrlAccess).toBe(true);
  });
});
