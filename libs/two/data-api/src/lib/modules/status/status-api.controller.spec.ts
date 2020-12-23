import { Test, TestingModule } from '@nestjs/testing';
import { StatusAPIController } from './status-api.controller';

describe('Status API Controller', () => {
  let controller: StatusAPIController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusAPIController]
    }).compile();

    controller = module.get<StatusAPIController>(StatusAPIController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
