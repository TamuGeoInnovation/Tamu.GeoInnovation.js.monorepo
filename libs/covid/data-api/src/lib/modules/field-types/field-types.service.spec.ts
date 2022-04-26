import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FieldType } from '@tamu-gisc/covid/common/entities';

import { FieldTypesService } from './field-types.service';

describe('FieldTypesService', () => {
  let fieldTypesService: FieldTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FieldTypesService, { provide: getRepositoryToken(FieldType), useClass: Repository }]
    }).compile();

    fieldTypesService = module.get<FieldTypesService>(FieldTypesService);
  });

  describe('Validation ', () => {
    it('Service should be defined', () => {
      expect(fieldTypesService).toBeDefined();
    });
  });
});
