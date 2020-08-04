import {
  CountyClaim,
  User,
  County,
  State,
  CountyClaimInfo,
  EntityStatus,
  EntityToValue,
  StatusType,
  TestingSite,
  LockdownInfo,
  Lockdown
} from '@tamu-gisc/covid/common/entities';
import { CountyClaimsService } from '../county-claims/county-claims.service';
import { UsersService } from '../users/users.service';
import { StatusTypesService } from '../status-types/status-types.service';
import { LockdownsService } from './lockdowns.service';
import { Repository, getConnection, DeepPartial } from 'typeorm';
import { TestingModule, Test } from '@nestjs/testing';
import { CountyClaimsModule } from '../county-claims/county-claims.module';
import { UsersModule } from '../users/users.module';
import { StatusTypesModule } from '../status-types/status-types.module';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { config } from '@tamu-gisc/covid/data-api';
import { LockdownsModule } from './lockdowns.module';

describe('County Claims Integration Tests', () => {
  let lockdownsService: LockdownsService;
  let countyClaimsService: CountyClaimsService;
  let usersService: UsersService;
  let statusTypesService: StatusTypesService;

  let lockdownsRepo: Repository<Lockdown>;
  let lockdownInfoRepo: Repository<LockdownInfo>;

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
        LockdownsModule,
        CountyClaimsModule,
        UsersModule,
        StatusTypesModule,
        TypeOrmModule.forFeature([
          CountyClaim,
          User,
          Lockdown,
          LockdownInfo,
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
      providers: [CountyClaimsService, UsersService, StatusTypesService, LockdownsService]
    }).compile();
    lockdownsService = module.get<LockdownsService>(LockdownsService);
    countyClaimsService = module.get<CountyClaimsService>(CountyClaimsService);
    usersService = module.get<UsersService>(UsersService);
    statusTypesService = module.get<StatusTypesService>(StatusTypesService);

    lockdownsRepo = module.get<Repository<Lockdown>>(getRepositoryToken(Lockdown));
    lockdownInfoRepo = module.get<Repository<LockdownInfo>>(getRepositoryToken(LockdownInfo));
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
    await lockdownInfoRepo.query(`DELETE FROM lockdown_infos`);
    await lockdownsRepo.query(`DELETE FROM lockdowns`);
    await usersRepo.query(`DELETE FROM users`);
    await countiesRepo.query(`DELETE FROM counties`);
    await countiesRepo.query(`DELETE FROM states`);
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
      .from(LockdownInfo)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(Lockdown)
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

  describe('Validation', () => {
    it('service should be defined', async () => {
      // create new state
      expect(lockdownsService).toBeDefined();
    });
    /*it('createOrUpdateLockdown', async () => {
      await usersRepo.save(userTest);
      await statusTypeRepo.save(statusTypeTest);
      await entityStatusRepo.save(entityStatusTest);
      await statesRepo.save(testState);
      await countiesRepo.save(countiesTest);
      await countyClaimsService.createOne(countiesTest);
      await countyClaimsService.createOrUpdateClaim(countyClaimsTest, [], []);

      const setLockdown = await lockdownsService.createOrUpdateLockdown({ claim: countyClaimsTest, info: {} });

      expect(setLockdown[0].county.name).toEqual(countiesTest.name);
    });*/
  });
});

/* 
Lockdowns:
	Find each neccesary part of Params
	Find refrenced out-side repos
	Find any none direct repos (Ex - Call to get Statefips from County Entity).

*/
