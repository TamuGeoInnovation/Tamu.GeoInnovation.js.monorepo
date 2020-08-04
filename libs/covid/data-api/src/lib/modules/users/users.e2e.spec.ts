import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getConnection, DeepPartial } from 'typeorm';
import {
  TestingSite,
  User,
  CountyClaim,
  Lockdown,
  County,
  TestingSiteInfo,
  Location,
  EntityStatus,
  CountyClaimInfo,
  EntityToValue,
  LockdownInfo,
  State
} from '@tamu-gisc/covid/common/entities';
import { config } from '@tamu-gisc/covid/data-api';
import { UsersService } from './users.service';
import { TestingSitesService } from '../testing-sites/testing-sites.service';
import { UsersModule } from './users.module';
import { TestingSitesModule } from '../testing-sites/testing-sites.module';
import { CountyClaimsService } from '../county-claims/county-claims.service';
import { CountyClaimsModule } from '../county-claims/county-claims.module';
import { LockdownsService } from '../lockdowns/lockdowns.service';
import { LockdownsModule } from '../lockdowns/lockdowns.module';
import { CountiesService } from '../counties/counties.service';
import { CountiesModule } from '../counties/counties.module';

describe('Users Integration Tests', () => {
  let usersService: UsersService;
  let countiesService: CountiesService;
  let countyClaimsService: CountyClaimsService;
  let testingSitesService: TestingSitesService;
  let lockdownsService: LockdownsService;

  let usersRepo: Repository<User>;
  let countyClaimsRepo: Repository<CountyClaim>;
  let testingSitesRepo: Repository<TestingSite>;
  let lockdownsRepo: Repository<Lockdown>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        CountyClaimsModule,
        CountiesModule,
        TestingSitesModule,
        LockdownsModule,
        TypeOrmModule.forFeature([
          User,
          TestingSite,
          CountyClaim,
          CountyClaimInfo,
          EntityToValue,
          Lockdown,
          County,
          State,
          TestingSiteInfo,
          Location,
          LockdownInfo,
          EntityStatus
        ]),
        TypeOrmModule.forRoot(config)
      ],
      providers: [UsersService, TestingSitesService, CountyClaimsService, LockdownsService, CountiesService]
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    countiesService = module.get<CountiesService>(CountiesService);
    countyClaimsService = module.get<CountyClaimsService>(CountyClaimsService);
    testingSitesService = module.get<TestingSitesService>(TestingSitesService);
    lockdownsService = module.get<LockdownsService>(LockdownsService);

    usersRepo = module.get<Repository<User>>(getRepositoryToken(User));
    countyClaimsRepo = module.get<Repository<CountyClaim>>(getRepositoryToken(CountyClaim));
    testingSitesRepo = module.get<Repository<TestingSite>>(getRepositoryToken(TestingSite));
    lockdownsRepo = module.get<Repository<Lockdown>>(getRepositoryToken(Lockdown));
  });

  /**
   * after each test, delete everything from states table
   */

  afterEach(async () => {
    await usersRepo.query(`DELETE FROM users`);
    await countyClaimsRepo.query(`DELETE FROM county_claims`);
    await testingSitesRepo.query(`DELETE FROM testing_site_infos`);
    await testingSitesRepo.query(`DELETE FROM testing_sites`);
    await lockdownsRepo.query(`DELETE FROM lockdown_infos`);
    await lockdownsRepo.query(`DELETE FROM lockdowns`);
  });

  /**
   * after all tests are done, delete everything from states table
   */

  afterAll(async () => {
    const connection = getConnection();
    await connection
      .createQueryBuilder()
      .delete()
      .from(User)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(CountyClaim)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(TestingSite)
      .execute();
    await connection.close();
  });

  const countyTest: DeepPartial<County> = {
    name: 'Foo',
    countyFips: 1
  };

  const userTest: DeepPartial<User> = {
    email: 'Foo'
  };

  const userTestTwo: DeepPartial<User> = {
    email: 'Bar'
  };
  describe('getUsers', () => {
    it('should be able to getUsers', async () => {
      await usersService.createOne(userTest);
      await usersService.createOne(userTestTwo);
      const foundUser = await usersService.getUsers();
      expect(foundUser).toMatchObject([{ email: 'Bar' }, { email: 'Foo' }]);
    });
  });

  /*describe('getUsersWithStats', () => {
    it('should be able to getUsersWithStats', async () => {
      await usersService.createOne(userTest);
      await countiesService.createOne(countyTest);

      const countyClaimTest: DeepPartial<CountyClaim> = {
        user: userTest,
        county: countyTest,
        statuses: [{ type: { id: 1, name: 'Foo' } }]
      };

      await countyClaimsService.createOrUpdateClaim(countyClaimTest, [], []);
      expect(await usersService.getUsersWithStats()).toEqual([]);
    });
  });

  describe('getUsersWithStats', () => {
    it('should be able to getUsersWithStats', async () => {
      await lockdownsService.createOne(lockdownTest);
      await testingSitesService.createOne(testingSiteTest);
      await usersService.createOne(userTest);
      await countyClaimsService.createOne(countyClaimTest);
      expect(await usersService.getUsersWithStats()).toEqual([]);
    });
  });

  describe('verifyEmail', () => {
    it('should return error object for undefined email', async () => {
      expect(await usersService.verifyEmail(undefined)).toMatchObject({
        statusCode: 500,
        success: false,
        message: 'Input parameter missing'
      });
    });
    it('should return error object for no user with email', async () => {
      expect(await usersService.verifyEmail('Foobar')).toMatchObject({
        statusCode: 400,
        success: false,
        message: 'Email not found'
      });
    });
    it('should be able to verify the existance of an set user email', async () => {
      await usersService.createOne(userTest);
      await usersService.createOne(userTestTwo);
      const foundUser = await usersService.verifyEmail('Foo');
      expect(foundUser).toMatchObject({ email: 'Foo' });
    });
  });

  describe('registerEmail', () => {
    it('should return error object for undefined email', async () => {
      expect(await usersService.registerEmail(undefined)).toMatchObject({
        status: 500,
        success: false,
        message: 'Input parameter missing'
      });
    });
    it('should be able to register via Email', async () => {
      await usersService.createOne(userTest);
      await usersService.createOne(userTestTwo);
      const foundUser = await usersService.registerEmail('Foo');
      expect(foundUser).toMatchObject({ email: 'Foo' });
    });
  });
  it('should be able to register via Email for unfound user', async () => {
    await usersService.createOne(userTest);
    await usersService.createOne(userTestTwo);
    const foundUser = await usersService.registerEmail('Foobar');
    expect(foundUser).toMatchObject({ email: 'Foobar' });
  });*/
});
