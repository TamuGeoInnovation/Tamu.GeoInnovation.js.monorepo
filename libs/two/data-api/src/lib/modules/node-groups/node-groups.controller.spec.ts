import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NodeGroups } from '@tamu-gisc/two/common';

import { NodeGroupsController } from './node-groups.controller';
import { NodeGroupsService } from './node-groups.service';

describe('NodeGroups Controller', () => {
  let controller: NodeGroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NodeGroupsService,
        {
          provide: getRepositoryToken(NodeGroups),
          useClass: Repository
        }
      ],
      controllers: [NodeGroupsController]
    }).compile();

    controller = module.get<NodeGroupsController>(NodeGroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
