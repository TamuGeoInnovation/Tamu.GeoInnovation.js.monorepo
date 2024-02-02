import { Test, TestingModule } from '@nestjs/testing';
import { EventLocationService } from './event-location.service';

describe('EventLocationService', () => {
  let service: EventLocationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventLocationService]
    }).compile();

    service = module.get<EventLocationService>(EventLocationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
