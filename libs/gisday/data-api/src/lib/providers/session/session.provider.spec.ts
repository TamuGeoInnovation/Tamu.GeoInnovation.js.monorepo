import { Test, TestingModule } from '@nestjs/testing';
import { SessionProvider } from './session.provider';

describe('SessionProvider', () => {
  let provider: SessionProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionProvider]
    }).compile();

    provider = module.get<SessionProvider>(SessionProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
