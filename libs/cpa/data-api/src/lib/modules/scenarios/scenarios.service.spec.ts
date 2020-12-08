import { Test, TestingModule } from '@nestjs/testing';
import { ScenariosService } from './scenarios.service';

describe('ScenariosService', () => {
  let service: ScenariosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScenariosService],
    }).compile();

    service = module.get<ScenariosService>(ScenariosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
