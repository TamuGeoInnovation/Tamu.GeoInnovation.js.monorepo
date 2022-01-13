import { Test, TestingModule } from '@nestjs/testing';
import { BaseProvider } from './base-provider';

describe('BaseProvider', () => {
  let provider: BaseProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BaseProvider],
    }).compile();

    provider = module.get<BaseProvider>(BaseProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
