import { Test, TestingModule } from '@nestjs/testing';

import { FieldTypesController } from './field-types.controller';
import { FieldTypesService } from './field-types.service';

jest.mock('./field-types.service');

describe('FieldTypes Controller', () => {
  let service: FieldTypesService;
  let controller: FieldTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FieldTypesService],
      controllers: [FieldTypesController]
    }).compile();
    service = module.get<FieldTypesService>(FieldTypesService);
    controller = module.get<FieldTypesController>(FieldTypesController);
  });

  describe('Validation ', () => {
    it('controller should be defined', () => {
      expect(controller).toBeDefined();
    });
  });
});
