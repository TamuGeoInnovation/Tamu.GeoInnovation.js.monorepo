import { Test, TestingModule } from '@nestjs/testing';
import { MapController } from './map.controller';

describe('Map Controller', () => {
  let controller: MapController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MapController],
    }).compile();

    controller = module.get<MapController>(MapController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
