import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DataGroups } from '@tamu-gisc/two/common';

import { DataGroupsService } from './data-groups.service';

describe('DataGroupsService', () => {
  let service: DataGroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataGroupsService,
        {
          provide: getRepositoryToken(DataGroups),
          useClass: Repository
        }
      ]
    }).compile();

    service = module.get<DataGroupsService>(DataGroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
