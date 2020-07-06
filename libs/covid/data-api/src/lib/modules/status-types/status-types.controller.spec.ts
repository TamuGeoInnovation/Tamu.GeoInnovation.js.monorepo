import { Test, TestingModule } from '@nestjs/testing';

import { StatusTypesController } from './status-types.controller';
import { StatusTypesService } from './status-types.service';

jest.mock('./status-types.service');

describe('StatusTypes Controller', () => {
  let service: StatusTypesService;
  let controller: StatusTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusTypesService],
      controllers: [StatusTypesController]
    }).compile();
    service = module.get<StatusTypesService>(StatusTypesService);
    controller = module.get<StatusTypesController>(StatusTypesController);
  });

  describe('Validation ', () => {
    it('controller should be defined', () => {
      expect(controller).toBeDefined();
    });
  });
});
