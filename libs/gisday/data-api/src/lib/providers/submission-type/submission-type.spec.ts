import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionType } from './submission-type';

describe('SubmissionType', () => {
  let provider: SubmissionType;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubmissionType],
    }).compile();

    provider = module.get<SubmissionType>(SubmissionType);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
