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
  let service: LockdownsService;

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

    service = module.get<LockdownsService>(LockdownsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
