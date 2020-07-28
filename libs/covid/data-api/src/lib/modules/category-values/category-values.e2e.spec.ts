import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';

import { config } from '@tamu-gisc/covid/data-api';
import { CategoryValue, FieldCategory, FieldType } from '@tamu-gisc/covid/common/entities';
import { CategoryValuesService } from './category-values.service';
import { FieldCategoriesService } from '../field-categories/field-categories.service';
import { CategoryValueModule } from './category-values.module';
import { FieldCategoriesModule } from '../field-categories/field-categories.module';
import { FieldTypesService } from '../field-types/field-types.service';
import { FieldTypesModule } from '../field-types/field-types.module';

describe('Category Values Integration Tests', () => {
  let categoryValuesService: CategoryValuesService;
  let fieldCategoriesService: FieldCategoriesService;
  let fieldTypesService: FieldTypesService;

  let categoryValuesrepo: Repository<CategoryValue>;
  let fieldCategoriesrepo: Repository<FieldCategory>;
  let fieldTypesrepo: Repository<FieldType>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CategoryValueModule,
        FieldCategoriesModule,
        FieldTypesModule,
        TypeOrmModule.forFeature([CategoryValue, FieldCategory, FieldType]),
        TypeOrmModule.forRoot(config)
      ],
      providers: [CategoryValuesService, FieldCategoriesService, FieldTypesService]
    }).compile();

    categoryValuesService = module.get<CategoryValuesService>(CategoryValuesService);
    fieldCategoriesService = module.get<FieldCategoriesService>(FieldCategoriesService);
    fieldTypesService = module.get<FieldTypesService>(FieldTypesService);

    categoryValuesrepo = module.get<Repository<CategoryValue>>(getRepositoryToken(CategoryValue));
    fieldCategoriesrepo = module.get<Repository<FieldCategory>>(getRepositoryToken(FieldCategory));
    fieldTypesrepo = module.get<Repository<FieldType>>(getRepositoryToken(FieldType));
  });

  /**
   * after each test, delete everything from each table
   */

  afterEach(async () => {
    await categoryValuesrepo.query(`DELETE FROM category_values`);
    await fieldCategoriesrepo.query(`DELETE FROM field_categories`);
    await fieldTypesrepo.query(`DELETE FROM field_types`);
  });

  /**
   * after all tests are done, delete everything from each table
   */

  afterAll(async () => {
    const connection = getConnection();
    await connection
      .createQueryBuilder()
      .delete()
      .from(FieldCategory)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(FieldType)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(CategoryValue)
      .execute();
    await connection.close();
  });

  describe('Validation', () => {
    it('service should be defined', async () => {
      // create new state
      expect(await categoryValuesService).toBeDefined();
    });
  });
});
