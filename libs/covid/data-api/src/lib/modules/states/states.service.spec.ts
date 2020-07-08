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

  describe('search', () => {
    /* Implementation Testing?
    it('should search', async () => {
      const mockParameter = 'foo';
      const expectedResult = [];
      jest.spyOn(stateMockRepo, 'find').mockResolvedValue(expectedResult);
      expect(await statesService.search(mockParameter)).toBe(expectedResult);
    });*/
  });
  describe('getStateByFips', () => {
    /* Implementation Testing?
    it('should getStateByFips', async () => {
      const mockParameter = 99;
      const expectedResult = new State();
      jest.spyOn(stateMockRepo, 'findOne').mockResolvedValue(expectedResult);
      expect(await statesService.getStateByFips(mockParameter)).toBe(expectedResult);
    });*/
  });
});
