import { Test, TestingModule } from '@nestjs/testing';
import { ResponsesController } from './responses.controller';

describe('Responses Controller', () => {
  let controller: ResponsesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResponsesController],
    }).compile();

    controller = module.get<ResponsesController>(ResponsesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
