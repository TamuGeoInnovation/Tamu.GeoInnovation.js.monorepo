import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';
import { TestingSite, User } from '@tamu-gisc/covid/common/entities';
import { config } from '@tamu-gisc/covid/data-api';
import { UsersService } from './users.service';
import { UsersModule } from './users.module';

describe('Testing Site Integration Tests', () => {
  let usersService: UsersService;
  let usersRepo: Repository<User>;
  let testingSitesRepo: Repository<TestingSite>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule, TypeOrmModule.forFeature([User]), TypeOrmModule.forRoot(config)],
      providers: [User]
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
});
