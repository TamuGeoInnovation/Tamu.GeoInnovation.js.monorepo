import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CountyClaim, User, County, CountyClaimInfo, EntityToValue, EntityStatus } from '@tamu-gisc/covid/common/entities';

import { CountyClaimsService } from './county-claims.service';

describe('CountyClaims Controller', () => {
  let countyClaimsService: CountyClaimsService;
  let countyClaimRepo: Repository<CountyClaim>;
  let userRepo: Repository<User>;
  let countyRepo: Repository<County>;
  let countyClaimInfoRepo: Repository<CountyClaimInfo>;
  let entityToValueRepo: Repository<EntityToValue>;
  let entityStatusRepo: Repository<EntityStatus>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountyClaimsService,
        { provide: getRepositoryToken(CountyClaim), useClass: Repository },
        { provide: getRepositoryToken(User), useClass: Repository },
        { provide: getRepositoryToken(County), useClass: Repository },
        { provide: getRepositoryToken(CountyClaimInfo), useClass: Repository },
        { provide: getRepositoryToken(EntityToValue), useClass: Repository },
        { provide: getRepositoryToken(EntityStatus), useClass: Repository }
      ]
    }).compile();
    countyClaimsService = module.get<CountyClaimsService>(CountyClaimsService);
    countyClaimRepo = module.get<Repository<CountyClaim>>(getRepositoryToken(CountyClaim));
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    countyRepo = module.get<Repository<County>>(getRepositoryToken(County));
    countyClaimInfoRepo = module.get<Repository<CountyClaimInfo>>(getRepositoryToken(CountyClaimInfo));
    entityToValueRepo = module.get<Repository<EntityToValue>>(getRepositoryToken(EntityToValue));
    entityStatusRepo = module.get<Repository<EntityStatus>>(getRepositoryToken(EntityStatus));
  });

  describe('getWebsitesForClaimInfo', () => {
    it('should throw error - undefined value ', async () => {
      await expect(countyClaimsService.getActiveClaimsForEmail(undefined)).rejects.toThrow();
    });
    it('should throw error - undefined string', async () => {
      await expect(countyClaimsService.getActiveClaimsForEmail('undefined')).rejects.toThrow();
    });
  });

  describe('getAllUserCountyClaims', () => {
    it('should throw error - undefined value ', async () => {
      await expect(countyClaimsService.getAllUserCountyClaims(undefined)).rejects.toThrow();
    });
    it('should throw error  - undefined string', async () => {
      await expect(countyClaimsService.getAllUserCountyClaims('undefined')).rejects.toThrow();
    });
  });

  describe('getActiveClaimsForCountyFips', () => {
    it('should throw error  - undefined value ', async () => {
      await expect(countyClaimsService.getActiveClaimsForCountyFips(undefined)).rejects.toThrow();
    });
    it('should throw error  - undefined string', async () => {
      await expect(countyClaimsService.getActiveClaimsForCountyFips('undefined')).rejects.toThrow();
    });
  });

  describe('closeClaim', () => {
    it('should handle catagorey inputs ', async () => {
      expect(await countyClaimsService.closeClaim(undefined)).toMatchObject({
        status: 400,
        success: false,
        message: 'Input parameter missing.'
      });
    });
    it('should handle catagorey inputs ', async () => {
      jest.spyOn(countyClaimRepo, 'findOne').mockReturnValue(undefined);
      expect(await countyClaimsService.closeClaim('yeet')).toMatchObject({
        status: 500,
        success: false,
        message: 'Invalid claim.'
      });
    });
  });
});

/*describe('closeClaim', () => {
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
    it('should handle catagorey inputs ', async () => {
      UserRepoMock.findOne.mockReturnValue(new User());
      await expect(service.createOrUpdateClaim(new CountyClaim(), [], [])).toMatchObject({
        status: 400,
        success: false,
        message: 'Input parameter missing.'
      });
    });*/
