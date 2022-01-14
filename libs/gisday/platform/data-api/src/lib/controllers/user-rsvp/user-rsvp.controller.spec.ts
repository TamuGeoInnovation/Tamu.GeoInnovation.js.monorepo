import { Test, TestingModule } from '@nestjs/testing';
import { UserRsvpController } from './user-rsvp.controller';

describe('UserRsvp Controller', () => {
  let controller: UserRsvpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserRsvpController],
    }).compile();

    controller = module.get<UserRsvpController>(UserRsvpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
