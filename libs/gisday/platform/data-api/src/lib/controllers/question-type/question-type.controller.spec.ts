import { Test, TestingModule } from '@nestjs/testing';
import { QuestionTypeController } from './question-type.controller';

describe('QuestionType Controller', () => {
  let controller: QuestionTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionTypeController],
    }).compile();

    controller = module.get<QuestionTypeController>(QuestionTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
