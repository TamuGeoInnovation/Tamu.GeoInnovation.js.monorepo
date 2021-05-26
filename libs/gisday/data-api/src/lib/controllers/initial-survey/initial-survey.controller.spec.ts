import { Test, TestingModule } from '@nestjs/testing';
import { InitialSurveyController } from './initial-survey.controller';

describe('InitialSurvey Controller', () => {
  let controller: InitialSurveyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InitialSurveyController],
    }).compile();

    controller = module.get<InitialSurveyController>(InitialSurveyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
