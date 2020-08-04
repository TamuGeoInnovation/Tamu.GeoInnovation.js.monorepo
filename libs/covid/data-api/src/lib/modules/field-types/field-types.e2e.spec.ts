import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getConnection, DeepPartial } from 'typeorm';
import { State, County, CountyClaim, CategoryValue, FieldType, FieldCategory } from '@tamu-gisc/covid/common/entities';

import { config } from '@tamu-gisc/covid/data-api';
import { FieldTypesService } from '../field-types/field-types.service';
import { CategoryValuesService } from '../category-values/category-values.service';
import { FieldTypesModule } from '../field-types/field-types.module';
import { CategoryValueModule } from '../category-values/category-values.module';
import { FieldCategoriesModule } from '../field-categories/field-categories.module';
import { FieldCategoriesService } from '../field-categories/field-categories.service';

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
   * after each test, delete everything from each table
   */

  afterEach(async () => {
    await fieldTypeRepo.query(`DELETE FROM field_types`);
  });

  /**
   * after all tests are done, delete everything from each table
   */

  afterAll(async () => {
    const connection = getConnection();
    await connection
      .createQueryBuilder()
      .delete()
      .from(FieldType)
      .execute();
    await connection.close();
  });

  describe('validation', () => {
    it('service should be defined', async () => {
      expect(fieldTypeService).toBeDefined();
    });
  });
});
