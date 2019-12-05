import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProFluxExpanded } from '@tamu-gisc/two/common';

import { ProFluxService } from './proflux.service';

describe('ProFluxService', () => {
  let service: ProFluxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProFluxService,
        {
          provide: getRepositoryToken(ProFluxExpanded),
          useClass: Repository
        }
      ]
    }).compile();

    service = module.get<ProFluxService>(ProFluxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
