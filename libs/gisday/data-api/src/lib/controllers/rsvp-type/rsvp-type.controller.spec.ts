import { Test, TestingModule } from '@nestjs/testing';
import { RsvpTypeController } from './rsvp-type.controller';

describe('RsvpType Controller', () => {
  let controller: RsvpTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RsvpTypeController],
    }).compile();

    controller = module.get<RsvpTypeController>(RsvpTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
