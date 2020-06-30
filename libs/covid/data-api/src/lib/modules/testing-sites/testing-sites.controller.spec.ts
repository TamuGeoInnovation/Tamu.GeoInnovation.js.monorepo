import { Test, TestingModule } from '@nestjs/testing';

import { TestingSitesController } from './testing-sites.controller';
import { TestingSitesService } from './testing-sites.service';
import { CountyClaimsService } from '../county-claims/county-claims.service';
import { TestingSiteInfo, TestingSite, EntityToValue, EntityValue } from '@tamu-gisc/covid/common/entities';

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

  describe('getDetailsForSite', () => {
    it('should return expected Result', async () => {
      jest.spyOn(testingSitesservice, 'getSiteAndLatestInfo').mockResolvedValue(undefined);
      expect(await controller.getDetailsForSite({})).toBe(undefined);
    });
  });

  describe('getInfosForSite', () => {
    it('should return expected Result', async () => {});
  });

  describe('getTestingSitesSortedByCounty', () => {
    it('should return expected Result', async () => {});
  });
  describe('getSitesByCounty', () => {
    it('should return expected Result', async () => {});
  });
  describe('getSitesForUser', () => {
    it('should return expected Result', async () => {});
  });

  describe('addTestingSite', () => {
    it('should return expected Result', async () => {});
  });

  describe('registerCountyAsSiteless', () => {
    it('should return expected Result', async () => {});
  });
});
