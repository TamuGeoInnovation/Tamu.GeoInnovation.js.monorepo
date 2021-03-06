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

  describe('addSnapshot', () => {
    it('should call service method addNewSnapshot', async () => {
      const expectedResult = [];
      jest.spyOn(workshopsService, 'addNewSnapshot').mockResolvedValue(expectedResult);
      expect(await workshopsController.addSnapshot(mockParameters)).toBe(expectedResult);
    });
  });

  describe('deleteSnapshot', () => {
    it('should call service method deleteSnapshot', async () => {
      const expectedResult = new Workshop();
      jest.spyOn(workshopsService, 'deleteSnapshot').mockResolvedValue(expectedResult);
      expect(await workshopsController.addSnapshot(mockParameters)).toBe(expectedResult);
    });
  });

  describe('getOne', () => {
    it('should call service method getOne', async () => {
      const expectedResult = new Workshop();
      jest.spyOn(workshopsService, 'getOne').mockResolvedValue(expectedResult);
      expect(await workshopsController.getOne(mockParameters)).toBe(expectedResult);
    });
  });

  describe('updateOne', () => {
    it('should call service method updateWorkshop', async () => {
      const serviceSpyOn = jest.spyOn(workshopsService, 'updateWorkshop');
      await workshopsController.updateOne(mockParameters, mockParameters);
      expect(serviceSpyOn).toBeCalled();
    });
  });

  describe('deleteOne', () => {
    it('should call service method deleteWorkshop', async () => {
      const serviceSpyOn = jest.spyOn(workshopsService, 'deleteWorkshop');
      await workshopsController.deleteOne(mockParameters);
      expect(serviceSpyOn).toBeCalled();
    });
  });

  describe('getAll', () => {
    it('should call service method getMany', async () => {
      const expectedResult = [];
      jest.spyOn(workshopsService, 'getMany').mockResolvedValue(expectedResult);
      expect(await workshopsController.getAll()).toBe(expectedResult);
    });
  });
});
