import { Test, TestingModule } from '@nestjs/testing';
import { WorkshopsController } from './workshops.controller';

describe('Workshops Controller', () => {
  let controller: WorkshopsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkshopsController],
    }).compile();

    controller = module.get<WorkshopsController>(WorkshopsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
