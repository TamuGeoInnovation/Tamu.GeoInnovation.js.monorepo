import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  County,
  CountyClaim,
  TestingSite,
  TestingSiteInfo,
  Location,
  User,
  EntityStatus,
  CountyClaimInfo,
  EntityToValue
} from '@tamu-gisc/covid/common/entities';

import { TestingSitesService } from './testing-sites.service';
import { CountyClaimsService } from '../county-claims/county-claims.service';

describe('TestingSitesService', () => {
  let service: TestingSitesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestingSitesService,
        { provide: getRepositoryToken(County), useClass: Repository },
        { provide: getRepositoryToken(CountyClaim), useClass: Repository },
        { provide: getRepositoryToken(TestingSite), useClass: Repository },
        { provide: getRepositoryToken(TestingSiteInfo), useClass: Repository },
        { provide: getRepositoryToken(Location), useClass: Repository },
        { provide: getRepositoryToken(User), useClass: Repository },
        { provide: getRepositoryToken(EntityStatus), useClass: Repository },
        { provide: getRepositoryToken(CountyClaimInfo), useClass: Repository },
        { provide: getRepositoryToken(EntityToValue), useClass: Repository },
        CountyClaimsService
      ]
    }).compile();

    service = module.get<TestingSitesService>(TestingSitesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
