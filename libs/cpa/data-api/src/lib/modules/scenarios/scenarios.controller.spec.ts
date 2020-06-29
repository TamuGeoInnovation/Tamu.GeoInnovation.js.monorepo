import { Test, TestingModule } from '@nestjs/testing';
import { ScenariosController } from './scenarios.controller';

describe('Scenarios Controller', () => {
  let controller: ScenariosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScenariosController],
    }).compile();

    controller = module.get<ScenariosController>(ScenariosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
