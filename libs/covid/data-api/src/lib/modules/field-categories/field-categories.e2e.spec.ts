import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getConnection, DeepPartial } from 'typeorm';
import { State, County, CountyClaim, CategoryValue, FieldType, FieldCategory } from '@tamu-gisc/covid/common/entities';

import { config } from '@tamu-gisc/covid/data-api';
import { FieldCategoriesService } from './field-categories.service';
import { FieldTypesService } from '../field-types/field-types.service';
import { CategoryValuesService } from '../category-values/category-values.service';
import { FieldCategoriesModule } from './field-categories.module';
import { FieldTypesModule } from '../field-types/field-types.module';
import { CategoryValueModule } from '../category-values/category-values.module';

const fieldCategory: DeepPartial<FieldCategory> = {
  id: 1,
  name: 'Foo'
};

describe('fieldCategory Integration Tests', () => {
  let fieldCategoriesService: FieldCategoriesService;
  let fieldTypeService: FieldTypesService;
  let categoryValueService: CategoryValuesService;

  let fieldCategoriesRepo: Repository<FieldCategory>;
  let fieldTypeRepo: Repository<FieldType>;
  let categoryValueRepo: Repository<CategoryValue>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        FieldCategoriesModule,
        FieldTypesModule,
        CategoryValueModule,
        TypeOrmModule.forFeature([FieldCategory, FieldType, CategoryValue]),
        TypeOrmModule.forRoot(config)
      ],
      providers: [FieldCategoriesService, FieldTypesService, CategoryValuesService]
    }).compile();

    fieldCategoriesService = module.get<FieldCategoriesService>(FieldCategoriesService);
    fieldTypeService = module.get<FieldTypesService>(FieldTypesService);
    categoryValueService = module.get<CategoryValuesService>(CategoryValuesService);
    fieldCategoriesRepo = module.get<Repository<FieldCategory>>(getRepositoryToken(FieldCategory));
    fieldTypeRepo = module.get<Repository<FieldType>>(getRepositoryToken(FieldType));
    categoryValueRepo = module.get<Repository<CategoryValue>>(getRepositoryToken(CategoryValue));
  });

  /**
   * after each test, delete everything from each table
   */

  afterEach(async () => {
    await fieldCategoriesRepo.query(`DELETE FROM field_categories`);
    await fieldCategoriesRepo.query(`DELETE FROM field_categories_types_field_types`);

    await categoryValueRepo.query(`DELETE FROM category_values`);
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
      .from(FieldCategory)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(CategoryValue)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(FieldType)
      .execute();
    await connection.close();
  });

  it('getAllCategoriesWithTypes - Should be able to get every catagory with a set type.', async () => {
    await fieldCategoriesService.createOne(fieldCategory);
    await fieldCategoriesService.addFieldTypeToCategory(1, 'Foo');
    const catsWithTypes = await fieldCategoriesService.getAllCategoriesWithTypes();
    expect(catsWithTypes[0].name).toEqual(fieldCategory.name);
  });

  it('should be able to get Category with getCategoryWithValues', async () => {
    await fieldCategoriesService.createOne(fieldCategory);
    //const catsWithTypes = await fieldCategoriesService.getCategoryWithValues('1');
    expect(await fieldCategoriesService.addValueToCategory('1', 'Foo')).toEqual(fieldCategory.name);
  });
});
