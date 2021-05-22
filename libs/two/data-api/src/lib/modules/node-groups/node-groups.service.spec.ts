import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NodeGroups } from '@tamu-gisc/two/common';

import { NodeGroupsService } from './node-groups.service';

describe('NodeGroupsService', () => {
  let service: NodeGroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NodeGroupsService,
        {
          provide: getRepositoryToken(NodeGroups),
          useClass: Repository
        }
      ]
    }).compile();

    service = module.get<NodeGroupsService>(NodeGroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
