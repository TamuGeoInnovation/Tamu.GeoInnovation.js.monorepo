import { Test, TestingModule } from '@nestjs/testing';

import { PhoneNumbersController } from './phone-numbers.controller';
import { PhoneNumbersService } from './phone-numbers.service';
import { Repository } from 'typeorm';

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
  describe('getPhoneNumbersForCounties', () => {
    it('should return expected Result', async () => {
      const expectedValue = [];
      jest.spyOn(service, 'getPhoneNumbersForCounty').mockResolvedValue(expectedValue);
      expect(await controller.getPhoneNumbersForCounties('yeet')).toBe(expectedValue);
    });
  });
  describe('getPhoneNumbersForClaimInfo', () => {
    it('should return expected Result', async () => {
      const expectedValue = [];
      jest.spyOn(service, 'getPhoneNumbersForClaimInfo').mockResolvedValue(expectedValue);
      expect(await controller.getPhoneNumbersForClaimInfo('yeet')).toBe(expectedValue);
    });
  });
});
