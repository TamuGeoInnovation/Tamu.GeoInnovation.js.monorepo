import { Test, TestingModule } from '@nestjs/testing';
import { UserSubmission } from './user-submission';

describe('UserSubmission', () => {
  let provider: UserSubmission;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserSubmission],
    }).compile();

    provider = module.get<UserSubmission>(UserSubmission);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
