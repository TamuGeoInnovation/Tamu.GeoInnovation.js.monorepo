import { Test, TestingModule } from '@nestjs/testing';
import { InterventionsController } from './interventions.controller';

describe('Intervention Controller', () => {
  let controller: InterventionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InterventionsController],
    }).compile();

    controller = module.get<InterventionsController>(InterventionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
