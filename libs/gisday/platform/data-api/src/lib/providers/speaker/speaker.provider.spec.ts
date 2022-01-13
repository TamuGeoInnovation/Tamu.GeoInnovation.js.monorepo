import { Test, TestingModule } from '@nestjs/testing';
import { SpeakerProvider } from './speaker.provider';

describe('SpeakerProvider', () => {
  let provider: SpeakerProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpeakerProvider]
    }).compile();

    provider = module.get<SpeakerProvider>(SpeakerProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
