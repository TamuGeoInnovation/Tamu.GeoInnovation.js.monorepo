import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Response } from '@tamu-gisc/cpa/common/entities';

import { ResponsesService } from './responses.service';

jest.mock('../base/base.service');

describe('ResponsesService', () => {
  let responsesService: ResponsesService;
  let responsesRepository: Repository<Response>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResponsesService,
        {
          provide: getRepositoryToken(Response),
          useValue: {
            update: jest.fn().mockResolvedValue(true),
            delete: jest.fn().mockResolvedValue(true)
          }
        }
      ]
    }).compile();

    responsesService = module.get<ResponsesService>(ResponsesService);
    responsesRepository = module.get(getRepositoryToken(Response));
  });

  describe('Validation ', () => {
    it('service should be defined', async () => {
      expect(responsesService).toBeDefined();
    });
  });

  describe('getSpecific', () => {
    it('should return call repo.update, and should accept IResponseRequestPayload type as mock parameters ', async () => {
      const mockparameter = {
        scenarioGuid: '',
        workshopGuid: '',
        shapes: {}
      };
      const jestSpy = jest.spyOn(responsesService, 'getOne').mockResolvedValue(new Response());
      responsesService.getSpecific(mockparameter);
      expect(jestSpy).toHaveBeenCalled();
    });
  });

  describe('updateExisting', () => {
    it('should return call repo.update, and should accept IResponseRequestPayload type as mock parameters ', async () => {
      const mockparameter = {
        scenarioGuid: '',
        workshopGuid: '',
        shapes: {}
      };
      await responsesService.updateExisting(mockparameter, mockparameter);
      expect(responsesRepository.update).toHaveBeenCalled();
    });
  });

  describe('deleteExisting', () => {
    it('should return call repo.delete, and should accept IResponseRequestPayload type as mock parameter ', async () => {
      const mockparameter = {
        scenarioGuid: '',
        workshopGuid: '',
        shapes: {}
      };

      await responsesService.deleteExisting(mockparameter);
      expect(responsesRepository.delete).toHaveBeenCalled();
    });
  });

  describe('insertNew', () => {
    it('should return call repo.update, and should accept IResponseRequestPayload type as mock parameters ', async () => {
      const mockparameter = {
        scenarioGuid: '',
        workshopGuid: '',
        shapes: {}
      };

      jest.spyOn(responsesService, 'getOne').mockResolvedValue(new Response());
      await expect(responsesService.insertNew(mockparameter)).rejects.toThrowError();
    });
  });
});
