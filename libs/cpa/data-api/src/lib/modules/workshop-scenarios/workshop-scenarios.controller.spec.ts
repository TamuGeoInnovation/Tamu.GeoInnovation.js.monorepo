import { Test, TestingModule } from '@nestjs/testing';
import { WorkshopScenariosController } from './workshop-scenarios.controller';

describe('WorkshopScenarios Controller', () => {
  let controller: WorkshopScenariosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkshopScenariosController],
    }).compile();

    controller = module.get<WorkshopScenariosController>(WorkshopScenariosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
