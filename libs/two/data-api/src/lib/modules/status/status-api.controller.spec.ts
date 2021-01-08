import { Test, TestingModule } from '@nestjs/testing';

import { StatusAPIController } from './status-api.controller';
import { StatusAPIService } from './status-api.service';

describe('Status API Controller', () => {
  let controller: StatusAPIController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusAPIController],
      providers: [StatusAPIService]
    }).compile();

    controller = module.get<StatusAPIController>(StatusAPIController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
