import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Snapshot } from '@tamu-gisc/cpa/common/entities';

import { SnapshotsService } from './snapshots.service';

jest.mock('../base/base.service');

describe('SnapshotsService', () => {
  let scenariosService: SnapshotsService;
  let scenarioRepository: Repository<Snapshot>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SnapshotsService,
        {
          provide: getRepositoryToken(Snapshot),
          useValue: {
            update: jest.fn().mockResolvedValue(true),
            delete: jest.fn().mockResolvedValue(true)
          }
        }
      ]
    }).compile();

    scenariosService = module.get<SnapshotsService>(SnapshotsService);
    scenarioRepository = module.get(getRepositoryToken(Snapshot));
  });

  describe('Validation ', () => {
    it('service should be defined', async () => {
      expect(scenariosService).toBeDefined();
    });
  });

  describe('updateExisting', () => {
    it('should return call repo.update, and should accept IResponseRequestPayload type as mock parameters ', async () => {
      const mockparameter = { layers: [] };
      await scenariosService.updateSnapshot(mockparameter, mockparameter);
      expect(scenarioRepository.update).toHaveBeenCalled();
    });
  });

  describe('deleteExisting', () => {
    it('should return call repo.delete, and should accept IResponseRequestPayload type as mock parameter ', async () => {
      const mockparameter = { layers: [] };
      await scenariosService.deleteSnapshot(mockparameter);
      expect(scenarioRepository.delete).toHaveBeenCalled();
    });
  });
});
