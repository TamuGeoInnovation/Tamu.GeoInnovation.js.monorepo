import { Test, TestingModule } from '@nestjs/testing';
import { UserInfoProvider } from './user-info.provider';

describe('UserInfoProvider', () => {
  let provider: UserInfoProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserInfoProvider]
    }).compile();

    provider = module.get<UserInfoProvider>(UserInfoProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
