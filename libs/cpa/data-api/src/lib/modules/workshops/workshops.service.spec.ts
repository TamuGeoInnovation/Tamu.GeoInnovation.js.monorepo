import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Workshop } from '@tamu-gisc/cpa/common/entities';

import { WorkshopsService } from './workshops.service';

describe('WorkshopsService', () => {
  let service: WorkshopsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkshopsService, { provide: getRepositoryToken(Workshop), useClass: Repository }]
    }).compile();

    service = module.get<WorkshopsService>(WorkshopsService);
  });

  describe('Validation ', () => {
    it('service should be defined', async () => {
      expect(service).toBeDefined();
    });
  });
});
