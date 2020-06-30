import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FieldType } from '@tamu-gisc/covid/common/entities';

import { FieldTypesController } from './field-types.controller';
import { FieldTypesService } from './field-types.service';

describe('FieldTypes Controller', () => {
  let controller: FieldTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FieldTypesService, { provide: getRepositoryToken(FieldType), useClass: Repository }],
      controllers: [FieldTypesController]
    }).compile();

    controller = module.get<FieldTypesController>(FieldTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
