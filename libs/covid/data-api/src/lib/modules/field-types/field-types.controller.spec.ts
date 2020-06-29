import { Test, TestingModule } from '@nestjs/testing';
import { FieldTypesController } from './field-types.controller';

describe('FieldTypes Controller', () => {
  let controller: FieldTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FieldTypesController],
    }).compile();

    controller = module.get<FieldTypesController>(FieldTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
