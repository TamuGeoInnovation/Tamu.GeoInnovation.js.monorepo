import { Test, TestingModule } from '@nestjs/testing';
import { EventProvider } from './event.provider';

describe('EventProvider', () => {
  let provider: EventProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventProvider]
    }).compile();

    provider = module.get<EventProvider>(EventProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
