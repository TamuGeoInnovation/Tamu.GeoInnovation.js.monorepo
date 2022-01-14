import { Test, TestingModule } from '@nestjs/testing';

import { UserLoginService } from './user-login.service';

describe('UserLoginService', () => {
  let provider: UserLoginService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserLoginService]
    }).compile();

    provider = module.get<UserLoginService>(UserLoginService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
