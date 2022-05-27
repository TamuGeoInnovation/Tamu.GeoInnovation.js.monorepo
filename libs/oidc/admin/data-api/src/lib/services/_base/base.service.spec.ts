import { Test, TestingModule } from '@nestjs/testing';
import { BaseService } from './base.service';

describe('BaseService', <T>() => {
  let service: BaseService<T>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BaseService]
    }).compile();

    service = module.get<BaseService<T>>(BaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
