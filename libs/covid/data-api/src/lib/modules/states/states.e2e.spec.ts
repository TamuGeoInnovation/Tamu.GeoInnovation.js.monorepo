import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';
import { StatesService } from './states.service';
import { StatesModule } from './states.module';
import { State } from '@tamu-gisc/covid/common/entities';

const stateTest: Partial<State> = {
  abbreviation: 'F',
  stateFips: 9,
  name: 'Foo'
};

const stateTestTwo: Partial<State> = {
  stateFips: 10,
  name: 'Bar',
  abbreviation: 'B'
};

describe('State Integration Tests', () => {
  let service: StatesService;
  let repo: Repository<State>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        StatesModule,
        TypeOrmModule.forFeature([State]),
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
      providers: [StatesService]
    }).compile();

    service = module.get<StatesService>(StatesService);
    repo = module.get<Repository<State>>(getRepositoryToken(State));
  });

  /**
   * after each test, delete everything from states table
   */

  afterEach(async () => {
    await repo.query(`DELETE FROM states`);
  });

  /**
   * after all tests are done, delete everything from states table
   */

  afterAll(async () => {
    const connection = getConnection();
    await connection
      .createQueryBuilder()
      .delete()
      .from(State)
      .execute();
    await connection.close();
  });

  describe('search', () => {
    it('should be able to get a State By search', async () => {
      // create new state
      await service.createOne(stateTest);
      await service.createOne(stateTestTwo);
      const foundState = await service.search('10');
      expect(foundState).toMatchObject([stateTestTwo]);
    });
  });

  describe('getStateByFips', () => {
    it('should be able to get a State By Fips', async () => {
      // create new state
      await service.createOne(stateTest);
      await service.createOne(stateTestTwo);
      const foundState = await service.getStateByFips(stateTestTwo.stateFips);
      expect(foundState).toMatchObject(stateTestTwo);
    });
  });
});
