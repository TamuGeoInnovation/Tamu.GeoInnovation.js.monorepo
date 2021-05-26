import { Test, TestingModule } from '@nestjs/testing';
import { UserSubmissionProvider } from './user-submission.provider';

describe('UserSubmissionProvider', () => {
  let provider: UserSubmissionProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserSubmissionProvider]
    }).compile();

    provider = module.get<UserSubmissionProvider>(UserSubmissionProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
