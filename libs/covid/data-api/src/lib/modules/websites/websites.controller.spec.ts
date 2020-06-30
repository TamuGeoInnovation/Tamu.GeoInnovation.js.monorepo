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

  describe('Get Websites for County', () => {
    it('should return expected Result', async () => {
      const expectedResult = { status: 0, success: true, message: 'yeet' };
      const mockEmailToSatisfyParameters = 'yeet';
      jest.spyOn(service, 'getWebsitesForCounty').mockResolvedValue(expectedResult);
      expect(await controller.getWebsitesForCounty(mockEmailToSatisfyParameters)).toBe(expectedResult);
    });
  });

  describe('Get Websites for Claim Info', () => {
    it('should return expected Result', async () => {
      const expectedResult = [];
      const mockEmailToSatisfyParameters = 'yeet';
      jest.spyOn(service, 'getWebsitesForClaimInfo').mockResolvedValue(expectedResult);
      expect(await controller.getWebsitesForClaimInfo(mockEmailToSatisfyParameters)).toBe(expectedResult);
    });
  });

  describe('Store Phone Number', () => {
    it('should throw error', async (done) => {
      await controller
        .storePhoneNumber(undefined)
        .then(() => done.fail(''))
        .catch((error) => {
          expect(error.message).toStrictEqual({ message: 'Not implemented', status: 501, success: false });
          done();
        });
    });
  });
});
