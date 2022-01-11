import { Test, TestingModule } from '@nestjs/testing';
import { AccessTokenService } from './access-token.service';

describe('AccessTokenService', () => {
  let provider: AccessTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessTokenService]
    }).compile();

    provider = module.get<AccessTokenService>(AccessTokenService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
