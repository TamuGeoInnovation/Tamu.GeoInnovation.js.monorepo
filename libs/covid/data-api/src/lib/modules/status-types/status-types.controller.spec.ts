import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { StatusType } from '@tamu-gisc/covid/common/entities';

import { StatusTypesController } from './status-types.controller';
import { StatusTypesService } from './status-types.service';

describe('StatusTypes Controller', () => {
  let controller: StatusTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusTypesService, { provide: getRepositoryToken(StatusType), useClass: Repository }],
      controllers: [StatusTypesController]
    }).compile();

    controller = module.get<StatusTypesController>(StatusTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
