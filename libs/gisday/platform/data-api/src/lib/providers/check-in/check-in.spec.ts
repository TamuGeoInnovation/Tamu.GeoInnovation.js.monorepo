import { Test, TestingModule } from '@nestjs/testing';
import { CheckInProvider } from './check-in.provider';

describe('CheckInProvider', () => {
  let provider: CheckInProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CheckInProvider]
    }).compile();

    provider = module.get<CheckInProvider>(CheckInProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
