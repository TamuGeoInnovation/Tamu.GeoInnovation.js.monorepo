import { Test, TestingModule } from '@nestjs/testing';
import { BearerTokenStrategy } from './bearer-strategy';

describe('BearerTokenStrategy', () => {
  let provider: BearerTokenStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BearerTokenStrategy]
    }).compile();

    provider = module.get<BearerTokenStrategy>(BearerTokenStrategy);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
