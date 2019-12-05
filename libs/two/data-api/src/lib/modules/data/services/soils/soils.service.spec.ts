import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SoilsExpanded } from '@tamu-gisc/two/common';

import { SoilsService } from './soils.service';

describe('SoilsService', () => {
  let service: SoilsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SoilsService,
        {
          provide: getRepositoryToken(SoilsExpanded),
          useClass: Repository
        }
      ]
    }).compile();

    service = module.get<SoilsService>(SoilsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
