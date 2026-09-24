import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';

import { ContactService } from '../contact/contact.service';
import { Submission, SubmissionType } from '../entities/all.entity';
import { SeasonService } from '../season/season.service';
import { UserSubmissionProvider } from './user-submission.provider';

describe('UserSubmissionProvider', () => {
  let provider: UserSubmissionProvider;
  let submissionRepo: Repository<Submission>;
  let seasonService: SeasonService;
  let contactService: ContactService;

  const OWNER = 'acct-owner';
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
        { provide: SeasonService, useValue: { findOne: jest.fn(), findOneActive: jest.fn() } },
        { provide: ContactService, useValue: { sendMessage: jest.fn().mockResolvedValue({}) } }
      ]
    }).compile();

    provider = module.get<UserSubmissionProvider>(UserSubmissionProvider);
    submissionRepo = module.get(getRepositoryToken(Submission));
    seasonService = module.get(SeasonService);
    contactService = module.get(ContactService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
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

      await expect(provider.getUserPresentation('sub-1', 'acct-other')).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('allows a reviewer holding read:competitions', async () => {
      jest.spyOn(submissionRepo, 'findOne').mockResolvedValue(submission());

      await expect(
        provider.getUserPresentation('sub-1', 'acct-reviewer', ['read:competitions'])
      ).resolves.toEqual(expect.objectContaining({ guid: 'sub-1' }));
    });

    it('throws NotFound before any ownership check when the submission is missing', async () => {
      jest.spyOn(submissionRepo, 'findOne').mockResolvedValue(null);

      await expect(provider.getUserPresentation('missing', 'acct-other')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('.updateUserSubmission()', () => {
    it('refuses someone who neither owns it nor reviews', async () => {
      jest.spyOn(submissionRepo, 'findOne').mockResolvedValue(submission());

      await expect(
        provider.updateUserSubmission('sub-1', 'acct-other', { title: 'Hijacked' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws NotFound when the submission does not exist', async () => {
      jest.spyOn(submissionRepo, 'findOne').mockResolvedValue(null);

      await expect(provider.updateUserSubmission('missing', OWNER, {})).rejects.toThrow(
        NotFoundException
      );
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
        .mockResolvedValue(
          submission({ participants: [{ email: 'owner@tamu.edu' }, { email: 'coauthor@tamu.edu' }] })
        );

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

    it('does not email when the owner merely edits their own content', async () => {
      jest.spyOn(submissionRepo, 'findOne').mockResolvedValue(submission());

      await provider.updateUserSubmission('sub-1', OWNER, { title: 'Revised' });

      expect(contactService.sendMessage).not.toHaveBeenCalled();
    });

    it('still records the decision when the notification email fails', async () => {
      jest.spyOn(submissionRepo, 'findOne').mockResolvedValue(submission());
      jest
        .spyOn(contactService, 'sendMessage')
        .mockRejectedValue(new Error('mailroom unreachable'));

      // A reviewer's decision must not be lost because the mail server was down.
      await expect(
        provider.updateUserSubmission(
          'sub-1',
          'acct-reviewer',
          { acceptance: true } as Partial<Submission>,
          REVIEWER_PERMS
        )
      ).resolves.toEqual(expect.objectContaining({ affected: 1 }));
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

      await expect(provider.deleteUserSubmission('sub-1', 'acct-other')).rejects.toThrow(
        UnauthorizedException
      );
      expect(del).not.toHaveBeenCalled();
    });

    it('allows a reviewer holding delete:competitions', async () => {
      jest.spyOn(submissionRepo, 'findOne').mockResolvedValue(submission());

      await expect(
        provider.deleteUserSubmission('sub-1', 'acct-reviewer', ['delete:competitions'])
      ).resolves.toEqual({ affected: 1 });
    });

    it('throws NotFound when the submission does not exist', async () => {
      jest.spyOn(submissionRepo, 'findOne').mockResolvedValue(null);

      await expect(provider.deleteUserSubmission('missing', OWNER)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('.insertUserSubmission()', () => {
    it('stamps the submission with the account that created it', async () => {
      jest.spyOn(submissionRepo, 'create').mockImplementation((s) => s as never);
      jest.spyOn(submissionRepo, 'save').mockImplementation((s) => Promise.resolve(s as never));

      await provider.insertUserSubmission(OWNER, { title: 'A paper' });

      // The account comes from the JWT, not the body, which is what makes the ownership checks
      // elsewhere meaningful.
      expect(submissionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ accountGuid: OWNER, title: 'A paper' })
      );
    });

    it('rejects a missing account or body', async () => {
      await expect(provider.insertUserSubmission(OWNER, null)).rejects.toThrow();
      await expect(provider.insertUserSubmission(null, { title: 'x' })).rejects.toThrow();
    });
  });

  describe('.getSubmissionsForSeason()', () => {
    it('answers an empty list for a season that does not exist', async () => {
      jest.spyOn(seasonService, 'findOne').mockResolvedValue(null);

      await expect(provider.getSubmissionsForSeason('missing')).resolves.toEqual([]);
    });

    it('scopes to the season', async () => {
      const season = { guid: 'season-1' };
      jest.spyOn(seasonService, 'findOne').mockResolvedValue(season as never);
      jest.spyOn(submissionRepo, 'find').mockResolvedValue([submission()]);

      await provider.getSubmissionsForSeason('season-1');

      expect(submissionRepo.find).toHaveBeenCalledWith({ where: { season } });
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
