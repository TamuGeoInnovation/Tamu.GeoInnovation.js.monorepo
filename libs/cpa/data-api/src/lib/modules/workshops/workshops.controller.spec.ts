import { Test, TestingModule } from '@nestjs/testing';

import { Workshop } from '@tamu-gisc/cpa/common/entities';

import { WorkshopsController } from './workshops.controller';
import { WorkshopsService } from './workshops.service';

jest.mock('./workshops.service');

describe('Workshops Controller', () => {
  let workshopsController: WorkshopsController;
  let workshopsService: WorkshopsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkshopsService],
      controllers: [WorkshopsController]
    }).compile();
    workshopsService = module.get<WorkshopsService>(WorkshopsService);
    workshopsController = module.get<WorkshopsController>(WorkshopsController);
  });

  const mockParameters = 'foobar';

  describe('Validation ', () => {
    it('controller should be defined', async () => {
      expect(workshopsController).toBeDefined();
    });
  });

  describe('addScenario', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(workshopsService, 'addNewScenario').mockResolvedValue(expectedResult);
      expect(await workshopsController.addScenario(mockParameters)).toBe(expectedResult);
    });
  });

  describe('deleteScenario', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new Workshop();
      jest.spyOn(workshopsService, 'deleteScen').mockResolvedValue(expectedResult);
      expect(await workshopsController.deleteScenario(mockParameters)).toBe(expectedResult);
    });
  });

  describe('getOne', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new Workshop();
      jest.spyOn(workshopsService, 'getOne').mockResolvedValue(expectedResult);
      expect(await workshopsController.getOne(mockParameters)).toBe(expectedResult);
    });
    it('should throw', async () => {
      const expectedResult = undefined;
      jest.spyOn(workshopsService, 'getOne').mockResolvedValue(expectedResult);
      await expect(workshopsController.getOne(mockParameters)).rejects.toThrow();
    });
  });

  describe('updateOne', () => {
    it('should return expectedResult', async () => {
      const serviceSpyOn = jest.spyOn(workshopsService, 'updateWorkshop');
      await workshopsController.updateOne(mockParameters, mockParameters);
      expect(serviceSpyOn).toBeCalled();
    });
  });

  describe('deleteOne', () => {
    it('should return expectedResult', async () => {
      const serviceSpyOn = jest.spyOn(workshopsService, 'deleteWorkshop');
      await workshopsController.deleteOne(mockParameters);
      expect(serviceSpyOn).toBeCalled();
    });
  });

  describe('getAll', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(workshopsService, 'getMany').mockResolvedValue(expectedResult);
      expect(await workshopsController.getAll()).toBe(expectedResult);
    });
  });
});
