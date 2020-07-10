import { Test, TestingModule } from '@nestjs/testing';
import { UserLogin } from './user-login.service';

describe('UserLogin', () => {
  let provider: UserLogin;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserLogin]
    }).compile();

    provider = module.get<UserLogin>(UserLogin);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
