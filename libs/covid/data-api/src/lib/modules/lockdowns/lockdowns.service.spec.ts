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

  let LockdownMock: Repository<Lockdown>;
  let LockdownInfoMock: Repository<LockdownInfo>;
  let UserMock: Repository<User>;
  let EntityStatusMock: Repository<EntityStatus>;
  let CountyMock: Repository<County>;
  let CountyClaimMock: Repository<CountyClaim>;
  let CountyClaimInfoMock: Repository<CountyClaimInfo>;
  let EntityValueMock: Repository<EntityValue>;
  let EntityToValueMock: Repository<EntityToValue>;

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
    LockdownMock = module.get(getRepositoryToken(Lockdown));
    LockdownInfoMock = module.get(getRepositoryToken(LockdownInfo));
    UserMock = module.get(getRepositoryToken(User));
    EntityStatusMock = module.get(getRepositoryToken(EntityStatus));
    CountyMock = module.get(getRepositoryToken(County));
    CountyClaimMock = module.get(getRepositoryToken(CountyClaim));
    CountyClaimInfoMock = module.get(getRepositoryToken(CountyClaimInfo));
    EntityValueMock = module.get(getRepositoryToken(EntityValue));
    EntityToValueMock = module.get(getRepositoryToken(EntityToValue));
  });
  describe('Validation ', () => {
    it('Service should be defined', () => {
      expect(lockdownsService).toBeDefined();
    });
  });
});
