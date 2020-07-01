import { Test, TestingModule } from '@nestjs/testing';

import { TestingSitesController } from './testing-sites.controller';
import { TestingSitesService } from './testing-sites.service';
import { CountyClaimsService } from '../county-claims/county-claims.service';

import { TestingSite, CountyClaim } from '@tamu-gisc/covid/common/entities';
import { Repository } from 'typeorm';

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

  describe('getValidated', () => {
    it('should return expected Result', async () => {
      testingSitesservice.repo = new Repository();
      jest.spyOn(testingSitesservice.repo, 'find').mockResolvedValue([]);
      expect(await controller.getValidated()).toStrictEqual([]);
    });
  });
  describe('getDetailsForSite', () => {
    it('should return expected Result', async () => {
      jest.spyOn(testingSitesservice, 'getSiteAndLatestInfo').mockResolvedValue(undefined);
      expect(await controller.getDetailsForSite({})).toBe(undefined);
    });
  });

  describe('getInfosForSite', () => {
    it('should return expected Result', async () => {
      const expectedResult = [];
      jest.spyOn(testingSitesservice, 'getInfosForSite').mockResolvedValue(expectedResult);
      expect(await controller.getInfosForSite(expectedResult)).toMatchObject(expectedResult);
    });
  });
  describe('getTestingSitesSortedByCounty', () => {
    it('should return expected Result', async () => {
      jest.spyOn(testingSitesservice, 'getTestingSitesSortedByCounty').mockResolvedValue([]);
      expect(await controller.getTestingSitesSortedByCounty()).toStrictEqual([]);
    });
  });
  describe('getSitesByCounty', () => {
    it('should return expected Result', async () => {
      jest.spyOn(testingSitesservice, 'getSitesForCounty').mockResolvedValue([]);
      expect(await controller.getSitesByCounty([])).toStrictEqual([]);
    });
  });
  describe('getSitesForUser', () => {
    it('should return expected Result', async () => {
      jest.spyOn(testingSitesservice, 'getSitesForUser').mockResolvedValue([]);
      expect(await controller.getSitesForUser([])).toStrictEqual([]);
    });
  });

  describe('getTestingSitesAdmin', () => {
    const expectedResult = [];
    it('should return expected Result', async () => {
      jest.spyOn(testingSitesservice, 'getTestingSitesAdmin').mockResolvedValue(expectedResult);
      expect(await controller.getTestingSitesAdmin(expectedResult)).toMatchObject(expectedResult);
    });

    it('should return expected Result', async () => {
      jest.spyOn(testingSitesservice, 'getTestingSitesAdmin').mockImplementation(() => {
        throw new Error();
      });
      expect(await controller.getTestingSitesAdmin(expectedResult)).toStrictEqual({
        message: '',
        status: 500,
        success: false
      });
    });
  });

  describe('addTestingSite', () => {
    it('should return expected Result', async () => {
      const expectedSomething = new TestingSite();
      jest.spyOn(testingSitesservice, 'createOrUpdateTestingSite').mockResolvedValue(expectedSomething);
      expect(await controller.addTestingSite(expectedSomething)).toBe(expectedSomething);
    });
  });

  describe('registerCountyAsSiteless', () => {
    it('should return expected Result', async () => {
      const expectedSomething = new CountyClaim();
      jest.spyOn(testingSitesservice, 'registerCountyAsSiteless').mockResolvedValue(expectedSomething);
      expect(await controller.registerCountyAsSiteless(expectedSomething)).toBe(expectedSomething);
    });
  });
  describe('validateLockdown', () => {
    it('should return expected Result', async () => {
      expect(await controller.validateLockdown('')).toBeUndefined();
    });
  });
  describe('deleteValidatedLockdown', () => {
    it('should return expected Result', async () => {
      expect(await controller.deleteValidatedLockdown('')).toBeUndefined();
    });
  });
});
