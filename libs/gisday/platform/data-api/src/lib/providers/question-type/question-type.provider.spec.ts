import { Test, TestingModule } from '@nestjs/testing';
import { QuestionTypeProvider } from './question-type.provider';

describe('QuestionType', () => {
  let provider: QuestionTypeProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuestionTypeProvider]
    }).compile();

    provider = module.get<QuestionTypeProvider>(QuestionTypeProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
