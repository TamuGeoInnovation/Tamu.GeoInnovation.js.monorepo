import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryValue, CountyClaim, CountyClaimInfo, County } from '@tamu-gisc/covid/common/entities';

import { WebsitesService } from './websites.service';

describe('WebsitesService', () => {
  let service: WebsitesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebsitesService, 
        {
          provide: getRepositoryToken(CategoryValue), 
          useClass: Repository

        },
        WebsitesService,
        {
          provide: getRepositoryToken(County),
          useClass: Repository
        },
        WebsitesService,
        {
          provide: getRepositoryToken(CountyClaim),
          useClass: Repository
        },
        WebsitesService,
        {
          provide: getRepositoryToken(CountyClaimInfo),
          useClass: Repository
        }
      ]
    }).compile();

    service = module.get<WebsitesService>(WebsitesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
