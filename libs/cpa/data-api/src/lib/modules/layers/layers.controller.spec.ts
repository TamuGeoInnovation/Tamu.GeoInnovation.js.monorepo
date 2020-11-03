import { Test, TestingModule } from '@nestjs/testing';
import { LayersController } from './layers.controller';

describe('Layers Controller', () => {
  let controller: LayersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LayersController],
    }).compile();

    controller = module.get<LayersController>(LayersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
