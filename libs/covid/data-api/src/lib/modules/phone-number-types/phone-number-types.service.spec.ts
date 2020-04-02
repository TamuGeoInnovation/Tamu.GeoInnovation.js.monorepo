import { Test, TestingModule } from '@nestjs/testing';
import { PhoneNumberTypesService } from './phone-number-types.service';

describe('PhoneNumberTypesService', () => {
  let service: PhoneNumberTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhoneNumberTypesService],
    }).compile();

    service = module.get<PhoneNumberTypesService>(PhoneNumberTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
