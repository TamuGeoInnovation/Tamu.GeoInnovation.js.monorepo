import { Test, TestingModule } from '@nestjs/testing';
import { AccessToken } from './access-token';

describe('AccessToken', () => {
  let provider: AccessToken;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessToken],
    }).compile();

    provider = module.get<AccessToken>(AccessToken);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
