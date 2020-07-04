import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FieldCategory, CategoryValue, County, CountyClaim, CountyClaimInfo } from '@tamu-gisc/covid/common/entities';

import { PhoneNumbersService } from './phone-numbers.service';

describe('PhoneNumbersService', () => {
  let service: PhoneNumbersService;
  let FieldCategoryMock: MockType<Repository<FieldCategory>>;
  let CategoryValueMock: MockType<Repository<CategoryValue>>;
  let CountyMock: MockType<Repository<County>>;
  let CountyClaimMock: MockType<Repository<CountyClaim>>;
  let CountyClaimInfoMock: MockType<Repository<CountyClaimInfo>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhoneNumbersService,
        { provide: getRepositoryToken(FieldCategory), useFactory: repositoryMockFactory },
        { provide: getRepositoryToken(CategoryValue), useFactory: repositoryMockFactory },
        { provide: getRepositoryToken(County), useFactory: repositoryMockFactory },
        { provide: getRepositoryToken(CountyClaim), useFactory: repositoryMockFactory },
        { provide: getRepositoryToken(CountyClaimInfo), useFactory: repositoryMockFactory }
      ]
    }).compile();

    service = module.get<PhoneNumbersService>(PhoneNumbersService);
    FieldCategoryMock = module.get(getRepositoryToken(FieldCategory));
    CategoryValueMock = module.get(getRepositoryToken(CategoryValue));
    CountyMock = module.get(getRepositoryToken(County));
    CountyClaimMock = module.get(getRepositoryToken(CountyClaim));
    CountyClaimInfoMock = module.get(getRepositoryToken(CountyClaimInfo));
  });

  describe('getPhoneNumbersForCounty', () => {
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
  });
});

// @ts-ignore
export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(() => ({
  findOne: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  save: jest.fn()
}));
export type MockType<T> = {
  [P in keyof T]: jest.Mock<{}>;
};
