import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CountyClaim, User, County, CountyClaimInfo, EntityToValue, EntityStatus } from '@tamu-gisc/covid/common/entities';

import { CountyClaimsService } from './county-claims.service';
import { CountyClaimsController } from './county-claims.controller';

describe('CountyClaims Controller', () => {
  let controller: CountyClaimsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountyClaimsService,
        { provide: getRepositoryToken(CountyClaim), useClass: Repository },
        { provide: getRepositoryToken(User), useClass: Repository },
        { provide: getRepositoryToken(County), useClass: Repository },
        { provide: getRepositoryToken(CountyClaimInfo), useClass: Repository },
        { provide: getRepositoryToken(EntityToValue), useClass: Repository },
        { provide: getRepositoryToken(EntityStatus), useClass: Repository }
      ],
      controllers: [CountyClaimsController]
    }).compile();

    controller = module.get<CountyClaimsController>(CountyClaimsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
