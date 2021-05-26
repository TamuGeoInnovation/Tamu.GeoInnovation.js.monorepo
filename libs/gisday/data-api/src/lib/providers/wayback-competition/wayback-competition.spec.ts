import { Test, TestingModule } from '@nestjs/testing';
import { WaybackCompetitionProvider } from './wayback-competition.provider';

describe('WaybackCompetitionProvider', () => {
  let provider: WaybackCompetitionProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WaybackCompetitionProvider]
    }).compile();

    provider = module.get<WaybackCompetitionProvider>(WaybackCompetitionProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
