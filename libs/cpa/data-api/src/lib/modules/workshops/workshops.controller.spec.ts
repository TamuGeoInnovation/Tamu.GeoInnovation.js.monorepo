import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Workshop } from '@tamu-gisc/cpa/common/entities';

import { WorkshopsController } from './workshops.controller';
import { WorkshopsService } from './workshops.service';

describe('Workshops Controller', () => {
  let controller: WorkshopsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkshopsService, { provide: getRepositoryToken(Workshop), useClass: Repository }],

      controllers: [WorkshopsController]
    }).compile();

    controller = module.get<WorkshopsController>(WorkshopsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
