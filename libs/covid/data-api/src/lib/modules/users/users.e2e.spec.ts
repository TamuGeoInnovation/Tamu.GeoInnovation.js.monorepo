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

describe('Users Setup', () => {
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
  describe('Users Integration Tests', () => {
    it('getUsers', async () => {
      expect(await usersService.getUsers()).toMatchObject([]);
      await usersService.registerEmail('Foo');
      expect(await usersService.getUsers()).toMatchObject([{ email: 'Foo' }]);
      await usersService.registerEmail('Bar');
      expect(await usersService.getUsers()).toMatchObject([{ email: 'Bar' }, { email: 'Foo' }]);
    });

    it('getUsersWithStats', async () => {
      expect(await usersService.getUsersWithStats()).toMatchObject([]);
      await usersService.registerEmail('Foo');
      expect(await usersService.getUsersWithStats()).toMatchObject([{ email: 'Foo' }]);
    });

    it('verifyEmail', async () => {
      await usersService.registerEmail('Foo');
      expect(await usersService.verifyEmail('')).toMatchObject({
        statusCode: 500,
        success: false,
        message: 'Input parameter missing'
      });
      expect(await usersService.verifyEmail('Bar')).toMatchObject({
        statusCode: 400,
        success: false,
        message: 'Email not found'
      });
      expect(await usersService.verifyEmail('Foo')).toMatchObject({ email: 'Foo' });
    });

    it('registerEmail', async () => {
      const setEmail = await usersService.registerEmail('Foo');
      expect(setEmail).toMatchObject({ email: 'Foo' });
    });
  });
});
