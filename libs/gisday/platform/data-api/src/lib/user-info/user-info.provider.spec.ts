import { NotImplementedException, UnprocessableEntityException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';

import { ManagementService } from '@tamu-gisc/common/nest/auth';

import { Organization, University, UserInfo } from '../entities/all.entity';
import { GisDayAppMetadata, ParticipantType, UserInfoProvider } from './user-info.provider';

describe('UserInfoProvider', () => {
  let provider: UserInfoProvider;
  let universityRepo: Repository<University>;
  let organizationRepo: Repository<Organization>;
  let management: ManagementService;

  /**
   * A payload that passes every validation for the given attendee type. Tests that exercise a
   * specific failure start from this and remove or replace only the part under test, so a test
   * cannot pass because some unrelated field happened to be missing too.
   */
  const validPayload = (type: ParticipantType): GisDayAppMetadata =>
    ({
      app_metadata: { gisday: { attendeeType: type, completedProfile: false } },
      user_metadata: {
        education: {
          id: '123456789',
          institution: 'tamu',
          otherInstitution: '',
          fieldOfStudy: 'Geography',
          classification: 'Senior'
        },
        occupation: {
          employer: 'tamu',
          otherEmployer: '',
          department: 'Geography',
          position: 'Professor'
        }
      }
    }) as unknown as GisDayAppMetadata;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserInfoProvider,
        { provide: getRepositoryToken(UserInfo), useValue: { find: jest.fn(), findOne: jest.fn() } },
        {
          provide: getRepositoryToken(University),
          useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn() }
        },
        {
          provide: getRepositoryToken(Organization),
          useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn() }
        },
        {
          provide: ManagementService,
          useValue: { getUsers: jest.fn(), getUserMetadata: jest.fn(), updateUserMetadata: jest.fn() }
        }
      ]
    }).compile();

    provider = module.get<UserInfoProvider>(UserInfoProvider);
    universityRepo = module.get(getRepositoryToken(University));
    organizationRepo = module.get(getRepositoryToken(Organization));
    management = module.get(ManagementService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('.getUsers()', () => {
    it('asks Auth0 only for the gisday app metadata and the two profile blocks', async () => {
      jest.spyOn(management, 'getUsers').mockResolvedValue([] as never);

      await provider.getUsers();

      expect(management.getUsers).toHaveBeenCalledWith({
        app_metadata: 'gisday',
        user_metadata: ['occupation', 'education']
      });
    });
  });

  describe('.getUserMetadata()', () => {
    it('scopes the lookup to the requested user', async () => {
      jest.spyOn(management, 'getUserMetadata').mockResolvedValue({} as never);

      await provider.getUserMetadata('auth0|abc');

      expect(management.getUserMetadata).toHaveBeenCalledWith('auth0|abc', {
        app_metadata: 'gisday',
        user_metadata: ['occupation', 'education']
      });
    });
  });

  describe('.getUser()', () => {
    it('is not implemented', async () => {
      await expect(provider.getUser('auth0|abc')).rejects.toThrow(NotImplementedException);
    });
  });

  describe('.updateUserMetadata()', () => {
    describe('payload shape', () => {
      it.each([
        ['no payload at all', undefined],
        ['no app_metadata', { user_metadata: {} }],
        ['no user_metadata', { app_metadata: { gisday: {} } }]
      ])('rejects a body with %s', async (_label, payload) => {
        await expect(
          provider.updateUserMetadata('auth0|abc', payload as unknown as GisDayAppMetadata)
        ).rejects.toThrow(UnprocessableEntityException);
      });

      /**
       * Regression coverage.
       *
       * The guard above checks that `app_metadata` exists, then the next line read
       * `app_metadata.gisday.attendeeType` straight through. A body carrying an `app_metadata`
       * without a `gisday` key threw a TypeError, so a malformed request answered 500 instead of
       * telling the caller what was wrong.
       */
      it('answers 422, not a TypeError, when app_metadata has no gisday block', async () => {
        const payload = { app_metadata: {}, user_metadata: {} } as unknown as GisDayAppMetadata;

        await expect(provider.updateUserMetadata('auth0|abc', payload)).rejects.toThrow(
          UnprocessableEntityException
        );
      });

      it('rejects a gisday block with no attendee type', async () => {
        const payload = validPayload(ParticipantType.Student);
        delete (payload.app_metadata.gisday as Partial<{ attendeeType: ParticipantType }>).attendeeType;

        await expect(provider.updateUserMetadata('auth0|abc', payload)).rejects.toThrow(
          UnprocessableEntityException
        );
      });

      /**
       * Regression coverage.
       *
       * Each validation block is keyed to one known attendee type. An unrecognized value matched
       * none of them, so the request fell straight through to `completedProfile = true` and was
       * written to Auth0 with nothing validated -- the one outcome the whole method exists to
       * prevent.
       */
      it('rejects an unrecognized attendee type rather than marking the profile complete', async () => {
        const payload = validPayload(ParticipantType.Student);
        payload.app_metadata.gisday.attendeeType = 'staff' as ParticipantType;

        await expect(provider.updateUserMetadata('auth0|abc', payload)).rejects.toThrow(
          UnprocessableEntityException
        );
        expect(management.updateUserMetadata).not.toHaveBeenCalled();
      });
    });

    describe('student', () => {
      /**
       * Regression coverage.
       *
       * Only `user_metadata` itself was checked, never the nested `education` object, so a student
       * body that carried `occupation` but no `education` threw a TypeError reading `.id`.
       */
      it('answers 422, not a TypeError, when the education block is missing entirely', async () => {
        const payload = validPayload(ParticipantType.Student);
        delete (payload.user_metadata as Partial<{ education: unknown }>).education;

        await expect(provider.updateUserMetadata('auth0|abc', payload)).rejects.toThrow(
          UnprocessableEntityException
        );
      });

      it.each(['id', 'fieldOfStudy', 'classification'] as const)(
        'rejects an education block missing %s',
        async (field) => {
          const payload = validPayload(ParticipantType.Student);
          payload.user_metadata.education[field] = '';

          await expect(provider.updateUserMetadata('auth0|abc', payload)).rejects.toThrow(
            UnprocessableEntityException
          );
        }
      );

      it('rejects "other" institution with no name supplied', async () => {
        const payload = validPayload(ParticipantType.Student);
        payload.user_metadata.education.institution = 'other';
        payload.user_metadata.education.otherInstitution = '';

        await expect(provider.updateUserMetadata('auth0|abc', payload)).rejects.toThrow(
          UnprocessableEntityException
        );
      });

      it('creates the university and stores its guid rather than the free-text name', async () => {
        const payload = validPayload(ParticipantType.Student);
        payload.user_metadata.education.institution = 'other';
        payload.user_metadata.education.otherInstitution = 'Rice University';

        jest.spyOn(universityRepo, 'findOne').mockResolvedValue(null);
        jest.spyOn(universityRepo, 'create').mockReturnValue({ name: 'Rice University' } as never);
        jest.spyOn(universityRepo, 'save').mockResolvedValue({ guid: 'uni-new' } as never);

        await provider.updateUserMetadata('auth0|abc', payload);

        expect(payload.user_metadata.education.institution).toBe('uni-new');
      });

      it('reuses an existing university instead of creating a duplicate', async () => {
        const payload = validPayload(ParticipantType.Student);
        payload.user_metadata.education.institution = 'other';
        payload.user_metadata.education.otherInstitution = 'Rice University';

        jest.spyOn(universityRepo, 'findOne').mockResolvedValue({ guid: 'uni-existing' } as never);
        const create = jest.spyOn(universityRepo, 'create');

        await provider.updateUserMetadata('auth0|abc', payload);

        expect(create).not.toHaveBeenCalled();
        expect(payload.user_metadata.education.institution).toBe('uni-existing');
      });
    });

    describe('academia', () => {
      /** Regression coverage -- same missing nested-object guard as the student case. */
      it('answers 422, not a TypeError, when the occupation block is missing entirely', async () => {
        const payload = validPayload(ParticipantType.Academia);
        delete (payload.user_metadata as Partial<{ occupation: unknown }>).occupation;

        await expect(provider.updateUserMetadata('auth0|abc', payload)).rejects.toThrow(
          UnprocessableEntityException
        );
      });

      it.each(['employer', 'department', 'position'] as const)(
        'rejects an occupation block missing %s',
        async (field) => {
          const payload = validPayload(ParticipantType.Academia);
          payload.user_metadata.occupation[field] = '';

          await expect(provider.updateUserMetadata('auth0|abc', payload)).rejects.toThrow(
            UnprocessableEntityException
          );
        }
      );

      // Academia shares the occupation block with industry, but an "other" employer is a
      // university rather than an organization.
      it('resolves an "other" employer against the university table', async () => {
        const payload = validPayload(ParticipantType.Academia);
        payload.user_metadata.occupation.employer = 'other';
        payload.user_metadata.occupation.otherEmployer = 'Rice University';

        jest.spyOn(universityRepo, 'findOne').mockResolvedValue({ guid: 'uni-1' } as never);
        const orgFind = jest.spyOn(organizationRepo, 'findOne');

        await provider.updateUserMetadata('auth0|abc', payload);

        expect(payload.user_metadata.occupation.employer).toBe('uni-1');
        expect(orgFind).not.toHaveBeenCalled();
      });
    });

    describe('industry', () => {
      /** Regression coverage -- same missing nested-object guard as the student case. */
      it('answers 422, not a TypeError, when the occupation block is missing entirely', async () => {
        const payload = validPayload(ParticipantType.Industry);
        delete (payload.user_metadata as Partial<{ occupation: unknown }>).occupation;

        await expect(provider.updateUserMetadata('auth0|abc', payload)).rejects.toThrow(
          UnprocessableEntityException
        );
      });

      it('resolves an "other" employer against the organization table', async () => {
        const payload = validPayload(ParticipantType.Industry);
        payload.user_metadata.occupation.employer = 'other';
        payload.user_metadata.occupation.otherEmployer = 'Esri';

        jest.spyOn(organizationRepo, 'findOne').mockResolvedValue(null);
        jest.spyOn(organizationRepo, 'create').mockReturnValue({ name: 'Esri' } as never);
        jest.spyOn(organizationRepo, 'save').mockResolvedValue({ guid: 'org-new' } as never);
        const uniFind = jest.spyOn(universityRepo, 'findOne');

        await provider.updateUserMetadata('auth0|abc', payload);

        expect(payload.user_metadata.occupation.employer).toBe('org-new');
        expect(uniFind).not.toHaveBeenCalled();
      });
    });

    it('marks the profile complete and writes it back to Auth0', async () => {
      const payload = validPayload(ParticipantType.Student);

      await provider.updateUserMetadata('auth0|abc', payload);

      expect(payload.app_metadata.gisday.completedProfile).toBe(true);
      expect(management.updateUserMetadata).toHaveBeenCalledWith('auth0|abc', payload, {
        app_metadata: 'gisday',
        user_metadata: ['occupation', 'education']
      });
    });
  });
});
