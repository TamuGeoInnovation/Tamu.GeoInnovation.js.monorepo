import { Test, TestingModule } from '@nestjs/testing';
import { StatService } from './stats.service';

describe('StatService', () => {
  let provider: StatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatService]
    }).compile();

    provider = module.get<StatService>(StatService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
