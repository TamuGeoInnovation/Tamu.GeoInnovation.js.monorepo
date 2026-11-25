import { BadRequestException, Logger } from '@nestjs/common';

import { EmailSenderService, configuredSenders, siteSender } from './email-sender.service';

/**
 * #3100: an admin may send the composer's emails as their own address (from their token), the site's `MAILROOM_FROM`, or
 * a shared address in `MAILROOM_SENDERS`, and only tamu.edu ones; anything else is refused with a reason.
 */
describe('EmailSenderService', () => {
  const settings = ['MAILROOM_FROM', 'MAILROOM_TO', 'MAILROOM_SENDERS', 'GISDAY_SITE'] as const;
  const previous: Partial<Record<(typeof settings)[number], string | undefined>> = {};
  const management = { getUserMetadata: jest.fn() };
  let service: EmailSenderService;
  let warn: jest.SpyInstance;

  /** An admin whose token carries their address, as a namespaced claim, and their name. */
  const admin = { sub: 'auth0|admin', 'https://gisday/email': 'JAdmin@tamu.edu', 'https://gisday/name': 'Jo Admin' };

  beforeEach(() => {
    for (const name of settings) {
      previous[name] = process.env[name];
    }

    process.env.MAILROOM_FROM = 'Texas A&M GIS Day <gisday.example@tamu.edu>';
    process.env.MAILROOM_TO = 'gisday.inbox@example.com';
    process.env.MAILROOM_SENDERS = 'gisday@tamu.edu, gisday@gmail.com';
    delete process.env.GISDAY_SITE;
    warn = jest.spyOn(Logger, 'warn').mockImplementation(() => undefined);
    management.getUserMetadata.mockReset().mockRejectedValue(new Error('management is not configured'));
    service = new EmailSenderService(management as never);
  });

  afterEach(() => {
    for (const name of settings) {
      if (previous[name] === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = previous[name];
      }
    }

    warn.mockRestore();
  });

  it('offers the admin their own address first, then the site, then the shared addresses, each with its From', async () => {
    const { choices, unavailable } = await service.choices(admin, 'gisday.tamu.edu');

    expect(choices).toEqual([
      {
        kind: 'own',
        address: 'JAdmin@tamu.edu',
        label: 'Your address (JAdmin@tamu.edu)',
        from: '"Jo Admin (Texas A&M GIS Day)" <JAdmin@tamu.edu>',
        replyTo: 'JAdmin@tamu.edu'
      },
      {
        kind: 'site',
        address: 'gisday.example@tamu.edu',
        label: "The site's address (gisday.example@tamu.edu)",
        from: '"Texas A&M GIS Day" <gisday.example@tamu.edu>',
        replyTo: 'gisday.inbox@example.com'
      },
      {
        kind: 'shared',
        address: 'gisday@tamu.edu',
        label: 'Shared address (gisday@tamu.edu)',
        from: '"Texas A&M GIS Day" <gisday@tamu.edu>',
        replyTo: 'gisday@tamu.edu'
      }
    ]);
    expect(unavailable).toEqual([]);
  });

  it('accepts their own address, from their token, as their name and the site, with replies to them', async () => {
    await expect(service.resolve(admin, 'jadmin@TAMU.edu', 'gisday.tamu.edu')).resolves.toEqual({
      from: '"Jo Admin (Texas A&M GIS Day)" <JAdmin@tamu.edu>',
      replyTo: 'JAdmin@tamu.edu'
    });
  });

  it("accepts the site's MAILROOM_FROM, as every email was sent before", async () => {
    await expect(service.resolve(admin, 'gisday.example@tamu.edu', 'gisday.tamu.edu')).resolves.toEqual(
      siteSender('Texas A&M GIS Day')
    );
    expect(siteSender('Texas A&M GIS Day')).toEqual({
      from: '"Texas A&M GIS Day" <gisday.example@tamu.edu>',
      replyTo: 'gisday.inbox@example.com'
    });
  });

  it('accepts a tamu.edu address in MAILROOM_SENDERS, with replies to it', async () => {
    await expect(service.resolve(admin, 'gisday@tamu.edu', 'gisday.tamu.edu')).resolves.toEqual({
      from: '"Texas A&M GIS Day" <gisday@tamu.edu>',
      replyTo: 'gisday@tamu.edu'
    });
  });

  it('sends from the site, as before, when no sender was chosen', async () => {
    await expect(service.resolve(admin, undefined, 'gisday.tamu.edu')).resolves.toBeUndefined();
    await expect(service.resolve(admin, '', 'gisday.tamu.edu')).resolves.toBeUndefined();
  });

  it('refuses an address that is not theirs, the site, or a shared one, with a reason', async () => {
    const refused = service.resolve(admin, 'someone.else@tamu.edu', 'gisday.tamu.edu');

    await expect(refused).rejects.toThrow(BadRequestException);
    await expect(refused).rejects.toThrow(
      "Cannot send as someone.else@tamu.edu: it is not your own address, the site's address, or a shared address in MAILROOM_SENDERS."
    );
  });

  it('ignores an entry of MAILROOM_SENDERS outside tamu.edu, with a warning, and refuses it', async () => {
    expect(configuredSenders('gisday@tamu.edu, gisday@gmail.com, events@tamu.edu.example.com')).toEqual({
      allowed: ['gisday@tamu.edu'],
      ignored: ['gisday@gmail.com', 'events@tamu.edu.example.com']
    });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('gisday@gmail.com'), 'EmailSenderService');

    const { choices } = await service.choices(admin, 'gisday.tamu.edu');

    expect(choices.map((c) => c.address)).not.toContain('gisday@gmail.com');
    await expect(service.resolve(admin, 'gisday@gmail.com', 'gisday.tamu.edu')).rejects.toThrow(
      'Cannot send as gisday@gmail.com: it is listed in MAILROOM_SENDERS, but only tamu.edu addresses may be sent as.'
    );
  });

  it('refuses an address outside tamu.edu, and anything that is not an address', async () => {
    await expect(service.resolve(admin, 'jadmin@gmail.com', 'gisday.tamu.edu')).rejects.toThrow(
      'Cannot send as jadmin@gmail.com: only tamu.edu addresses may be sent as.'
    );
    await expect(service.resolve(admin, 'not an address', 'gisday.tamu.edu')).rejects.toThrow(
      '"Send as" must be an email address.'
    );
    await expect(service.resolve(admin, ['jadmin@tamu.edu'], 'gisday.tamu.edu')).rejects.toThrow(BadRequestException);
  });

  it('does not offer, and refuses, an own address outside tamu.edu, saying why', async () => {
    const gmail = { sub: 'google-oauth2|1', email: 'jo.admin@gmail.com', name: 'Jo Admin' };
    const { choices, unavailable } = await service.choices(gmail, 'gisday.tamu.edu');

    expect(choices.map((c) => c.kind)).toEqual(['site', 'shared']);
    expect(unavailable).toEqual([
      { address: 'jo.admin@gmail.com', reason: 'Your address is not a tamu.edu address, so emails cannot be sent as it.' }
    ]);
    await expect(service.resolve(gmail, 'jo.admin@gmail.com', 'gisday.tamu.edu')).rejects.toThrow(BadRequestException);
  });

  it("reads the admin's address from their account when the token has no email claim, never from the request", async () => {
    management.getUserMetadata.mockResolvedValue({ user_info: { email: 'pat@tamu.edu', name: 'Pat Lee' } });

    await expect(service.resolve({ sub: 'auth0|pat' }, 'pat@tamu.edu', 'gisday.tamu.edu')).resolves.toEqual({
      from: '"Pat Lee (Texas A&M GIS Day)" <pat@tamu.edu>',
      replyTo: 'pat@tamu.edu'
    });
    expect(management.getUserMetadata).toHaveBeenCalledWith('auth0|pat', undefined, true);
  });

  it('offers no own address when there is none to read, and refuses one asked for', async () => {
    const { choices } = await service.choices({ sub: 'auth0|nobody' }, 'gisday.tamu.edu');

    expect(choices.map((c) => c.kind)).toEqual(['site', 'shared']);
    await expect(service.resolve({ sub: 'auth0|nobody' }, 'nobody@tamu.edu', 'gisday.tamu.edu')).rejects.toThrow(
      BadRequestException
    );
  });

  it('keeps a display name from breaking the From header', async () => {
    const quoted = { ...admin, 'https://gisday/name': 'Jo "The <Admin>" Smith' };

    await expect(service.resolve(quoted, 'jadmin@tamu.edu', 'gisday.tamu.edu')).resolves.toEqual({
      from: '"Jo The Admin Smith (Texas A&M GIS Day)" <JAdmin@tamu.edu>',
      replyTo: 'JAdmin@tamu.edu'
    });
  });
});
