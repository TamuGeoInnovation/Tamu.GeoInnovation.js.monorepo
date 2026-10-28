import { DeepPartial } from 'typeorm';

import { CompetitionSubmission, SubmissionLocation, SubmissionMedia } from '../entities/all.entities';
import { clampAccuracy, SubmissionService } from './submission.service';
import { AUTOMATIC_REVIEWER } from './automatic-review';

describe('clampAccuracy', () => {
  it('keeps the reported accuracy in metres, to the centimetre (#1784)', () => {
    expect(clampAccuracy(12)).toBe(12);
    expect(clampAccuracy(7.456)).toBe(7.46);
    expect(clampAccuracy('35.2')).toBe(35.2);
  });

  it('keeps it within what its column holds', () => {
    expect(clampAccuracy(2500)).toBe(999.99);
  });

  it('saves 0 when none was reported or it makes no sense', () => {
    expect(clampAccuracy(undefined)).toBe(0);
    expect(clampAccuracy(null)).toBe(0);
    expect(clampAccuracy('far')).toBe(0);
    expect(clampAccuracy(-4)).toBe(0);
  });
});

/**
 * #1786: the app chooses a submission's guid, so the submission is INSERTed, never save()d (which
 * would update a row that already has that guid), together with its photographs in one transaction.
 */
describe('SubmissionService.createCompetitionSubmission', () => {
  let em: { create: jest.Mock; save: jest.Mock; insert: jest.Mock; find: jest.Mock };
  let service: SubmissionService;
  let publishInBackground: jest.Mock;

  const entity: DeepPartial<CompetitionSubmission> = {
    guid: '7f1c5a52-3b0e-4d36-9a55-2f8e8f4c1b6a',
    userGuid: 'auth0|ann',
    value: '{"kind":"monument"}',
    location: { latitude: 30.6, longitude: -96.3 },
    season: { guid: 'cs-1' }
  };
  const blobs = [{ fieldName: 'head1' }, { fieldName: 'head2' }] as Array<DeepPartial<SubmissionMedia>>;

  const inserted = (type) => em.insert.mock.calls.filter(([t]) => t === type).map(([, v]) => v);

  beforeEach(() => {
    em = {
      create: jest.fn((type, values) => Object.assign(new type(), values)),
      save: jest.fn((value) => Promise.resolve(value)),
      insert: jest.fn(() => Promise.resolve({})),
      // The participant's earlier submissions, for the automatic review (#2164).
      find: jest.fn(() => Promise.resolve([]))
    };
    // The participant's earlier submissions are read before the save, outside its transaction (#2428 review).
    const submissionRepo = { manager: { transaction: (work) => work(em) }, find: (options) => em.find(options) };

    publishInBackground = jest.fn();
    service = new SubmissionService(
      submissionRepo as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      { publishInBackground } as never
    );
  });

  it('inserts the submission under its own guid, and its photographs with it', async () => {
    const sub = await service.createCompetitionSubmission(entity, blobs);

    expect(inserted(CompetitionSubmission)).toEqual([expect.objectContaining({ guid: entity.guid, userGuid: 'auth0|ann' })]);
    expect(inserted(SubmissionMedia)).toEqual([
      [expect.objectContaining({ fieldName: 'head1', submission: sub }), expect.objectContaining({ fieldName: 'head2', submission: sub })]
    ]);
    expect(em.save.mock.calls.some(([value]) => value instanceof SubmissionLocation)).toBe(true);
    expect(em.save.mock.calls.some(([value]) => value instanceof CompetitionSubmission)).toBe(false);
  });

  // #2433: published to the season's ArcGIS Online layer once saved, never as part of the save.
  it('publishes the submission to ArcGIS Online once it is saved', async () => {
    const sub = await service.createCompetitionSubmission(entity, blobs);

    expect(publishInBackground).toHaveBeenCalledWith(sub.guid);
  });

  it('when the guid is already saved, fails on the duplicate and inserts no photographs', async () => {
    const duplicate = { driverError: { number: 2627 } };
    em.insert.mockImplementation((type) => (type === CompetitionSubmission ? Promise.reject(duplicate) : Promise.resolve({})));

    await expect(service.createCompetitionSubmission(entity, blobs)).rejects.toBe(duplicate);
    expect(inserted(SubmissionMedia)).toEqual([]);
    expect(publishInBackground).not.toHaveBeenCalled();
  });

  /**
   * #2164: every new submission is reviewed by the app as it is saved.
   */
  describe('reviewing it automatically', () => {
    const form = {
      model: [
        {
          attribute: 'memorial_type',
          isDiscriminator: true,
          options: [{ name: 'Tree or bench memorial plaque', value: 'tree_bench_plaque', sameThingMetres: 10, nameAttribute: 'memorial_name' }]
        },
        { attribute: 'memorial_name', options: [] }
      ]
    };
    const plaque: DeepPartial<CompetitionSubmission> = {
      guid: '0b8e2f0e-6a0e-4b8a-9d8a-0f6f3b9e2c11',
      userGuid: 'auth0|ann',
      value: { memorial_type: 'tree_bench_plaque', memorial_name: 'John Smith' } as never,
      location: { latitude: 30.61316, longitude: -96.34062, accuracy: 6 },
      season: { guid: 'cs-2026', form } as never
    };

    const status = () => inserted(CompetitionSubmission)[0]?.validationStatus;

    it('marks one that passes every check as verified by the app', async () => {
      await service.createCompetitionSubmission(plaque, blobs);

      expect(status()).toEqual(expect.objectContaining({ status: 'verified', verifiedBy: AUTOMATIC_REVIEWER }));
    });

    it('leaves one that fails a check unverified, for a person to look at', async () => {
      await service.createCompetitionSubmission(plaque, []);

      expect(status()).toEqual(expect.objectContaining({ status: 'unverified', verifiedBy: AUTOMATIC_REVIEWER }));
    });

    it("compares with the participant's own earlier submissions in the season", async () => {
      const earlier = Object.assign(new CompetitionSubmission(), {
        created: new Date(Date.now() - 60 * 60 * 1000),
        userGuid: 'auth0|ann',
        value: { memorial_type: 'tree_bench_plaque', memorial_name: 'john smith' },
        location: { latitude: '30.61318', longitude: '-96.34062', accuracy: '5' },
        validationStatus: null
      });
      em.find.mockResolvedValue([earlier]);

      await service.createCompetitionSubmission(plaque, blobs);

      expect(em.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userGuid: 'auth0|ann', season: { guid: 'cs-2026' } } })
      );
      expect(status()).toEqual(expect.objectContaining({ status: 'unverified' }));
    });

    // #2428 review: a review that fails must never lose the participant's submission.
    it('saves the submission unverified when the review itself fails', async () => {
      em.find.mockRejectedValue(new Error('connection reset'));

      const sub = await service.createCompetitionSubmission(plaque, blobs);

      expect(sub).toEqual(expect.objectContaining({ guid: plaque.guid }));
      expect(inserted(CompetitionSubmission)).toEqual([expect.objectContaining({ guid: plaque.guid })]);
      expect(inserted(SubmissionMedia)).toHaveLength(1);
      expect(status()).toEqual(expect.objectContaining({ status: 'unverified', verifiedBy: AUTOMATIC_REVIEWER }));
    });

    it('saves the submission unverified when its form data is not what the review expects', async () => {
      const odd = { ...plaque, season: { guid: 'cs-2026', form: { model: 'not a list' } } as never };

      await service.createCompetitionSubmission(odd, blobs);

      expect(status()).toEqual(expect.objectContaining({ status: 'unverified', verifiedBy: AUTOMATIC_REVIEWER }));
    });
  });
});

/**
 * #2164: the admin list says why the app left a submission for a person, and the name typed on it.
 */
describe('SubmissionService.getAdminSubmissions', () => {
  const form = {
    model: [
      {
        attribute: 'memorial_type',
        isDiscriminator: true,
        options: [{ name: 'Tree or bench memorial plaque', value: 'tree_bench_plaque', sameThingMetres: 10, nameAttribute: 'memorial_name' }]
      },
      { attribute: 'memorial_name', options: [] }
    ]
  };

  const row = (guid: string, minutesAgo: number, overrides: Record<string, unknown> = {}) =>
    Object.assign(new CompetitionSubmission(), {
      guid,
      created: new Date(Date.now() - minutesAgo * 60 * 1000),
      userGuid: 'auth0|ann',
      value: { memorial_type: 'tree_bench_plaque', memorial_name: 'John Smith' },
      location: { latitude: '30.61316', longitude: '-96.34062', accuracy: '5' },
      validationStatus: { status: 'verified', verifiedBy: AUTOMATIC_REVIEWER },
      blobs: [{ guid: `${guid}-photo`, sha256: 'abc' }],
      ...overrides
    });

  let find: jest.Mock;
  let service: SubmissionService;

  beforeEach(() => {
    find = jest.fn();
    service = new SubmissionService(
      { find } as never,
      {} as never,
      {} as never,
      { findOne: jest.fn(() => Promise.resolve({ guid: 'cs-2026', form })) } as never,
      { findOne: jest.fn(() => Promise.resolve({ guid: 's-2026', active: true })) } as never,
      { getUserMetadata: jest.fn(() => Promise.reject(new Error('offline'))) } as never,
      { publishInBackground: jest.fn() } as never
    );
  });

  it('gives each submission its name, why it needs a look, and whether the app verified it', async () => {
    // Newest first, as the list is.
    find.mockResolvedValue([
      row('again', 10, { validationStatus: { status: 'unverified', verifiedBy: AUTOMATIC_REVIEWER } }),
      row('first', 60)
    ]);

    const list = await service.getAdminSubmissions({});
    const byGuid = Object.fromEntries(list.map((s) => [s.guid, s]));

    expect(byGuid['first']).toEqual(expect.objectContaining({ name: 'John Smith', reviewReasons: [], verifiedAutomatically: true }));
    expect(byGuid['again']).toEqual(
      expect.objectContaining({ reviewReasons: ['Already submitted by this participant'], verifiedAutomatically: false })
    );
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          location: expect.objectContaining({ accuracy: true }),
          validationStatus: expect.objectContaining({ verifiedBy: true })
        })
      })
    );
  });

  it('gives no reasons for a submission a person has already decided on', async () => {
    find.mockResolvedValue([row('decided', 5, { blobs: [], validationStatus: { status: 'verified', verifiedBy: 'auth0|reviewer' } })]);

    const [decided] = await service.getAdminSubmissions({});

    expect(decided).toEqual(expect.objectContaining({ reviewReasons: [], verifiedAutomatically: false }));
  });
});

/**
 * #2433: a person's review changes the submission's status in ArcGIS Online too.
 */
describe('SubmissionService.validateSubmission', () => {
  it("publishes the submission's new status to ArcGIS Online", async () => {
    const save = jest.fn(() => Promise.resolve());
    const submission = { guid: 's-1', validationStatus: { status: 'verified', verifiedBy: 'automatic' }, save };
    const publishInBackground = jest.fn();
    const service = new SubmissionService(
      { findOne: jest.fn(() => Promise.resolve(submission)) } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      { publishInBackground } as never
    );

    await service.validateSubmission({ guid: 's-1', status: 'discarded' as never, userGuid: 'auth0|reviewer' });

    expect(save).toHaveBeenCalled();
    expect(publishInBackground).toHaveBeenCalledWith('s-1');
  });
});
