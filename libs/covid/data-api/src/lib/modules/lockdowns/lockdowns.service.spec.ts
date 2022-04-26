import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  Lockdown,
  LockdownInfo,
  User,
  EntityStatus,
  County,
  CountyClaim,
  CountyClaimInfo,
  EntityValue,
  EntityToValue
} from '@tamu-gisc/covid/common/entities';

import { LockdownsService } from './lockdowns.service';
import { CountyClaimsService } from '../county-claims/county-claims.service';

describe('LockdownsService', () => {
  let lockdownsService: LockdownsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LockdownsService,
        CountyClaimsService,
        { provide: getRepositoryToken(Lockdown), useClass: Repository },
        { provide: getRepositoryToken(LockdownInfo), useClass: Repository },
        { provide: getRepositoryToken(User), useClass: Repository },
        { provide: getRepositoryToken(EntityStatus), useClass: Repository },
        { provide: getRepositoryToken(County), useClass: Repository },
        { provide: getRepositoryToken(CountyClaim), useClass: Repository },
        { provide: getRepositoryToken(CountyClaimInfo), useClass: Repository },
        { provide: getRepositoryToken(EntityValue), useClass: Repository },
        { provide: getRepositoryToken(EntityToValue), useClass: Repository }
      ]
    }).compile();
    lockdownsService = module.get<LockdownsService>(LockdownsService);
  });
  describe('Validation ', () => {
    it('Service should be defined', () => {
      expect(lockdownsService).toBeDefined();
    });
  });

  describe('getAllLockdownsForUser', () => {
    it('should return {} with mockParameter being Empty String ', async () => {
      const mockParameter = '';
      const expectedResult = {};
      await expect(lockdownsService.getAllLockdownsForUser(mockParameter)).toMatchObject(expectedResult);
    });
  });

  describe('getLockdownInfoForLockdown', () => {
    it('should throw error for undefined parameter ', async () => {
      const mockParameter = undefined;
      await expect(lockdownsService.getLockdownInfoForLockdown(mockParameter)).rejects.toThrow();
    });
  });
});
