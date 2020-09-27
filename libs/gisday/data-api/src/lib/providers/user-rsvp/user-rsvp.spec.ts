import { Test, TestingModule } from '@nestjs/testing';
import { UserRsvp } from './user-rsvp';

describe('UserRsvp', () => {
  let provider: UserRsvp;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserRsvp],
    }).compile();

    provider = module.get<UserRsvp>(UserRsvp);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
