import { Test, TestingModule } from '@nestjs/testing';

import { WebsitesController } from './websites.controller';
import { WebsitesService } from './websites.service';

jest.mock('../websites/websites.service');

describe('Websites Controller', () => {
  let websitesService: WebsitesService;
  let websitesController: WebsitesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebsitesService],
      controllers: [WebsitesController]
    }).compile();
    websitesService = module.get<WebsitesService>(WebsitesService);
    websitesController = module.get<WebsitesController>(WebsitesController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const mockParameters = 'foobar';

  describe('Validation ', () => {
    it('controller should be defined', () => {
      expect(websitesController).toBeDefined();
    });
  });

  describe('getWebsitesForCounty', () => {
    it('should return expectedResult', async () => {
      const expectedResult = { status: 0, success: true, message: 'foobar' };
      jest.spyOn(websitesService, 'getWebsitesForCounty').mockResolvedValue(expectedResult);
      expect(await websitesController.getWebsitesForCounty(mockParameters)).toBe(expectedResult);
    });
  });

  describe('getWebsitesForClaimInfo', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(websitesService, 'getWebsitesForClaimInfo').mockResolvedValue(expectedResult);
      expect(await websitesController.getWebsitesForClaimInfo(mockParameters)).toBe(expectedResult);
    });
  });

  describe('storePhoneNumber', () => {
    it('should throw error', async () => {
      await expect(websitesController.storePhoneNumber(undefined)).rejects.toThrow();
    });
  });
});
