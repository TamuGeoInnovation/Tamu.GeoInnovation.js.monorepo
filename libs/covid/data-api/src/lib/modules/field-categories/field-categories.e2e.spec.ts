import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';
import { CategoryValue, FieldType, FieldCategory } from '@tamu-gisc/covid/common/entities';

import { config } from '@tamu-gisc/covid/data-api';

import { FieldCategoriesService } from './field-categories.service';
import { FieldCategoriesModule } from './field-categories.module';

const fieldCategoryTest: Partial<FieldCategory> = {
  id: 1,
  name: 'Foo'
};

const fieldCategoryTestTwo: Partial<FieldCategory> = {
  id: 2,
  name: 'Bar'
};

const fieldTypeTest: Partial<FieldType> = {
  name: 'Foo',
  guid: 'Foo'
};

describe('fieldCategory Integration Tests', () => {
  let fieldCategoriesService: FieldCategoriesService;

  let fieldCategoriesRepo: Repository<FieldCategory>;
  let fieldTypeRepo: Repository<FieldType>;
  let categoryValueRepo: Repository<CategoryValue>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        FieldCategoriesModule,
        TypeOrmModule.forFeature([FieldCategory, FieldType, CategoryValue]),
        TypeOrmModule.forRoot(config)
      ],
      providers: [FieldCategoriesService]
    }).compile();

    fieldCategoriesService = module.get<FieldCategoriesService>(FieldCategoriesService);

    fieldCategoriesRepo = module.get<Repository<FieldCategory>>(getRepositoryToken(FieldCategory));
    fieldTypeRepo = module.get<Repository<FieldType>>(getRepositoryToken(FieldType));
    categoryValueRepo = module.get<Repository<CategoryValue>>(getRepositoryToken(CategoryValue));
  });

  /**
   * after each test, delete everything from each table
   */

  afterEach(async () => {
    await categoryValueRepo.query(`DELETE FROM category_values`);
    await fieldTypeRepo.query(`DELETE FROM field_types`);
    await fieldCategoriesRepo.query(`DELETE FROM field_categories`);
  });

  /**
   * after all tests are done, delete everything from each table
   */

  afterAll(async () => {
    const connection = getConnection();
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
    await connection
      .createQueryBuilder()
      .delete()
      .from(FieldCategory)
      .execute();
    await connection.close();
  });
  it('getAllCategoriesWithTypes.', async () => {
    await fieldCategoriesRepo.save(fieldCategoryTest);
    const catsWithTypes = await fieldCategoriesService.getAllCategoriesWithTypes();
    expect(catsWithTypes[0].types).toEqual([]);
  });

  it('getCategoryWithValues.', async () => {
    await fieldCategoriesRepo.save(fieldCategoryTest);
    const catsWithTypes = await fieldCategoriesService.getCategoryWithValues(fieldCategoryTest.id.toString());
    expect(catsWithTypes[0].values).toEqual([]);
  });

  it('getFieldTypesForCategory.', async () => {
    await fieldCategoriesRepo.save(fieldCategoryTest);
    const catsWithTypes = await fieldCategoriesService.getAllCategoriesWithTypes();
    const typesForCats = await fieldCategoriesService.getFieldTypesForCategory(fieldCategoryTest.id);
    expect(typesForCats).toEqual(catsWithTypes[0]);
  });

  it('addFieldTypeToCategory.', async () => {
    await fieldCategoriesRepo.save(fieldCategoryTest);
    await fieldTypeRepo.save(fieldTypeTest);
    await fieldCategoriesService.addFieldTypeToCategory(fieldCategoryTest.id, fieldTypeTest.guid);
    const catsWithTypes = await fieldCategoriesService.getAllCategoriesWithTypes();
    expect(catsWithTypes[0].types).toEqual([fieldTypeTest]);
  });
  it('addValueToCategory.', async () => {
    await fieldCategoriesRepo.save(fieldCategoryTest);
    await fieldCategoriesRepo.save(fieldCategoryTestTwo);
    await fieldTypeRepo.save(fieldTypeTest);
    const typesForCats = await fieldCategoriesService.addValueToCategory(
      fieldCategoryTest.id.toString(),
      fieldTypeTest.guid
    );
    expect([typesForCats]).toMatchObject(
      await fieldCategoriesService.getCategoryWithValues(fieldCategoryTest.id.toString())
    );
  });
});
