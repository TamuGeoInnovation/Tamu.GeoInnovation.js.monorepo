import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatusType } from '@tamu-gisc/covid/common/entities';

import { StatusTypesService } from './status-types.service';

describe('StatusTypesService', () => {
  let service: StatusTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatusTypesService,
        {
          provide: getRepositoryToken(StatusType),
          useClass: Repository
        }
      ]
    }).compile();

    service = module.get<StatusTypesService>(StatusTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });  
});
