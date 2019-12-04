import { Test, TestingModule } from '@nestjs/testing';
import { SoilsService } from './soils.service';

describe('SoilsService', () => {
  let service: SoilsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SoilsService],
    }).compile();

    service = module.get<SoilsService>(SoilsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
