import { Test, TestingModule } from '@nestjs/testing';
import { StaticAccountService } from './account.service';

describe('AccountService', () => {
  let service: StaticAccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StaticAccountService]
    }).compile();

    service = module.get<StaticAccountService>(StaticAccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
