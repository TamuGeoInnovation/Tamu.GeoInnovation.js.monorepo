import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';

import { PhoneNumbersController } from './phone-numbers.controller';
import { PhoneNumbersService } from './phone-numbers.service';

jest.mock('./phone-numbers.service');

describe('PhoneNumbers Controller', () => {
  let service: PhoneNumbersService;
  let controller: PhoneNumbersController;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [PhoneNumbersService],
      controllers: [PhoneNumbersController]
    }).compile();
    service = module.get<PhoneNumbersService>(PhoneNumbersService);
    controller = module.get<PhoneNumbersController>(PhoneNumbersController);
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

  describe('getAllNumbers', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      service.repo = new Repository();
      jest.spyOn(service.repo, 'find').mockResolvedValue(expectedResult);
      expect(await controller.getAllNumbers()).toStrictEqual(expectedResult);
    });
  });
  describe('getPhoneNumbersForCounties', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(service, 'getPhoneNumbersForCounty').mockResolvedValue(expectedResult);
      expect(await controller.getPhoneNumbersForCounties(mockParameters)).toBe(expectedResult);
    });
  });
  describe('getPhoneNumbersForClaimInfo', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(service, 'getPhoneNumbersForClaimInfo').mockResolvedValue(expectedResult);
      expect(await controller.getPhoneNumbersForClaimInfo(mockParameters)).toBe(expectedResult);
    });
  });
  describe('storePhoneNumber', () => {
    it('should throw error', async () => {
      await expect(controller.storePhoneNumber(mockParameters)).rejects.toThrow();
    });
  });
});
