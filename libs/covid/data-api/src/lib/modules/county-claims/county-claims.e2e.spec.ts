import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getConnection, DeepPartial } from 'typeorm';

import { config } from '@tamu-gisc/covid/data-api';
import { CountyClaimsService } from './county-claims.service';
import {
  CountyClaim,
  County,
  EntityStatus,
  EntityToValue,
  CountyClaimInfo,
  User,
  TestingSite,
  StatusType,
  State,
  EntityValue,
  CategoryValue,
  FieldCategory,
  FieldType
} from '@tamu-gisc/covid/common/entities';
import { CountyClaimsModule } from './county-claims.module';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';
import { StatusTypesService } from '../status-types/status-types.service';
import { StatusTypesModule } from '../status-types/status-types.module';

describe('County Claims Integration Tests', () => {
  let countyClaimsService: CountyClaimsService;
  let usersService: UsersService;
  let statusTypesService: StatusTypesService;

  let countyClaimsRepo: Repository<CountyClaim>;
  let usersRepo: Repository<User>;
  let countiesRepo: Repository<County>;
  let statesRepo: Repository<State>;
  let countyClaimInfoRepo: Repository<CountyClaimInfo>;
  let entityToValueRepo: Repository<EntityToValue>;
  let entityStatusRepo: Repository<EntityStatus>;
  let statusTypeRepo: Repository<StatusType>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CountyClaimsModule,
        UsersModule,
        StatusTypesModule,
        TypeOrmModule.forFeature([
          CountyClaim,
          User,
          County,
          CountyClaimInfo,
          EntityToValue,
          EntityStatus,
          TestingSite,
          StatusType,
          State
        ]),
        TypeOrmModule.forRoot(config)
      ],
      providers: [CountyClaimsService, UsersService, StatusTypesService]
    }).compile();

    countyClaimsService = module.get<CountyClaimsService>(CountyClaimsService);
    usersService = module.get<UsersService>(UsersService);
    statusTypesService = module.get<StatusTypesService>(StatusTypesService);

    statesRepo = module.get<Repository<State>>(getRepositoryToken(State));
    countyClaimsRepo = module.get<Repository<CountyClaim>>(getRepositoryToken(CountyClaim));
    usersRepo = module.get<Repository<User>>(getRepositoryToken(User));
    entityStatusRepo = module.get<Repository<EntityStatus>>(getRepositoryToken(EntityStatus));
    entityToValueRepo = module.get<Repository<EntityToValue>>(getRepositoryToken(EntityToValue));
    countyClaimInfoRepo = module.get<Repository<CountyClaimInfo>>(getRepositoryToken(CountyClaimInfo));
    countiesRepo = module.get<Repository<County>>(getRepositoryToken(County));
    statusTypeRepo = module.get<Repository<StatusType>>(getRepositoryToken(StatusType));
  });

  /**
   * after each test, delete everything from each table
   */

  afterEach(async () => {
    await entityStatusRepo.query(`DELETE FROM entity_statuses`);
    await countyClaimInfoRepo.query(`DELETE FROM county_claim_infos`);
    await countyClaimsRepo.query(`DELETE FROM county_claims`);
    await usersRepo.query(`DELETE FROM users`);
    await countiesRepo.query(`DELETE FROM counties`);
    await statesRepo.query(`DELETE FROM states`);
  });

  /**
   * after all tests are done, delete everything from each table
   */

  afterAll(async () => {
    const connection = getConnection();

    await connection
      .createQueryBuilder()
      .delete()
      .from(EntityStatus)
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
      .from(User)
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

    await connection.close();
  });

  const userTest: DeepPartial<User> = { email: 'Foo', guid: 'Bar' };

  const testState: DeepPartial<State> = {
    name: 'Foo',
    abbreviation: 'F',
    stateFips: 1
  };

  const testStateTwo: DeepPartial<State> = {
    name: 'Bar',
    abbreviation: 'B',
    stateFips: 2
  };

  const countiesTest: DeepPartial<County> = {
    countyFips: 1,
    name: 'Foo',
    stateFips: testState
  };

  const countiesTestTwo: DeepPartial<County> = {
    countyFips: 2,
    name: 'Bar',
    stateFips: testStateTwo
  };

  const countiesTestThree: DeepPartial<County> = {
    countyFips: 3,
    name: 'Bar',
    stateFips: testState
  };

  const statusTypeTest: DeepPartial<StatusType> = {
    name: 'Foo'
  };

  const statusTypeTestTwo: DeepPartial<StatusType> = {
    name: 'Bar'
  };

  const entityStatusTest: DeepPartial<EntityStatus> = {
    guid: 'Foo'
  };

  const entityStatusTestTwo: DeepPartial<EntityStatus> = {
    guid: 'Bar'
  };

  const countyClaimsTest: DeepPartial<CountyClaim> = {
    user: userTest,
    county: countiesTest,
    statuses: [entityStatusTest]
  };

  const countyClaimsTestTwo: DeepPartial<CountyClaim> = {
    user: userTest,
    county: countiesTestTwo,
    statuses: [entityStatusTestTwo]
  };

  /*const fieldCategoryTest: DeepPartial<FieldCategory> = {id: 1, };

  const fieldTypeTest: DeepPartial<FieldType> = {name: 'Foo'};

  const categoryValueTest: DeepPartial<CategoryValue> = {
    value: 'Foo',
    category: fieldCategoryTest,
    type: fieldTypeTest
  };

  const entityValueTest: DeepPartial<EntityValue> = {
    value: categoryValueTest
  };*/

  describe('', () => {
    it('getActiveClaimsForEmail', async () => {
      await usersRepo.save(userTest);
      //await statusTypeRepo.save(statusTypeTest);
      await entityStatusRepo.save(entityStatusTest);
      await statesRepo.save(testState);
      await countiesRepo.save(countiesTest);
      await countyClaimsService.createOne(countiesTest);
      await countyClaimsService.createOrUpdateClaim(countyClaimsTest, [], []);
      const setClaim = await countyClaimsService.getActiveClaimsForEmail(userTest.email);
      expect(setClaim[0].county.name).toEqual(countiesTest.name);
      await countyClaimsService.closeClaim(setClaim[0].guid);
      expect(await countyClaimsService.getActiveClaimsForEmail(userTest.email)).toEqual([]);
    });

    it('getAllUserCountyClaims', async () => {
      await usersRepo.save(userTest);
      await statusTypeRepo.save(statusTypeTest);
      await entityStatusRepo.save(entityStatusTest);
      await statesRepo.save(testState);
      await countiesRepo.save(countiesTest);
      await countyClaimsService.createOne(countiesTest);

      await statusTypeRepo.save(statusTypeTestTwo);
      await entityStatusRepo.save(entityStatusTestTwo);
      await statesRepo.save(testStateTwo);
      await countiesRepo.save(countiesTestTwo);
      await countyClaimsService.createOne(countiesTestTwo);

      await countyClaimsService.createOrUpdateClaim(countyClaimsTest, [], []);
      await countyClaimsService.createOrUpdateClaim(countyClaimsTestTwo, [], []);
      const numberOfState = await countyClaimsService.getAllUserCountyClaims(userTest.email);
      expect(numberOfState.length).toEqual(2);
    });

    it('getActiveClaimsForCountyFips', async () => {
      await usersRepo.save(userTest);
      await statusTypeRepo.save(statusTypeTest);
      await entityStatusRepo.save(entityStatusTest);
      await statesRepo.save(testState);
      await countiesRepo.save(countiesTest);
      await countyClaimsService.createOne(countiesTest);
      await countyClaimsService.createOrUpdateClaim(countyClaimsTest, [], []);
      const setClaim = await countyClaimsService.getActiveClaimsForCountyFips(countiesTest.countyFips);
      expect(setClaim[0].county.name).toEqual(countiesTest.name);
      await countyClaimsService.closeClaim(setClaim[0].guid);
      expect(await countyClaimsService.getActiveClaimsForCountyFips(countiesTest.countyFips)).toEqual([]);
    });

    it('closeClaim', async () => {
      await usersRepo.save(userTest);
      await statusTypeRepo.save(statusTypeTest);
      await entityStatusRepo.save(entityStatusTest);
      await statesRepo.save(testState);
      await countiesRepo.save(countiesTest);
      await countyClaimsService.createOne(countiesTest);
      await countyClaimsService.createOrUpdateClaim(countyClaimsTest, [], []);
      const setClaim = await countyClaimsService.getActiveClaimsForCountyFips(countiesTest.countyFips);
      await countyClaimsService.closeClaim(setClaim[0].guid);
      expect(await countyClaimsService.getActiveClaimsForCountyFips(countiesTest.countyFips)).toEqual([]);
    });

    it('getHistoricClaimsForCounty', async () => {
      await usersRepo.save(userTest);
      await statusTypeRepo.save(statusTypeTest);
      await entityStatusRepo.save(entityStatusTest);
      await statesRepo.save(testState);
      await countiesRepo.save(countiesTest);
      await countyClaimsService.createOne(countiesTest);
      await countyClaimsService.createOrUpdateClaim(countyClaimsTest, [], []);
      const setClaim = await countyClaimsService.getActiveClaimsForEmail(userTest.email);
      await countyClaimsService.closeClaim(setClaim[0].guid);
      const historicClaim = await countyClaimsService.getHistoricClaimsForCounty(countiesTest.countyFips);
      expect(historicClaim[0].guid).toEqual(setClaim[0].guid);
    });

    it('getSuggestedClaims', async () => {
      await usersRepo.save(userTest);
      await statusTypeRepo.save(statusTypeTest);
      await entityStatusRepo.save(entityStatusTest);
      await statesRepo.save(testState);
      await countiesRepo.save(countiesTest);
      await countiesRepo.save(countiesTestThree);

      await countyClaimsService.createOne(countiesTest);
      await countyClaimsService.createOrUpdateClaim(countyClaimsTest, [], []);

      const suggestedClaim = await countyClaimsService.getSuggestedClaims(countiesTest.countyFips);
      expect(suggestedClaim[0].countyFips).toEqual(countiesTestThree.countyFips);
    });

    it('getClaimsAdmin', async () => {
      await usersRepo.save(userTest);
      await statusTypeRepo.save(statusTypeTest);
      await entityStatusRepo.save(entityStatusTest);
      await statesRepo.save(testState);
      await countiesRepo.save(countiesTest);
      await countyClaimsService.createOne(countiesTest);

      await countyClaimsService.createOrUpdateClaim(countyClaimsTest, [], []);

      const suggestedClaim = await countyClaimsService.getClaimsAdmin({
        stateFips: countyClaimsTest.county.stateFips.stateFips,
        countyFips: countyClaimsTest.county.countyFips,
        email: countyClaimsTest.user.email
      });
      expect(suggestedClaim[0].user.email).toEqual(countyClaimsTest.user.email);
    });

    it('getInfosForClaim', async () => {
      await usersRepo.save(userTest);
      await statusTypeRepo.save(statusTypeTest);
      await entityStatusRepo.save(entityStatusTest);
      await statesRepo.save(testState);
      await countiesRepo.save(countiesTest);
      await countyClaimsService.createOne(countiesTest);

      await countyClaimsService.createOrUpdateClaim(countyClaimsTest, [], []);
      const setClaim = await countyClaimsService.getActiveClaimsForEmail(userTest.email);
      const suggestedClaim = await countyClaimsService.getInfosForClaim(setClaim[0].guid);
      expect(suggestedClaim.infos.length).toEqual(1);
    });
  });
});
