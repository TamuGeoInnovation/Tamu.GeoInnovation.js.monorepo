import { Test, TestingModule } from '@nestjs/testing';
import { LockdownsController } from './lockdowns.controller';

describe('Lockdowns Controller', () => {
  let controller: LockdownsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LockdownsController],
    }).compile();

    controller = module.get<LockdownsController>(LockdownsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
