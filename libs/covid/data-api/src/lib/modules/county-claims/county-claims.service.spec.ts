import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CountyClaim, User, County, CountyClaimInfo, EntityToValue, EntityStatus } from '@tamu-gisc/covid/common/entities';

import { CountyClaimsService } from './county-claims.service';

describe('CountyClaimsService', () => {
  let service: CountyClaimsService;
  let UserRepoMock: MockType<Repository<User>>;
  let CountyRepoMock: MockType<Repository<County>>;
  let CountyClaimRepoMock: MockType<Repository<CountyClaim>>;
  let CountyClaimInfoRepoMock: MockType<Repository<CountyClaimInfo>>;
  let EntityStatusRepoMock: MockType<Repository<EntityStatus>>;
  let EntityToValueRepoMock: MockType<Repository<EntityToValue>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountyClaimsService,
        { provide: getRepositoryToken(CountyClaim), useFactory: repositoryMockFactory },
        { provide: getRepositoryToken(User), useFactory: repositoryMockFactory },
        { provide: getRepositoryToken(County), useFactory: repositoryMockFactory },
        { provide: getRepositoryToken(CountyClaimInfo), useFactory: repositoryMockFactory },
        { provide: getRepositoryToken(EntityToValue), useFactory: repositoryMockFactory },
        { provide: getRepositoryToken(EntityStatus), useFactory: repositoryMockFactory }
      ]
    }).compile();
    service = module.get<CountyClaimsService>(CountyClaimsService);
    UserRepoMock = module.get(getRepositoryToken(User));
    CountyRepoMock = module.get(getRepositoryToken(County));
    CountyClaimRepoMock = module.get(getRepositoryToken(CountyClaim));
    CountyClaimInfoRepoMock = module.get(getRepositoryToken(CountyClaimInfo));
    EntityStatusRepoMock = module.get(getRepositoryToken(EntityStatus));
    EntityToValueRepoMock = module.get(getRepositoryToken(EntityToValue));
  });

  describe('getWebsitesForClaimInfo', () => {
    it('should handle catagorey inputs ', async () => {
      await expect(service.getActiveClaimsForEmail(undefined)).rejects.toThrow();
    });
    it('should handle catagorey inputs ', async () => {
      await expect(service.getActiveClaimsForEmail('undefined')).rejects.toThrow();
    });
  });
  describe('getAllUserCountyClaims', () => {
    it('should handle catagorey inputs ', async () => {
      await expect(service.getAllUserCountyClaims(undefined)).rejects.toThrow();
    });
    it('should handle catagorey inputs ', async () => {
      await expect(service.getAllUserCountyClaims('undefined')).rejects.toThrow();
    });
  });
  describe('getActiveClaimsForCountyFips', () => {
    it('should handle catagorey inputs ', async () => {
      await expect(service.getActiveClaimsForCountyFips(undefined)).rejects.toThrow();
    });
    it('should handle catagorey inputs ', async () => {
      await expect(service.getActiveClaimsForCountyFips('undefined')).rejects.toThrow();
    });
  });

  describe('closeClaim', () => {
    it('should handle catagorey inputs ', async () => {
      expect(await service.closeClaim(undefined)).toMatchObject({
        status: 400,
        success: false,
        message: 'Input parameter missing.'
      });
    });
    it('should handle catagorey inputs ', async () => {
      CountyClaimInfoRepoMock.findOne.mockReturnValue(undefined);
      expect(await service.closeClaim('yeet')).toMatchObject({
        status: 500,
        success: false,
        message: 'Invalid claim.'
      });
    });
  });

  describe('getHistoricClaimsForCounty', () => {
    it('should handle catagorey inputs ', async () => {
      await expect(service.getHistoricClaimsForCounty(undefined)).rejects.toThrow();
    });
    it('should handle catagorey inputs ', async () => {
      await expect(service.getHistoricClaimsForCounty('undefined')).rejects.toThrow();
    });
  });

  describe('getSuggestedClaims', () => {
    it('should handle catagorey inputs ', async () => {
      await expect(service.getSuggestedClaims(undefined)).rejects.toThrow();
    });
    it('should handle catagorey inputs ', async () => {
      await expect(service.getSuggestedClaims('undefined')).rejects.toThrow();
    });
    it('should handle catagorey inputs ', async () => {
      await expect(service.getSuggestedClaims(null)).rejects.toThrow();
    });
  });
  describe('createOrUpdateClaim', () => {
    it('should handle catagorey inputs ', async () => {
      UserRepoMock.findOne.mockReturnValue(undefined);
      await expect(service.createOrUpdateClaim(undefined, undefined, undefined)).rejects.toThrow();
    });
    /*it('should handle catagorey inputs ', async () => {
      UserRepoMock.findOne.mockReturnValue(new User());
      await expect(service.createOrUpdateClaim(new CountyClaim(), [], [])).toMatchObject({
        status: 400,
        success: false,
        message: 'Input parameter missing.'
      });
    });*/
  });
});

// @ts-ignore
export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(() => ({
  findOne: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  save: jest.fn()
}));
export type MockType<T> = {
  [P in keyof T]: jest.Mock<{}>;
};
