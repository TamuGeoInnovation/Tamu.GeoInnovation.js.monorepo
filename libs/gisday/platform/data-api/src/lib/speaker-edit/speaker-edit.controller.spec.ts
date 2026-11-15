import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { JwtGuard } from '@tamu-gisc/common/nest/auth';

import { SpeakerEditController } from './speaker-edit.controller';
import { SpeakerEditService } from './speaker-edit.service';

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
      providers: [{ provide: SpeakerEditService, useValue: { sendLinksForSubmissions } }]
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
    expect(sendLinksForSubmissions).toHaveBeenCalledWith(['sub-1', 'sub-2'], 'gisday.tamu.edu');
  });
});
