import { existsSync, mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { BadRequestException, NotFoundException } from '@nestjs/common';

import { declaredJpeg } from '@tamu-gisc/common/node/images';
import { PROFILE_EDIT_LINK_PREVIEW, fillReviewEmail } from '@tamu-gisc/gisday/common';

import { SpeakerEditService, cleanFields, hashOf, linkEmail, senderAs } from './speaker-edit.service';
import { siteHost } from './speaker-edit.controller';

/**
 * Speakers editing their own profile (#2936). What must hold: a link reaches one speaker and nothing else, only by its
 * token; it stops working; a speaker can change only the bio, affiliation, link and photo; nothing changes until an admin
 * approves; and the request form answers the same for anyone.
 */
const TAMU = '0b6a8f2e-1c3d-4e5f-8a9b-0c1d2e3f4a5b';

describe('SpeakerEditService', () => {
  const ana = {
    guid: 'speaker-ana',
    firstName: 'Ana',
    lastName: 'Ruiz',
    email: 'ana@example.edu',
    description: 'Old bio',
    affiliation: 'TAMU',
    socialMedia: null,
    images: []
  };
  const ben = { guid: 'speaker-ben', firstName: 'Ben', lastName: 'Lee', email: '', description: 'Ben bio' };

  let appData: string;
  let previousAppData: string | undefined;
  let links: Array<{ speaker: { guid: string }; tokenHash: string; expires: Date; created: Date }>;
  let edits: Array<Record<string, unknown>>;
  let sent: Array<{ to: string; text: string; subject: string }>;
  let applied: Array<{ guid: string; fields: object; photo?: object }>;
  let service: SpeakerEditService;

  const linkRepo = {
    create: (x) => x,
    save: jest.fn(async (x) => {
      links.push({ ...x, created: new Date() });
      return x;
    }),
    findOne: jest.fn(async ({ where }) => {
      const l = links.find((x) => x.tokenHash === where.tokenHash);
      return l ? { ...l, speaker: { ...l.speaker } } : null;
    }),
    count: jest.fn(
      async ({ where }) =>
        links.filter((l) => l.speaker.guid === where.speaker.guid && l.created > where.created._value).length
    )
  };
  const editRepo = {
    create: (x) => ({ ...x }),
    save: jest.fn(async (x) => {
      edits.push({ ...x, created: new Date() });
      return x;
    }),
    find: jest.fn(async ({ where }) =>
      edits.filter((e) => (e.speaker as { guid: string }).guid === where.speaker?.guid && e.status === where.status)
    ),
    findOne: jest.fn(
      async ({ where }) =>
        edits.find(
          (e) =>
            (where.guid ? e.guid === where.guid : (e.speaker as { guid: string }).guid === where.speaker.guid) &&
            (!where.status || e.status === where.status)
        ) ?? null
    ),
    delete: jest.fn(async (guids: Array<string>) => {
      edits = edits.filter((e) => !guids.includes(e.guid as string));
    }),
    update: jest.fn(async (guid, changes) =>
      Object.assign(
        edits.find((e) => e.guid === guid),
        changes
      )
    )
  };
  const speakerRepo = {
    find: jest.fn(async ({ where }) =>
      where.guid ? [ana, ben].filter((s) => where.guid._value.includes(s.guid)) : [ana, ben]
    ),
    findOne: jest.fn(async ({ where }) => [ana, ben].find((s) => s.guid === where.guid))
  };

  /** The token from the link in the last email sent. */
  const tokenSent = () => /\/presenters\/edit\/([A-Za-z0-9_-]{43})/.exec(sent[sent.length - 1].text)[1];

  beforeEach(() => {
    previousAppData = process.env.APP_DATA;
    appData = mkdtempSync(join(tmpdir(), 'speaker-edits-'));
    process.env.APP_DATA = appData;
    links = [];
    edits = [];
    sent = [];
    applied = [];

    service = new SpeakerEditService(
      linkRepo as never,
      editRepo as never,
      speakerRepo as never,
      {
        findOne: jest.fn(async ({ where }) => (where.guid === TAMU ? { guid: TAMU, name: 'Texas A&M University' } : null))
      } as never,
      {
        applySelfEdit: async (guid: string, fields: object, photo?: object) => applied.push({ guid, fields, photo })
      } as never,
      { sendMessage: jest.fn(async (m) => sent.push(m)) } as never,
      { findOneActive: async () => ({ guid: 'season' }) } as never,
      {} as never
    );
  });

  afterEach(() => {
    rmSync(appData, { recursive: true, force: true });
    process.env.APP_DATA = previousAppData;
    jest.clearAllMocks();
  });

  it("emails each speaker their own link on the site's address, and skips one with no email", async () => {
    const result = await service.sendLinks(['speaker-ana', 'speaker-ben'], 'gisday.tamu.edu');

    expect(result).toEqual({
      sent: ['Ana Ruiz'],
      skipped: [{ name: 'Ben Lee', reason: 'no email address on their record' }]
    });
    expect(sent[0].to).toBe('ana@example.edu');
    expect(sent[0].text).toContain('https://gisday.tamu.edu/presenters/edit/');
  });

  // #2951. The first live link, sent from Texas A&M's site, came as TxGIS Day with a txgisday.org link.
  it("sends from Texas A&M's site as Texas A&M GIS Day, in the sender, subject, text and link", async () => {
    const previousFrom = process.env.MAILROOM_FROM;
    process.env.MAILROOM_FROM = 'TxGIS Day <gisday@example.edu>';

    await service.sendLinks(['speaker-ana'], 'gisday.tamu.edu');

    process.env.MAILROOM_FROM = previousFrom;
    expect(sent[0]).toEqual(
      expect.objectContaining({
        from: '"Texas A&M GIS Day" <gisday@example.edu>',
        subject: 'Update your Texas A&M GIS Day presenter profile'
      })
    );
    expect(sent[0].text).toContain('on Texas A&M GIS Day');
    expect(sent[0].text).toContain('https://gisday.tamu.edu/presenters/edit/');
  });

  /**
   * #3023: the email is shown and editable before it goes, as the acceptance emails are: one group, today's subject and
   * text as the default, and an example for the first speaker with a stand-in for the link, never a real one.
   */
  describe('the email, read and edited first (#3023)', () => {
    it("previews today's subject and text for those with an address, makes no link and sends nothing", async () => {
      const preview = await service.previewLinks(['speaker-ana', 'speaker-ben'], 'gisday.tamu.edu');

      expect(preview.groups.map((g) => [g.kind, g.label, g.count])).toEqual([['profile', 'Presenter profile emails', 1]]);
      // The subject is editable, so it comes with its placeholders, as the text does.
      expect(preview.groups[0].subject).toBe('Update your {site} presenter profile');
      expect(preview.groups[0].template).toContain('{edit link}');
      expect(preview.groups[0].example.to).toBe('ana@example.edu');
      expect(preview.groups[0].example.values['{first name}']).toBe('Ana');
      expect(preview.groups[0].example.values['{edit link}']).toBe(PROFILE_EDIT_LINK_PREVIEW);
      expect(JSON.stringify(preview)).not.toContain('/presenters/edit/');
      expect(links).toEqual([]);
      expect(sent).toEqual([]);
    });

    it("sends the subject and text as edited, with each speaker's own link filled in", async () => {
      await service.sendLinks(['speaker-ana'], 'gisday.tamu.edu', {
        subject: 'Your profile, {first name}',
        template: 'Hi {first name}, update it at {edit link} on {site}.'
      });

      expect(sent[0].subject).toBe('Your profile, Ana');
      expect(sent[0].text).toBe(
        `Hi Ana, update it at https://gisday.tamu.edu/presenters/edit/${tokenSent()} on Texas A&M GIS Day.`
      );
      expect(links).toHaveLength(1);
    });

    it("sends exactly the preview's text when it is left as it is, but with the real link", async () => {
      const [group] = (await service.previewLinks(['speaker-ana'], 'gisday.tamu.edu')).groups;

      await service.sendLinks(['speaker-ana'], 'gisday.tamu.edu', { subject: group.subject, template: group.template });

      const link = `https://gisday.tamu.edu/presenters/edit/${tokenSent()}`;

      expect(sent[0].text).toBe(fillReviewEmail(group.template, { ...group.example.values, '{edit link}': link }));
    });

    // #3065: the finalists' send reached the API twice, 30 seconds apart, and all 48 got it twice.
    it('emails no one twice when the same send arrives again within minutes, and says why it skipped them', async () => {
      const email = { subject: 'Profile', template: 'Hi {first name}: {edit link}' };

      await service.sendLinks(['speaker-ana'], 'gisday.tamu.edu', email);
      const again = await service.sendLinks(['speaker-ana'], 'gisday.tamu.edu', email);

      expect(sent).toHaveLength(1);
      expect(links).toHaveLength(1);
      expect(again.sent).toEqual([]);
      expect(again.skipped).toEqual([{ name: 'Ana Ruiz', reason: expect.stringContaining('already emailed') }]);
    });

    it('refuses a text without {edit link}, or with no subject, and makes no link and sends nothing', async () => {
      await expect(
        service.sendLinks(['speaker-ana'], 'gisday.tamu.edu', { subject: 'Profile', template: 'Hi {first name}.' })
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.sendLinks(['speaker-ana'], 'gisday.tamu.edu', { subject: ' ', template: 'Hi {edit link}' })
      ).rejects.toThrow(BadRequestException);
      expect(links).toEqual([]);
      expect(sent).toEqual([]);
    });
  });

  it('keeps only a hash of the token, never the token', async () => {
    await service.sendLinks(['speaker-ana']);

    expect(links[0].tokenHash).toBe(hashOf(tokenSent()));
    expect(JSON.stringify(links)).not.toContain(tokenSent());
  });

  it('opens the speaker the link belongs to, and refuses a wrong or expired token alike', async () => {
    await service.sendLinks(['speaker-ana']);
    const token = tokenSent();

    expect((await service.forLink(token)).firstName).toBe('Ana');
    await expect(service.forLink('x'.repeat(43))).rejects.toThrow(NotFoundException);
    await expect(service.forLink('not-a-token')).rejects.toThrow(NotFoundException);

    links[0].expires = new Date(Date.now() - 1000);
    await expect(service.forLink(token)).rejects.toThrow(/expired or is not valid/);
  });

  it('records a proposal for that speaker only, keeping the allowed fields and dropping the rest, and changes nothing yet', async () => {
    await service.sendLinks(['speaker-ana']);

    await service.propose(tokenSent(), {
      description: '  New bio  ',
      affiliation: 'Esri',
      ...({
        firstName: 'Mallory',
        email: 'attacker@example.com',
        isOrganizer: true,
        speaker: { guid: 'speaker-ben' }
      } as object)
    });

    expect(edits).toHaveLength(1);
    expect(edits[0]).toEqual(expect.objectContaining({ description: 'New bio', affiliation: 'Esri', status: 'pending' }));
    expect((edits[0].speaker as { guid: string }).guid).toBe('speaker-ana');
    expect(edits[0]).not.toHaveProperty('firstName');
    expect(edits[0]).not.toHaveProperty('email');
    expect(applied).toHaveLength(0);
  });

  it('refuses an SVG photo, and keeps an accepted one out of public view until approved', async () => {
    await service.sendLinks(['speaker-ana']);

    await expect(
      service.propose(tokenSent(), {}, {
        originalname: 'face.svg',
        buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>')
      } as never)
    ).rejects.toThrow(/JPEG or PNG/);

    await service.propose(tokenSent(), { description: 'Bio' }, {
      originalname: 'face.jpg',
      buffer: declaredJpeg(10, 10)
    } as never);
    const photoPath = edits[0].photoPath as string;

    expect(photoPath).toMatch(/^speaker-edits\//);
    expect(existsSync(join(appData, photoPath))).toBe(true);
  });

  // #2937. A speaker's own photo takes the same check as an admin's upload: a JPEG or PNG by its content, nothing else.
  it.each([
    ['an SVG renamed to .png', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>')],
    ['a GIF', Buffer.concat([Buffer.from('GIF89a', 'latin1'), Buffer.from([1, 0, 1, 0, 0, 0, 0, 0, 0, 0])])]
  ])('refuses %s as a proposed photo, and keeps nothing', async (_name, buffer) => {
    await service.sendLinks(['speaker-ana']);

    await expect(
      service.propose(tokenSent(), { description: 'Bio' }, { originalname: 'face.png', buffer } as never)
    ).rejects.toThrow(/JPEG or PNG/);
    expect(edits).toHaveLength(0);
  });

  // #2953. University and class year, which a presenter card shows, go through review like the rest.
  it('takes a university from the list and a class year, and refuses a university not in it', async () => {
    await service.sendLinks(['speaker-ana']);

    await expect(service.propose(tokenSent(), { university: '11111111-2222-4333-8444-555555555555' })).rejects.toThrow(
      /not in the list/
    );
    await expect(service.propose(tokenSent(), { university: 'Texas A&M' })).rejects.toThrow(/from the list/);

    await service.propose(tokenSent(), { graduationYear: ' 2018 ', university: TAMU });

    expect(edits[0]).toEqual(expect.objectContaining({ graduationYear: '2018', university: { guid: TAMU } }));
  });

  it('applies the university and class year on approval', async () => {
    await service.sendLinks(['speaker-ana']);
    await service.propose(tokenSent(), { graduationYear: '2018', university: TAMU });
    edits[0].speaker = ana;

    await service.approve(edits[0].guid as string, 'auth0|admin');

    expect(applied[0].fields).toEqual(expect.objectContaining({ graduationYear: '2018', university: { guid: TAMU } }));
  });

  it('replaces an earlier pending proposal rather than piling them up', async () => {
    await service.sendLinks(['speaker-ana']);
    await service.propose(tokenSent(), { description: 'First' });
    await service.propose(tokenSent(), { description: 'Second' });

    expect(edits.filter((e) => e.status === 'pending').map((e) => e.description)).toEqual(['Second']);
  });

  it('applies the proposal when an admin approves it, with the photo, and then removes the held photo', async () => {
    await service.sendLinks(['speaker-ana']);
    await service.propose(tokenSent(), { description: 'Approved bio' }, {
      originalname: 'face.jpg',
      buffer: declaredJpeg(10, 10)
    } as never);
    const edit = edits[0];
    edit.speaker = ana;
    const photoPath = edit.photoPath as string;

    await service.approve(edit.guid as string, 'auth0|admin');

    expect(applied).toEqual([
      expect.objectContaining({
        guid: 'speaker-ana',
        fields: expect.objectContaining({ description: 'Approved bio' }),
        photo: expect.objectContaining({ buffer: declaredJpeg(10, 10), originalname: 'photo' })
      })
    ]);
    expect(edit).toEqual(expect.objectContaining({ status: 'approved', reviewedBy: 'auth0|admin', photoPath: null }));
    expect(existsSync(join(appData, photoPath))).toBe(false);
  });

  it('changes nothing on the speaker when an admin rejects', async () => {
    await service.sendLinks(['speaker-ana']);
    await service.propose(tokenSent(), { description: 'Something offensive' });
    edits[0].speaker = ana;

    await service.reject(edits[0].guid as string, 'auth0|admin');

    expect(applied).toHaveLength(0);
    expect(edits[0].status).toBe('rejected');
  });

  it("answers a request for a link the same way for anyone, sending only to a speaker's own address, at most once in ten minutes", async () => {
    await service.requestLink('stranger@example.com');
    await service.requestLink('not an email');
    expect(sent).toHaveLength(0);

    await service.requestLink('ANA@example.edu ');
    await service.requestLink('ana@example.edu');
    expect(sent.map((m) => m.to)).toEqual(['ana@example.edu']);
  });
});

describe('cleanFields', () => {
  it('takes one web link, never javascript: or two at once', () => {
    expect(cleanFields({ socialMedia: 'https://linkedin.com/in/ana' })).toEqual({
      socialMedia: 'https://linkedin.com/in/ana'
    });
    expect(() => cleanFields({ socialMedia: 'javascript:alert(1)' })).toThrow(/http/);
    expect(() => cleanFields({ socialMedia: 'https://a.com https://b.com' })).toThrow(/one web address/);
  });

  it('refuses a bio longer than the limit, and anything that is not text', () => {
    expect(() => cleanFields({ description: 'x'.repeat(4001) })).toThrow(/most is 4000/);
    expect(() => cleanFields({ description: { $gt: '' } as never })).toThrow(/must be text/);
  });
});

describe('linkEmail', () => {
  it('names the speaker, the site, the link and the day it stops working, in Central time', () => {
    const text = linkEmail(
      { firstName: 'Ana' },
      'TxGIS Day',
      'https://txgisday.org/presenters/edit/abc',
      new Date('2026-11-21T15:00:00Z')
    );

    expect(text).toContain('Howdy Ana,');
    expect(text).toContain('https://txgisday.org/presenters/edit/abc');
    expect(text).toContain('Saturday, November 21');
    expect(text).toContain('reviews each change before it appears');
  });

  // #3045: the maintainer's text for the competition finalists is the one it starts from.
  it("starts from the maintainer's text for the finalists", () => {
    const text = linkEmail({ firstName: 'Ana' }, 'TxGIS Day', 'https://txgisday.org/presenters/edit/abc', new Date());

    expect(text).toContain('One of the best ways for you to get a full-time or internship position');
    expect(text).toContain('Without a bio or photo, you will not appear on the presenters page.');
    expect(text).toContain('- The Texas A&M GIS Day Team');
  });
});

describe('siteHost (#2951)', () => {
  it("is the page's own site from Origin, though the API is called at txgisday.org's address", () => {
    expect(siteHost({ origin: 'https://gisday.tamu.edu', host: 'txgisday.org' })).toBe('gisday.tamu.edu');
  });

  it('falls back to the forwarded host, then the host, without a port', () => {
    expect(siteHost({ 'x-forwarded-host': 'gisday.ucgis.org', host: 'gisday-nest:8080' })).toBe('gisday.ucgis.org');
    expect(siteHost({ host: 'txgisday.org:443' })).toBe('txgisday.org');
    expect(siteHost({})).toBeUndefined();
  });
});

describe('senderAs (#2951)', () => {
  it("keeps the configured address under the site's name, whether configured with a name or bare", () => {
    expect(senderAs('Texas A&M GIS Day', 'TxGIS Day <gisday@example.edu>')).toBe('"Texas A&M GIS Day" <gisday@example.edu>');
    expect(senderAs('UCGIS GIS Day', 'gisday@example.edu')).toBe('"UCGIS GIS Day" <gisday@example.edu>');
    expect(senderAs('TxGIS Day', undefined)).toBeUndefined();
  });
});

/**
 * #2958: "Send profile email" on Research Competitions. Each selected submission's people are matched to their season's
 * speaker records by email, ignoring case and spaces, and each speaker found gets their own link as the Speakers list
 * sends it. Anyone with no speaker record is returned by name, so the admin can add them, rather than silently skipped.
 */
describe('SpeakerEditService.sendLinksForSubmissions (#2958)', () => {
  const S2026 = 'season-2026';
  const S1 = '5a1d3c2e-0b4f-4c6a-9e8d-7f6a5b4c3d21';
  const S2 = '6b2e4d3f-1c5a-4d7b-8f9e-8a7b6c5d4e32';
  const S3 = '7c3f5e4a-2d6b-4e8c-9a0f-9b8c7d6e5f43';
  const S4 = '8d4a6f5b-3e7c-4f9d-8b1a-0c9d8e7f6a54';
  const speakers = [
    { guid: 'sp-ana', firstName: 'Ana', lastName: 'Ruiz', email: ' Ana.Ruiz@TAMU.edu ', season: { guid: S2026 } },
    { guid: 'sp-cy', firstName: 'Cy', lastName: 'Diaz', email: 'cy@tamu.edu', season: { guid: S2026 } },
    { guid: 'sp-eve', firstName: 'Eve', lastName: 'Kim', email: 'eve@tamu.edu', season: { guid: S2026 } },
    { guid: 'sp-fay', firstName: 'Fay', lastName: 'Ng', email: 'fay@tamu.edu', season: { guid: S2026 } },
    { guid: 'sp-gus', firstName: 'Gus', lastName: 'Oh', email: 'gus123@tamu.edu', season: { guid: S2026 } },
    // Last year's record is not this year's speaker.
    { guid: 'sp-ben-2025', firstName: 'Ben', lastName: 'Lee', email: 'ben@tamu.edu', season: { guid: 'season-2025' } }
  ];
  const submissions = [
    {
      guid: S1,
      title: 'Flood maps',
      season: { guid: S2026 },
      participants: [
        { name: 'Ana Ruiz', email: 'ana.ruiz@tamu.edu' },
        { name: 'Ben Lee', email: 'BEN@tamu.edu' }
      ]
    },
    {
      guid: S2,
      title: 'Campus trees',
      season: { guid: S2026 },
      participants: [
        { name: 'Cy Diaz', email: 'CY@tamu.edu' },
        { name: 'Ana Ruiz', email: 'ana.ruiz@tamu.edu' },
        { name: 'Dee Fox', email: '' }
      ]
    },
    // A participant with no name is named by their address.
    { guid: S3, title: 'Soil moisture', season: { guid: S2026 }, participants: [{ name: ' ', email: 'ben@tamu.edu' }] },
    // #3043: co-authors typed into one email box, and one entered by NetID, as add-competition-speakers.ps1 read them.
    {
      guid: S4,
      title: 'Heat islands',
      season: { guid: S2026 },
      participants: [
        { name: 'Eve Kim, Fay Ng', email: 'Eve@tamu.edu; fay@tamu.edu' },
        { name: 'Gus Oh', email: 'gus123' }
      ]
    }
  ];

  let sent: Array<{ to: string; text: string }>;
  let service: SpeakerEditService;
  const values = (condition) => condition?._value ?? [condition];

  beforeEach(() => {
    sent = [];
    service = new SpeakerEditService(
      // No link sent to anyone yet, so the repeat guard (#3065) lets each through.
      { create: (x) => x, save: jest.fn(async (x) => x), count: jest.fn(async () => 0) } as never,
      {} as never,
      {
        find: jest.fn(async ({ where }) =>
          speakers.filter((s) =>
            where.guid ? values(where.guid).includes(s.guid) : values(where.season.guid).includes(s.season.guid)
          )
        )
      } as never,
      {} as never,
      {} as never,
      { sendMessage: jest.fn(async (m) => sent.push(m)) } as never,
      { findOneActive: async () => ({ guid: S2026 }) } as never,
      { find: jest.fn(async ({ where }) => submissions.filter((s) => values(where.guid).includes(s.guid))) } as never
    );
  });

  it('emails each matched speaker once, ignoring case, and names everyone with no speaker record', async () => {
    const result = await service.sendLinksForSubmissions([S1, S2], 'gisday.tamu.edu');

    expect(result).toEqual({
      sent: ['Ana Ruiz', 'Cy Diaz'],
      skipped: [],
      unmatched: [
        { name: 'Ben Lee', submission: 'Flood maps' },
        { name: 'Dee Fox', submission: 'Campus trees' }
      ]
    });
    expect(sent.map((m) => m.to)).toEqual(['Ana.Ruiz@TAMU.edu', 'cy@tamu.edu']);
    expect(sent[0].text).toContain('https://gisday.tamu.edu/presenters/edit/');
  });

  it('sends nothing, and still names them, when no one has a speaker record', async () => {
    const result = await service.sendLinksForSubmissions([S3]);

    expect(result).toEqual({ sent: [], skipped: [], unmatched: [{ name: 'ben@tamu.edu', submission: 'Soil moisture' }] });
    expect(sent).toEqual([]);
  });

  // #3043: the finalists' co-authors are speakers, made from each address in a shared box and from a bare NetID.
  it('emails each co-author typed into one box, and one entered by NetID', async () => {
    const result = await service.sendLinksForSubmissions([S4], 'gisday.tamu.edu');

    expect(result).toEqual({ sent: ['Eve Kim', 'Fay Ng', 'Gus Oh'], skipped: [], unmatched: [] });
  });

  // #3046: who won't be emailed is known before sending, not only after.
  it('names, in the preview, everyone on the submissions with no speaker record', async () => {
    const preview = await service.previewLinksForSubmissions([S1, S2, S4], 'gisday.tamu.edu');

    expect(preview.groups[0].count).toBe(5);
    expect(preview.notEmailed).toEqual([
      { name: 'Ben Lee', submission: 'Flood maps' },
      { name: 'Dee Fox', submission: 'Campus trees' }
    ]);
  });

  it('refuses an empty list', async () => {
    await expect(service.sendLinksForSubmissions([])).rejects.toThrow(BadRequestException);
    expect(sent).toEqual([]);
  });

  it('previews the email for the matched speakers, each once, and sends it as edited (#3023)', async () => {
    const preview = await service.previewLinksForSubmissions([S1, S2], 'gisday.tamu.edu');

    expect(preview.groups.map((g) => [g.kind, g.count])).toEqual([['profile', 2]]);
    expect(sent).toEqual([]);

    await service.sendLinksForSubmissions([S1, S2], 'gisday.tamu.edu', {
      subject: 'Profile',
      template: 'Hi {first name}: {edit link}'
    });

    expect(sent.map((m) => m.text.split(':')[0])).toEqual(['Hi Ana', 'Hi Cy']);
  });
});
