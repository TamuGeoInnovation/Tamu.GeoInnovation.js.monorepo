import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';
import { TestingSite, User } from '@tamu-gisc/covid/common/entities';
import { config } from '@tamu-gisc/covid/data-api';
import { UsersService } from './users.service';
import { UsersModule } from './users.module';

const userTest: Partial<User> = {
  email: 'Foo'
};

const userTestTwo: Partial<User> = {
  email: 'Bar'
};

describe('Testing Site Integration Tests', () => {
  let usersService: UsersService;
  let usersRepo: Repository<User>;
  let testingSitesRepo: Repository<TestingSite>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        TypeOrmModule.forFeature([User, TestingSite]),
        TypeOrmModule.forRoot({
          type: 'mssql',
          host: 'localhost',
          port: 1433,
          username: 'testing',
          password: 'test',
          database: 'test',
          autoLoadEntities: true,
          synchronize: true
        })
      ],
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
    await testingSitesRepo.query(`DELETE FROM testingSites`);
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

  describe('registerEmail', () => {
    it('should be able to register via Email', async () => {
      // create new state
      await usersService.createOne(userTest);
      await usersService.createOne(userTestTwo);
      const foundUser = await usersService.registerEmail('Foo');
      expect(foundUser).toMatchObject([userTest]);
    });
  });
});
