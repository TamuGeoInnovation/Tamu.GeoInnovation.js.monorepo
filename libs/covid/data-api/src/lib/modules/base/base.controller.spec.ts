import { Test, TestingModule } from '@nestjs/testing';

import { BaseEntity, Repository } from 'typeorm';

import { BaseController } from './base.controller';
import { BaseService } from './base.service';

describe('Base Controller', () => {
  let controller: BaseController<BaseEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BaseService, Repository],
      controllers: [BaseController]
    }).compile();

    controller = module.get<BaseController<BaseEntity>>(BaseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
