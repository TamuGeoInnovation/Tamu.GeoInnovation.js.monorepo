import { Test, TestingModule } from '@nestjs/testing';

import { BaseEntity, Repository } from 'typeorm';

import { BaseService } from './base.service';

describe('BaseService', () => {
  let baseService: BaseService<BaseEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BaseService, Repository]
    }).compile();

    baseService = module.get<BaseService<BaseEntity>>(BaseService);
  });

  describe('Validation ', () => {
    it('Service should be defined', () => {
      expect(baseService).toBeDefined();
    });
  });
});
