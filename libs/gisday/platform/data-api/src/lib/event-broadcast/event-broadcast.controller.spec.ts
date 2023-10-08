import { Test, TestingModule } from '@nestjs/testing';
import { EventBroadcastController } from './event-broadcast.controller';
import { EventBroadcastService } from './event-broadcast.service';

describe('EventBroadcastController', () => {
  let controller: EventBroadcastController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventBroadcastController],
      providers: [EventBroadcastService]
    }).compile();

    controller = module.get<EventBroadcastController>(EventBroadcastController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
