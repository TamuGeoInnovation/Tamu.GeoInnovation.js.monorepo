import { Test, TestingModule } from '@nestjs/testing';
import { UserRsvpProvider } from './user-rsvp.provider';

describe('UserRsvpProvider', () => {
  let provider: UserRsvpProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserRsvpProvider]
    }).compile();

    provider = module.get<UserRsvpProvider>(UserRsvpProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
