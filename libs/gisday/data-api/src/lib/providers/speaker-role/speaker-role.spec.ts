import { Test, TestingModule } from '@nestjs/testing';
import { SpeakerRoleProvider } from './speaker-role.provider';

describe('SpeakerRoleProvider', () => {
  let provider: SpeakerRoleProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpeakerRoleProvider]
    }).compile();

    provider = module.get<SpeakerRoleProvider>(SpeakerRoleProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
