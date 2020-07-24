import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getConnection, DeepPartial } from 'typeorm';
import { TestingSite, User, CountyClaim, Lockdown } from '@tamu-gisc/covid/common/entities';
import { config } from '@tamu-gisc/covid/data-api';
import { UsersService } from './users.service';
import { TestingSitesService } from '../testing-sites/testing-sites.service';
import { UsersModule } from './users.module';
import { TestingSitesModule } from '../testing-sites/testing-sites.module';
import { CountyClaimsService } from '../county-claims/county-claims.service';
import { CountyClaimsModule } from '../county-claims/county-claims.module';

const userTest: DeepPartial<User> = {
  email: 'Foo',
  claims: []
};

const userTestTwo: DeepPartial<User> = {
  email: 'Bar',
  claims: []
};

describe('Users Integration Tests', () => {
  let usersService: UsersService;
  let countyClaimService: CountyClaimsService;
  let testingSiteService: TestingSitesService;

  let usersRepo: Repository<User>;
  let testingSitesRepo: Repository<TestingSite>;
  let countyClaimRepo: Repository<CountyClaim>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        TestingSitesModule,
        CountyClaimsModule,
        TypeOrmModule.forFeature([User, TestingSite, CountyClaimsService]),
        TypeOrmModule.forRoot(config)
      ],
      providers: [UsersService, TestingSitesService, CountyClaimsService]
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    countyClaimService = module.get<CountyClaimsService>(CountyClaimsService);
    testingSiteService = module.get<TestingSitesService>(TestingSitesService);

    usersRepo = module.get<Repository<User>>(getRepositoryToken(User));
    testingSitesRepo = module.get<Repository<TestingSite>>(getRepositoryToken(TestingSite));
    countyClaimRepo = module.get<Repository<CountyClaim>>(getRepositoryToken(CountyClaim));
  });

  /**
   * after each test, delete everything from states table
   */

  afterEach(async () => {
    await usersRepo.query(`DELETE FROM users`);
    await usersRepo.query(`DELETE FROM county_claims`);
    await testingSitesRepo.query(`DELETE FROM testing_sites`);
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

  describe('getUsers', () => {
    it('should be able to getUsers', async () => {
      await usersService.createOne(userTest);
      await usersService.createOne(userTestTwo);
      const foundUser = await usersService.getUsers();
      expect(foundUser).toMatchObject([{ email: 'Bar' }, { email: 'Foo' }]);
    });
  });

  describe('getUsersWithStats', () => {
    it('should be able to getUsersWithStats', async () => {
      await usersService.createOne(userTest);
      await usersService.createOne(userTestTwo);
      expect(await usersService.getUsersWithStats()).toEqual([{ claims: [], email: 'Bar' }, { claims: [], email: 'Foo' }]);
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
  });
});
