import { Test, TestingModule } from '@nestjs/testing';
import { SecretQuestionController } from './secret-question.controller';

describe('SecretQuestion Controller', () => {
  let controller: SecretQuestionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SecretQuestionController],
    }).compile();

    controller = module.get<SecretQuestionController>(SecretQuestionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
