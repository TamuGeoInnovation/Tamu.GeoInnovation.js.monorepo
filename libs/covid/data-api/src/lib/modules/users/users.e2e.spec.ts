import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';
import { TestingSite, User, CountyClaim, State, County, StatusType, EntityStatus } from '@tamu-gisc/covid/common/entities';
import { config } from '@tamu-gisc/covid/data-api';
import { UsersService } from './users.service';
import { UsersModule } from './users.module';

const testState = new State();
testState.name = 'Foo';
testState.abbreviation = 'F';
testState.stateFips = 1;

const testStateTwo = new State();
testStateTwo.name = 'Bar';
testStateTwo.abbreviation = 'B';
testStateTwo.stateFips = 2;

const countiesTest: Partial<County> = {
  countyFips: 1,
  stateFips: testState,
  name: 'Foo'
};

const countiesTestTwo: Partial<County> = {
  countyFips: 2,
  stateFips: testStateTwo,
  name: 'Bar'
};

const statusTypeTest = new StatusType();
statusTypeTest.id = 1;
statusTypeTest.name = 'foo';

const statusTypeTwoTest = new StatusType();
statusTypeTest.id = 2;
statusTypeTest.name = 'bar';

const entityStatusTest = new EntityStatus();
entityStatusTest.type = statusTypeTest;

const userTest: Partial<User> = {
  email: 'Foo'
};

const userTestTwo: Partial<User> = {
  email: 'Bar'
};

describe('Users Integration Tests', () => {
  let usersService: UsersService;
  let usersRepo: Repository<User>;
  let testingSitesRepo: Repository<TestingSite>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule, TypeOrmModule.forFeature([User, TestingSite]), TypeOrmModule.forRoot(config)],
      providers: [UsersService]
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersRepo = module.get<Repository<User>>(getRepositoryToken(User));
    testingSitesRepo = module.get<Repository<TestingSite>>(getRepositoryToken(TestingSite));
  });

  /**
   * after each test, delete everything from states table
   */

  afterEach(async () => {
    await usersRepo.query(`DELETE FROM users`);
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
      .from(TestingSite)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(User)
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
      const foundUser = await usersService.getUsersWithStats();
      expect(await usersService.getUsersWithStats()).toMatchObject([
        { claims: [], email: 'Bar' },
        { claims: [], email: 'Foo' }
      ]);
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
