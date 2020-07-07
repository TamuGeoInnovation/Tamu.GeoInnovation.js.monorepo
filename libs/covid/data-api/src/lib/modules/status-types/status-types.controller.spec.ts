import { Test, TestingModule } from '@nestjs/testing';

import { StatusTypesController } from './status-types.controller';
import { StatusTypesService } from './status-types.service';

jest.mock('./status-types.service');

describe('StatusTypes Controller', () => {
  let statusTypesService: StatusTypesService;
  let statusTypesController: StatusTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusTypesService],
      controllers: [StatusTypesController]
    }).compile();
    statusTypesService = module.get<StatusTypesService>(StatusTypesService);
    statusTypesController = module.get<StatusTypesController>(StatusTypesController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Validation ', () => {
    it('controller should be defined', () => {
      expect(statusTypesController).toBeDefined();
    });
  });
});
