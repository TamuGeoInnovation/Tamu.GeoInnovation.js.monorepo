import { Test, TestingModule } from '@nestjs/testing';

import { UpdateResult, DeleteResult } from 'typeorm';

import { Response } from '@tamu-gisc/cpa/common/entities';

import { ResponsesController } from './responses.controller';
import { ResponsesService } from './responses.service';

jest.mock('./responses.service');

describe('Responses Controller', () => {
  let responsesService: ResponsesService;
  let responsesController: ResponsesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResponsesService],
      controllers: [ResponsesController]
    }).compile();
    responsesService = module.get<ResponsesService>(ResponsesService);
    responsesController = module.get<ResponsesController>(ResponsesController);
  });

  const mockParameters = 'foobar';

  describe('Validation ', () => {
    it('controller should be defined', async () => {
      expect(responsesController).toBeDefined();
    });
  });

  describe('getAllForScenarioAndWorkshop', () => {
    it('should call service method getAllForBoth', async () => {
      const expectedResult = [];
      jest.spyOn(responsesService, 'getAllForBoth').mockResolvedValue(expectedResult);
      expect(await responsesController.getAllForScenarioAndWorkshop(mockParameters)).toBe(expectedResult);
    });
  });

  describe('getOne', () => {
    it('should call service method getSpecific', async () => {
      const expectedResult = new Response();
      jest.spyOn(responsesService, 'getSpecific').mockResolvedValue(expectedResult);
      expect(await responsesController.getOne(mockParameters)).toBe(expectedResult);
    });

    it('should throw', async () => {
      const expectedResult = undefined;
      jest.spyOn(responsesService, 'getOne').mockResolvedValue(expectedResult);
      await expect(responsesController.getOne(mockParameters)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should call service method updateExisting', async () => {
      const expectedResult = new UpdateResult();
      jest.spyOn(responsesService, 'updateExisting').mockResolvedValue(expectedResult);
      expect(await responsesController.update(mockParameters, mockParameters)).toBe(expectedResult);
    });
  });

  describe('delete', () => {
    it('should call service method deleteExisting', async () => {
      const expectedResult = new DeleteResult();
      jest.spyOn(responsesService, 'deleteExisting').mockResolvedValue(expectedResult);
      expect(await responsesController.delete(mockParameters)).toBe(expectedResult);
    });
  });

  describe('getAll', () => {
    it('should call service method getMany', async () => {
      const expectedResult = [];
      jest.spyOn(responsesService, 'getMany').mockResolvedValue(expectedResult);
      expect(await responsesController.getAll()).toBe(expectedResult);
    });
  });

  describe('insert', () => {
    it('should call service method insertNew', async () => {
      const expectedResult = new Response();
      jest.spyOn(responsesService, 'insertNew').mockResolvedValue(expectedResult);
      expect(await responsesController.insert(mockParameters)).toBe(expectedResult);
    });
  });
});
