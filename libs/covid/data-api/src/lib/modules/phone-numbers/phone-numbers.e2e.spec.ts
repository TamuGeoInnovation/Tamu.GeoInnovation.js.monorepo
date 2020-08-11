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
import { CATEGORY } from '@tamu-gisc/covid/common/enums';

describe('Phone-Numbers Setup', () => {
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

  describe('Phone-Numbers Integration Tests', async () => {
    it('getPhoneNumbersForCounty', async () => {
      await fieldCategoryRepo.save(fieldCategoryW);
      await fieldCategoryRepo.save(fieldCategoryPN);
      await fieldTypeRepo.save(fieldTypePN);
      const category = await fieldCategoryRepo.findOne({
        where: {
          id: CATEGORY.PHONE_NUMBERS
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

      const expected = await phoneNumberService.getPhoneNumbersForCounty(countyTest.countyFips.toString());
      expect(expected).toMatchObject([eV]);
    });

    it('getPhoneNumbersForClaimInfo', async () => {
      await fieldCategoryRepo.save(fieldCategoryW);
      await fieldCategoryRepo.save(fieldCategoryPN);
      await fieldTypeRepo.save(fieldTypePN);
      const category = await fieldCategoryRepo.findOne({
        where: {
          id: CATEGORY.PHONE_NUMBERS
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

      const expected = await phoneNumberService.getPhoneNumbersForClaimInfo(countyClaimTest.infos[0].guid);
      expect(expected).toMatchObject([eV]);
    });
  });
});
