import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CountyClaim, User, County, CountyClaimInfo, EntityValue, EntityToValue, EntityStatus } from '@tamu-gisc/covid/common/entities';
import { CountyClaimsService } from './county-claims.service';

describe('CountyClaimsService', () => {
  let service: CountyClaimsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountyClaimsService,
        { provide: getRepositoryToken(CountyClaim), useClass: Repository },
        { provide: getRepositoryToken(User), useClass: Repository },
        { provide: getRepositoryToken(County), useClass: Repository },
        { provide: getRepositoryToken(CountyClaimInfo), useClass: Repository }, 
        { provide: getRepositoryToken(EntityValue), useClass: Repository },       
        { provide: getRepositoryToken(EntityToValue), useClass: Repository },
        { provide: getRepositoryToken(EntityStatus), useClass: Repository }
      ]
    }).compile();

    service = module.get<CountyClaimsService>(CountyClaimsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
