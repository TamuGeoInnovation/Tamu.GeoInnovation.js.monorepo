import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { JwtGuard } from '@tamu-gisc/common/nest/auth';

import { SlidesRequestEmailController } from './slides-request-email.controller';
import { SlidesRequestEmailService } from './slides-request-email.service';
import { EMAIL_SENDER_TEST_PROVIDERS } from '../contact/email-sender.testing';

/**
 * #3113: the Ask for slides email is sent, and previewed, behind the profile email's own permission, `update:speakers`,
 * only ever as a copy each, and as the sender chosen once checked (#3100). Nest's real routing, body parsing,
 * `PermissionsGuard` and "Send as" check run; only the token check is replaced.
 */
describe('SlidesRequestEmailController', () => {
  let app: INestApplication;
  let url: string;
  let permissions: Array<string>;
  // A made-up admin, as the token would name them.
  let user: Record<string, unknown>;
  const service = { send: jest.fn(), preview: jest.fn() };

  const post = (path: string, body: object) =>
    fetch(`${url}/session-emails/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://gisday.tamu.edu' },
      body: JSON.stringify(body)
    });

  beforeEach(async () => {
    permissions = [];
    user = {};
    service.send.mockReset().mockResolvedValue({ sent: ['Avery Example'], skipped: [] });
    service.preview.mockReset().mockResolvedValue({ groups: [] });

    const module = await Test.createTestingModule({
      controllers: [SlidesRequestEmailController],
      providers: [{ provide: SlidesRequestEmailService, useValue: service }, ...EMAIL_SENDER_TEST_PROVIDERS]
    })
      .overrideGuard(JwtGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest().user = { sub: 'admin-1', permissions, ...user };
          return true;
        }
      })
      .compile();

    app = module.createNestApplication({ logger: false });
    await app.listen(0, '127.0.0.1');
    url = await app.getUrl();
  });

  afterEach(async () => {
    await app.close();
  });

  it('refuses the send and the preview to anyone who cannot edit speakers', async () => {
    for (const held of [[], ['read:competitions'], ['update:events']]) {
      permissions = held;

      expect((await post('slides', { event: 'e-1' })).status).toBe(403);
      expect((await post('slides/preview', { event: 'e-1' })).status).toBe(403);
    }

    expect(service.send).not.toHaveBeenCalled();
    expect(service.preview).not.toHaveBeenCalled();
  });

  it("previews the session's request from the admin's site", async () => {
    permissions = ['update:speakers'];

    const response = await post('slides/preview', { event: 'e-1' });

    expect(response.status).toBe(201);
    expect(service.preview).toHaveBeenCalledWith('e-1', 'gisday.tamu.edu');
  });

  it('sends it as edited, to the speakers ticked, or as prefilled to everyone when neither is given', async () => {
    permissions = ['update:speakers'];

    const response = await post('slides', { event: 'e-1', subject: 'S', template: 'T {edit link}', speakers: ['sp-1'] });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ sent: ['Avery Example'], skipped: [] });
    expect(service.send).toHaveBeenCalledWith(
      'e-1',
      'gisday.tamu.edu',
      { subject: 'S', template: 'T {edit link}' },
      undefined,
      ['sp-1']
    );

    await post('slides', { event: 'e-1' });

    expect(service.send).toHaveBeenLastCalledWith('e-1', 'gisday.tamu.edu', undefined, undefined, undefined);
  });

  it('refuses it together with 400, before anything is sent: each copy carries its own link (decided 1A)', async () => {
    permissions = ['update:speakers'];

    const response = await post('slides', { event: 'e-1', speakers: ['sp-1', 'sp-2'], together: true });

    expect(response.status).toBe(400);
    expect((await response.json()).message).toMatch(/copy each/);
    expect(service.send).not.toHaveBeenCalled();
  });

  it('sends as the admin’s own address when chosen (#3100)', async () => {
    permissions = ['update:speakers'];
    user = { email: 'jadmin@tamu.edu', name: 'Jo Admin' };

    expect((await post('slides', { event: 'e-1', sender: 'jadmin@tamu.edu' })).status).toBe(201);
    expect(service.send).toHaveBeenCalledWith(
      'e-1',
      'gisday.tamu.edu',
      undefined,
      expect.objectContaining({ replyTo: 'jadmin@tamu.edu' }),
      undefined
    );
  });

  it('refuses a sender the admin may not send as, before anything is sent (#3100)', async () => {
    permissions = ['update:speakers'];

    for (const sender of ['someone@example.com', 'not an address', 'another.person@tamu.edu']) {
      expect((await post('slides', { event: 'e-1', sender })).status).toBe(400);
    }

    expect(service.send).not.toHaveBeenCalled();
  });
});
