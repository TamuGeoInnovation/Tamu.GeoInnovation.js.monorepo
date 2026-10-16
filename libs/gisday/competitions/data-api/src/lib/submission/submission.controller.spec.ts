import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';

import { JwtGuard, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { SubmissionController } from './submission.controller';

/**
 * #1780: every competition submission endpoint needs a signed-in user; an ordinary participant sees
 * only their own submissions; and a submission is recorded for the signed-in user, whatever the
 * request says.
 */
describe('SubmissionController', () => {
  const readAll = 'read:competitions';
  const ann = { user: { sub: 'auth0|ann', permissions: [] } };
  const bob = { user: { sub: 'auth0|bob', permissions: [] } };
  const organizer = { user: { sub: 'auth0|org', permissions: [readAll] } };

  let service;
  let formService;
  // Typed loosely, so the same tests run against the code before the fix, whose methods took different
  // arguments, and fail there for the behaviour rather than to compile.
  let controller: Record<string, (...args: Array<unknown>) => Promise<unknown>>;

  const guardsOf = (method: string) => Reflect.getMetadata(GUARDS_METADATA, SubmissionController.prototype[method]) ?? [];
  const permissionsOf = (method: string) => Reflect.getMetadata('Permissions', SubmissionController.prototype[method]);

  beforeEach(() => {
    service = {
      getUserSubmissions: jest.fn(() => Promise.resolve([])),
      getSubmissionImages: jest.fn(() => Promise.resolve([])),
      getSubmissionByGuid: jest.fn((guid) => Promise.resolve(guid === 'missing' ? null : { guid, userGuid: 'auth0|ann' })),
      getOne: jest.fn(({ where }) =>
        Promise.resolve(where.guid === 'missing' ? null : { guid: where.guid, userGuid: 'auth0|ann', blobs: [] })
      ),
      getAdminSubmissions: jest.fn(() => Promise.resolve([])),
      getMany: jest.fn(() => Promise.resolve([])),
      createCompetitionSubmission: jest.fn((sub) => Promise.resolve(sub)),
      createOne: jest.fn((sub) => Promise.resolve(sub))
    };
    formService = { getSeason: jest.fn(() => Promise.resolve({ guid: 'cs-1', allowSubmissions: true })) };
    controller = new SubmissionController(service, formService) as unknown as typeof controller;
  });

  describe('needs a signed-in user', () => {
    it.each(['getUserSubmissions', 'getSubmissionImages', 'getSubmissionImage', 'getAdminSubmissions', 'getSubmission', 'getAll', 'insert'])(
      '%s',
      (method) => {
        expect(guardsOf(method)).toContain(JwtGuard);
      }
    );

    it.each(['getAdminSubmissions', 'getAll'])('%s also needs permission to read every submission', (method) => {
      expect(guardsOf(method)).toContain(PermissionsGuard);
      expect(permissionsOf(method)?.[0]).toEqual([readAll]);
    });
  });

  describe('a submission is recorded for the signed-in user', () => {
    const body = { season: 'cs-1', value: '{"kind":"monument"}', location: '{"latitude":30.6,"longitude":-96.3}' };

    it('ignores any userGuid in the request', async () => {
      await controller.insert(bob, { ...body, userGuid: 'auth0|ann' }, []);

      expect(service.createCompetitionSubmission).toHaveBeenCalledWith(expect.objectContaining({ userGuid: 'auth0|bob' }), []);
    });

    it('refuses a season that does not exist with 422, not 500', async () => {
      formService.getSeason.mockResolvedValue(null);

      await expect(controller.insert(bob, body, [])).rejects.toThrow(UnprocessableEntityException);
      expect(service.createCompetitionSubmission).not.toHaveBeenCalled();
    });

    it('still refuses a season that is not taking submissions', async () => {
      formService.getSeason.mockResolvedValue({ guid: 'cs-1', allowSubmissions: false });

      await expect(controller.insert(bob, body, [])).rejects.toThrow(BadRequestException);
    });
  });

  describe('a participant sees only their own submissions', () => {
    it('lists their own', async () => {
      await controller.getUserSubmissions(ann, 'auth0|ann');

      expect(service.getUserSubmissions).toHaveBeenCalledWith({ userGuid: 'auth0|ann', seasonGuid: undefined });
    });

    it("refuses someone else's list", async () => {
      await expect(controller.getUserSubmissions(bob, 'auth0|ann')).rejects.toThrow(ForbiddenException);
      expect(service.getUserSubmissions).not.toHaveBeenCalled();
    });

    it("lets an organizer list anyone's", async () => {
      await controller.getUserSubmissions(organizer, 'auth0|ann');

      expect(service.getUserSubmissions).toHaveBeenCalled();
    });

    it('opens their own submission and refuses someone else', async () => {
      await expect(controller.getSubmission(ann, { guid: 's-1' })).resolves.toMatchObject({ guid: 's-1' });
      await expect(controller.getSubmission(bob, { guid: 's-1' })).rejects.toThrow(ForbiddenException);
      await expect(controller.getSubmission(organizer, { guid: 's-1' })).resolves.toMatchObject({ guid: 's-1' });
    });

    it("refuses someone else's photographs", async () => {
      await expect(controller.getSubmissionImages(bob, { guid: 's-1' })).rejects.toThrow(ForbiddenException);
      await expect(controller.getSubmissionImage(bob, { guid: 's-1' }, {})).rejects.toThrow(ForbiddenException);
      expect(service.getSubmissionImages).not.toHaveBeenCalled();
    });

    it('answers 404 for a submission that does not exist', async () => {
      await expect(controller.getSubmission(ann, { guid: 'missing' })).rejects.toThrow(NotFoundException);
    });

    it('answers 404, rather than failing, for a submission with no photograph', async () => {
      await expect(controller.getSubmissionImage(ann, { guid: 's-1' }, {})).rejects.toThrow(NotFoundException);
    });

    it('answers 404 for the photograph of a submission that does not exist', async () => {
      await expect(controller.getSubmissionImage(ann, { guid: 'missing' }, {})).rejects.toThrow(NotFoundException);
    });

    it('reads a submission once to send its photograph, and checks the owner on that row', async () => {
      await expect(controller.getSubmissionImage(organizer, { guid: 's-1' }, {})).rejects.toThrow(NotFoundException);

      expect(service.getOne).toHaveBeenCalledTimes(1);
      expect(service.getOne).toHaveBeenCalledWith(expect.objectContaining({ relations: expect.arrayContaining(['blobs']) }));
      expect(service.getSubmissionByGuid).not.toHaveBeenCalled();
    });
  });
});
