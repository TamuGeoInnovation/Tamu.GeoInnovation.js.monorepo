import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { JwtGuard } from '@tamu-gisc/common/nest/auth';

import { SpeakerEditController } from './speaker-edit.controller';
import { SpeakerEditService } from './speaker-edit.service';
import { EMAIL_SENDER_TEST_PROVIDERS } from '../contact/email-sender.testing';

/**
 * #2958: profile emails for the selected submissions' people, from Research Competitions. It reads the submissions'
 * participants and emails speakers, so it takes both permissions. Nest's real routing, body parsing and
 * `PermissionsGuard` run; only the token check is replaced.
 */
describe('SpeakerEditController POST /speaker-edits/send-for-submissions', () => {
  let app: INestApplication;
  let url: string;
  let permissions: Array<string>;
  const sendLinksForSubmissions = jest.fn();

  const post = (body: object, headers: Record<string, string> = {}) =>
    fetch(`${url}/speaker-edits/send-for-submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body)
    });

  beforeEach(async () => {
    permissions = [];
    sendLinksForSubmissions.mockReset().mockResolvedValue({ sent: ['Ana Ruiz'], skipped: [], unmatched: [] });

    const module = await Test.createTestingModule({
      controllers: [SpeakerEditController],
      providers: [{ provide: SpeakerEditService, useValue: { sendLinksForSubmissions } }, ...EMAIL_SENDER_TEST_PROVIDERS]
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

  it('refuses an admin who cannot both read the competitions and edit speakers', async () => {
    for (const held of [['update:speakers'], ['read:competitions']]) {
      permissions = held;

      expect((await post({ submissions: ['sub-1'] })).status).toBe(403);
    }

    expect(sendLinksForSubmissions).not.toHaveBeenCalled();
  });

  it("sends for the list in one call, from the admin's site", async () => {
    permissions = ['update:speakers', 'read:competitions'];

    const response = await post({ submissions: ['sub-1', 'sub-2'] }, { Origin: 'https://gisday.tamu.edu' });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ sent: ['Ana Ruiz'], skipped: [], unmatched: [] });
    expect(sendLinksForSubmissions).toHaveBeenCalledWith(
      ['sub-1', 'sub-2'],
      'gisday.tamu.edu',
      undefined,
      undefined,
      undefined
    );
  });
});

/** #3023: the email is read and edited first, from all three places, and the send takes the edited text. */
describe('SpeakerEditController, the profile email read and edited first (#3023)', () => {
  let app: INestApplication;
  let url: string;
  let permissions: Array<string>;
  const service = {
    sendLinks: jest.fn(),
    sendLinksForSubmissions: jest.fn(),
    previewLinks: jest.fn(),
    previewLinksForSubmissions: jest.fn()
  };

  const post = (path: string, body: object) =>
    fetch(`${url}/speaker-edits/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://gisday.tamu.edu' },
      body: JSON.stringify(body)
    });

  beforeEach(async () => {
    permissions = [];
    Object.values(service).forEach((fn) => fn.mockReset().mockResolvedValue({}));

    const module = await Test.createTestingModule({
      controllers: [SpeakerEditController],
      providers: [{ provide: SpeakerEditService, useValue: service }, ...EMAIL_SENDER_TEST_PROVIDERS]
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

  it('keeps each preview behind the same permissions as its send', async () => {
    permissions = ['read:competitions'];
    expect((await post('send/preview', { speakers: ['sp-1'] })).status).toBe(403);

    permissions = ['update:speakers'];
    expect((await post('send-for-submissions/preview', { submissions: ['sub-1'] })).status).toBe(403);

    expect(service.previewLinks).not.toHaveBeenCalled();
    expect(service.previewLinksForSubmissions).not.toHaveBeenCalled();
  });

  it("previews from the admin's site, and sends the subject and text as edited", async () => {
    permissions = ['update:speakers', 'read:competitions'];
    const email = { subject: 'Profile', template: 'Hi {edit link}' };

    expect((await post('send/preview', { speakers: ['sp-1'] })).status).toBe(201);
    expect(service.previewLinks).toHaveBeenCalledWith(['sp-1'], 'gisday.tamu.edu');

    await post('send-for-submissions/preview', { submissions: ['sub-1'] });
    expect(service.previewLinksForSubmissions).toHaveBeenCalledWith(['sub-1'], 'gisday.tamu.edu');

    await post('send', { speakers: ['sp-1'], ...email });
    expect(service.sendLinks).toHaveBeenCalledWith(['sp-1'], 'gisday.tamu.edu', email, undefined);

    await post('send-for-submissions', { submissions: ['sub-1'], ...email });
    expect(service.sendLinksForSubmissions).toHaveBeenCalledWith(['sub-1'], 'gisday.tamu.edu', email, undefined, undefined);
  });
});

/**
 * #3104: the profile email goes to the speakers ticked in the window, and only ever as a copy each: each carries that
 * speaker's own link to edit their profile, which must not reach anyone else.
 */
describe('SpeakerEditController, choosing speakers for the profile email (#3104)', () => {
  let app: INestApplication;
  let url: string;
  const service = { sendLinks: jest.fn(), sendLinksForSubmissions: jest.fn() };

  const post = (path: string, body: object) =>
    fetch(`${url}/speaker-edits/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://gisday.tamu.edu' },
      body: JSON.stringify(body)
    });

  beforeEach(async () => {
    Object.values(service).forEach((fn) => fn.mockReset().mockResolvedValue({ sent: [], skipped: [] }));

    const module = await Test.createTestingModule({
      controllers: [SpeakerEditController],
      providers: [{ provide: SpeakerEditService, useValue: service }, ...EMAIL_SENDER_TEST_PROVIDERS]
    })
      .overrideGuard(JwtGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest().user = {
            sub: 'admin-1',
            permissions: ['update:speakers', 'read:competitions']
          };
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

  it('refuses to send it to them together, from either place, and sends nothing', async () => {
    const send = await post('send', { speakers: ['sp-1', 'sp-2'], together: true });
    const forSubmissions = await post('send-for-submissions', { submissions: ['sub-1'], together: true });

    expect(send.status).toBe(400);
    expect(forSubmissions.status).toBe(400);
    expect((await send.json()).message).toMatch(/own link/);
    expect(service.sendLinks).not.toHaveBeenCalled();
    expect(service.sendLinksForSubmissions).not.toHaveBeenCalled();
  });

  it("narrows Research Competitions' send to the speakers ticked", async () => {
    await post('send-for-submissions', { submissions: ['sub-1'], speakers: ['sp-2'] });

    expect(service.sendLinksForSubmissions).toHaveBeenCalledWith(['sub-1'], 'gisday.tamu.edu', undefined, undefined, [
      'sp-2'
    ]);
  });
});
