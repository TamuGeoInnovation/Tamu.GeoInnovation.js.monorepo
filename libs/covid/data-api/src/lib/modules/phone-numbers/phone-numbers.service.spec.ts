import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FieldCategory, CategoryValue, County, CountyClaim, CountyClaimInfo } from '@tamu-gisc/covid/common/entities';

import { PhoneNumbersService } from './phone-numbers.service';

describe('PhoneNumbersService', () => {
  let phoneNumbersService: PhoneNumbersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhoneNumbersService,
        { provide: getRepositoryToken(FieldCategory), useClass: Repository },
        { provide: getRepositoryToken(CategoryValue), useClass: Repository },
        { provide: getRepositoryToken(County), useClass: Repository },
        { provide: getRepositoryToken(CountyClaim), useClass: Repository },
        { provide: getRepositoryToken(CountyClaimInfo), useClass: Repository }
      ]
    }).compile();

    phoneNumbersService = module.get<PhoneNumbersService>(PhoneNumbersService);
  });
  describe('Validation ', () => {
    it('Service should be defined', () => {
      expect(phoneNumbersService).toBeDefined();
    });
  });
  describe('getPhoneNumbersForCounty', () => {
    it('should return error message for undefined mockParameter', async () => {
      const mockParameter = undefined;
      const expectedResult = {
        status: 400,
        success: false,
        message: 'Invalid county fips'
      };
      expect(await phoneNumbersService.getPhoneNumbersForCounty(mockParameter)).toMatchObject(expectedResult);
    });

    it('should return error message for undefined string mockParameter ', async () => {
      const mockParameter = 'undefined';
      const expectedResult = {
        status: 400,
        success: false,
        message: 'Invalid county fips'
      };
      expect(await phoneNumbersService.getPhoneNumbersForCounty(mockParameter)).toMatchObject(expectedResult);
    });

    it('should return error message for number mockParameter ', async () => {
      const mockParameter = 9;
      const expectedResult = {
        status: 400,
        success: false,
        message: 'Invalid county fips'
      };
      expect(await phoneNumbersService.getPhoneNumbersForCounty(mockParameter)).toMatchObject(expectedResult);
    });
  });

  describe('getPhoneNumbersForClaimInfo', () => {
    it('should return error message for undefined mockParameter  ', async () => {
      const mockParameter = undefined;
      const expectedResult = {
        status: 400,
        success: false,
        message: 'Invalid county fips'
      };
      expect(await phoneNumbersService.getPhoneNumbersForClaimInfo(mockParameter)).toMatchObject(expectedResult);
    });
  });
});
