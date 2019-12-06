import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WeatherfluxExpanded, AncillaryExpanded, SoilsExpanded, ProFluxExpanded } from '@tamu-gisc/two/common';

import { DataController } from './data.controller';
import { AncillaryService } from './services/ancillary/ancillary.service';
import { SoilsService } from './services/soils/soils.service';
import { ProFluxService } from './services/proflux/proflux.service';
import { WeatherfluxService } from './services/weatherflux/weatherflux.service';

describe('Data Controller', () => {
  let controller: DataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataController],
      providers: [
        AncillaryService,
        SoilsService,
        ProFluxService,
        WeatherfluxService,
        {
          provide: getRepositoryToken(AncillaryExpanded),
          useClass: Repository
        },
        {
          provide: getRepositoryToken(SoilsExpanded),
          useClass: Repository
        },
        {
          provide: getRepositoryToken(ProFluxExpanded),
          useClass: Repository
        },
        {
          provide: getRepositoryToken(WeatherfluxExpanded),
          useClass: Repository
        }
      ]
    }).compile();

    controller = module.get<DataController>(DataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
