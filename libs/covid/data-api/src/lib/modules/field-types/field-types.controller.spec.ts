import { Test, TestingModule } from '@nestjs/testing';

import { FieldTypesController } from './field-types.controller';
import { FieldTypesService } from './field-types.service';

jest.mock('./field-types.service');

describe('FieldTypes Controller', () => {
  let fieldTypesController: FieldTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FieldTypesService],
      controllers: [FieldTypesController]
    }).compile();

    fieldTypesController = module.get<FieldTypesController>(FieldTypesController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Validation ', () => {
    it('controller should be defined', () => {
      expect(fieldTypesController).toBeDefined();
    });
  });
});
