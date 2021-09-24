import { Test, TestingModule } from '@nestjs/testing';
import { TripsController } from './trips.controller';

describe('Trips Controller', () => {
  let controller: TripsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripsController],
    }).compile();

    controller = module.get<TripsController>(TripsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
