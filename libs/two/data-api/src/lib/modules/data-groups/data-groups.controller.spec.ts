import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DataGroups } from '@tamu-gisc/two/common';

import { DataGroupsController } from './data-groups.controller';

import { DataGroupsService } from './data-groups.service';

describe('DataGroups Controller', () => {
  let controller: DataGroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataGroupsService,
        {
          provide: getRepositoryToken(DataGroups),
          useClass: Repository
        }
      ],
      controllers: [DataGroupsController]
    }).compile();

    controller = module.get<DataGroupsController>(DataGroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
