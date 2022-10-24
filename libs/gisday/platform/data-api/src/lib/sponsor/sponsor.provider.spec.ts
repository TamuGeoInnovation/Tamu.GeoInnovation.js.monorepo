import { Test, TestingModule } from '@nestjs/testing';
import { SponsorProvider } from './sponsor.provider';

describe('SponsorProvider', () => {
  let provider: SponsorProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SponsorProvider]
    }).compile();

    provider = module.get<SponsorProvider>(SponsorProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
