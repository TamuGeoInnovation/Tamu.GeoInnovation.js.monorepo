import { Test, TestingModule } from '@nestjs/testing';
import { StatesController } from './states.controller';

describe('States Controller', () => {
  let controller: StatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatesController],
    }).compile();

    controller = module.get<StatesController>(StatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
