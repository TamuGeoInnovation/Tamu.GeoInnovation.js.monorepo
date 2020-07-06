import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';

import { TestingSite, CountyClaim } from '@tamu-gisc/covid/common/entities';

import { TestingSitesController } from './testing-sites.controller';
import { TestingSitesService } from './testing-sites.service';
import { CountyClaimsService } from '../county-claims/county-claims.service';

jest.mock('./testing-sites.service');
jest.mock('../county-claims/county-claims.service');

describe('TestingSitesController', () => {
  let testingSitesservice: TestingSitesService;
  let countyClaimsService: CountyClaimsService;
  let module: TestingModule;
  let controller: TestingSitesController;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [TestingSitesService, CountyClaimsService],
      controllers: [TestingSitesController]
    }).compile();
    testingSitesservice = module.get<TestingSitesService>(TestingSitesService);
    countyClaimsService = module.get<CountyClaimsService>(CountyClaimsService);
    controller = module.get<TestingSitesController>(TestingSitesController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const mockParameters = 'foobar';

  describe('Validation ', () => {
    it('controller should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('getValidated', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      testingSitesservice.repo = new Repository();
      jest.spyOn(testingSitesservice.repo, 'find').mockResolvedValue(expectedResult);
      expect(await controller.getValidated()).toStrictEqual(expectedResult);
    });
  });

  describe('getDetailsForSite', () => {
    it('should return expectedResult', async () => {
      const expectedResult = undefined;
      jest.spyOn(testingSitesservice, 'getSiteAndLatestInfo').mockResolvedValue(expectedResult);
      expect(await controller.getDetailsForSite(mockParameters)).toBe(expectedResult);
    });
  });

  describe('getInfosForSite', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(testingSitesservice, 'getInfosForSite').mockResolvedValue(expectedResult);
      expect(await controller.getInfosForSite(mockParameters)).toMatchObject(expectedResult);
    });
  });

  describe('getTestingSitesSortedByCounty', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(testingSitesservice, 'getTestingSitesSortedByCounty').mockResolvedValue(expectedResult);
      expect(await controller.getTestingSitesSortedByCounty()).toStrictEqual(expectedResult);
    });
  });

  describe('getSitesByCounty', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(testingSitesservice, 'getSitesForCounty').mockResolvedValue(expectedResult);
      expect(await controller.getSitesByCounty(mockParameters)).toStrictEqual(expectedResult);
    });
  });

  describe('getSitesForUser', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(testingSitesservice, 'getSitesForUser').mockResolvedValue(expectedResult);
      expect(await controller.getSitesForUser(mockParameters)).toStrictEqual(expectedResult);
    });
  });

  describe('getTestingSitesAdmin', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(testingSitesservice, 'getTestingSitesAdmin').mockResolvedValue(expectedResult);
      expect(await controller.getTestingSitesAdmin(mockParameters)).toMatchObject(expectedResult);
    });

    it('should handle Error thrown from service.getTestingSitesAdmin', async () => {
      const expectedResult = {
        message: '',
        status: 500,
        success: false
      };
      jest.spyOn(testingSitesservice, 'getTestingSitesAdmin').mockImplementation(() => {
        throw new Error();
      });
      expect(await controller.getTestingSitesAdmin(mockParameters)).toStrictEqual(expectedResult);
    });
  });

  describe('addTestingSite', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new TestingSite();
      jest.spyOn(testingSitesservice, 'createOrUpdateTestingSite').mockResolvedValue(expectedResult);
      expect(await controller.addTestingSite(mockParameters)).toBe(expectedResult);
    });
  });

  describe('registerCountyAsSiteless', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new CountyClaim();
      jest.spyOn(testingSitesservice, 'registerCountyAsSiteless').mockResolvedValue(expectedResult);
      expect(await controller.registerCountyAsSiteless(mockParameters)).toBe(expectedResult);
    });
  });

  describe('validateLockdown', () => {
    it('should be undefiend', async () => {
      expect(await controller.validateLockdown(mockParameters)).toBeUndefined();
    });
  });

  describe('deleteValidatedLockdown', () => {
    it('should be undefiend', async () => {
      expect(await controller.deleteValidatedLockdown(mockParameters)).toBeUndefined();
    });
  });
});
