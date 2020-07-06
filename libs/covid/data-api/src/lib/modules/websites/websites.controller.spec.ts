import { Test, TestingModule } from '@nestjs/testing';

import { WebsitesController } from './websites.controller';
import { WebsitesService } from './websites.service';

jest.mock('../websites/websites.service');

describe('Websites Controller', () => {
  let service: WebsitesService;
  let module: TestingModule;
  let controller: WebsitesController;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [WebsitesService],
      controllers: [WebsitesController]
    }).compile();
    service = module.get<WebsitesService>(WebsitesService);
    controller = module.get<WebsitesController>(WebsitesController);
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

  describe('getWebsitesForCounty', () => {
    it('should return expectedResult', async () => {
      const expectedResult = { status: 0, success: true, message: 'foobar' };
      jest.spyOn(service, 'getWebsitesForCounty').mockResolvedValue(expectedResult);
      expect(await controller.getWebsitesForCounty(mockParameters)).toBe(expectedResult);
    });
  });

  describe('getWebsitesForClaimInfo', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(service, 'getWebsitesForClaimInfo').mockResolvedValue(expectedResult);
      expect(await controller.getWebsitesForClaimInfo(mockParameters)).toBe(expectedResult);
    });
  });

  describe('storePhoneNumber', () => {
    it('should throw error', async () => {
      await expect(controller.storePhoneNumber(undefined)).rejects.toThrow();
    });
  });
});
