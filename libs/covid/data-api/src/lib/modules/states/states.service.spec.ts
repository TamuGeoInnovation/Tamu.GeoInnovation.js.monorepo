import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { State } from '@tamu-gisc/covid/common/entities';

import { StatesService } from './states.service';

describe('StatesService', () => {
  let statesService: StatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatesService, { provide: getRepositoryToken(State), useClass: Repository }]
    }).compile();
    statesService = module.get<StatesService>(StatesService);
  });

  describe('Validation ', () => {
    it('Service should be defined', () => {
      expect(statesService).toBeDefined();
    });
  });
});
