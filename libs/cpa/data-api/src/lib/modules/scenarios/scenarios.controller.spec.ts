import { Test, TestingModule } from '@nestjs/testing';
import { ScenariosController } from './scenarios.controller';

import { ScenariosService } from './scenarios.service';

import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scenario } from '@tamu-gisc/cpa/common/entities';

describe('Scenarios Controller', () => {
  let controller: ScenariosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScenariosService,
        { provide: getRepositoryToken(Scenario), useClass: Repository } 
      ],

      controllers: [ScenariosController],
    }).compile();

    controller = module.get<ScenariosController>(ScenariosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
