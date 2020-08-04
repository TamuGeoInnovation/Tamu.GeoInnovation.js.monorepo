import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getConnection, DeepPartial } from 'typeorm';

import { config } from '@tamu-gisc/covid/data-api';
import {
  CountyClaim,
  County,
  EntityStatus,
  EntityToValue,
  CountyClaimInfo,
  User,
  TestingSite,
  State,
  EntityValue,
  CategoryValue,
  FieldCategory,
  FieldType
} from '@tamu-gisc/covid/common/entities';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';
import { CountyClaimsService } from '../county-claims/county-claims.service';
import { CountyClaimsModule } from '../county-claims/county-claims.module';
import { PhoneNumbersService } from './phone-numbers.service';
import { PhoneNumbersModule } from './phone-numbers.module';

describe('Phone-Numbers Integration Tests', () => {
  let phoneNumberService: PhoneNumbersService;
  let countyClaimsService: CountyClaimsService;
  let usersService: UsersService;

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
        CountyClaimsModule,
        UsersModule,
        PhoneNumbersModule,
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
      providers: [CountyClaimsService, UsersService, PhoneNumbersService]
    }).compile();

    phoneNumberService = module.get<PhoneNumbersService>(PhoneNumbersService);
    countyClaimsService = module.get<CountyClaimsService>(CountyClaimsService);
    usersService = module.get<UsersService>(UsersService);

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
    await fieldTypeRepo.query(`DELETE FROM field_types`);
    await fieldTypeRepo.query(`DELETE FROM field_categories_types_field_types`);
    await fieldCategoryRepo.query(`DELETE FROM field_categories`);
    await fieldCategoryRepo.query(`DELETE FROM field_categories_types_field_types`);

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
      .from(FieldType)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(FieldCategory)
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

  const fieldCategoryW: DeepPartial<FieldCategory> = { name: 'Website' };
  const fieldCategoryPN: DeepPartial<FieldCategory> = { name: 'PhoneNumber' };

  const fieldTypePN: DeepPartial<FieldType> = { name: '6054756968', guid: 'Fo' };

  const categoryValue: DeepPartial<CategoryValue> = {
    value: 'Foo',
    type: fieldTypePN,
    category: fieldCategoryPN,
    guid: 'Foo'
  };

  const entityValue: DeepPartial<EntityValue> = { value: categoryValue, guid: 'Fooo' };

  const entityToValue: DeepPartial<EntityToValue> = { entityValue: entityValue, guid: 'Foooo' };

  /* 
    Testing this - - - - - 
  */
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

  describe('Validation', () => {
    it('service should be defined', async () => {
      await fieldCategoryRepo.save(fieldCategoryW);
      await fieldCategoryRepo.save(fieldCategoryPN);
      await fieldTypeRepo.save(fieldTypePN);
      await categoryValueRepo.save(categoryValue);
      await entityValueRepo.save(entityValue);
      await entityToValueRepo.save(entityToValue);

      await usersRepo.save(userTest);
      await statesRepo.save(stateTest);
      await countiesRepo.save(countyTest);
      await countyClaimInfoRepo.save(countyClaimInfoTest);
      await countyClaimsRepo.save(countyClaimTest);
      await phoneNumberService.getPhoneNumbersForCounty(countyTest.countyFips.toString());

      expect(await phoneNumberService.getPhoneNumbersForCounty(countyTest.countyFips.toString())).toEqual([fieldCategoryPN]);
    });
  });

  describe('Validation', () => {
    it('service should be defined', async () => {
      await fieldCategoryRepo.save(fieldCategoryW);
      await fieldCategoryRepo.save(fieldCategoryPN);
      await fieldTypeRepo.save(fieldTypePN);
      await categoryValueRepo.save(categoryValue);
      await entityValueRepo.save(entityValue);
      await entityToValueRepo.save(entityToValue);

      await usersRepo.save(userTest);
      await statesRepo.save(stateTest);
      await countiesRepo.save(countyTest);
      await countyClaimInfoRepo.save(countyClaimInfoTest);
      await countyClaimsRepo.save(countyClaimTest);

      expect(await phoneNumberService.getPhoneNumbersForCounty(countyTest.countyFips.toString())).toEqual([fieldCategoryPN]);
    });
  });

  /*describe('', () => {
    it('getPhoneNumbersForCounty', async () => {
      await entityToValueRepo.save(entityToValueTest);
      await countyClaimInfoRepo.save(countyClaimInfoTest);
      await countyClaimsRepo.save(countyClaimTest);

      expect(await phoneNumberService.getPhoneNumbersForCounty(countyTest.countyFips.toString())).toEqual([]);
    });
  });*/
});
