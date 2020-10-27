import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Workshop } from '@tamu-gisc/cpa/common/entities';

import { WorkshopsService } from './workshops.service';

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

  /*describe('addNewScenario', () => {
    it('should throw error, and should accept IResponseRequestPayload type as mock parameters ', async () => {
      const mockparameter = {
        scenarioGuid: '',
        workshopGuid: ''
      };
      jest.spyOn(workshopsRepository, 'findOne').mockResolvedValue(undefined);
      try {
        await workshopsService.addNewScenario(mockparameter);
      } catch (error) {
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('deleteScenario', () => {
    it('should throw error, and should accept IResponseRequestPayload type as mock parameters ', async () => {
      const mockparameter = {
        scenarioGuid: '',
        workshopGuid: ''
      };
      jest.spyOn(workshopsRepository, 'findOne').mockResolvedValue(undefined);
      try {
        await workshopsService.deleteScenario(mockparameter);
      } catch (error) {
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('getOne', () => {
    it('should throw error ', async () => {
      const mockparameter = {
        scenarioGuid: '',
        workshopGuid: ''
      };
      jest.spyOn(workshopsRepository, 'findOne').mockResolvedValue(undefined);
      try {
        await workshopsService.getOne(mockparameter);
      } catch (error) {
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('updateWorkshop', () => {
    it('should throw error, and should accept IResponseRequestPayload type as mock parameters ', async () => {
      const mockparameter = {
        guid: ''
      };
      jest.spyOn(workshopsRepository, 'update').mockRejectedValue(new Error());
      try {
        await workshopsService.updateWorkshop(mockparameter, '');
      } catch (error) {
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('deleteWorkshop', () => {
    it('should throw error, and should accept IResponseRequestPayload type as mock parameters ', async () => {
      const mockparameter = {
        guid: ''
      };
      jest.spyOn(workshopsRepository, 'delete').mockRejectedValue(new Error());
      try {
        await workshopsService.deleteWorkshop(mockparameter);
      } catch (error) {
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });*/
});
