import { Test, TestingModule } from '@nestjs/testing';

import { BaseEntity, Repository } from 'typeorm';

import { BaseService } from './base.service';

describe('BaseService', () => {
  let service: BaseService<BaseEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BaseService, Repository]
    }).compile();

    service = module.get<BaseService<BaseEntity>>(BaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
