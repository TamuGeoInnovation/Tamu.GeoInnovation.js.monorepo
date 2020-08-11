import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';
import { StatesService } from './states.service';
import { StatesModule } from './states.module';
import { State } from '@tamu-gisc/covid/common/entities';
import { config } from '@tamu-gisc/covid/data-api';

describe('State Setup', () => {
  let service: StatesService;
  let repo: Repository<State>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [StatesModule, TypeOrmModule.forFeature([State]), TypeOrmModule.forRoot(config)],
      providers: [StatesService]
    }).compile();

    service = module.get<StatesService>(StatesService);
    repo = module.get<Repository<State>>(getRepositoryToken(State));
  });

  /**
   * after each test, delete everything from each table
   */

  afterEach(async () => {
    await repo.query(`DELETE FROM states`);
  });

  /**
   * after all tests are done, delete everything from each table
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

  describe('State Integration Test', () => {
    it('Should be able to get a state by search', async () => {
      // create new state
      let foundState = await service.search('9');
      expect(foundState).toMatchObject([]);
      await service.createOne(stateTest);
      foundState = await service.search('9');
      expect(foundState).toMatchObject([stateTest]);
      await service.createOne(stateTestTwo);
      foundState = await service.search('10');
      expect(foundState).toMatchObject([stateTestTwo]);
    });

    it('Should be able to get a state by Fips', async () => {
      // create new state
      let foundState = await service.getStateByFips(stateTestTwo.stateFips);
      expect(foundState).toBeUndefined();
      await service.createOne(stateTest);
      foundState = await service.getStateByFips(stateTest.stateFips);
      expect(foundState).toMatchObject(stateTest);
      await service.createOne(stateTestTwo);
      foundState = await service.getStateByFips(stateTestTwo.stateFips);
      expect(foundState).toMatchObject(stateTestTwo);
    });
  });
});
