import { Test, TestingModule } from '@nestjs/testing';
import { SitesService } from './sites.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Sites } from '@tamu-gisc/two/common';
import { Repository } from 'typeorm';

describe('SitesService', () => {
  let service: SitesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SitesService,
        {
          provide: getRepositoryToken(Sites),
          useClass: Repository
        }
      ]
    }).compile();

    service = module.get<SitesService>(SitesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
