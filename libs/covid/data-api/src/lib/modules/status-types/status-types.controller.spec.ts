import { Test, TestingModule } from '@nestjs/testing';
import { StatusTypesController } from './status-types.controller';

describe('StatusTypes Controller', () => {
  let controller: StatusTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusTypesController],
    }).compile();

    controller = module.get<StatusTypesController>(StatusTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
