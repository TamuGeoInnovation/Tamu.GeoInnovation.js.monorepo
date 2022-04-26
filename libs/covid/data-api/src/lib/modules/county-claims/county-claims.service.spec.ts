import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CountyClaim, User, County, CountyClaimInfo, EntityToValue, EntityStatus } from '@tamu-gisc/covid/common/entities';

import { CountyClaimsService } from './county-claims.service';

describe('CountyClaims Controller', () => {
  let countyClaimsService: CountyClaimsService;

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
  });

  describe('getWebsitesForClaimInfo', () => {
    it('should throw error - undefined value ', async () => {
      const mockParameter = undefined;
      await expect(countyClaimsService.getActiveClaimsForEmail(mockParameter)).rejects.toThrow();
    });

    it('should throw error - undefined string', async () => {
      const mockParameter = 'undefined';
      await expect(countyClaimsService.getActiveClaimsForEmail(mockParameter)).rejects.toThrow();
    });
  });

  describe('getAllUserCountyClaims', () => {
    it('should throw error - undefined value ', async () => {
      const mockParameter = undefined;
      await expect(countyClaimsService.getAllUserCountyClaims(mockParameter)).rejects.toThrow();
    });

    it('should throw error  - undefined string', async () => {
      const mockParameter = 'undefined';
      await expect(countyClaimsService.getAllUserCountyClaims(mockParameter)).rejects.toThrow();
    });
  });

  describe('getActiveClaimsForCountyFips', () => {
    it('should throw error  - undefined value ', async () => {
      const mockParameter = undefined;
      await expect(countyClaimsService.getActiveClaimsForCountyFips(mockParameter)).rejects.toThrow();
    });

    it('should throw error  - undefined string', async () => {
      const mockParameter = 'undefined';
      await expect(countyClaimsService.getActiveClaimsForCountyFips(mockParameter)).rejects.toThrow();
    });
  });

  describe('closeClaim', () => {
    it('should handle mockParameter being undefined ', async () => {
      const mockParameter = undefined;
      const expectedResult = {
        status: 400,
        success: false,
        message: 'Input parameter missing.'
      };
      expect(await countyClaimsService.closeClaim(mockParameter)).toMatchObject(expectedResult);
    });
  });

  describe('getHistoricClaimsForCounty', () => {
    it('should throw error  - undefined value  ', async () => {
      const mockParameter = undefined;
      await expect(countyClaimsService.getHistoricClaimsForCounty(mockParameter)).rejects.toThrow();
    });
    it('should throw error  - undefined string  ', async () => {
      const mockParameter = 'undefined';
      await expect(countyClaimsService.getHistoricClaimsForCounty(mockParameter)).rejects.toThrow();
    });
  });

  describe('getSuggestedClaims', () => {
    it('should throw error  - undefined value ', async () => {
      const mockParameter = undefined;
      await expect(countyClaimsService.getSuggestedClaims(mockParameter)).rejects.toThrow();
    });

    it('should throw error  - undefined string ', async () => {
      const mockParameter = 'undefined';
      await expect(countyClaimsService.getSuggestedClaims(mockParameter)).rejects.toThrow();
    });

    it('should throw error  - null', async () => {
      const mockParameter = null;
      await expect(countyClaimsService.getSuggestedClaims(mockParameter)).rejects.toThrow();
    });
  });
});
