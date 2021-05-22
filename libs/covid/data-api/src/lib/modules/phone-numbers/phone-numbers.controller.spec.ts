import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';

import { PhoneNumbersController } from './phone-numbers.controller';
import { PhoneNumbersService } from './phone-numbers.service';

jest.mock('./phone-numbers.service');

describe('PhoneNumbers Controller', () => {
  let phoneNumbersService: PhoneNumbersService;
  let phoneNumbersController: PhoneNumbersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhoneNumbersService],
      controllers: [PhoneNumbersController]
    }).compile();
    phoneNumbersService = module.get<PhoneNumbersService>(PhoneNumbersService);
    phoneNumbersController = module.get<PhoneNumbersController>(PhoneNumbersController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const mockParameters = 'foobar';

  describe('Validation ', () => {
    it('controller should be defined', () => {
      expect(phoneNumbersController).toBeDefined();
    });
  });

  describe('getAllNumbers', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      phoneNumbersService.repo = new Repository();
      jest.spyOn(phoneNumbersService.repo, 'find').mockResolvedValue(expectedResult);
      expect(await phoneNumbersController.getAllNumbers()).toStrictEqual(expectedResult);
    });
  });
  describe('getPhoneNumbersForCounties', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(phoneNumbersService, 'getPhoneNumbersForCounty').mockResolvedValue(expectedResult);
      expect(await phoneNumbersController.getPhoneNumbersForCounties(mockParameters)).toBe(expectedResult);
    });
  });
  describe('getPhoneNumbersForClaimInfo', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(phoneNumbersService, 'getPhoneNumbersForClaimInfo').mockResolvedValue(expectedResult);
      expect(await phoneNumbersController.getPhoneNumbersForClaimInfo(mockParameters)).toBe(expectedResult);
    });
  });
  describe('storePhoneNumber', () => {
    it('should throw error', async () => {
      await expect(phoneNumbersController.storePhoneNumber(mockParameters)).rejects.toThrow();
    });
  });
});
