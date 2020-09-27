import { Test, TestingModule } from '@nestjs/testing';
import { CheckIn } from './check-in';

describe('CheckIn', () => {
  let provider: CheckIn;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CheckIn],
    }).compile();

    provider = module.get<CheckIn>(CheckIn);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
