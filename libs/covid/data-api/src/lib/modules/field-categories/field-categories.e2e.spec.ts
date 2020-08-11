import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getConnection, DeepPartial } from 'typeorm';
import { CategoryValue, FieldType, FieldCategory } from '@tamu-gisc/covid/common/entities';

import { config } from '@tamu-gisc/covid/data-api';

import { FieldCategoriesService } from './field-categories.service';
import { FieldCategoriesModule } from './field-categories.module';

describe('Field Category Setup', () => {
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

  afterAll(async () => {
    const connection = getConnection();
    await connection
      .createQueryBuilder()
      .delete()
      .from(CategoryValue)
      .execute();
    await connection.close();
  });

  const fieldCategoryW: DeepPartial<FieldCategory> = { name: 'Website', id: 1 };
  const fieldCategoryPN: DeepPartial<FieldCategory> = { name: 'PhoneNumber', id: 2 };
  const fieldCategorySO: DeepPartial<FieldCategory> = { name: 'SiteOwners', id: 3 };
  const fieldCategorySS: DeepPartial<FieldCategory> = { name: 'SiteServices', id: 4 };
  const fieldCategorySR: DeepPartial<FieldCategory> = { name: 'SiteRestrictions', id: 5 };
  const fieldCategorySOS: DeepPartial<FieldCategory> = { name: 'SiteOperationalStatus', id: 6 };

  const fieldTypeTest: Partial<FieldType> = {
    name: 'Foo',
    guid: 'Foo'
  };
  describe('Field Category Integration Test', () => {
    it('getAllCategoriesWithTypes.', async () => {
      await fieldCategoriesRepo.save(fieldCategoryW);
      await fieldCategoriesRepo.save(fieldCategoryPN);
      await fieldCategoriesRepo.save(fieldCategorySO);
      await fieldCategoriesRepo.save(fieldCategorySS);
      await fieldCategoriesRepo.save(fieldCategorySR);
      await fieldCategoriesRepo.save(fieldCategorySOS);
      const catsWithTypes = await fieldCategoriesService.getAllCategoriesWithTypes();
      expect(catsWithTypes[0].types).toMatchObject([{ name: 'Foo' }]);
    });

    it('getCategoryWithValues.', async () => {
      await fieldCategoriesRepo.save(fieldCategoryW);
      await fieldCategoriesRepo.save(fieldCategoryPN);
      await fieldCategoriesRepo.save(fieldCategorySO);
      await fieldCategoriesRepo.save(fieldCategorySS);
      await fieldCategoriesRepo.save(fieldCategorySR);
      await fieldCategoriesRepo.save(fieldCategorySOS);
      const catsWithTypes = await fieldCategoriesService.getCategoryWithValues(fieldCategoryW.id.toString());
      expect(catsWithTypes[0].values).toMatchObject([]);
    });

    it('getFieldTypesForCategory.', async () => {
      await fieldCategoriesRepo.save(fieldCategoryW);
      await fieldCategoriesRepo.save(fieldCategoryPN);
      await fieldCategoriesRepo.save(fieldCategorySO);
      await fieldCategoriesRepo.save(fieldCategorySS);
      await fieldCategoriesRepo.save(fieldCategorySR);
      await fieldCategoriesRepo.save(fieldCategorySOS);
      const catsWithTypes = await fieldCategoriesService.getAllCategoriesWithTypes();
      const typesForCats = await fieldCategoriesService.getFieldTypesForCategory(fieldCategoryW.id);
      expect(typesForCats).toMatchObject(catsWithTypes[0]);
    });

    it('addFieldTypeToCategory.', async () => {
      await fieldCategoriesRepo.save(fieldCategoryW);
      await fieldCategoriesRepo.save(fieldCategoryPN);
      await fieldCategoriesRepo.save(fieldCategorySO);
      await fieldCategoriesRepo.save(fieldCategorySS);
      await fieldCategoriesRepo.save(fieldCategorySR);
      await fieldCategoriesRepo.save(fieldCategorySOS);
      await fieldTypeRepo.save(fieldTypeTest);
      await fieldCategoriesService.addFieldTypeToCategory(fieldCategoryW.id, fieldTypeTest.guid);
      const catsWithTypes = await fieldCategoriesService.getAllCategoriesWithTypes();
      expect(catsWithTypes[0].types).toMatchObject([fieldTypeTest]);
    });
    it('addValueToCategory.', async () => {
      await fieldCategoriesRepo.save(fieldCategoryW);
      await fieldCategoriesRepo.save(fieldCategoryPN);
      await fieldCategoriesRepo.save(fieldCategorySO);
      await fieldCategoriesRepo.save(fieldCategorySS);
      await fieldCategoriesRepo.save(fieldCategorySR);
      await fieldCategoriesRepo.save(fieldCategorySOS);
      await fieldTypeRepo.save(fieldTypeTest);
      const typesForCats = await fieldCategoriesService.addValueToCategory(fieldCategoryW.id.toString(), fieldTypeTest.guid);
      expect([typesForCats]).toMatchObject(await fieldCategoriesService.getCategoryWithValues(fieldCategoryW.id.toString()));
    });
  });
});
