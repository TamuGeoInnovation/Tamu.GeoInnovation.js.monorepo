import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Workshop } from '@tamu-gisc/cpa/common/entities';

import { WorkshopsService } from './workshops.service';
import { throwError } from 'rxjs';

jest.mock('../base/base.service');

describe('WorkshopsService', () => {
  let workshopsService: WorkshopsService;
  let workshopsRepository: Repository<Response>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkshopsService,
        {
          provide: getRepositoryToken(Workshop),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
          }
        }
      ]
    }).compile();

    workshopsService = module.get<WorkshopsService>(WorkshopsService);
    workshopsRepository = module.get(getRepositoryToken(Workshop));
  });

  describe('Validation ', () => {
    it('service should be defined', async () => {
      expect(workshopsService).toBeDefined();
    });
  });

  describe('addNewScenario', () => {
    it('should return call repo.update, and should accept IResponseRequestPayload type as mock parameters ', async () => {
      const mockparameter = {
        scenarioGuid: '',
        workshopGuid: ''
      };
      jest.spyOn(workshopsRepository, 'findOne').mockResolvedValue(undefined);
      await expect(workshopsService.addNewScenario(mockparameter)).rejects.toThrowError('Not Found');
    });
  });

  describe('deleteScen', () => {
    it('should return call repo.update, and should accept IResponseRequestPayload type as mock parameters ', async () => {
      const mockparameter = {
        scenarioGuid: '',
        workshopGuid: ''
      };
      jest.spyOn(workshopsRepository, 'findOne').mockResolvedValue(undefined);
      await expect(workshopsService.deleteScen(mockparameter)).rejects.toThrowError('Not Found');
    });
  });

  describe('updateWorkshop', () => {
    it('should return call repo.update, and should accept IResponseRequestPayload type as mock parameters ', async () => {
      const mockparameter = {
        guid: ''
      };
      jest.spyOn(workshopsRepository, 'update').mockRejectedValue(throwError);
      await expect(workshopsService.updateWorkshop(mockparameter, '')).rejects.toThrowError('Internal Server Error');
    });
  });

  describe('deleteWorkshop', () => {
    it('should return call repo.update, and should accept IResponseRequestPayload type as mock parameters ', async () => {
      const mockparameter = {
        guid: ''
      };
      jest.spyOn(workshopsRepository, 'delete').mockRejectedValue(throwError);
      await expect(workshopsService.deleteWorkshop('')).rejects.toThrowError('Internal Server Error');
    });
  });
});
