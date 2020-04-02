import { Test, TestingModule } from '@nestjs/testing';
import { PhoneNumbersService } from './phone-numbers.service';

describe('PhoneNumbersService', () => {
  let service: PhoneNumbersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhoneNumbersService],
    }).compile();

    service = module.get<PhoneNumbersService>(PhoneNumbersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
