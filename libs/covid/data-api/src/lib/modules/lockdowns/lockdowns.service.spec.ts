import { Test, TestingModule } from '@nestjs/testing';
import { LockdownsService } from './lockdowns.service';

describe('LockdownsService', () => {
  let service: LockdownsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LockdownsService],
    }).compile();

    service = module.get<LockdownsService>(LockdownsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
