import { createServer, IncomingMessage, Server, ServerResponse } from 'node:http';
import { AddressInfo } from 'node:net';

import { GatewayTimeoutException, HttpException, HttpStatus } from '@nestjs/common';

import { EnvironmentService } from '@tamu-gisc/common/nest/environment';

import { HelperController } from './helper.controller';

/**
 * What the helper's forwarding does over real HTTP, against a stand-in for mailroom, so the same tests hold whichever
 * HTTP client sends it (#1218: got 11 to 16). helper.controller.spec.ts covers which fields are forwarded.
 */
describe('HelperController over HTTP', () => {
  let server: Server;
  let answer: (req: IncomingMessage, res: ServerResponse) => void;
  let received: Array<{ method: string; url: string; type: string; body: string }>;
  let controller: HelperController;

  beforeAll(async () => {
    server = createServer((req, res) => {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        received.push({ method: req.method, url: req.url, type: req.headers['content-type'], body });
        answer(req, res);
      });
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const settings = {
      mailroomUrl: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
      mailroomToAddress: 'inbox@example.edu',
      mailroomFromAddress: 'noreply@example.edu',
      rejectUnauthorized: true
    };
    controller = new HelperController({ value: (key: string) => settings[key] } as unknown as EnvironmentService);
  });

  afterAll(() => new Promise((resolve) => server.close(resolve)));

  beforeEach(() => {
    received = [];
  });

  const respond = (status: number, body: string) =>
    (answer = (_req, res) => {
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(body);
    });

  /** The Express response the controller answers through. */
  const reply = () => {
    const sent: { status?: number; json?: unknown } = {};
    return {
      sent,
      res: {
        status: (status: number) => {
          sent.status = status;
          return { json: (json: unknown) => (sent.json = json) };
        }
      }
    };
  };

  const forward = (res: unknown) =>
    controller.forwardMail(
      { from: 'visitor@example.edu', subject: 'Hello', text: 'Plain' },
      [{ buffer: Buffer.from('attached'), originalname: 'note.txt' } as Express.Multer.File],
      res
    );

  it('posts a multipart form to mailroom /form and answers 200 when mailroom accepts it', async () => {
    respond(200, '{}');
    const { sent, res } = reply();

    await forward(res);

    expect(sent).toEqual({ status: 200, json: { statusCode: 200, message: 'Successfully forwarded email.' } });
    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({ method: 'POST', url: '/form' });
    expect(received[0].type).toMatch(/^multipart\/form-data; boundary=/);
    for (const part of ['name="subject"', 'Hello', 'name="replyTo"', 'visitor@example.edu', 'inbox@example.edu', 'filename="note.txt"', 'attached']) {
      expect(received[0].body).toContain(part);
    }
  });

  it('throws an HttpException carrying mailroom\'s exception when a 2xx answer reports one', async () => {
    respond(200, JSON.stringify({ exception: 'mailbox full' }));

    await expect(forward(reply().res)).rejects.toThrow(HttpException);
  });

  // A 4xx or 5xx used to fail with the HTTP client's own error before the controller's error branch was reached (#2277).
  it.each([400, 500])("throws the HttpException carrying mailroom's exception on a %i, without retrying", async (status) => {
    respond(status, JSON.stringify({ exception: 'mailbox full' }));

    const failure = await forward(reply().res).catch((e) => e);

    expect(failure).toBeInstanceOf(HttpException);
    expect(failure.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(failure.getResponse()).toBe('mailbox full');
    expect(received).toHaveLength(1);
  });

  it('throws an HttpException, not a parse error, when mailroom answers an error that is not JSON', async () => {
    respond(502, '<html>Bad Gateway</html>');

    const failure = await forward(reply().res).catch((e) => e);

    expect(failure).toBeInstanceOf(HttpException);
    expect(failure.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  // A mailroom that never answers held the request open for ever (#2277).
  it('gives up after the mail timeout, as a 504 the API can answer with', async () => {
    process.env.MAILROOM_TIMEOUT_MS = '300';
    let hung: ServerResponse;
    answer = (_req, res) => (hung = res);

    const outcome = await Promise.race([
      forward(reply().res).then(
        () => 'sent',
        (e) => e
      ),
      new Promise((resolve) => setTimeout(() => resolve('still waiting after 2 s'), 2000))
    ]);

    hung?.end('{}');
    delete process.env.MAILROOM_TIMEOUT_MS;
    expect(outcome).toBeInstanceOf(GatewayTimeoutException);
    expect(received).toHaveLength(1);
  });
});
