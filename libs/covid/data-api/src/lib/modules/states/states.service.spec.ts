import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { State } from '@tamu-gisc/covid/common/entities';

import { StatesService } from './states.service';

describe('StatesService', () => {
  let statesService: StatesService;
  let stateMockRepo: Repository<State>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatesService, { provide: getRepositoryToken(State), useClass: Repository }]
    }).compile();
    statesService = module.get<StatesService>(StatesService);
    stateMockRepo = module.get(getRepositoryToken(State));
  });

  describe('Validation ', () => {
    it('Service should be defined', () => {
      expect(statesService).toBeDefined();
    });
  });
});
