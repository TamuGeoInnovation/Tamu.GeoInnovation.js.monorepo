import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldCategory, CategoryValue, County, CountyClaim, CountyClaimInfo } from '@tamu-gisc/covid/common/entities';


import { PhoneNumbersController } from './phone-numbers.controller';
import { PhoneNumbersService } from './phone-numbers.service';


describe('PhoneNumbers Controller', () => {
  let controller: PhoneNumbersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhoneNumbersService,
        {
          provide: getRepositoryToken(FieldCategory),
          useClass: Repository
        },
        PhoneNumbersService,
        {
          provide: getRepositoryToken(CategoryValue),
          useClass: Repository
        },
        PhoneNumbersService,
        {
          provide: getRepositoryToken(County),
          useClass: Repository
        },
        PhoneNumbersService,
        {
          provide: getRepositoryToken(CountyClaim),
          useClass: Repository
        },
        PhoneNumbersService,
        {
          provide: getRepositoryToken(CountyClaimInfo),
          useClass: Repository
        }
      ],

      controllers: [PhoneNumbersController]
    }).compile();

    controller = module.get<PhoneNumbersController>(PhoneNumbersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
