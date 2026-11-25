import type { Mock } from 'vitest';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { JwtGuard } from '@tamu-gisc/common/nest/auth';

import { EmailSenderController } from './email-sender.controller';
import { EMAIL_SENDER_TEST_PROVIDERS } from './email-sender.testing';
import { SpeakerEditController } from '../speaker-edit/speaker-edit.controller';
import { SpeakerEditService } from '../speaker-edit/speaker-edit.service';
import { SessionDetailsEmailController } from '../speaker-edit/session-details-email.controller';
import { SessionDetailsEmailService } from '../speaker-edit/session-details-email.service';
import { SlidesRequestEmailController } from '../speaker-edit/slides-request-email.controller';
import { SlidesRequestEmailService } from '../speaker-edit/slides-request-email.service';
import { UserSubmissionController } from '../user-submission/user-submission.controller';
import { UserSubmissionProvider } from '../user-submission/user-submission.provider';
import { SubmissionFilesService } from '../user-submission/submission-files.service';

/**
 * #3100: the composer's "Send as" box. Its choices come from `GET /email-senders`, guarded as the send routes are, and every
 * send route that uses the composer checks the choice before anything is sent: the admin's own address (from their
 * token), the site's `MAILROOM_FROM`, or a tamu.edu address in `MAILROOM_SENDERS`; anything else is a 400 with a reason.
 * Nest's real routing, body parsing and `PermissionsGuard` run; only the token check is replaced.
 */
describe('Send as, on every route that uses the email composer', () => {
  let app: INestApplication;
  let url: string;
  let permissions: Array<string>;
  const settings = ['MAILROOM_FROM', 'MAILROOM_TO', 'MAILROOM_SENDERS', 'GISDAY_SITE'] as const;
  const previous: Partial<Record<(typeof settings)[number], string | undefined>> = {};

  const speakerEdits = { sendLinks: vi.fn(), sendLinksForSubmissions: vi.fn() };
  const sessionEmails = { send: vi.fn() };
  const slidesRequests = { send: vi.fn() };
  const submissions = { reviewUserSubmissions: vi.fn(), remindUserSubmissions: vi.fn() };

  /** Each route the composer sends through, with a body it accepts, and the service call that does the sending. */
  const routes: Array<{ path: string; body: object; sends: Mock }> = [
    { path: 'speaker-edits/send', body: { speakers: ['sp-1'] }, sends: speakerEdits.sendLinks },
    {
      path: 'speaker-edits/send-for-submissions',
      body: { submissions: ['s-1'] },
      sends: speakerEdits.sendLinksForSubmissions
    },
    { path: 'session-emails/details', body: { event: 'e-1' }, sends: sessionEmails.send },
    // The Ask for slides email (#3113).
    { path: 'session-emails/slides', body: { event: 'e-1' }, sends: slidesRequests.send },
    {
      path: 'user-submissions/review',
      body: { submissions: ['s-1'], acceptance: true },
      sends: submissions.reviewUserSubmissions
    },
    { path: 'user-submissions/remind', body: { submissions: ['s-1'] }, sends: submissions.remindUserSubmissions }
  ];

  const call = (path: string, body?: object) =>
    fetch(`${url}/${path}`, {
      method: body ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json', Origin: 'https://gisday.tamu.edu' },
      body: body ? JSON.stringify(body) : undefined
    });

  beforeEach(async () => {
    for (const name of settings) {
      previous[name] = process.env[name];
    }

    process.env.MAILROOM_FROM = 'Texas A&M GIS Day <gisday.example@tamu.edu>';
    process.env.MAILROOM_TO = 'gisday.inbox@example.com';
    process.env.MAILROOM_SENDERS = 'gisday@tamu.edu,gisday@gmail.com';
    delete process.env.GISDAY_SITE;
    permissions = ['update:speakers', 'read:competitions', 'update:competitions'];

    for (const { sends } of routes) {
      sends.mockReset().mockResolvedValue({ sent: [], skipped: [] });
    }

    const module = await Test.createTestingModule({
      controllers: [
        EmailSenderController,
        SpeakerEditController,
        SessionDetailsEmailController,
        SlidesRequestEmailController,
        UserSubmissionController
      ],
      providers: [
        { provide: SpeakerEditService, useValue: speakerEdits },
        { provide: SessionDetailsEmailService, useValue: sessionEmails },
        { provide: SlidesRequestEmailService, useValue: slidesRequests },
        { provide: UserSubmissionProvider, useValue: submissions },
        { provide: SubmissionFilesService, useValue: {} },
        ...EMAIL_SENDER_TEST_PROVIDERS
      ]
    })
      .overrideGuard(JwtGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          // The admin's address and name as their token carries them, in namespaced claims.
          context.switchToHttp().getRequest().user = {
            sub: 'auth0|admin',
            permissions,
            'https://gisday/email': 'jadmin@tamu.edu',
            'https://gisday/name': 'Jo Admin'
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

    for (const name of settings) {
      if (previous[name] === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = previous[name];
      }
    }
  });

  it('lists the choices for the signed-in admin, their own first, to anyone who may send these emails', async () => {
    for (const held of [['update:speakers'], ['update:competitions']]) {
      permissions = held;

      const response = await call('email-senders');

      expect(response.status).toBe(200);
      expect((await response.json()).choices.map((c) => [c.kind, c.address, c.from])).toEqual([
        ['own', 'jadmin@tamu.edu', '"Jo Admin (Texas A&M GIS Day)" <jadmin@tamu.edu>'],
        ['site', 'gisday.example@tamu.edu', '"Texas A&M GIS Day" <gisday.example@tamu.edu>'],
        ['shared', 'gisday@tamu.edu', '"Texas A&M GIS Day" <gisday@tamu.edu>']
      ]);
    }
  });

  it('lists nothing to anyone who may not send them', async () => {
    for (const held of [[], ['read:competitions'], ['update:events']]) {
      permissions = held;

      expect((await call('email-senders')).status).toBe(403);
    }
  });

  it.each(routes.map((r) => [r.path, r]))(
    '%s refuses an address that is not theirs, the site or a shared one, with a reason, and sends nothing',
    async (_path, { path, body, sends }) => {
      const response = await call(path, { ...body, sender: 'someone.else@tamu.edu' });

      expect(response.status).toBe(400);
      expect((await response.json()).message).toBe(
        "Cannot send as someone.else@tamu.edu: it is not your own address, the site's address, or a shared address in MAILROOM_SENDERS."
      );
      expect(sends).not.toHaveBeenCalled();
    }
  );

  it.each(routes.map((r) => [r.path, r]))(
    '%s refuses a MAILROOM_SENDERS entry outside tamu.edu, and sends nothing',
    async (_path, { path, body, sends }) => {
      const response = await call(path, { ...body, sender: 'gisday@gmail.com' });

      expect(response.status).toBe(400);
      expect((await response.json()).message).toContain('only tamu.edu addresses may be sent as');
      expect(sends).not.toHaveBeenCalled();
    }
  );

  it.each(routes.map((r) => [r.path, r]))(
    "%s sends as the admin's own address, with replies to them, and as the site's",
    async (_path, { path, body, sends }) => {
      expect((await call(path, { ...body, sender: 'jadmin@tamu.edu' })).status).toBe(201);
      expect((await call(path, { ...body, sender: 'gisday.example@tamu.edu' })).status).toBe(201);

      expect(JSON.stringify(sends.mock.calls[0])).toContain(
        JSON.stringify({ from: '"Jo Admin (Texas A&M GIS Day)" <jadmin@tamu.edu>', replyTo: 'jadmin@tamu.edu' })
      );
      expect(JSON.stringify(sends.mock.calls[1])).toContain(
        JSON.stringify({ from: '"Texas A&M GIS Day" <gisday.example@tamu.edu>', replyTo: 'gisday.inbox@example.com' })
      );
    }
  );
});
