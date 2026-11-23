import { BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';
import { fillReviewEmail } from '@tamu-gisc/gisday/common';

import { ContactService } from '../contact/contact.service';
import { Event, Submission, SubmissionType } from '../entities/all.entity';
import { DashboardProfilesService } from '../dashboards/dashboard-profiles.service';
import { AssetsService } from '../assets/assets.service';
import { SeasonService } from '../season/season.service';
import { UserSubmissionProvider, reviewEmail, reviewSubject } from './user-submission.provider';

describe('UserSubmissionProvider', () => {
  let provider: UserSubmissionProvider;
  let submissionRepo: Repository<Submission>;
  let seasonService: SeasonService;
  let contactService: ContactService;
  let profiles: DashboardProfilesService;

  const OWNER = 'acct-owner';

  /** The season's sessions as the program has them on 14 November 2026 (#2985). */
  const SESSIONS = [
    {
      guid: '7b433068-8171-4f42-8159-07332624c084',
      name: 'COMPETITION: Student Poster Competition',
      startTime: '16:15:00',
      endTime: '17:15:00',
      day: { date: new Date('2026-11-17T06:00:00Z') },
      location: { building: 'TAMU Memorial Student Center Bethancourt Ballroom', room: '2300 C' }
    },
    {
      guid: '62eeed6b-d8b4-4c60-9fa0-c4d4c70380d6',
      name: 'COMPETITION: Undergraduate Research Competition',
      startTime: '14:00:00',
      endTime: '14:40:00',
      day: { date: new Date('2026-11-17T06:00:00Z') },
      location: { building: 'TAMU Memorial Student Center Bethancourt Ballroom', room: '2300 C' }
    },
    {
      guid: '816c4a80-f28d-431b-95ad-e6dddca0245d',
      name: 'COMPETITION: Graduate Student Research',
      startTime: '14:40:00',
      endTime: '16:00:00',
      day: { date: new Date('2026-11-17T06:00:00Z') },
      location: { building: 'TAMU Memorial Student Center Bethancourt Ballroom', room: '2300 C' }
    },
    {
      guid: '9c73d7f1-3eeb-4294-97a8-5f0a3aea07c2',
      name: 'AWARDS: Student Presentation & Poster Competition Winner Announcements',
      startTime: '13:00:00',
      endTime: '13:15:00',
      day: { date: new Date('2026-11-19T06:00:00Z') },
      location: { building: 'TAMU Memorial Student Center Bethancourt Ballroom', room: '2300 A&B' }
    },
    {
      guid: 'a1def55f-e79e-4d69-b1b6-9520e6157a81',
      name: 'AWARDS: Student VGI Competition Winner Announcements',
      startTime: '13:00:00',
      endTime: '13:30:00',
      day: { date: new Date('2026-11-20T06:00:00Z') },
      location: { building: 'TAMU East Quad - Between OMB & Langford', room: null }
    }
  ];
  const REVIEWER_PERMS = ['update:competitions'];

  const submission = (over: Record<string, unknown> = {}) =>
    ({
      guid: 'sub-1',
      accountGuid: OWNER,
      title: 'A paper',
      reviewed: false,
      acceptance: false,
      participants: [{ email: 'owner@tamu.edu' }],
      ...over
    }) as unknown as Submission;

  /** What actually reached the database. */
  const written = () => (submissionRepo.update as jest.Mock).mock.calls[0][1];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserSubmissionProvider,
        {
          provide: getRepositoryToken(Submission),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn().mockResolvedValue({ affected: 1 }),
            delete: jest.fn().mockResolvedValue({ affected: 1 })
          }
        },
        { provide: getRepositoryToken(SubmissionType), useValue: { find: jest.fn() } },
        { provide: getRepositoryToken(Event), useValue: { find: jest.fn().mockResolvedValue(SESSIONS) } },
        { provide: SeasonService, useValue: { findOne: jest.fn(), findOneActive: jest.fn() } },
        { provide: ContactService, useValue: { sendMessage: jest.fn().mockResolvedValue({}) } },
        { provide: DashboardProfilesService, useValue: { profilesOf: jest.fn().mockResolvedValue(new Map()) } },
        { provide: AssetsService, useValue: { deleteAssetFiles: jest.fn().mockResolvedValue(undefined) } }
      ]
    }).compile();

    provider = module.get<UserSubmissionProvider>(UserSubmissionProvider);
    submissionRepo = module.get(getRepositoryToken(Submission));
    seasonService = module.get(SeasonService);
    contactService = module.get(ContactService);
    profiles = module.get(DashboardProfilesService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('.getPosters()', () => {
    const SEASON = { guid: 'season-2025', year: 2025 };
    const poster = (over: Record<string, unknown> = {}) =>
      submission({
        title: 'Flood maps',
        link: 'https://example.com/flood.pdf',
        abstract: 'About floods',
        submissionType: 'poster',
        reviewed: true,
        acceptance: true,
        message: 'Reviewer note',
        participants: [
          { name: 'A. Aggie', email: 'a.aggie@tamu.edu', studentId: '123001234' },
          { name: 'B. Bevo', email: 'b.bevo@tamu.edu', studentId: '123005678' }
        ],
        ...over
      });

    it('returns only the title, authors, link and year, never a contact detail', async () => {
      jest.spyOn(seasonService, 'findOne').mockResolvedValue(SEASON as never);
      jest.spyOn(submissionRepo, 'find').mockResolvedValue([poster()]);

      const posters = await provider.getPosters('season-2025');

      expect(posters).toEqual([
        { title: 'Flood maps', authors: ['A. Aggie', 'B. Bevo'], link: 'https://example.com/flood.pdf', year: 2025 }
      ]);

      const json = JSON.stringify(posters);

      for (const hidden of ['tamu.edu', '1230012', OWNER, 'sub-1', 'Reviewer note']) {
        expect(json).not.toContain(hidden);
      }
    });

    it('asks only for accepted posters of the season', async () => {
      jest.spyOn(seasonService, 'findOne').mockResolvedValue(SEASON as never);
      const find = jest.spyOn(submissionRepo, 'find').mockResolvedValue([]);

      await provider.getPosters('season-2025');

      expect(find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { season: { guid: 'season-2025' }, submissionType: 'poster', acceptance: true }
        })
      );
    });

    it('uses the active season when none is named', async () => {
      jest.spyOn(seasonService, 'findOneActive').mockResolvedValue(SEASON as never);
      const find = jest.spyOn(submissionRepo, 'find').mockResolvedValue([]);

      await provider.getPosters();

      expect(find).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ season: { guid: 'season-2025' } }) })
      );
    });

    it('returns none for a season that does not exist, or a site with no active season', async () => {
      jest.spyOn(seasonService, 'findOne').mockResolvedValue(null);
      jest.spyOn(seasonService, 'findOneActive').mockRejectedValue(new NotFoundException('No active season found.'));

      await expect(provider.getPosters('missing')).resolves.toEqual([]);
      await expect(provider.getPosters()).resolves.toEqual([]);
      expect(submissionRepo.find).not.toHaveBeenCalled();
    });

    it('lists a poster with no participants with no authors', async () => {
      jest.spyOn(seasonService, 'findOne').mockResolvedValue(SEASON as never);
      jest.spyOn(submissionRepo, 'find').mockResolvedValue([poster({ participants: null })]);

      await expect(provider.getPosters('season-2025')).resolves.toEqual([expect.objectContaining({ authors: [] })]);
    });
  });

  describe('.getUserPresentation()', () => {
    it('returns the submission to its owner', async () => {
      jest.spyOn(submissionRepo, 'findOne').mockResolvedValue(submission());

      await expect(provider.getUserPresentation('sub-1', OWNER)).resolves.toEqual(
        expect.objectContaining({ guid: 'sub-1' })
      );
    });

    it('refuses someone else', async () => {
      jest.spyOn(submissionRepo, 'findOne').mockResolvedValue(submission());

      await expect(provider.getUserPresentation('sub-1', 'acct-other')).rejects.toThrow(UnauthorizedException);
    });

    it('allows a reviewer holding read:competitions', async () => {
      jest.spyOn(submissionRepo, 'findOne').mockResolvedValue(submission());

      await expect(provider.getUserPresentation('sub-1', 'acct-reviewer', ['read:competitions'])).resolves.toEqual(
        expect.objectContaining({ guid: 'sub-1' })
      );
    });

    it('throws NotFound before any ownership check when the submission is missing', async () => {
      jest.spyOn(submissionRepo, 'findOne').mockResolvedValue(null);

      await expect(provider.getUserPresentation('missing', 'acct-other')).rejects.toThrow(NotFoundException);
    });
  });

  describe('.updateUserSubmission()', () => {
    it('refuses someone who neither owns it nor reviews', async () => {
      jest.spyOn(submissionRepo, 'findOne').mockResolvedValue(submission());

      await expect(provider.updateUserSubmission('sub-1', 'acct-other', { title: 'Hijacked' })).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('throws NotFound when the submission does not exist', async () => {
      jest.spyOn(submissionRepo, 'findOne').mockResolvedValue(null);

      await expect(provider.updateUserSubmission('missing', OWNER, {})).rejects.toThrow(NotFoundException);
    });

    it('lets the owner edit their own content', async () => {
      jest.spyOn(submissionRepo, 'findOne').mockResolvedValue(submission());

      await provider.updateUserSubmission('sub-1', OWNER, { title: 'Revised title' });

      expect(written()).toEqual(expect.objectContaining({ title: 'Revised title' }));
    });

    /**
     * Regression coverage for a privilege escalation.
     *
     * The intent is stated in the source: "Otherwise, remove them preemptively to avoid users
     * setting these." The stripping was written inside the `if (hasPermission)` branch and applied
     * to `existingSubmission` -- but the row is written from `submission`, the caller's payload,
     * and an entrant without the permission skipped the branch entirely.
     *
     * So a competition entrant could approve their own submission by including `acceptance` in the
     * PATCH body. `acceptance`, `reviewed` and `message` are real columns and the controller passes
     * `@Body()` through unfiltered.
     */
    it('does not let an entrant approve their own submission', async () => {
      jest.spyOn(submissionRepo, 'findOne').mockResolvedValue(submission());

      await provider.updateUserSubmission('sub-1', OWNER, {
        title: 'A paper',
        acceptance: true,
        reviewed: true,
        message: 'Looks great to me'
      } as Partial<Submission>);

      const payload = written();

      expect(payload.acceptance).toBeUndefined();
      expect(payload.reviewed).toBeUndefined();
      expect(payload.message).toBeUndefined();
      // Their own content still goes through.
      expect(payload.title).toBe('A paper');
    });

    it('does not let an entrant retarget the row by sending a guid', async () => {
      jest.spyOn(submissionRepo, 'findOne').mockResolvedValue(submission());

      await provider.updateUserSubmission('sub-1', OWNER, {
        guid: 'someone-elses',
        title: 'A paper'
      } as Partial<Submission>);

      expect(written().guid).toBeUndefined();
      expect((submissionRepo.update as jest.Mock).mock.calls[0][0]).toBe('sub-1');
    });

    it('lets a reviewer record an acceptance', async () => {
      jest.spyOn(submissionRepo, 'findOne').mockResolvedValue(submission());

      await provider.updateUserSubmission(
        'sub-1',
        'acct-reviewer',
        { acceptance: true, message: 'Accepted' } as Partial<Submission>,
        REVIEWER_PERMS
      );

      expect(submissionRepo.update).toHaveBeenCalled();
    });

    it('emails the entrant when a reviewer records a decision', async () => {
      jest
        .spyOn(submissionRepo, 'findOne')
        .mockResolvedValue(submission({ participants: [{ email: 'owner@tamu.edu' }, { email: 'coauthor@tamu.edu' }] }));

      await provider.updateUserSubmission(
        'sub-1',
        'acct-reviewer',
        { acceptance: true } as Partial<Submission>,
        REVIEWER_PERMS
      );

      // The first participant is the addressee; the rest are copied.
      expect(contactService.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'owner@tamu.edu', cc: 'coauthor@tamu.edu' }),
        true
      );
    });

    // #3114: on gisday.tamu.edu the review emails wear the Texas A&M GIS Day design, with the season's dates; txgisday.org's
    // stay plain. The plain text goes beside it either way.
    it("sends Texas A&M's entrants the designed email, with the season's dates, and txgisday.org's the plain one", async () => {
      const review = async (host: string) => {
        (contactService.sendMessage as jest.Mock).mockClear();
        jest.spyOn(submissionRepo, 'findOne').mockResolvedValue(
          submission({
            title: 'Mapping Floods',
            submissionType: 'poster',
            participants: [{ name: 'Ana Ruiz', email: 'ana@tamu.edu' }],
            season: {
              guid: 'season-2026',
              days: [{ date: '2026-11-16T06:00:00.000Z' }, { date: '2026-11-20T06:00:00.000Z' }]
            }
          })
        );
        await provider.updateUserSubmission(
          'sub-1',
          'acct-reviewer',
          { acceptance: true } as Partial<Submission>,
          REVIEWER_PERMS,
          host
        );

        return (contactService.sendMessage as jest.Mock).mock.calls[0][0];
      };

      const tamu = await review('gisday.tamu.edu');

      expect(tamu.html).toContain('GIS DAY(S)');
      expect(tamu.html).toContain('November 16–20, 2026');
      expect(tamu.html).toContain('<p>Howdy Ana,');
      expect(tamu.text).toContain('Howdy Ana,');

      expect((await review('txgisday.org')).html).not.toContain('GIS DAY(S)');
    });

    // #2957. The finalist email named TxGIS Day on every site and asked for a link rather than the attached files.
    it("sends a finalist on Texas A&M's site the next steps under that site's name and address", async () => {
      const previousFrom = process.env.MAILROOM_FROM;
      process.env.MAILROOM_FROM = 'TxGIS Day <gisday@example.edu>';
      jest.spyOn(submissionRepo, 'findOne').mockResolvedValue(
        submission({
          title: 'Mapping Floods',
          submissionType: 'poster',
          participants: [{ name: 'Ana Ruiz', email: 'ana@tamu.edu' }]
        })
      );

      await provider.updateUserSubmission(
        'sub-1',
        'acct-reviewer',
        { acceptance: true, message: 'Booth 4.' } as Partial<Submission>,
        REVIEWER_PERMS,
        'gisday.tamu.edu'
      );

      process.env.MAILROOM_FROM = previousFrom;
      const [email] = (contactService.sendMessage as jest.Mock).mock.calls[0];

      expect(email.from).toBe('"Texas A&M GIS Day" <gisday@example.edu>');
      expect(email.subject).toBe('Your Texas A&M GIS Day submission has been accepted');
      expect(email.text).toContain('Howdy Ana,');
      expect(email.text).toContain(
        'Your poster, "Mapping Floods", has been accepted as a finalist in the Texas A&M GIS Day poster competition.'
      );
      expect(email.text).toContain(
        '1. Upload your final poster by the deadline shown on your submission. Sign in at https://gisday.tamu.edu/account/submissions'
      );
      expect(email.text).toContain('under Presentation files');
      expect(email.text).toContain('5. Complete your presenter profile.');
      expect(email.text).toContain('https://gisday.tamu.edu/sessions');
      // #3044: the same email as HTML, from its Markdown, beside the plain text.
      expect(email.html).toContain('<p>Howdy Ana,');
      expect(email.text).toContain('Additional notes: Booth 4.');
      expect(email.text).not.toMatch(/TxGIS|txgisday|provide a link/);
    });

    describe('the poster finalist email (#2980)', () => {
      const tamu = { name: 'Texas A&M GIS Day', address: 'https://gisday.tamu.edu' };
      const season = { posterFilesCloseAt: new Date('2026-11-16T18:00:00Z') };
      const poster = (more: Record<string, unknown> = {}) =>
        reviewEmail(
          {
            title: 'Mapping Floods',
            acceptance: true,
            submissionType: 'poster',
            participants: [{ name: 'Ana Ruiz', email: 'ana@tamu.edu' }],
            season,
            ...more
          } as unknown as Submission,
          tamu
        );

      it('asks for the final poster by the poster files deadline, in Central time', () => {
        expect(poster()).toContain('1. Upload your final poster by Mon, Nov 16, 2026, 12:00 PM Central.');
      });

      it('says to print it at 36 x 48 inches or smaller and bring it', () => {
        expect(poster()).toContain('36 x 48 inches or smaller');
        expect(poster()).toContain('bring it with you');
      });

      it('asks them to set up as early in the day as they can, as judges walk the posters all day', () => {
        expect(poster()).toContain('as early in the day as you can');
        expect(poster()).toContain('judges');
      });

      it('says one member of the team must be at the poster to win', () => {
        expect(poster()).toContain('at least one member of your team, must be at your poster during the competition');
      });

      it('names where winners are announced, and keeps the profile and the session', () => {
        expect(poster()).toContain('Winners are announced at');
        expect(poster()).toContain('Complete your presenter profile.');
        expect(poster()).toContain('https://gisday.tamu.edu/sessions');
      });

      it('points to the submission page for the deadline when the season has none', () => {
        expect(poster({ season: {} })).toContain('1. Upload your final poster by the deadline shown on your submission.');
      });
    });

    it('gives a presenter the presentation files deadline', () => {
      const tamu = { name: 'Texas A&M GIS Day', address: 'https://gisday.tamu.edu' };
      const email = reviewEmail(
        {
          title: 'T',
          acceptance: true,
          submissionType: 'presentation',
          season: { presentationFilesCloseAt: new Date('2026-11-16T18:00:00Z') }
        } as unknown as Submission,
        tamu
      );

      expect(email).toContain('1. Submit your final presentation by Mon, Nov 16, 2026, 12:00 PM Central.');
      expect(email).not.toContain('judges');
    });

    describe("links to the finalist's own session and the awards session (#2985)", () => {
      const tamu = { name: 'Texas A&M GIS Day', address: 'https://gisday.tamu.edu' };
      const email = (more: Record<string, unknown>) =>
        reviewEmail({ title: 'T', acceptance: true, ...more } as unknown as Submission, tamu, undefined, SESSIONS);

      it('gives a poster finalist the poster session, with day, time, place and link', () => {
        expect(email({ submissionType: 'poster' })).toContain(
          'Your session: COMPETITION: Student Poster Competition, Tue, Nov 17, 4:15 to 5:15 PM, TAMU Memorial Student Center Bethancourt Ballroom 2300 C: https://gisday.tamu.edu/sessions/details/7b433068-8171-4f42-8159-07332624c084'
        );
      });

      it("gives a presenter their own level's session", () => {
        expect(email({ submissionType: 'presentation', classificationType: 'undergraduate' })).toContain(
          'COMPETITION: Undergraduate Research Competition, Tue, Nov 17, 2:00 to 2:40 PM'
        );
        expect(email({ submissionType: 'presentation', classificationType: 'graduate' })).toContain(
          'COMPETITION: Graduate Student Research, Tue, Nov 17, 2:40 to 4:00 PM'
        );
      });

      it('gives both the poster and presentation awards session, not the VGI one', () => {
        for (const submissionType of ['poster', 'presentation']) {
          const text = email({ submissionType, classificationType: 'graduate' });

          expect(text).toContain(
            'Winners are announced at AWARDS: Student Presentation & Poster Competition Winner Announcements, Thu, Nov 19, 1:00 to 1:15 PM, TAMU Memorial Student Center Bethancourt Ballroom 2300 A&B: https://gisday.tamu.edu/sessions/details/9c73d7f1-3eeb-4294-97a8-5f0a3aea07c2.'
          );
          expect(text).not.toContain('VGI');
        }
      });

      it('points to the sessions page when the season has no such sessions', () => {
        const text = reviewEmail({ title: 'T', acceptance: true, submissionType: 'poster' } as Submission, tamu);

        expect(text).toContain('Your session: see https://gisday.tamu.edu/sessions');
        expect(text).toContain('Winners are announced at the awards session; see https://gisday.tamu.edu/sessions.');
      });

      it('sends the links in the email itself, from the season of the submission', async () => {
        jest.spyOn(submissionRepo, 'findOne').mockResolvedValue(
          submission({
            submissionType: 'poster',
            season: { guid: 'season-2026' },
            participants: [{ email: 'a@tamu.edu' }]
          })
        );

        await provider.updateUserSubmission('sub-1', 'r', { acceptance: true }, REVIEWER_PERMS, 'gisday.tamu.edu');
        // A single review sends without waiting, after reading the season's sessions.
        await new Promise((resolve) => setImmediate(resolve));

        const [sent] = (contactService.sendMessage as jest.Mock).mock.calls[0];

        expect(sent.text).toContain('sessions/details/7b433068-8171-4f42-8159-07332624c084');
        expect(sent.text).toContain('sessions/details/9c73d7f1-3eeb-4294-97a8-5f0a3aea07c2');
      });
    });

    describe('the presentation finalist email (#2983)', () => {
      const tamu = { name: 'Texas A&M GIS Day', address: 'https://gisday.tamu.edu' };
      const email = () => reviewEmail({ title: 'T', acceptance: true, submissionType: 'presentation' } as Submission, tamu);

      it('asks them to be there at their session time', () => {
        expect(email()).toContain("2. Be there at your session's time. Your session: see https://gisday.tamu.edu/sessions");
      });

      it('gives the minutes, presentation plus questions, and says they will be cut off', () => {
        expect(email()).toContain('5 minutes in all, questions included: about 4 minutes to present and 1 for questions');
        expect(email()).toContain('You will be cut off when your time is up.');
      });

      it('gives the one-slide-per-minute rule', () => {
        expect(email()).toContain('Plan on one slide per minute.');
      });
    });

    it("tells a presenter to attach their slides, and keeps a rejection's wording under the site's name", () => {
      const tamu = { name: 'Texas A&M GIS Day', address: 'https://gisday.tamu.edu' };

      expect(reviewEmail({ title: 'T', acceptance: true, submissionType: 'presentation' } as Submission, tamu)).toContain(
        '1. Submit your final presentation by the deadline shown on your submission.'
      );

      const rejected = reviewEmail({ title: 'T', acceptance: false } as Submission, tamu);

      expect(rejected).toContain('has not been accepted for the Texas A&M GIS Day competition');
      expect(rejected).toContain('The Texas A&M GIS Day Team');
      expect(reviewSubject({ acceptance: false } as Submission, tamu)).toBe('Your Texas A&M GIS Day submission');
    });

    it('does not email when the owner merely edits their own content', async () => {
      jest.spyOn(submissionRepo, 'findOne').mockResolvedValue(submission());

      await provider.updateUserSubmission('sub-1', OWNER, { title: 'Revised' });

      expect(contactService.sendMessage).not.toHaveBeenCalled();
    });

    it('still records the decision when the notification email fails', async () => {
      jest.spyOn(submissionRepo, 'findOne').mockResolvedValue(submission());
      jest.spyOn(contactService, 'sendMessage').mockRejectedValue(new Error('mailroom unreachable'));

      // A reviewer's decision must not be lost because the mail server was down.
      await expect(
        provider.updateUserSubmission('sub-1', 'acct-reviewer', { acceptance: true } as Partial<Submission>, REVIEWER_PERMS)
      ).resolves.toEqual(expect.objectContaining({ affected: 1 }));
    });
  });

  /**
   * #2990: the review email goes to the submitter's own account address. The typed one had been a test address, or one
   * no directory knew, and the email went there.
   */
  describe('who the review email goes to', () => {
    const sent = async (participants: Array<{ name: string; email: string }>, accountEmail: string | null) => {
      (profiles.profilesOf as jest.Mock).mockResolvedValue(
        new Map([[OWNER, accountEmail ? ({ email: accountEmail } as never) : null]])
      );
      jest.spyOn(submissionRepo, 'findOne').mockResolvedValue(submission({ participants, title: 'T' }));

      await provider.updateUserSubmission('sub-1', 'r', { acceptance: true }, REVIEWER_PERMS, 'gisday.tamu.edu');
      await new Promise((resolve) => setImmediate(resolve));

      return (contactService.sendMessage as jest.Mock).mock.calls[0][0];
    };

    it("goes to the account's address, not the address the submitter typed for themselves", async () => {
      const email = await sent([{ name: 'Dan', email: 'dan@test.com' }], 'daniel@tamu.edu');

      expect(email.to).toBe('daniel@tamu.edu');
      expect(email.cc).toBe('');
    });

    it('copies the other members of a group, each once', async () => {
      const email = await sent(
        [
          { name: 'Ana', email: 'ana@agnet.tamu.edu' },
          { name: 'Ben', email: 'ben@tamu.edu' },
          { name: 'Ben', email: 'BEN@tamu.edu' },
          { name: 'Ana', email: 'ana@tamu.edu' }
        ],
        'ana@tamu.edu'
      );

      expect(email.to).toBe('ana@tamu.edu');
      expect(email.cc).toBe('ben@tamu.edu');
    });

    it('goes to the typed address when the account has none', async () => {
      const email = await sent(
        [
          { name: 'Ana', email: 'ana@tamu.edu' },
          { name: 'Ben', email: 'ben@tamu.edu' }
        ],
        null
      );

      expect(email.to).toBe('ana@tamu.edu');
      expect(email.cc).toBe('ben@tamu.edu');
    });
  });

  /**
   * #2958: an admin approves or rejects the selected submissions at once. Each is reviewed exactly as Submit Review
   * reviews one - the decision recorded, the submitter emailed from the reviewer's site - and the result says which were
   * done and which failed, by title.
   */
  describe('.reviewUserSubmissions()', () => {
    const A = '0f8c9a52-1b2c-4d3e-8f4a-5b6c7d8e9f01';
    const B = '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
    const MISSING = '9e8d7c6b-5a4f-4e3d-8c2b-1a0f9e8d7c6b';
    const rows: Record<string, Submission> = {
      [A]: submission({
        guid: A,
        title: 'Flood maps',
        submissionType: 'poster',
        participants: [
          { name: 'Ana Ruiz', email: 'ana@tamu.edu' },
          { name: 'Ben Lee', email: 'ben@tamu.edu' }
        ]
      }),
      [B]: submission({
        guid: B,
        title: 'Campus trees',
        submissionType: 'presentation',
        participants: [{ name: 'Cy Diaz', email: 'cy@tamu.edu' }]
      })
    };
    const decide = (over: Record<string, unknown>) => ({ acceptance: true, message: 'Booth 4.', ...over });
    const sends = () => (contactService.sendMessage as jest.Mock).mock.calls;

    beforeEach(() => {
      jest
        .spyOn(submissionRepo, 'findOne')
        .mockImplementation((async ({ where }: { where: { guid: string } }) =>
          rows[where.guid] ? { ...rows[where.guid], participants: [...rows[where.guid].participants] } : null) as never);
    });

    // #3067: a bulk send reached the API twice, 30 seconds apart (#3065). The same decision again within minutes is that
    // repeat, and emails no one a second time; a decision changed, or made long ago, emails as before.
    it('emails no one again when the same decision repeats within minutes', async () => {
      rows[A] = { ...rows[A], reviewed: true, acceptance: true, updated: new Date() } as Submission;
      rows[B] = { ...rows[B], reviewed: true, acceptance: false, updated: new Date() } as Submission;

      try {
        const result = await provider.reviewUserSubmissions([A, B], 'acct-reviewer', { acceptance: true }, REVIEWER_PERMS);

        expect(result).toEqual({ reviewed: ['Flood maps', 'Campus trees'], failed: [] });
        // A was already accepted moments ago: no second email. B's decision changed: its email goes.
        expect(sends().map(([m]) => m.to)).toEqual(['cy@tamu.edu']);
      } finally {
        delete (rows[A] as Partial<Submission>).reviewed;
        delete (rows[B] as Partial<Submission>).reviewed;
      }
    });

    it("reviews and emails each one exactly as a single review does, from the reviewer's site", async () => {
      await provider.updateUserSubmission(
        A,
        'acct-reviewer',
        decide({}) as Partial<Submission>,
        REVIEWER_PERMS,
        'gisday.tamu.edu'
      );
      const single = { written: written(), email: sends()[0] };

      (submissionRepo.update as jest.Mock).mockClear();
      (contactService.sendMessage as jest.Mock).mockClear();

      const result = await provider.reviewUserSubmissions(
        [A, B],
        'acct-reviewer',
        { acceptance: true, message: 'Booth 4.' },
        REVIEWER_PERMS,
        'gisday.tamu.edu'
      );

      expect(result).toEqual({ reviewed: ['Flood maps', 'Campus trees'], failed: [] });
      expect((submissionRepo.update as jest.Mock).mock.calls.map((c) => c[0])).toEqual([A, B]);
      expect(written()).toEqual(single.written);
      expect(sends()[0]).toEqual(single.email);

      const [second] = sends()[1];

      expect(second.to).toBe('cy@tamu.edu');
      expect(second.subject).toBe('Your Texas A&M GIS Day submission has been accepted');
      expect(second.text).toContain(
        'has been accepted as a finalist in the Texas A&M GIS Day research presentation competition'
      );
    });

    it('records and emails a rejection with the rejection wording', async () => {
      const result = await provider.reviewUserSubmissions(
        [B],
        'acct-reviewer',
        { acceptance: false },
        REVIEWER_PERMS,
        'gisday.tamu.edu'
      );

      expect(result.reviewed).toEqual(['Campus trees']);
      expect(written()).toEqual(expect.objectContaining({ acceptance: false, reviewed: true }));

      const [email] = sends()[0];

      expect(email.subject).toBe('Your Texas A&M GIS Day submission');
      expect(email.text).toContain('has not been accepted for the Texas A&M GIS Day competition');
    });

    it('refuses anyone without update:competitions, even for their own submissions, and writes nothing', async () => {
      await expect(provider.reviewUserSubmissions([A], OWNER, { acceptance: true }, [])).rejects.toThrow(ForbiddenException);
      expect(submissionRepo.update).not.toHaveBeenCalled();
      expect(contactService.sendMessage).not.toHaveBeenCalled();
    });

    it('refuses an empty list, a missing decision, or an id that is not a submission id', async () => {
      await expect(provider.reviewUserSubmissions([], 'r', { acceptance: true }, REVIEWER_PERMS)).rejects.toThrow(
        BadRequestException
      );
      await expect(provider.reviewUserSubmissions([A], 'r', {} as never, REVIEWER_PERMS)).rejects.toThrow(
        BadRequestException
      );
      await expect(provider.reviewUserSubmissions(['1; drop'], 'r', { acceptance: true }, REVIEWER_PERMS)).rejects.toThrow(
        BadRequestException
      );
      expect(submissionRepo.update).not.toHaveBeenCalled();
    });

    it('carries on past one that fails, and names it', async () => {
      const result = await provider.reviewUserSubmissions(
        [MISSING, A],
        'acct-reviewer',
        { acceptance: true },
        REVIEWER_PERMS
      );

      expect(result).toEqual({ reviewed: ['Flood maps'], failed: [{ title: MISSING, reason: 'it no longer exists' }] });
    });

    it('counts one whose email failed as reviewed, and lists it as not emailed', async () => {
      (contactService.sendMessage as jest.Mock).mockRejectedValueOnce(new Error('mailroom unreachable'));

      const result = await provider.reviewUserSubmissions([A, B], 'acct-reviewer', { acceptance: true }, REVIEWER_PERMS);

      expect(result).toEqual({
        reviewed: ['Flood maps', 'Campus trees'],
        failed: [{ title: 'Flood maps', reason: 'reviewed, but the email could not be sent' }]
      });
    });

    // #3100: each submitter's email goes as the sender the reviewer chose, as the controller checked it.
    it('emails each as the sender chosen, with replies to it', async () => {
      const sender = { from: '"Jo Admin (Texas A&M GIS Day)" <jadmin@tamu.edu>', replyTo: 'jadmin@tamu.edu' };

      await provider.reviewUserSubmissions([A, B], 'acct-reviewer', { acceptance: true, sender }, REVIEWER_PERMS);

      expect(sends()).toHaveLength(2);
      expect(sends().map(([m]) => [m.from, m.replyTo])).toEqual([
        [sender.from, sender.replyTo],
        [sender.from, sender.replyTo]
      ]);
    });

    it('reviews a submission named twice once', async () => {
      await provider.reviewUserSubmissions([A, A], 'acct-reviewer', { acceptance: true }, REVIEWER_PERMS);

      expect(submissionRepo.update).toHaveBeenCalledTimes(1);
    });

    describe('the email the reviewer sees and edits first (#2981)', () => {
      it('previews one group per kind of email, records nothing and sends nothing', async () => {
        const preview = await provider.previewReview([A, B], { acceptance: true }, REVIEWER_PERMS, 'gisday.tamu.edu');

        expect(preview.groups.map((g) => [g.kind, g.label, g.count])).toEqual([
          ['poster', 'Accepted posters', 1],
          ['presentation', 'Accepted presentations', 1]
        ]);
        expect(preview.groups[0].subject).toBe('Your Texas A&M GIS Day submission has been accepted');
        expect(preview.groups[0].template).toContain('Howdy {first name},');
        expect(preview.groups[0].example).toEqual(
          expect.objectContaining({ title: 'Flood maps', to: 'ana@tamu.edu', cc: 'ben@tamu.edu' })
        );
        expect(submissionRepo.update).not.toHaveBeenCalled();
        expect(contactService.sendMessage).not.toHaveBeenCalled();
      });

      it('previews exactly the email that is then sent when the text is left as it is', async () => {
        const preview = await provider.previewReview([A], { acceptance: true }, REVIEWER_PERMS, 'gisday.tamu.edu');
        const [group] = preview.groups;

        await provider.reviewUserSubmissions(
          [A],
          'acct-reviewer',
          { acceptance: true, templates: { poster: group.template } },
          REVIEWER_PERMS,
          'gisday.tamu.edu'
        );

        expect(sends()[0][0].text).toBe(fillReviewEmail(group.template, group.example.values));
      });

      it("sends the text as edited, filled in for each submission's own people and title", async () => {
        await provider.reviewUserSubmissions(
          [A, B],
          'acct-reviewer',
          {
            acceptance: true,
            templates: { poster: 'Howdy {first name}: "{title}" is in. Edited.', presentation: 'Talk: {title}' }
          },
          REVIEWER_PERMS,
          'gisday.tamu.edu'
        );

        expect(sends().map(([email]) => email.text)).toEqual([
          'Howdy Ana: "Flood maps" is in. Edited.',
          'Talk: Campus trees'
        ]);
      });

      it('previews a rejection as one group, whatever the kinds', async () => {
        const preview = await provider.previewReview([A, B], { acceptance: false }, REVIEWER_PERMS, 'gisday.tamu.edu');

        expect(preview.groups.map((g) => [g.kind, g.count])).toEqual([['rejection', 2]]);
      });

      it('refuses a preview to anyone without update:competitions', async () => {
        await expect(provider.previewReview([A], { acceptance: true }, [])).rejects.toThrow(ForbiddenException);
      });

      it('refuses email text that is empty or not text, and records nothing', async () => {
        for (const templates of [{ poster: '   ' }, { poster: 42 }, 'text']) {
          await expect(
            provider.reviewUserSubmissions([A], 'r', { acceptance: true, templates } as never, REVIEWER_PERMS)
          ).rejects.toThrow(BadRequestException);
        }

        expect(submissionRepo.update).not.toHaveBeenCalled();
      });
    });
  });

  /**
   * #3017: the final reminder to finalists who have not uploaded their final presentation or poster, by the review email's
   * own path: previewed and edited first, one kind per competition, sent to the same people. A submission that already
   * has a file, or that was not accepted (rejected, or not yet reviewed), is skipped, and said to be, with why.
   */
  describe('the final reminder (#3017)', () => {
    const A = '0f8c9a52-1b2c-4d3e-8f4a-5b6c7d8e9f01';
    const B = '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
    const C = '2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e';
    const REJECTED = '3c4d5e6f-7a8b-4c9d-8e0f-2a3b4c5d6e7f';
    const UNREVIEWED = '4d5e6f7a-8b9c-4d0e-9f1a-3b4c5d6e7f8a';
    const accepted = { reviewed: true, acceptance: true };
    const rows: Record<string, Submission> = {
      [A]: submission({
        guid: A,
        title: 'Flood maps',
        submissionType: 'poster',
        participants: [
          { name: 'Ana Ruiz', email: 'ana@tamu.edu' },
          { name: 'Ben Lee', email: 'ben@tamu.edu' }
        ],
        files: [],
        ...accepted
      }),
      [B]: submission({
        guid: B,
        title: 'Campus trees',
        submissionType: 'presentation',
        participants: [{ name: 'Cy Diaz', email: 'cy@tamu.edu' }],
        files: [{ guid: 'f-1', name: 'slides.pptx' }],
        ...accepted
      }),
      [C]: submission({
        guid: C,
        title: 'Bike lanes',
        submissionType: 'presentation',
        participants: [{ name: 'Di Park', email: 'di@tamu.edu' }],
        ...accepted
      }),
      [REJECTED]: submission({
        guid: REJECTED,
        title: 'Old roads',
        submissionType: 'poster',
        participants: [{ name: 'Ed Wu', email: 'ed@tamu.edu' }],
        reviewed: true,
        acceptance: false
      }),
      [UNREVIEWED]: submission({
        guid: UNREVIEWED,
        title: 'Rivers',
        submissionType: 'presentation',
        participants: [{ name: 'Fay Ng', email: 'fay@tamu.edu' }]
      })
    };
    const HAS_FILE = { title: 'Campus trees', reason: 'already has a file' };
    const sends = () => (contactService.sendMessage as jest.Mock).mock.calls;

    beforeEach(() => {
      jest
        .spyOn(submissionRepo, 'findOne')
        .mockImplementation((async ({ where }: { where: { guid: string } }) =>
          rows[where.guid] ? { ...rows[where.guid], participants: [...rows[where.guid].participants] } : null) as never);
    });

    it('previews one group per competition, skipping and naming any that already has a file, and sends nothing', async () => {
      const preview = await provider.previewReminders([A, B, C], REVIEWER_PERMS, 'gisday.tamu.edu');

      expect(preview.groups.map((g) => [g.kind, g.label, g.count])).toEqual([
        ['poster-reminder', 'Final reminders: posters', 1],
        ['presentation-reminder', 'Final reminders: presentations', 1]
      ]);
      expect(preview.groups[1].subject).toBe('Final reminder: upload your final presentation for Texas A&M GIS Day');
      expect(preview.groups[0].subject).toBe('Final reminder: upload your final poster for Texas A&M GIS Day');
      expect(preview.groups[1].template).toContain('This is your final reminder.');
      expect(preview.groups[1].template).toContain('your submission will be removed from the competition');
      expect(preview.groups[0].example).toEqual(
        expect.objectContaining({ title: 'Flood maps', to: 'ana@tamu.edu', cc: 'ben@tamu.edu' })
      );
      expect(preview.skipped).toEqual([HAS_FILE]);
      expect(contactService.sendMessage).not.toHaveBeenCalled();
      expect(submissionRepo.update).not.toHaveBeenCalled();
    });

    it('sends the text as edited to each without a file, skips the one with a file, and records nothing', async () => {
      const result = await provider.remindUserSubmissions(
        [A, B, C],
        { templates: { 'presentation-reminder': 'Hi {first name}, "{title}" needs its slides by {upload deadline}.' } },
        REVIEWER_PERMS,
        'gisday.tamu.edu'
      );

      expect(result).toEqual({ sent: ['Flood maps', 'Bike lanes'], skipped: [HAS_FILE], failed: [] });
      expect(sends().map(([m]) => [m.to, m.subject])).toEqual([
        ['ana@tamu.edu', 'Final reminder: upload your final poster for Texas A&M GIS Day'],
        ['di@tamu.edu', 'Final reminder: upload your final presentation for Texas A&M GIS Day']
      ]);
      expect(sends()[0][0].cc).toBe('ben@tamu.edu');
      expect(sends()[0][0].text).toContain('This is your final reminder.');
      expect(sends()[1][0].text).toMatch(/^Hi Di, "Bike lanes" needs its slides by /);
      expect(submissionRepo.update).not.toHaveBeenCalled();
      // Its files are asked for: a submission is not loaded with them otherwise.
      expect(submissionRepo.findOne).toHaveBeenCalledWith(
        // With its season's days, for the email's design on Texas A&M's site (#3114).
        expect.objectContaining({ relations: { season: { days: true }, files: true } })
      );
    });

    // #3100: as the sender the reviewer chose, as the controller checked it.
    it('sends each reminder as the sender chosen, with replies to it', async () => {
      const sender = { from: '"Jo Admin (Texas A&M GIS Day)" <jadmin@tamu.edu>', replyTo: 'jadmin@tamu.edu' };

      await provider.remindUserSubmissions([A, B, C], { sender }, REVIEWER_PERMS, 'gisday.tamu.edu');

      expect(sends()).toHaveLength(2);
      expect(sends().map(([m]) => [m.from, m.replyTo])).toEqual([
        [sender.from, sender.replyTo],
        [sender.from, sender.replyTo]
      ]);
    });

    it('previews exactly the email that is then sent when the text is left as it is', async () => {
      const preview = await provider.previewReminders([C], REVIEWER_PERMS, 'gisday.tamu.edu');
      const [group] = preview.groups;

      await provider.remindUserSubmissions(
        [C],
        { templates: { [group.kind]: group.template } },
        REVIEWER_PERMS,
        'gisday.tamu.edu'
      );

      expect(sends()[0][0].text).toBe(fillReviewEmail(group.template, group.example.values));
    });

    it('skips one that was rejected or is not yet reviewed, in the preview and the send, and says why (decided 15 November)', async () => {
      const preview = await provider.previewReminders([A, REJECTED, UNREVIEWED], REVIEWER_PERMS, 'gisday.tamu.edu');

      expect(preview.groups.map((g) => [g.kind, g.count])).toEqual([['poster-reminder', 1]]);
      expect(preview.skipped).toEqual([
        { title: 'Old roads', reason: 'not accepted' },
        { title: 'Rivers', reason: 'not accepted' }
      ]);

      const result = await provider.remindUserSubmissions([A, REJECTED, UNREVIEWED], {}, REVIEWER_PERMS, 'gisday.tamu.edu');

      expect(result.sent).toEqual(['Flood maps']);
      expect(result.skipped).toEqual(preview.skipped);
      expect(sends().map(([m]) => m.to)).toEqual(['ana@tamu.edu']);
    });

    it('names one whose email could not be sent, and carries on', async () => {
      (contactService.sendMessage as jest.Mock).mockRejectedValueOnce(new Error('mailroom unreachable'));

      const result = await provider.remindUserSubmissions([A, C], {}, REVIEWER_PERMS, 'gisday.tamu.edu');

      expect(result).toEqual({
        sent: ['Bike lanes'],
        skipped: [],
        failed: [{ title: 'Flood maps', reason: 'the email could not be sent' }]
      });
    });

    it('is for reviewers only, and checks what it is given', async () => {
      await expect(provider.previewReminders([A], [])).rejects.toThrow(ForbiddenException);
      await expect(provider.remindUserSubmissions([A], {}, [])).rejects.toThrow(ForbiddenException);
      await expect(provider.remindUserSubmissions([], {}, REVIEWER_PERMS)).rejects.toThrow(BadRequestException);
      await expect(provider.remindUserSubmissions(['1; drop'], {}, REVIEWER_PERMS)).rejects.toThrow(BadRequestException);
      await expect(
        provider.remindUserSubmissions([A], { templates: { 'poster-reminder': 5 } } as never, REVIEWER_PERMS)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('.deleteUserSubmission()', () => {
    it('lets the owner delete their own submission', async () => {
      jest.spyOn(submissionRepo, 'findOne').mockResolvedValue(submission());

      await expect(provider.deleteUserSubmission('sub-1', OWNER)).resolves.toEqual({ affected: 1 });
    });

    it('refuses someone else', async () => {
      jest.spyOn(submissionRepo, 'findOne').mockResolvedValue(submission());
      const del = jest.spyOn(submissionRepo, 'delete');

      await expect(provider.deleteUserSubmission('sub-1', 'acct-other')).rejects.toThrow(UnauthorizedException);
      expect(del).not.toHaveBeenCalled();
    });

    it('allows a reviewer holding delete:competitions', async () => {
      jest.spyOn(submissionRepo, 'findOne').mockResolvedValue(submission());

      await expect(provider.deleteUserSubmission('sub-1', 'acct-reviewer', ['delete:competitions'])).resolves.toEqual({
        affected: 1
      });
    });

    it('throws NotFound when the submission does not exist', async () => {
      jest.spyOn(submissionRepo, 'findOne').mockResolvedValue(null);

      await expect(provider.deleteUserSubmission('missing', OWNER)).rejects.toThrow(NotFoundException);
    });
  });

  // #2992: Research Competitions' Delete sends the selected ids at once, and there was no route for them.
  describe('.deleteUserSubmissions()', () => {
    const A = '0f8c9a52-1b2c-4d3e-8f4a-5b6c7d8e9f01';
    const B = '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';

    it('deletes each selected submission, once each', async () => {
      jest.spyOn(submissionRepo, 'findOne').mockResolvedValue(submission());

      await expect(provider.deleteUserSubmissions([A, B, A], 'r', ['delete:competitions'])).resolves.toEqual({ deleted: 2 });
      expect((submissionRepo.delete as jest.Mock).mock.calls.map((c) => c[0])).toEqual([A, B]);
    });

    it('refuses anyone without delete:competitions, even an owner, and deletes nothing', async () => {
      await expect(provider.deleteUserSubmissions([A], OWNER, [])).rejects.toThrow(ForbiddenException);
      expect(submissionRepo.delete).not.toHaveBeenCalled();
    });

    it('refuses an empty list or an id that is not a submission id, and deletes nothing', async () => {
      await expect(provider.deleteUserSubmissions([], 'r', ['delete:competitions'])).rejects.toThrow(BadRequestException);
      await expect(provider.deleteUserSubmissions([A, '1; drop'], 'r', ['delete:competitions'])).rejects.toThrow(
        BadRequestException
      );
      expect(submissionRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe('.insertUserSubmission()', () => {
    it('stamps the submission with the account that created it', async () => {
      jest.spyOn(submissionRepo, 'create').mockImplementation((s) => s as never);
      jest.spyOn(submissionRepo, 'save').mockImplementation((s) => Promise.resolve(s as never));

      await provider.insertUserSubmission(OWNER, { title: 'A paper' });

      // The account comes from the JWT, not the body, which is what makes the ownership checks
      // elsewhere meaningful.
      expect(submissionRepo.create).toHaveBeenCalledWith(expect.objectContaining({ accountGuid: OWNER, title: 'A paper' }));
    });

    it('rejects a missing account or body', async () => {
      await expect(provider.insertUserSubmission(OWNER, null)).rejects.toThrow();
      await expect(provider.insertUserSubmission(null, { title: 'x' })).rejects.toThrow();
    });
  });

  /**
   * #2934: an admin sets when each competition, poster and presentation, stops taking submissions. At that moment new
   * submissions and edits close, refused by the API whatever the page shows. Reviewers are not held to it.
   */
  /** #2948: a season runs only the research competitions its admins turned on; every one when none is set. */
  describe("the season's competitions (#2948)", () => {
    const SEASON = { guid: 'season-2026', year: 2026 };

    function seasonRunning(...types: Array<string>) {
      const season = { ...SEASON, competitions: types.map((competitionType) => ({ competitionType })) };

      jest.spyOn(seasonService, 'findOne').mockResolvedValue(season as never);
      jest.spyOn(seasonService, 'findOneActive').mockResolvedValue(season as never);

      return season;
    }

    beforeEach(() => {
      jest.spyOn(submissionRepo, 'create').mockImplementation((s) => s as never);
      jest.spyOn(submissionRepo, 'save').mockImplementation((s) => Promise.resolve(s as never));
    });

    it('refuses a new submission to a competition the season does not run, and saves nothing', async () => {
      seasonRunning('poster', 'presentation');

      await expect(
        provider.insertUserSubmission(OWNER, { submissionType: 'paper', season: SEASON.guid } as never)
      ).rejects.toThrow(new BadRequestException('The paper competition is not running this season.'));
      expect(submissionRepo.save).not.toHaveBeenCalled();
    });

    it('takes a new submission to one it runs', async () => {
      seasonRunning('poster', 'presentation');

      await provider.insertUserSubmission(OWNER, { submissionType: 'poster', season: SEASON.guid } as never);

      expect(submissionRepo.save).toHaveBeenCalled();
    });

    it('takes every competition when the season has no rows, as every season did before', async () => {
      seasonRunning();

      await provider.insertUserSubmission(OWNER, { submissionType: 'cartography', season: SEASON.guid } as never);

      expect(submissionRepo.save).toHaveBeenCalled();
    });

    it('lets the entrant edit a submission to a competition since turned off', async () => {
      jest
        .spyOn(submissionRepo, 'findOne')
        .mockResolvedValue(submission({ submissionType: 'paper', season: seasonRunning('poster') }));

      await provider.updateUserSubmission('sub-1', OWNER, {
        title: 'Revised',
        submissionType: 'paper'
      } as Partial<Submission>);

      expect(written()).toEqual(expect.objectContaining({ title: 'Revised' }));
    });

    it('refuses to move a submission into a competition the season does not run', async () => {
      jest
        .spyOn(submissionRepo, 'findOne')
        .mockResolvedValue(submission({ submissionType: 'poster', season: seasonRunning('poster') }));

      await expect(
        provider.updateUserSubmission('sub-1', OWNER, { submissionType: 'cartography' } as Partial<Submission>)
      ).rejects.toThrow(BadRequestException);
      expect(submissionRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('the submission deadline (#2934)', () => {
    const past = '2026-11-01T17:00:00.000Z';
    const future = '2099-11-01T17:00:00.000Z';
    const SEASON = { guid: 'season-2026', year: 2026 };

    function seasonWith(deadlines: Record<string, unknown>) {
      const season = { ...SEASON, ...deadlines };

      jest.spyOn(seasonService, 'findOne').mockResolvedValue(season as never);
      jest.spyOn(seasonService, 'findOneActive').mockResolvedValue(season as never);

      return season;
    }

    beforeEach(() => {
      jest.spyOn(submissionRepo, 'create').mockImplementation((s) => s as never);
      jest.spyOn(submissionRepo, 'save').mockImplementation((s) => Promise.resolve(s as never));
    });

    describe('a new submission', () => {
      it('is refused once its competition has closed', async () => {
        seasonWith({ posterSubmissionsCloseAt: past });

        await expect(
          provider.insertUserSubmission(OWNER, {
            title: 'Flood maps',
            submissionType: 'poster',
            season: SEASON.guid
          } as never)
        ).rejects.toThrow(ForbiddenException);
        await expect(
          provider.insertUserSubmission(OWNER, {
            title: 'Flood maps',
            submissionType: 'poster',
            season: SEASON.guid
          } as never)
        ).rejects.toThrow('Submissions to the poster competition closed on Sun, Nov 1, 2026, 11:00 AM Central.');
        expect(submissionRepo.save).not.toHaveBeenCalled();
      });

      it('is taken before the deadline', async () => {
        seasonWith({ posterSubmissionsCloseAt: future });

        await provider.insertUserSubmission(OWNER, { submissionType: 'poster', season: SEASON.guid } as never);

        expect(submissionRepo.save).toHaveBeenCalled();
      });

      it('is taken when no deadline is set', async () => {
        seasonWith({});

        await provider.insertUserSubmission(OWNER, { submissionType: 'poster', season: SEASON.guid } as never);

        expect(submissionRepo.save).toHaveBeenCalled();
      });

      it('holds each competition to its own deadline', async () => {
        seasonWith({ posterSubmissionsCloseAt: past, presentationSubmissionsCloseAt: future });

        await provider.insertUserSubmission(OWNER, { submissionType: 'presentation', season: SEASON.guid } as never);

        expect(submissionRepo.save).toHaveBeenCalled();
      });

      it('is taken on a site with no active season', async () => {
        jest.spyOn(seasonService, 'findOneActive').mockRejectedValue(new NotFoundException('No active season found.'));

        await provider.insertUserSubmission(OWNER, { submissionType: 'poster' } as never);

        expect(submissionRepo.save).toHaveBeenCalled();
      });

      it('goes by the active season when the body names none', async () => {
        seasonWith({ presentationSubmissionsCloseAt: past });

        await expect(provider.insertUserSubmission(OWNER, { submissionType: 'presentation' } as never)).rejects.toThrow(
          ForbiddenException
        );
      });
    });

    describe('an edit', () => {
      it('is refused to the entrant once their competition has closed', async () => {
        jest
          .spyOn(submissionRepo, 'findOne')
          .mockResolvedValue(
            submission({ submissionType: 'poster', season: seasonWith({ posterSubmissionsCloseAt: past }) })
          );

        await expect(provider.updateUserSubmission('sub-1', OWNER, { title: 'Revised' })).rejects.toThrow(
          ForbiddenException
        );
        expect(submissionRepo.update).not.toHaveBeenCalled();
      });

      it('is refused when it would move the submission into a competition that has closed', async () => {
        jest
          .spyOn(submissionRepo, 'findOne')
          .mockResolvedValue(
            submission({ submissionType: 'presentation', season: seasonWith({ posterSubmissionsCloseAt: past }) })
          );

        await expect(
          provider.updateUserSubmission('sub-1', OWNER, { submissionType: 'poster' } as Partial<Submission>)
        ).rejects.toThrow(ForbiddenException);
        expect(submissionRepo.update).not.toHaveBeenCalled();
      });

      it('is taken from the entrant before the deadline', async () => {
        jest
          .spyOn(submissionRepo, 'findOne')
          .mockResolvedValue(
            submission({ submissionType: 'poster', season: seasonWith({ posterSubmissionsCloseAt: future }) })
          );

        await provider.updateUserSubmission('sub-1', OWNER, { title: 'Revised' });

        expect(written()).toEqual(expect.objectContaining({ title: 'Revised' }));
      });

      it('is taken from a reviewer after it, so submissions can be reviewed once closed', async () => {
        jest
          .spyOn(submissionRepo, 'findOne')
          .mockResolvedValue(
            submission({ submissionType: 'poster', season: seasonWith({ posterSubmissionsCloseAt: past }) })
          );

        await provider.updateUserSubmission(
          'sub-1',
          'acct-reviewer',
          { acceptance: true } as Partial<Submission>,
          REVIEWER_PERMS
        );

        expect(submissionRepo.update).toHaveBeenCalled();
      });
    });

    /** #2962: paper and cartography close the same way, each at its own deadline. */
    describe.each(['paper', 'cartography'])('a %s submission (#2962)', (type) => {
      const field = `${type}SubmissionsCloseAt`;

      it('is refused once its competition has closed', async () => {
        seasonWith({ [field]: past });

        await expect(
          provider.insertUserSubmission(OWNER, { submissionType: type, season: SEASON.guid } as never)
        ).rejects.toThrow(`Submissions to the ${type} competition closed on Sun, Nov 1, 2026, 11:00 AM Central.`);
        expect(submissionRepo.save).not.toHaveBeenCalled();
      });

      it('is taken before its deadline', async () => {
        seasonWith({ [field]: future });

        await provider.insertUserSubmission(OWNER, { submissionType: type, season: SEASON.guid } as never);

        expect(submissionRepo.save).toHaveBeenCalled();
      });

      it("is not held to another competition's deadline", async () => {
        seasonWith({ posterSubmissionsCloseAt: past, presentationSubmissionsCloseAt: past });

        await provider.insertUserSubmission(OWNER, { submissionType: type, season: SEASON.guid } as never);

        expect(submissionRepo.save).toHaveBeenCalled();
      });

      it('refuses an edit from the entrant once it has closed, and takes one from a reviewer', async () => {
        jest
          .spyOn(submissionRepo, 'findOne')
          .mockResolvedValue(submission({ submissionType: type, season: seasonWith({ [field]: past }) }));

        await expect(provider.updateUserSubmission('sub-1', OWNER, { title: 'Revised' })).rejects.toThrow(
          ForbiddenException
        );
        expect(submissionRepo.update).not.toHaveBeenCalled();

        await provider.updateUserSubmission(
          'sub-1',
          'acct-reviewer',
          { acceptance: true } as Partial<Submission>,
          REVIEWER_PERMS
        );
        expect(submissionRepo.update).toHaveBeenCalled();
      });
    });
  });

  describe('.getSubmissionsForSeason()', () => {
    it('answers an empty list for a season that does not exist', async () => {
      jest.spyOn(seasonService, 'findOne').mockResolvedValue(null);

      await expect(provider.getSubmissionsForSeason('missing')).resolves.toEqual([]);
    });

    it("scopes to the season, with each submission's files for the list to count (#2933)", async () => {
      const season = { guid: 'season-1' };
      jest.spyOn(seasonService, 'findOne').mockResolvedValue(season as never);
      jest.spyOn(submissionRepo, 'find').mockResolvedValue([submission()]);

      await provider.getSubmissionsForSeason('season-1');

      expect(submissionRepo.find).toHaveBeenCalledWith({ where: { season }, relations: { files: true } });
    });

    describe('who submitted each (#2799)', () => {
      const profile = (id: string, over: Record<string, unknown> = {}) => ({
        user_info: { id, name: `${id}@tamu.edu`, given_name: 'Ana', family_name: 'Ruiz', email: `${id}@tamu.edu` },
        user_metadata: { education: { fieldOfStudy: 'Geography' }, occupation: { department: 'Planning' } },
        app_metadata: { gisday: { attendeeType: 'student' } },
        ...over
      });

      beforeEach(() => {
        jest.spyOn(seasonService, 'findOne').mockResolvedValue({ guid: 'season-1' } as never);
      });

      it("gives each submission its submitter's name, email and department", async () => {
        jest.spyOn(submissionRepo, 'find').mockResolvedValue([submission({ accountGuid: 'student' })]);
        jest.spyOn(profiles, 'profilesOf').mockResolvedValue(new Map([['student', profile('student') as never]]));

        const [entry] = await provider.getSubmissionsForSeason('season-1');

        expect(entry.title).toBe('A paper');
        expect(entry.submitter).toEqual({
          firstName: 'Ana',
          lastName: 'Ruiz',
          email: 'student@tamu.edu',
          department: 'Geography'
        });
      });

      it('takes the department, not the field of study, for anyone but a student', async () => {
        jest.spyOn(submissionRepo, 'find').mockResolvedValue([submission({ accountGuid: 'faculty' })]);
        jest
          .spyOn(profiles, 'profilesOf')
          .mockResolvedValue(
            new Map([['faculty', profile('faculty', { app_metadata: { gisday: { attendeeType: 'academia' } } }) as never]])
          );

        const [entry] = await provider.getSubmissionsForSeason('season-1');

        expect(entry.submitter.department).toBe('Planning');
      });

      it('shows the display name when the account has no given or family name', async () => {
        jest.spyOn(submissionRepo, 'find').mockResolvedValue([submission({ accountGuid: 'social' })]);
        const unnamed = profile('social');
        unnamed.user_info = { ...unnamed.user_info, given_name: null, family_name: null };
        jest.spyOn(profiles, 'profilesOf').mockResolvedValue(new Map([['social', unnamed as never]]));

        const [entry] = await provider.getSubmissionsForSeason('season-1');

        expect(entry.submitter).toMatchObject({ firstName: 'social@tamu.edu', lastName: null });
      });

      it('reads every submitter in one batch, each account once, not a request per account (#2925)', async () => {
        jest
          .spyOn(submissionRepo, 'find')
          .mockResolvedValue([
            submission({ guid: 'a', accountGuid: 'student' }),
            submission({ guid: 'b', accountGuid: 'student' }),
            submission({ guid: 'c', accountGuid: 'faculty' })
          ]);
        jest.spyOn(profiles, 'profilesOf').mockResolvedValue(
          new Map([
            ['student', profile('student') as never],
            ['faculty', profile('faculty') as never]
          ])
        );

        const entries = await provider.getSubmissionsForSeason('season-1');

        expect(profiles.profilesOf).toHaveBeenCalledTimes(1);
        expect(profiles.profilesOf).toHaveBeenCalledWith(['student', 'faculty']);
        expect(entries.map((e) => e.submitter?.email)).toEqual(['student@tamu.edu', 'student@tamu.edu', 'faculty@tamu.edu']);
      });

      it('still lists a submission whose account cannot be read', async () => {
        jest.spyOn(submissionRepo, 'find').mockResolvedValue([submission({ accountGuid: 'gone' })]);
        jest.spyOn(profiles, 'profilesOf').mockResolvedValue(new Map([['gone', null]]));

        const entries = await provider.getSubmissionsForSeason('season-1');

        expect(entries).toHaveLength(1);
        expect(entries[0].submitter).toBeNull();
      });
    });
  });

  describe('.getUserPresentationsForActiveSeason()', () => {
    it('scopes to both the account and the active season', async () => {
      jest.spyOn(seasonService, 'findOneActive').mockResolvedValue({ guid: 'active' } as never);
      jest.spyOn(submissionRepo, 'find').mockResolvedValue([submission()]);

      await provider.getUserPresentationsForActiveSeason(OWNER);

      // Without the account scope this would return every entrant's submissions.
      expect(submissionRepo.find).toHaveBeenCalledWith({
        where: { accountGuid: OWNER, season: { guid: 'active' } }
      });
    });
  });
});
