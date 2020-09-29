import { Test, TestingModule } from '@nestjs/testing';
import { RsvpTypeProvider } from './rsvp-type.provider';

describe('RsvpTypeProvider', () => {
  let provider: RsvpTypeProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RsvpTypeProvider]
    }).compile();

    provider = module.get<RsvpTypeProvider>(RsvpTypeProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
