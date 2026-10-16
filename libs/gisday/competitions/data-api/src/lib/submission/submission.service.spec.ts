import { DeepPartial } from 'typeorm';

import { CompetitionSubmission, SubmissionLocation, SubmissionMedia } from '../entities/all.entities';
import { clampAccuracy, SubmissionService } from './submission.service';

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
  let em: { create: jest.Mock; save: jest.Mock; insert: jest.Mock };
  let service: SubmissionService;

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
      insert: jest.fn(() => Promise.resolve({}))
    };
    const submissionRepo = { manager: { transaction: (work) => work(em) } };

    service = new SubmissionService(submissionRepo as never, {} as never, {} as never, {} as never, {} as never, {} as never);
  });

  it('inserts the submission under its own guid, and its photographs with it', async () => {
    const sub = await service.createCompetitionSubmission(entity, blobs);

    expect(inserted(CompetitionSubmission)).toEqual([expect.objectContaining({ guid: entity.guid, userGuid: 'auth0|ann' })]);
    expect(inserted(SubmissionMedia)).toEqual([
      [expect.objectContaining({ fieldName: 'head1', submission: sub }), expect.objectContaining({ fieldName: 'head2', submission: sub })]
    ]);
    expect(em.save.mock.calls.every(([value]) => value instanceof SubmissionLocation)).toBe(true);
  });

  it('when the guid is already saved, fails on the duplicate and inserts no photographs', async () => {
    const duplicate = { driverError: { number: 2627 } };
    em.insert.mockImplementation((type) => (type === CompetitionSubmission ? Promise.reject(duplicate) : Promise.resolve({})));

    await expect(service.createCompetitionSubmission(entity, blobs)).rejects.toBe(duplicate);
    expect(inserted(SubmissionMedia)).toEqual([]);
  });
});
