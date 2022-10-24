import { Test, TestingModule } from '@nestjs/testing';
import { CheckInController } from './check-in.controller';

describe('CheckIn Controller', () => {
  let controller: CheckInController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckInController]
    }).compile();

    controller = module.get<CheckInController>(CheckInController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
