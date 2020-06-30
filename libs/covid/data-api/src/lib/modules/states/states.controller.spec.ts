import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { State } from '@tamu-gisc/covid/common/entities';

import { StatesController } from './states.controller';
import { StatesService } from './states.service';

describe('States Controller', () => {
  let controller: StatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatesService, { provide: getRepositoryToken(State), useClass: Repository }],
      controllers: [StatesController]
    }).compile();

    controller = module.get<StatesController>(StatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
