import { Test, TestingModule } from '@nestjs/testing';
import { SourceTypesController } from './source-types.controller';

describe('SourceTypes Controller', () => {
  let controller: SourceTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SourceTypesController],
    }).compile();

    controller = module.get<SourceTypesController>(SourceTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
