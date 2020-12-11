import { Test, TestingModule } from '@nestjs/testing';

import { DeleteResult, UpdateResult } from 'typeorm';

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
    it('should call service method updateScenario', async () => {
      const expectedResult = new UpdateResult();
      jest.spyOn(scenariosService, 'updateScenario').mockResolvedValue(expectedResult);
      expect(await scenariosController.update(mockParameters, mockParameters)).toBe(expectedResult);
    });
  });

  describe('delete', () => {
    it('should call service method deleteScenario', async () => {
      const expectedResult = new DeleteResult();
      jest.spyOn(scenariosService, 'deleteScenario').mockResolvedValue(expectedResult);
      expect(await scenariosController.delete(mockParameters)).toBe(expectedResult);
    });
  });
});
