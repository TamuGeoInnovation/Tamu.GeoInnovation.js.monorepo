import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  INestApplication,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common';
import { GUARDS_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { Test } from '@nestjs/testing';

import { JwtGuard, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { FormService } from '../form/form.service';
import { SubmissionService } from './submission.service';
import { MAX_PHOTO_BYTES, SubmissionController } from './submission.controller';

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
    it.each(['getMySubmissions', 'getUserSubmissions', 'getSubmissionImages', 'getSubmissionImage', 'getAdminSubmissions', 'getSubmission', 'getAll', 'insert'])(
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

    /**
     * #1786: the app sends a submission again when its answer did not arrive, with the same id each
     * time, so a submission that was saved but whose answer was lost is not saved twice.
     */
    describe('sent again with the same id', () => {
      const id = '7f1c5a52-3b0e-4d36-9a55-2f8e8f4c1b6a';

      it("saves a new id as the submission's own", async () => {
        service.getSubmissionByGuid.mockResolvedValueOnce(null);

        await controller.insert(ann, { ...body, guid: id }, []);

        expect(service.createCompetitionSubmission).toHaveBeenCalledWith(expect.objectContaining({ guid: id, userGuid: 'auth0|ann' }), []);
      });

      it('returns the submission already saved, and saves nothing', async () => {
        const saved = { guid: id, userGuid: 'auth0|ann' };
        service.getSubmissionByGuid.mockResolvedValueOnce(saved);

        await expect(controller.insert(ann, { ...body, guid: id }, [])).resolves.toBe(saved);
        expect(service.createCompetitionSubmission).not.toHaveBeenCalled();
        expect(service.createOne).not.toHaveBeenCalled();
      });

      it("refuses someone else's id, and saves nothing", async () => {
        service.getSubmissionByGuid.mockResolvedValueOnce({ guid: id, userGuid: 'auth0|ann' });

        await expect(controller.insert(bob, { ...body, guid: id }, [])).rejects.toThrow(ConflictException);
        expect(service.createCompetitionSubmission).not.toHaveBeenCalled();
      });

      it('returns the saved one when a copy sent at the same time was saved first, and saves nothing more', async () => {
        const saved = { guid: id, userGuid: 'auth0|ann' };
        // The check finds nothing, then the INSERT meets the copy that was saved in the meantime.
        service.getSubmissionByGuid.mockResolvedValueOnce(null).mockResolvedValueOnce(saved);
        service.createCompetitionSubmission.mockRejectedValueOnce({ driverError: { number: 2627 } });

        await expect(controller.insert(ann, { ...body, guid: id }, [])).resolves.toBe(saved);
        expect(service.createCompetitionSubmission).toHaveBeenCalledTimes(1);
        expect(service.createOne).not.toHaveBeenCalled();
      });

      it("refuses a copy that meets someone else's submission at the same time", async () => {
        service.getSubmissionByGuid.mockResolvedValueOnce(null).mockResolvedValueOnce({ guid: id, userGuid: 'auth0|ann' });
        service.createCompetitionSubmission.mockRejectedValueOnce({ driverError: { number: 2627 } });

        await expect(controller.insert(bob, { ...body, guid: id }, [])).rejects.toThrow(ConflictException);
      });

      it('refuses an id that is not a UUID', async () => {
        await expect(controller.insert(ann, { ...body, guid: 'not-a-uuid' }, [])).rejects.toThrow(BadRequestException);
        expect(service.createCompetitionSubmission).not.toHaveBeenCalled();
      });
    });

    it('still refuses a season that is not taking submissions', async () => {
      formService.getSeason.mockResolvedValue({ guid: 'cs-1', allowSubmissions: false });

      await expect(controller.insert(bob, body, [])).rejects.toThrow(BadRequestException);
    });
  });

  /**
   * #1791: My VGI Submissions lists the signed-in participant's own submissions, taking who they are
   * from the sign-in.
   */
  describe('my submissions', () => {
    it("lists the signed-in participant's own", async () => {
      await controller.getMySubmissions(ann);

      expect(service.getUserSubmissions).toHaveBeenCalledWith({ userGuid: 'auth0|ann', seasonGuid: undefined });
    });

    it('passes on a season', async () => {
      await controller.getMySubmissions(bob, 's-2025');

      expect(service.getUserSubmissions).toHaveBeenCalledWith({ userGuid: 'auth0|bob', seasonGuid: 's-2025' });
    });

    it('is reached at user/me, declared before user/:userGuid so that "me" is not taken for an account id', () => {
      const methods = Object.getOwnPropertyNames(SubmissionController.prototype);

      expect(Reflect.getMetadata(PATH_METADATA, SubmissionController.prototype['getMySubmissions'])).toBe('user/me');
      expect(methods.indexOf('getMySubmissions')).toBeLessThan(methods.indexOf('getUserSubmissions'));
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

    // #1792: a participant opening their own submission does not learn which organizer reviewed it;
    // organizers still see it.
    it('shows the participant their submission without the reviewer, and an organizer with it', async () => {
      service.getSubmissionByGuid.mockImplementation((guid) =>
        Promise.resolve({
          guid,
          userGuid: 'auth0|ann',
          validationStatus: { status: 'verified', verifiedBy: 'google-oauth2|reviewer-account-id' }
        })
      );

      const own = await controller.getSubmission(ann, { guid: 's-1' });
      const asOrganizer = await controller.getSubmission(organizer, { guid: 's-1' });

      expect(own).toMatchObject({ guid: 's-1', validationStatus: { status: 'verified' } });
      expect(JSON.stringify(own)).not.toContain('reviewer-account-id');
      expect(asOrganizer).toMatchObject({ validationStatus: { verifiedBy: 'google-oauth2|reviewer-account-id' } });
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
      expect(service.getOne).toHaveBeenCalledWith(expect.objectContaining({ relations: expect.objectContaining({ blobs: true }) }));
      expect(service.getSubmissionByGuid).not.toHaveBeenCalled();
    });
  });
});

/**
 * #1786: the API refuses a photograph over 15 MB with 413, and more than two files, before anything is
 * saved. Sent over HTTP, because the limits live in the upload interceptor.
 */
describe('SubmissionController upload limits', () => {
  let app: INestApplication;
  let url: string;
  let createCompetitionSubmission: jest.Mock;

  const send = (...photos: Array<number>) => {
    const form = new FormData();
    form.append('season', 'cs-1');
    form.append('value', '{"kind":"monument"}');
    form.append('location', '{"latitude":30.6,"longitude":-96.3}');
    photos.forEach((bytes, i) => form.append(`head${i + 1}`, new Blob([new Uint8Array(bytes)], { type: 'image/jpeg' }), 'photo.jpg'));

    return fetch(`${url}/competitions/submissions`, { method: 'POST', body: form });
  };

  beforeAll(async () => {
    createCompetitionSubmission = jest.fn((sub) => Promise.resolve(sub));

    const moduleRef = await Test.createTestingModule({
      controllers: [SubmissionController],
      providers: [
        { provide: SubmissionService, useValue: { createCompetitionSubmission, getSubmissionByGuid: jest.fn() } },
        { provide: FormService, useValue: { getSeason: () => Promise.resolve({ guid: 'cs-1', allowSubmissions: true }) } }
      ]
    })
      .overrideGuard(JwtGuard)
      .useValue({
        canActivate: (context) => {
          context.switchToHttp().getRequest().user = { sub: 'auth0|bob', permissions: [] };

          return true;
        }
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.listen(0, '127.0.0.1');
    url = await app.getUrl();
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(() => createCompetitionSubmission.mockClear());

  it('accepts two photographs within the limit', async () => {
    const res = await send(1024, 1024);

    expect(res.status).toBe(201);
    expect(createCompetitionSubmission).toHaveBeenCalledTimes(1);
  });

  it('answers 413 for a photograph over 15 MB, and saves nothing', async () => {
    const res = await send(MAX_PHOTO_BYTES + 1);

    expect(res.status).toBe(413);
    expect(createCompetitionSubmission).not.toHaveBeenCalled();
  }, 30000);

  it('refuses more than two files, and saves nothing', async () => {
    const res = await send(1024, 1024, 1024);

    expect(res.status).toBe(400);
    expect(createCompetitionSubmission).not.toHaveBeenCalled();
  });
});
