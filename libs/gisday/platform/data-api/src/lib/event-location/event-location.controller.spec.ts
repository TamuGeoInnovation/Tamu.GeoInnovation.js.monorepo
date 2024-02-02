import { Test, TestingModule } from '@nestjs/testing';
import { EventLocationController } from './event-location.controller';
import { EventLocationService } from './event-location.service';

describe('EventLocationController', () => {
  let controller: EventLocationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventLocationController],
      providers: [EventLocationService]
    }).compile();

    controller = module.get<EventLocationController>(EventLocationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
