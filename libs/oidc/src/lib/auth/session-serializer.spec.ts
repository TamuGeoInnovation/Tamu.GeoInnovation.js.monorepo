import { Test, TestingModule } from '@nestjs/testing';
import { SessionSerializer } from './session-serializer';

describe('SessionSerializer', () => {
  let provider: SessionSerializer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionSerializer],
    }).compile();

    provider = module.get<SessionSerializer>(SessionSerializer);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
