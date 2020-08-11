import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getConnection, DeepPartial } from 'typeorm';
import {
  CountyClaim,
  County,
  EntityStatus,
  EntityToValue,
  CountyClaimInfo,
  CategoryValue,
  State,
  User,
  FieldCategory,
  FieldType,
  EntityValue,
  TestingSite
} from '@tamu-gisc/covid/common/entities';
import { config } from '@tamu-gisc/covid/data-api';
import { WebsitesService } from './websites.service';
import { WebsitesModule } from './websites.module';
import { CATEGORY } from '@tamu-gisc/covid/common/enums';

describe('Websites Setup', () => {
  let service: WebsitesService;

  let countyClaimsRepo: Repository<CountyClaim>;
  let usersRepo: Repository<User>;
  let fieldCategoryRepo: Repository<FieldCategory>;
  let fieldTypeRepo: Repository<FieldType>;
  let categoryValueRepo: Repository<CategoryValue>;
  let entityValueRepo: Repository<EntityValue>;
  let countiesRepo: Repository<County>;
  let statesRepo: Repository<State>;
  let countyClaimInfoRepo: Repository<CountyClaimInfo>;
  let entityToValueRepo: Repository<EntityToValue>;
  let entityStatusRepo: Repository<EntityStatus>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        WebsitesModule,
        TypeOrmModule.forFeature([
          CountyClaim,
          User,
          County,
          CountyClaimInfo,
          EntityToValue,
          EntityStatus,
          TestingSite,
          State,
          FieldCategory,
          CategoryValue,
          EntityValue,
          FieldType
        ]),
        TypeOrmModule.forRoot(config)
      ],
      providers: [WebsitesService]
    }).compile();

    service = module.get<WebsitesService>(WebsitesService);

    statesRepo = module.get<Repository<State>>(getRepositoryToken(State));
    fieldCategoryRepo = module.get<Repository<FieldCategory>>(getRepositoryToken(FieldCategory));
    fieldTypeRepo = module.get<Repository<FieldType>>(getRepositoryToken(FieldType));
    categoryValueRepo = module.get<Repository<CategoryValue>>(getRepositoryToken(CategoryValue));
    entityValueRepo = module.get<Repository<EntityValue>>(getRepositoryToken(EntityValue));
    countyClaimsRepo = module.get<Repository<CountyClaim>>(getRepositoryToken(CountyClaim));
    usersRepo = module.get<Repository<User>>(getRepositoryToken(User));
    entityStatusRepo = module.get<Repository<EntityStatus>>(getRepositoryToken(EntityStatus));
    entityToValueRepo = module.get<Repository<EntityToValue>>(getRepositoryToken(EntityToValue));
    countyClaimInfoRepo = module.get<Repository<CountyClaimInfo>>(getRepositoryToken(CountyClaimInfo));
    countiesRepo = module.get<Repository<County>>(getRepositoryToken(County));
  });

  /**
   * after each test, delete everything from each table
   */

  afterEach(async () => {
    await entityToValueRepo.query(`DELETE FROM entity_to_values`);
    await countyClaimInfoRepo.query(`DELETE FROM county_claim_infos`);
    await entityValueRepo.query(`DELETE FROM entity_values`);
    await categoryValueRepo.query(`DELETE FROM category_values`);
    await countyClaimsRepo.query(`DELETE FROM county_claims`);
    await countiesRepo.query(`DELETE FROM counties`);
    await statesRepo.query(`DELETE FROM states`);
    await usersRepo.query(`DELETE FROM users`);
  });

  /**
   * after all tests are done, delete everything from each table
   */

  afterAll(async () => {
    const connection = getConnection();
    await connection
      .createQueryBuilder()
      .delete()
      .from(EntityToValue)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(EntityValue)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(CategoryValue)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(CountyClaimInfo)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(CountyClaim)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(County)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(State)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(User)
      .execute();
    await connection.close();
  });

  const fieldCategoryW: DeepPartial<FieldCategory> = { name: 'Website', id: 1 };
  const fieldCategoryPN: DeepPartial<FieldCategory> = { name: 'PhoneNumber', id: 2 };
  const fieldTypePN: DeepPartial<FieldType> = { name: 'Foooo', guid: 'Yeet' };
  const entityValue: DeepPartial<EntityValue> = { guid: 'Fooo' };
  const entityToValue: DeepPartial<EntityToValue> = { entityValue: entityValue, guid: 'Foooo' };
  const userTest: DeepPartial<User> = { email: 'Foo', guid: 'Bar' };
  const stateTest: DeepPartial<State> = { name: 'Foo', abbreviation: 'F', stateFips: 1 };
  const countyTest: DeepPartial<County> = { countyFips: 1, name: 'Foo', stateFips: stateTest };
  const countyClaimInfoTest: DeepPartial<CountyClaimInfo> = { responses: [entityToValue], guid: 'Foobar' };
  const countyClaimTest: DeepPartial<CountyClaim> = {
    user: userTest,
    county: countyTest,
    guid: 'Foo',
    infos: [countyClaimInfoTest]
  };
  describe('Websites Integration Testing ', () => {
    it('getWebsitesForCounty', async () => {
      await fieldCategoryRepo.save(fieldCategoryW);
      await fieldCategoryRepo.save(fieldCategoryPN);
      await fieldTypeRepo.save(fieldTypePN);
      const category = await fieldCategoryRepo.findOne({
        where: {
          id: CATEGORY.WEBSITES
        }
      });
      const type = await fieldTypeRepo.findOne({
        where: {
          name: 'Foooo'
        }
      });
      const Cv = categoryValueRepo.create({
        value: 'Foo',
        type: type,
        category: category
      });
      await Cv.save();
      const eV = entityValueRepo.create({ value: Cv, guid: 'Fooo' });
      await eV.save();
      const eTV = entityToValueRepo.create({ entityValue: eV, guid: 'Foooo' });
      await eTV.save();
      await usersRepo.save(userTest);
      await statesRepo.save(stateTest);
      await countiesRepo.save(countyTest);
      await countyClaimInfoRepo.save(countyClaimInfoTest);
      await countyClaimsRepo.save(countyClaimTest);
      const expected = await service.getWebsitesForCounty(countyTest.countyFips.toString());
      expect(expected).toMatchObject([
        { value: { category: { id: 1, name: 'Website' }, type: { name: 'Foooo' }, value: 'Foo' } }
      ]);
    });

    it('getWebsitesForClaimInfo', async () => {
      await fieldCategoryRepo.save(fieldCategoryW);
      await fieldCategoryRepo.save(fieldCategoryPN);
      await fieldTypeRepo.save(fieldTypePN);
      const category = await fieldCategoryRepo.findOne({
        where: {
          id: CATEGORY.WEBSITES
        }
      });
      const type = await fieldTypeRepo.findOne({
        where: {
          name: 'Foooo'
        }
      });
      const Cv = categoryValueRepo.create({
        value: 'Foo',
        type: type,
        category: category
      });
      await Cv.save();
      const eV = entityValueRepo.create({ value: Cv, guid: 'Fooo' });
      await eV.save();
      const eTV = entityToValueRepo.create({ entityValue: eV, guid: 'Foooo' });
      await eTV.save();
      await usersRepo.save(userTest);
      await statesRepo.save(stateTest);
      await countiesRepo.save(countyTest);
      await countyClaimInfoRepo.save(countyClaimInfoTest);
      await countyClaimsRepo.save(countyClaimTest);
      const expected = await service.getWebsitesForClaimInfo(countyClaimTest.infos[0].guid);
      expect(expected).toMatchObject([
        { value: { category: { id: 1, name: 'Website' }, type: { name: 'Foooo' }, value: 'Foo' } }
      ]);
    });
  });
});
