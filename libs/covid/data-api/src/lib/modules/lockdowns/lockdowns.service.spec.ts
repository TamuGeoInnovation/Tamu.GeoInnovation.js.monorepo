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
  let countyClaimsService: CountyClaimsService;

  let lockdownMock: Repository<Lockdown>;
  let lockdownInfoMock: Repository<LockdownInfo>;
  let userMock: Repository<User>;
  let entityStatusMock: Repository<EntityStatus>;
  let countyMock: Repository<County>;
  let countyClaimMock: Repository<CountyClaim>;
  let countyClaimInfoMock: Repository<CountyClaimInfo>;
  let entityValueMock: Repository<EntityValue>;
  let entityToValueMock: Repository<EntityToValue>;

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
    countyClaimsService = module.get<CountyClaimsService>(CountyClaimsService);
    lockdownMock = module.get(getRepositoryToken(Lockdown));
    lockdownInfoMock = module.get(getRepositoryToken(LockdownInfo));
    userMock = module.get(getRepositoryToken(User));
    entityStatusMock = module.get(getRepositoryToken(EntityStatus));
    countyMock = module.get(getRepositoryToken(County));
    countyClaimMock = module.get(getRepositoryToken(CountyClaim));
    countyClaimInfoMock = module.get(getRepositoryToken(CountyClaimInfo));
    entityValueMock = module.get(getRepositoryToken(EntityValue));
    entityToValueMock = module.get(getRepositoryToken(EntityToValue));
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
