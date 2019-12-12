import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WeatherfluxExpanded } from '@tamu-gisc/two/common';

import { WeatherfluxService } from './weatherflux.service';

describe('WeatherfluxService', () => {
  let service: WeatherfluxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherfluxService,
        {
          provide: getRepositoryToken(WeatherfluxExpanded),
          useClass: Repository
        }
      ]
    }).compile();

    service = module.get<WeatherfluxService>(WeatherfluxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
