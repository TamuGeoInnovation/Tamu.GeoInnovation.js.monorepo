import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getConnection, DeepPartial } from 'typeorm';

import { config } from '@tamu-gisc/covid/data-api';
import { CountyClaimsService } from './county-claims.service';
import { CountiesService } from '../counties/counties.service';
import { TestingSitesService } from '../testing-sites/testing-sites.service';
import { LockdownsService } from '../lockdowns/lockdowns.service';
import {
  CountyClaim,
  County,
  TestingSite,
  Lockdown,
  EntityStatus,
  EntityToValue,
  CountyClaimInfo,
  User,
  TestingSiteInfo,
  Location,
  LockdownInfo
} from '@tamu-gisc/covid/common/entities';
import { CountyClaimsModule } from './county-claims.module';
import { CountiesModule } from '../counties/counties.module';
import { TestingSitesModule } from '../testing-sites/testing-sites.module';
import { LockdownsModule } from '../lockdowns/lockdowns.module';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';

const countyTest: DeepPartial<County> = {
  name: 'Foo',
  countyFips: 1
};

const userTest: DeepPartial<User> = {
  email: 'Foo'
};

const countyClaimTest: DeepPartial<CountyClaim> = {
  user: userTest,
  county: countyTest
};

describe('CategoryValues Integration Tests', () => {
  let countyClaimsService: CountyClaimsService;
  let usersService: UsersService;
  let countiesService: CountiesService;
  let testingSitesService: TestingSitesService;
  let lockdownsService: LockdownsService;

  let countyClaimsRepo: Repository<CountyClaim>;
  let usersRepo: Repository<User>;

  let countiesRepo: Repository<County>;

  let entityStatusRepo: Repository<EntityStatus>;
  let entityToValueRepo: Repository<EntityToValue>;
  let countyClaimInfoRepo: Repository<CountyClaimInfo>;

  let testingSitesRepo: Repository<TestingSite>;
  let lockdownsRepo: Repository<Lockdown>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CountyClaimsModule,
        CountiesModule,
        TestingSitesModule,
        LockdownsModule,
        UsersModule,
        TypeOrmModule.forFeature([
          CountyClaim,
          County,
          TestingSite,
          Lockdown,
          EntityStatus,
          CountyClaim,
          User,
          CountyClaimInfo,
          EntityToValue,
          TestingSiteInfo,
          Location,
          LockdownInfo
        ]),
        TypeOrmModule.forRoot(config)
      ],
      providers: [CountyClaimsService, CountiesService, TestingSitesService, LockdownsService, UsersService]
    }).compile();

    countyClaimsService = module.get<CountyClaimsService>(CountyClaimsService);
    usersService = module.get<UsersService>(UsersService);
    countiesService = module.get<CountiesService>(CountiesService);
    testingSitesService = module.get<TestingSitesService>(TestingSitesService);
    lockdownsService = module.get<LockdownsService>(LockdownsService);

    countyClaimsRepo = module.get<Repository<CountyClaim>>(getRepositoryToken(CountyClaim));
    usersRepo = module.get<Repository<User>>(getRepositoryToken(User));
    entityStatusRepo = module.get<Repository<EntityStatus>>(getRepositoryToken(EntityStatus));
    entityToValueRepo = module.get<Repository<EntityToValue>>(getRepositoryToken(EntityToValue));
    countyClaimInfoRepo = module.get<Repository<CountyClaimInfo>>(getRepositoryToken(CountyClaimInfo));
    countiesRepo = module.get<Repository<County>>(getRepositoryToken(County));
    testingSitesRepo = module.get<Repository<TestingSite>>(getRepositoryToken(TestingSite));
    lockdownsRepo = module.get<Repository<Lockdown>>(getRepositoryToken(Lockdown));
  });

  /**
   * after each test, delete everything from each table
   */

  afterEach(async () => {
    await countyClaimsRepo.query(`DELETE FROM county_claims`);
    await usersRepo.query(`DELETE FROM users`);
    await entityStatusRepo.query(`DELETE FROM entity_statuses`);
    await entityToValueRepo.query(`DELETE FROM entity_to_values`);
    await countyClaimInfoRepo.query(`DELETE FROM county_claim_infos`);
    await countiesRepo.query(`DELETE FROM counties`);
    await testingSitesRepo.query(`DELETE FROM testing_sites`);
    await lockdownsRepo.query(`DELETE FROM lockdowns`);
  });

  /**
   * after all tests are done, delete everything from each table
   */

  afterAll(async () => {
    const connection = getConnection();
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
      .from(CountyClaimInfo)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(County)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(TestingSite)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(Lockdown)
      .execute();
    await connection.close();
  });

  describe('validation', () => {
    it('service should be defined', async () => {
      countyClaimsService.userRepo.create(userTest);
      countiesService.createOne(countyTest);
      expect(await countyClaimsService.createOrUpdateClaim({ user: { email: 'Foo' } }, [], [])).toReturnWith('');
    });
  });
});
