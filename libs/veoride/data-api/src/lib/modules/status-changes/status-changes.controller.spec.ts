import { Test, TestingModule } from '@nestjs/testing';
import { StatusChangesController } from './status-changes.controller';

describe('StatusChanges Controller', () => {
  let controller: StatusChangesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusChangesController]
    }).compile();

    controller = module.get<StatusChangesController>(StatusChangesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
