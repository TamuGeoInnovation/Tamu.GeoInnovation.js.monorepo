import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository, DeleteResult, UpdateResult } from 'typeorm';

import { Scenario } from '@tamu-gisc/cpa/common/entities';

import { ScenariosController } from './scenarios.controller';
import { ScenariosService } from './scenarios.service';

jest.mock('./scenarios.service');

describe('Scenarios Controller', () => {
  let scenariosService: ScenariosService;
  let scenariosController: ScenariosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScenariosService],
      controllers: [ScenariosController]
    }).compile();
    scenariosService = module.get<ScenariosService>(ScenariosService);
    scenariosController = module.get<ScenariosController>(ScenariosController);
  });

  const mockParameters = 'foobar';

  describe('Validation ', () => {
    it('controller should be defined', async () => {
      expect(scenariosController).toBeDefined();
    });
  });

  describe('update', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new UpdateResult();
      jest.spyOn(scenariosService, 'updateScenario').mockResolvedValue(expectedResult);
      expect(await scenariosController.update(mockParameters, mockParameters)).toBe(expectedResult);
    });
  });

  describe('delete', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new DeleteResult();
      jest.spyOn(scenariosService, 'deleteScenario').mockResolvedValue(expectedResult);
      expect(await scenariosController.delete(mockParameters)).toBe(expectedResult);
    });
  });
});
