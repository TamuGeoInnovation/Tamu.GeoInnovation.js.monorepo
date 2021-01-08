import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Location, Result } from '@tamu-gisc/ues/effluent/common/entities';

import { ResultsController } from './results.controller';
import { ResultsService } from './results.service';

describe('Results Controller', () => {
  let controller: ResultsController;
  let service: ResultsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResultsController],
      providers: [
        ResultsService,
        { provide: getRepositoryToken(Result), useValue: {} },
        { provide: getRepositoryToken(Location), useValue: {} }
      ]
    }).compile();

    controller = module.get<ResultsController>(ResultsController);
    service = module.get<ResultsService>(ResultsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
/* */
