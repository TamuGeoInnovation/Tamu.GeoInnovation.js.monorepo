import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';

import { TestingSite, CountyClaim } from '@tamu-gisc/covid/common/entities';

import { TestingSitesController } from './testing-sites.controller';
import { TestingSitesService } from './testing-sites.service';
import { CountyClaimsService } from '../county-claims/county-claims.service';

jest.mock('./testing-sites.service');
jest.mock('../county-claims/county-claims.service');

describe('TestingSitesController', () => {
  let testingSitesService: TestingSitesService;
  let testingSitesController: TestingSitesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestingSitesService, CountyClaimsService],
      controllers: [TestingSitesController]
    }).compile();
    testingSitesService = module.get<TestingSitesService>(TestingSitesService);
    testingSitesController = module.get<TestingSitesController>(TestingSitesController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const mockParameters = 'foobar';

  describe('Validation ', () => {
    it('controller should be defined', () => {
      expect(testingSitesController).toBeDefined();
    });
  });

  describe('getValidated', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      testingSitesService.repo = new Repository();
      jest.spyOn(testingSitesService.repo, 'find').mockResolvedValue(expectedResult);
      expect(await testingSitesController.getValidated()).toStrictEqual(expectedResult);
    });
  });

  describe('getDetailsForSite', () => {
    it('should return expectedResult', async () => {
      const expectedResult = undefined;
      jest.spyOn(testingSitesService, 'getSiteAndLatestInfo').mockResolvedValue(expectedResult);
      expect(await testingSitesController.getDetailsForSite(mockParameters)).toBe(expectedResult);
    });
  });

  describe('getInfosForSite', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(testingSitesService, 'getInfosForSite').mockResolvedValue(expectedResult);
      expect(await testingSitesController.getInfosForSite(mockParameters)).toMatchObject(expectedResult);
    });
  });

  describe('getTestingSitesSortedByCounty', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(testingSitesService, 'getTestingSitesSortedByCounty').mockResolvedValue(expectedResult);
      expect(await testingSitesController.getTestingSitesSortedByCounty()).toStrictEqual(expectedResult);
    });
  });

  describe('getSitesByCounty', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(testingSitesService, 'getSitesForCounty').mockResolvedValue(expectedResult);
      expect(await testingSitesController.getSitesByCounty(mockParameters)).toStrictEqual(expectedResult);
    });
  });

  describe('getSitesForUser', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(testingSitesService, 'getSitesForUser').mockResolvedValue(expectedResult);
      expect(await testingSitesController.getSitesForUser(mockParameters)).toStrictEqual(expectedResult);
    });
  });

  describe('getTestingSitesAdmin', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(testingSitesService, 'getTestingSitesAdmin').mockResolvedValue(expectedResult);
      expect(await testingSitesController.getTestingSitesAdmin(mockParameters)).toMatchObject(expectedResult);
    });

    it('should handle Error thrown from service.getTestingSitesAdmin', async () => {
      const expectedResult = {
        message: '',
        status: 500,
        success: false
      };
      jest.spyOn(testingSitesService, 'getTestingSitesAdmin').mockImplementation(() => {
        throw new Error();
      });
      expect(await testingSitesController.getTestingSitesAdmin(mockParameters)).toStrictEqual(expectedResult);
    });
  });

  describe('addTestingSite', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new TestingSite();
      jest.spyOn(testingSitesService, 'createOrUpdateTestingSite').mockResolvedValue(expectedResult);
      expect(await testingSitesController.addTestingSite(mockParameters)).toBe(expectedResult);
    });
  });

  describe('registerCountyAsSiteless', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new CountyClaim();
      jest.spyOn(testingSitesService, 'registerCountyAsSiteless').mockResolvedValue(expectedResult);
      expect(await testingSitesController.registerCountyAsSiteless(mockParameters)).toBe(expectedResult);
    });
  });

  describe('validateLockdown', () => {
    it('should be undefiend', async () => {
      expect(await testingSitesController.validateLockdown(mockParameters)).toBeUndefined();
    });
  });

  describe('deleteValidatedLockdown', () => {
    it('should be undefiend', async () => {
      expect(await testingSitesController.deleteValidatedLockdown(mockParameters)).toBeUndefined();
    });
  });
});
