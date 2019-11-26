import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WeatherfluxExpanded } from '@tamu-gisc/two/common';

import { DataController } from './data.controller';
import { DataService } from './data.service';

describe('Data Controller', () => {
  let controller: DataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataController],
      providers: [
        DataService,
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
