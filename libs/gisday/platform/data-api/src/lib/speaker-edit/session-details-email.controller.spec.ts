import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { JwtGuard } from '@tamu-gisc/common/nest/auth';

import { SessionDetailsEmailController } from './session-details-email.controller';
import { SessionDetailsEmailService } from './session-details-email.service';
import { EMAIL_SENDER_TEST_PROVIDERS } from '../contact/email-sender.testing';

/**
 * #3092: the session details email is sent, and previewed, behind the profile email's own permission, `update:speakers`.
 * Nest's real routing, body parsing and `PermissionsGuard` run; only the token check is replaced.
 */
describe('SessionDetailsEmailController', () => {
  let app: INestApplication;
  let url: string;
  let permissions: Array<string>;
  const service = { send: vi.fn(), preview: vi.fn() };

  const post = (path: string, body: object) =>
    fetch(`${url}/session-emails/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://gisday.tamu.edu' },
      body: JSON.stringify(body)
    });

  beforeEach(async () => {
    permissions = [];
    service.send.mockReset().mockResolvedValue({ sent: ['Ana Ruiz'], skipped: [] });
    service.preview.mockReset().mockResolvedValue({ groups: [] });

    const module = await Test.createTestingModule({
      controllers: [SessionDetailsEmailController],
      providers: [{ provide: SessionDetailsEmailService, useValue: service }, ...EMAIL_SENDER_TEST_PROVIDERS]
    })
      .overrideGuard(JwtGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest().user = { sub: 'admin-1', permissions };
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

      expect((await post('details', { event: 'e-1' })).status).toBe(403);
      expect((await post('details/preview', { event: 'e-1' })).status).toBe(403);
    }

    expect(service.send).not.toHaveBeenCalled();
    expect(service.preview).not.toHaveBeenCalled();
  });

  it("previews the session's email from the admin's site", async () => {
    permissions = ['update:speakers'];

    const response = await post('details/preview', { event: 'e-1' });

    expect(response.status).toBe(201);
    expect(service.preview).toHaveBeenCalledWith('e-1', 'gisday.tamu.edu');
  });

  it('sends it as edited, or as prefilled when no text is given', async () => {
    permissions = ['update:speakers'];

    const response = await post('details', { event: 'e-1', subject: 'S', template: 'T' });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ sent: ['Ana Ruiz'], skipped: [] });
    expect(service.send).toHaveBeenCalledWith(
      'e-1',
      'gisday.tamu.edu',
      { subject: 'S', template: 'T' },
      undefined,
      undefined
    );

    await post('details', { event: 'e-1' });

    // No sender chosen (#3100): the service sends from the site, as before.
    expect(service.send).toHaveBeenLastCalledWith('e-1', 'gisday.tamu.edu', undefined, undefined, undefined);
  });
});

/** #3104: the speakers ticked in the window, and together or a copy each, reach the service as chosen. */
describe('SessionDetailsEmailController, choosing speakers', () => {
  let app: INestApplication;
  let url: string;
  const service = { send: vi.fn(), preview: vi.fn() };

  beforeEach(async () => {
    service.send.mockReset().mockResolvedValue({ sent: [], skipped: [] });

    const module = await Test.createTestingModule({
      controllers: [SessionDetailsEmailController],
      providers: [{ provide: SessionDetailsEmailService, useValue: service }, ...EMAIL_SENDER_TEST_PROVIDERS]
    })
      .overrideGuard(JwtGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest().user = { sub: 'admin-1', permissions: ['update:speakers'] };
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

  it('passes on the speakers chosen and whether together', async () => {
    await fetch(`${url}/session-emails/details`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://gisday.tamu.edu' },
      body: JSON.stringify({ event: 'e-1', subject: 'S', template: 'T', speakers: ['sp-1', 'sp-2'], together: true })
    });

    expect(service.send).toHaveBeenCalledWith('e-1', 'gisday.tamu.edu', { subject: 'S', template: 'T' }, undefined, {
      speakers: ['sp-1', 'sp-2'],
      together: true
    });
  });
});
