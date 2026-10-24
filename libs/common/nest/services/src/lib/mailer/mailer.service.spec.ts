import { createServer, IncomingMessage, Server, ServerResponse } from 'node:http';
import { AddressInfo } from 'node:net';

import { GatewayTimeoutException, InternalServerErrorException } from '@nestjs/common';

import { EnvironmentService } from '@tamu-gisc/common/nest/environment';
import { IMailroomEmailOutbound } from '@tamu-gisc/mailroom/common';

import { MailerService } from './mailer.service';

/**
 * What the mailer does over real HTTP, against a stand-in for the mailroom service, so the same tests hold whichever
 * HTTP client sends it (#1218: got 11 to 16).
 */
describe('MailerService', () => {
  let server: Server;
  let url: string;
  let answer: (req: IncomingMessage, body: string, res: ServerResponse) => void;
  let received: Array<{ method: string; type: string; body: string }>;

  beforeAll(async () => {
    server = createServer((req, res) => {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        received.push({ method: req.method, type: req.headers['content-type'], body });
        answer(req, body, res);
      });
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/send`;
  });

  afterAll(() => new Promise((resolve) => server.close(resolve)));

  beforeEach(() => {
    received = [];
  });

  const mailer = (from?: string) =>
    new MailerService({ value: (key: string) => ({ mailroomUrl: url, mailroomFromAddress: from })[key] } as unknown as EnvironmentService);

  const mail = { to: 'someone@example.edu', from: 'app@example.edu', subject: 'Hello', text: 'Body' } as IMailroomEmailOutbound;

  const respond = (status: number, json: unknown) =>
    (answer = (_req, _body, res) => {
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(json));
    });

  it('posts the mail as JSON, with the configured from address, and returns the parsed answer', async () => {
    respond(200, { statusCode: 200, message: 'sent' });

    await expect(mailer('noreply@example.edu').sendMail({ ...mail })).resolves.toEqual({ statusCode: 200, message: 'sent' });

    expect(received).toHaveLength(1);
    expect(received[0].method).toBe('POST');
    expect(received[0].type).toMatch(/^application\/json/);
    expect(JSON.parse(received[0].body)).toEqual({ ...mail, from: 'noreply@example.edu' });
  });

  it('throws InternalServerErrorException on a 4xx, without retrying', async () => {
    respond(400, { message: 'bad request' });

    await expect(mailer().sendMail({ ...mail })).rejects.toBeInstanceOf(InternalServerErrorException);
    expect(received).toHaveLength(1);
  });

  it('throws InternalServerErrorException on a 5xx, without retrying', async () => {
    respond(500, { message: 'down' });

    await expect(mailer().sendMail({ ...mail })).rejects.toBeInstanceOf(InternalServerErrorException);
    expect(received).toHaveLength(1);
  });

  // A mailroom that never answers held the request open for ever (#2277).
  it('gives up after the mail timeout, as a 504 the API can answer with', async () => {
    process.env.MAILROOM_TIMEOUT_MS = '300';
    let hung: ServerResponse;
    answer = (_req, _body, res) => (hung = res);

    const outcome = await Promise.race([
      mailer()
        .sendMail({ ...mail })
        .then(
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
