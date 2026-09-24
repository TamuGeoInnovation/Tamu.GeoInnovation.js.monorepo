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

  // The controller methods take payload objects, not a string. `foobar` predates the
  // IWorkshopSnapshotPayload signatures.
  const mockParameters = { snapshotGuid: 'snapshot-guid', workshopGuid: 'workshop-guid' };

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
      // removeWorkshopSnapshot resolves IWorkshopExtractedSnapshots, whose `snapshots` are
      // Snapshot rather than WorkshopSnapshot, so a bare Workshop no longer satisfies it.
      const expectedResult = { ...new Workshop(), snapshots: [] } as unknown as Awaited<
        ReturnType<WorkshopsService['removeWorkshopSnapshot']>
      >;
      jest.spyOn(workshopsService, 'removeWorkshopSnapshot').mockResolvedValue(expectedResult);
      expect(await workshopsController.deleteSnapshot(mockParameters)).toBe(expectedResult);
    });
  });

  describe('getOne', () => {
    // The controller delegates to getWorkshop, not the BaseService getOne. The spec mocked
    // getOne, so the real getWorkshop ran against a jest.mock()'d service and returned
    // undefined.
    it('should call service method getWorkshop', async () => {
      const expectedResult = new Workshop();
      jest.spyOn(workshopsService, 'getWorkshop').mockResolvedValue(expectedResult);
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
