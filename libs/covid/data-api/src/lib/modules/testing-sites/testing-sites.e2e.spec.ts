import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getConnection, DeepPartial } from 'typeorm';
import {
  TestingSite,
  TestingSiteInfo,
  County,
  CountyClaim,
  Location,
  User,
  EntityStatus,
  EntityToValue,
  CountyClaimInfo,
  State,
  StatusType
} from '@tamu-gisc/covid/common/entities';
import { config } from '@tamu-gisc/covid/data-api';
import { TestingSitesService } from './testing-sites.service';
import { TestingSitesModule } from './testing-sites.module';
import { CountyClaimsService } from '../county-claims/county-claims.service';
import { CountyClaimsModule } from '../county-claims/county-claims.module';

describe('Testing Site Integration Tests', () => {
  let testingSitesService: TestingSitesService;
  let countyClaimsService: CountyClaimsService;

  let testingSitesRepo: Repository<TestingSite>;
  let testingSiteInfoRepo: Repository<TestingSiteInfo>;
  let countiesRepo: Repository<County>;
  let statesRepo: Repository<State>;

  let countyClaimsRepo: Repository<CountyClaim>;
  let countyClaimInfoRepo: Repository<CountyClaimInfo>;
  let locationsRepo: Repository<Location>;
  let usersRepo: Repository<User>;
  let entityStatusRepo: Repository<EntityStatus>;
  let entityToValueRepo: Repository<EntityToValue>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestingSitesModule,
        CountyClaimsModule,
        TypeOrmModule.forFeature([
          TestingSite,
          TestingSiteInfo,
          County,
          State,
          CountyClaim,
          CountyClaimInfo,
          EntityStatus,
          EntityToValue,
          User,
          Location
        ]),
        TypeOrmModule.forRoot(config)
      ],
      providers: [TestingSitesService, CountyClaimsService]
    }).compile();

    testingSitesService = module.get<TestingSitesService>(TestingSitesService);

    countyClaimsService = module.get<CountyClaimsService>(CountyClaimsService);

    testingSitesRepo = module.get<Repository<TestingSite>>(getRepositoryToken(TestingSite));
    testingSiteInfoRepo = module.get<Repository<TestingSiteInfo>>(getRepositoryToken(TestingSiteInfo));
    countiesRepo = module.get<Repository<County>>(getRepositoryToken(County));
    statesRepo = module.get<Repository<State>>(getRepositoryToken(State));

    countyClaimsRepo = module.get<Repository<CountyClaim>>(getRepositoryToken(CountyClaim));
    countyClaimInfoRepo = module.get<Repository<CountyClaimInfo>>(getRepositoryToken(CountyClaimInfo));
    locationsRepo = module.get<Repository<Location>>(getRepositoryToken(Location));
    usersRepo = module.get<Repository<User>>(getRepositoryToken(User));
    entityStatusRepo = module.get<Repository<EntityStatus>>(getRepositoryToken(EntityStatus));
    entityToValueRepo = module.get<Repository<EntityToValue>>(getRepositoryToken(EntityToValue));
  });

  /**
   * after each test, delete everything from states table
   */

  afterEach(async () => {
    await testingSitesRepo.query(`DELETE FROM testing_sites`);
    await testingSiteInfoRepo.query(`DELETE FROM testing_site_infos`);
    await entityStatusRepo.query(`DELETE FROM entity_statuses`);
    await countyClaimInfoRepo.query(`DELETE FROM county_claim_infos`);
    await countyClaimsRepo.query(`DELETE FROM county_claims`);
    await usersRepo.query(`DELETE FROM users`);
    await countiesRepo.query(`DELETE FROM counties`);
    await statesRepo.query(`DELETE FROM states`);
  });

  /**
   * after all tests are done, delete everything from states table
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
      .from(EntityToValue)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(State)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(County)
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
      .from(TestingSite)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(TestingSiteInfo)
      .execute();
    await connection.close();
  });
  const userTest: DeepPartial<User> = { email: 'Foo', guid: 'Bar' };

  const testState: DeepPartial<State> = {
    name: 'Foo',
    abbreviation: 'F',
    stateFips: 1
  };

  const countiesTest: DeepPartial<County> = {
    countyFips: 1,
    name: 'Foo',
    stateFips: testState
  };

  const entityStatusTest: DeepPartial<EntityStatus> = {
    guid: 'Foo'
  };

  const countyClaimsTest: DeepPartial<CountyClaim> = {
    user: userTest,
    county: countiesTest,
    statuses: [entityStatusTest]
  };

  const entityToValueTest: DeepPartial<EntityToValue> = {};

  const testingSiteInfoTest: DeepPartial<TestingSiteInfo> = {
    responses: [entityToValueTest]
  };

  describe('Validation', () => {
    it('service should be defined', async () => {
      expect(testingSitesService).toBeDefined();
    });

    /*it('service should be defined', async () => {
      await usersRepo.save(userTest);
      await entityStatusRepo.save(entityStatusTest);
      await statesRepo.save(testState);
      await countiesRepo.save(countiesTest);
      await countyClaimsService.createOne(countiesTest);
      await countyClaimsService.createOrUpdateClaim(countyClaimsTest, [], []);
      const createdTestingSite = await testingSitesService.createOrUpdateTestingSite({
        claim: countyClaimsTest,
        info: [testingSiteInfoTest],
        statuses: []
      });
      expect(createdTestingSite).toEqual('Foo');
    });*/
  });
});
