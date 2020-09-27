import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionTypeProvider } from './submission-type.provider';

describe('SubmissionTypeProvider', () => {
  let provider: SubmissionTypeProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubmissionTypeProvider]
    }).compile();

    provider = module.get<SubmissionTypeProvider>(SubmissionTypeProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
