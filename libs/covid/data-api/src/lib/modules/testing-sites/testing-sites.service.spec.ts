import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  County,
  CountyClaim,
  TestingSite,
  TestingSiteInfo,
  Location,
  User,
  EntityStatus,
  CountyClaimInfo,
  EntityToValue
} from '@tamu-gisc/covid/common/entities';

import { TestingSitesService } from './testing-sites.service';
import { CountyClaimsService } from '../county-claims/county-claims.service';

describe('TestingSitesService', () => {
  let testingSitesService: TestingSitesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestingSitesService,
        CountyClaimsService,
        { provide: getRepositoryToken(County), useClass: Repository },
        { provide: getRepositoryToken(CountyClaim), useClass: Repository },
        { provide: getRepositoryToken(TestingSite), useClass: Repository },
        { provide: getRepositoryToken(TestingSiteInfo), useClass: Repository },
        { provide: getRepositoryToken(Location), useClass: Repository },
        { provide: getRepositoryToken(User), useClass: Repository },
        { provide: getRepositoryToken(EntityStatus), useClass: Repository },
        { provide: getRepositoryToken(CountyClaimInfo), useClass: Repository },
        { provide: getRepositoryToken(EntityToValue), useClass: Repository }
      ]
    }).compile();

    testingSitesService = module.get<TestingSitesService>(TestingSitesService);
  });

  describe('Validation ', () => {
    it('Service should be defined', () => {
      expect(testingSitesService).toBeDefined();
    });
  });

  describe('getSitesForUser', () => {
    it('should return {} with mockParameter being Empty String ', async () => {
      const mockParameter = '';
      const expectedResult = {};
      await expect(testingSitesService.getSitesForUser(mockParameter)).toMatchObject(expectedResult);
    });
  });

  describe('should return error message with mockParameter being undefined', () => {
    it('should handle category inputs ', async () => {
      const mockParameter = undefined;
      const expectedResult = {
        status: 400,
        success: false,
        message: 'Input parameter missing.'
      };
      expect(await testingSitesService.registerCountyAsSiteless(mockParameter)).toMatchObject(expectedResult);
    });
  });

  describe('getSiteAndLatestInfo', () => {
    it('should throw error with mockParameter being undefined', async () => {
      const mockParameter = undefined;
      await expect(testingSitesService.getSiteAndLatestInfo(mockParameter)).rejects.toThrow();
    });
  });
});
