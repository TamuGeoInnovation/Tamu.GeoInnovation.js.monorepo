import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { County, CountyClaim, CategoryValue, CountyClaimInfo } from '@tamu-gisc/covid/common/entities';

import { WebsitesService } from './websites.service';

describe('WebsitesService', () => {
  let websitesService: WebsitesService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebsitesService,
        { provide: getRepositoryToken(CategoryValue), useClass: Repository },
        { provide: getRepositoryToken(County), useClass: Repository },
        { provide: getRepositoryToken(CountyClaim), useClass: Repository },
        { provide: getRepositoryToken(CountyClaimInfo), useClass: Repository }
      ]
    }).compile();

    websitesService = module.get<WebsitesService>(WebsitesService);
  });

  describe('Validation ', () => {
    it('Service should be defined', () => {
      expect(websitesService).toBeDefined();
    });
  });

  describe('getWebsitesForCounty', () => {
    it('should return expectedResult', async () => {
      const mockParameter = 'undefined';
      const expectedResult = {
        status: 400,
        success: false,
        message: 'Invalid county fips'
      };
      expect(await websitesService.getWebsitesForCounty(mockParameter)).toMatchObject(expectedResult);
    });
    it('should return expectedResult', async () => {
      const mockParameter = undefined;
      const expectedResult = {
        status: 400,
        success: false,
        message: 'Invalid county fips'
      };
      expect(await websitesService.getWebsitesForCounty(mockParameter)).toMatchObject(expectedResult);
    });
    it('should return expectedResult', async () => {
      const mockParameter = 0;
      const expectedResult = {
        status: 400,
        success: false,
        message: 'Invalid county fips'
      };
      expect(await websitesService.getWebsitesForCounty(mockParameter)).toMatchObject(expectedResult);
    });
  });

  describe('getWebsitesForClaimInfo', () => {
    it('should throw error for undefined parameter ', async () => {
      const mockParameter = undefined;
      await expect(websitesService.getWebsitesForClaimInfo(mockParameter)).rejects.toThrow();
    });
  });
});
