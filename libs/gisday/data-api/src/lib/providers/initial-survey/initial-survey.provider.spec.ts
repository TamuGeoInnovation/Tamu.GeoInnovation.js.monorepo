import { Test, TestingModule } from '@nestjs/testing';
import { InitialSurveyProvider } from './initial-survey.provider';

describe('InitialSurveyProvider', () => {
  let provider: InitialSurveyProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InitialSurveyProvider]
    }).compile();

    provider = module.get<InitialSurveyProvider>(InitialSurveyProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
