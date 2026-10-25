import { createServer, IncomingMessage, Server, ServerResponse } from 'node:http';
import { AddressInfo } from 'node:net';

import { InternalServerErrorException } from '@nestjs/common';

import { IMailroomEmailOutbound } from '@tamu-gisc/mailroom/common';

import { ContactService } from './contact.service';

/**
 * What the contact form's mail does over real HTTP, against a stand-in for the mailroom service, so the same tests
 * hold whichever HTTP client sends it (#1218: got 11 to 16). contact.service.spec.ts covers what is composed.
 */
describe('ContactService over HTTP', () => {
  let server: Server;
  let answer: (req: IncomingMessage, res: ServerResponse) => void;
  let received: Array<{ method: string; type: string; body: string }>;
  const original = { ...process.env };

  beforeAll(async () => {
    server = createServer((req, res) => {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        received.push({ method: req.method, type: req.headers['content-type'], body });
        answer(req, res);
      });
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    process.env.MAILROOM_URL = `http://127.0.0.1:${(server.address() as AddressInfo).port}/send`;
    process.env.MAILROOM_TO = 'gisday@example.edu';
    process.env.MAILROOM_FROM = 'noreply@example.edu';
  });

  afterAll(async () => {
    process.env = original;
    await new Promise((resolve) => server.close(resolve));
  });

  beforeEach(() => {
    received = [];
  });

  const message = { subject: 'Hello', text: 'Body', to: 'x@example.edu', from: 'visitor@example.edu' } as IMailroomEmailOutbound;

  const respond = (status: number, json: unknown) =>
    (answer = (_req, res) => {
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(json));
    });

  it('posts the message as JSON and returns the parsed answer', async () => {
    respond(200, { statusCode: 200 });

    await expect(new ContactService().sendMessage({ ...message })).resolves.toEqual({ statusCode: 200 });

    expect(received).toHaveLength(1);
    expect(received[0].method).toBe('POST');
    expect(received[0].type).toMatch(/^application\/json/);
    expect(JSON.parse(received[0].body)).toMatchObject({ to: 'gisday@example.edu', from: 'noreply@example.edu', replyTo: 'visitor@example.edu' });
  });

  it.each([400, 500])('throws InternalServerErrorException on a %i, without retrying', async (status) => {
    respond(status, { message: 'no' });

    await expect(new ContactService().sendMessage({ ...message })).rejects.toBeInstanceOf(InternalServerErrorException);
    expect(received).toHaveLength(1);
  });

  it('sets no timeout of its own: a mailroom that never answers keeps the request waiting', async () => {
    let hung: ServerResponse;
    answer = (_req, res) => (hung = res);

    let settled = false;
    const sending = new ContactService().sendMessage({ ...message }).then(
      () => (settled = true),
      () => (settled = true)
    );

    await new Promise((resolve) => setTimeout(resolve, 1500));
    expect(settled).toBe(false);

    hung.writeHead(200, { 'content-type': 'application/json' });
    hung.end('{}');
    await sending;
  });
});
