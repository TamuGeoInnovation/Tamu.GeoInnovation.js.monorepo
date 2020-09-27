import { Test, TestingModule } from '@nestjs/testing';
import { UserClass } from './user-class';

describe('UserClass', () => {
  let provider: UserClass;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserClass],
    }).compile();

    provider = module.get<UserClass>(UserClass);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
