import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Scenario } from '@tamu-gisc/cpa/common/entities';

import { ScenariosService } from './scenarios.service';

jest.mock('../base/base.service');

describe('ScenariosService', () => {
  let scenariosService: ScenariosService;
  let scenarioRepository: Repository<Scenario>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScenariosService,
        {
          provide: getRepositoryToken(Scenario),
          useValue: {
            update: jest.fn().mockResolvedValue(true),
            delete: jest.fn().mockResolvedValue(true)
          }
        }
      ]
    }).compile();

    scenariosService = module.get<ScenariosService>(ScenariosService);
    scenarioRepository = module.get(getRepositoryToken(Scenario));
  });

  describe('Validation ', () => {
    it('service should be defined', async () => {
      expect(scenariosService).toBeDefined();
    });
  });

  describe('updateExisting', () => {
    it('should return call repo.update, and should accept IResponseRequestPayload type as mock parameters ', async () => {
      const mockparameter = { layers: '' };
      const cat = await scenariosService.updateScenario(mockparameter, mockparameter);
      expect(scenarioRepository.update).toHaveBeenCalled();
    });
  });

  describe('deleteExisting', () => {
    it('should return call repo.delete, and should accept IResponseRequestPayload type as mock parameter ', async () => {
      const mockparameter = { layers: '' };
      const cat = await scenariosService.deleteScenario(mockparameter);
      expect(scenarioRepository.delete).toHaveBeenCalled();
    });
  });
});
