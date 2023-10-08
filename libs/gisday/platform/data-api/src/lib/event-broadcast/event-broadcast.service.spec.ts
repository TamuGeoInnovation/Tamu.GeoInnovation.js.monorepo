import { Test, TestingModule } from '@nestjs/testing';
import { EventBroadcastService } from './event-broadcast.service';

describe('EventBroadcastService', () => {
  let service: EventBroadcastService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventBroadcastService]
    }).compile();

    service = module.get<EventBroadcastService>(EventBroadcastService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
