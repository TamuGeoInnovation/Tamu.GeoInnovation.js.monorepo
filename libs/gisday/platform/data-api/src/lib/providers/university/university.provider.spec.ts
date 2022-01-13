import { Test, TestingModule } from '@nestjs/testing';
import { UniversityProvider } from './university.provider';

describe('UniversityProvider', () => {
  let provider: UniversityProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UniversityProvider]
    }).compile();

    provider = module.get<UniversityProvider>(UniversityProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
