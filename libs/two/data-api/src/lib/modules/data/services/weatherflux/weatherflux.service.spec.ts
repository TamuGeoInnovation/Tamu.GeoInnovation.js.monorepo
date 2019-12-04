import { Test, TestingModule } from '@nestjs/testing';
import { WeatherfluxService } from './weatherflux.service';

describe('WeatherfluxService', () => {
  let service: WeatherfluxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WeatherfluxService],
    }).compile();

    service = module.get<WeatherfluxService>(WeatherfluxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
