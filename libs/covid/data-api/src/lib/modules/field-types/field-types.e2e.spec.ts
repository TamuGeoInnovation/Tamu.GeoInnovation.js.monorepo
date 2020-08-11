import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';
import { FieldType } from '@tamu-gisc/covid/common/entities';

import { config } from '@tamu-gisc/covid/data-api';
import { FieldTypesService } from '../field-types/field-types.service';
import { FieldTypesModule } from '../field-types/field-types.module';

describe('Field Type Integration Tests', () => {
  let fieldTypeService: FieldTypesService;
  let fieldTypeRepo: Repository<FieldType>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [FieldTypesModule, TypeOrmModule.forFeature([FieldType]), TypeOrmModule.forRoot(config)],
      providers: [FieldTypesService]
    }).compile();

    fieldTypeService = module.get<FieldTypesService>(FieldTypesService);
    fieldTypeRepo = module.get<Repository<FieldType>>(getRepositoryToken(FieldType));
  });

  /**
   * after all tests are done, delete everything from each table
   */

  afterAll(async () => {
    const connection = getConnection();
    await connection.close();
  });

  describe('validation', () => {
    it('service should be defined', async () => {
      expect(fieldTypeService).toBeDefined();
    });
  });
});
