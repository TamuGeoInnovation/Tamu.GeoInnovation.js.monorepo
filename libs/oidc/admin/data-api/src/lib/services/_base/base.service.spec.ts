import { Test, TestingModule } from '@nestjs/testing';
import { BaseService } from './base.service';

describe('BaseService', () => {
  let service: BaseService<unknown>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BaseService]
    }).compile();

    service = module.get<BaseService<unknown>>(BaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
