import { Test, TestingModule } from '@nestjs/testing';
import { UserClassProvider } from './user-class.provider';

describe('UserClassProvider', () => {
  let provider: UserClassProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserClassProvider]
    }).compile();

    provider = module.get<UserClassProvider>(UserClassProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
