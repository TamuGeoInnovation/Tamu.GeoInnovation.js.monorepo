import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AncillaryExpanded } from '@tamu-gisc/two/common';

import { AncillaryService } from './ancillary.service';

describe('AncillaryService', () => {
  let service: AncillaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AncillaryService,
        {
          provide: getRepositoryToken(AncillaryExpanded),
          useClass: Repository
        }
      ]
    }).compile();

    service = module.get<AncillaryService>(AncillaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
