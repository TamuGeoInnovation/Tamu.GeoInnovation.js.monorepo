import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Scenario } from '@tamu-gisc/cpa/common/entities';

import { ScenariosService } from './scenarios.service';

describe('ScenariosService', () => {
  let service: ScenariosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScenariosService, { provide: getRepositoryToken(Scenario), useClass: Repository }]
    }).compile();

    service = module.get<ScenariosService>(ScenariosService);
  });

  describe('Validation ', () => {
    it('service should be defined', async () => {
      expect(service).toBeDefined();
    });
  });
});
