import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FieldCategory, CategoryValue, County, CountyClaim, CountyClaimInfo } from '@tamu-gisc/covid/common/entities';

import { PhoneNumbersService } from './phone-numbers.service';

describe('PhoneNumbersService', () => {
  let phoneNumbersService: PhoneNumbersService;
  let FieldCategoryMock: Repository<FieldCategory>;
  let CategoryValueMock: Repository<CategoryValue>;
  let CountyMock: Repository<County>;
  let CountyClaimMock: Repository<CountyClaim>;
  let CountyClaimInfoMock: Repository<CountyClaimInfo>;

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
    FieldCategoryMock = module.get(getRepositoryToken(FieldCategory));
    CategoryValueMock = module.get(getRepositoryToken(CategoryValue));
    CountyMock = module.get(getRepositoryToken(County));
    CountyClaimMock = module.get(getRepositoryToken(CountyClaim));
    CountyClaimInfoMock = module.get(getRepositoryToken(CountyClaimInfo));
  });
  describe('Validation ', () => {
    it('Service should be defined', () => {
      expect(phoneNumbersService).toBeDefined();
    });
  });
  /*describe('getPhoneNumbersForCounty', () => {
    it('should handle catagorey inputs ', async () => {
      expect(await service.getPhoneNumbersForCounty(undefined)).toMatchObject({
        status: 400,
        success: false,
        message: 'Invalid county fips'
      });
    });
    it('should handle catagorey inputs ', async () => {
      expect(await service.getPhoneNumbersForCounty('undefined')).toMatchObject({
        status: 400,
        success: false,
        message: 'Invalid county fips'
      });
    });
    it('should handle catagorey inputs ', async () => {
      expect(await service.getPhoneNumbersForCounty(9)).toMatchObject({
        status: 400,
        success: false,
        message: 'Invalid county fips'
      });
    });
  });
  describe('getPhoneNumbersForClaimInfo', () => {
    it('should handle catagorey inputs ', async () => {
      expect(await service.getPhoneNumbersForClaimInfo(undefined)).toMatchObject({
        status: 400,
        success: false,
        message: 'Invalid county fips'
      });
    });
  });*/
});
