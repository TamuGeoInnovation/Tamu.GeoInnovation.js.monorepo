import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';
import { State, County, CountyClaim } from '@tamu-gisc/covid/common/entities';
import { CountiesService } from './counties.service';
import { CountiesModule } from './counties.module';
import { config } from '@tamu-gisc/covid/data-api';
import { StatesService } from '../states/states.service';
import { StatesModule } from '../states/states.module';

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

describe('County Integration Tests', () => {
  let service: CountiesService;
  let statesService: StatesService;

  let stateRepo: Repository<State>;
  let countyRepo: Repository<County>;
  let countyClaimRepo: Repository<CountyClaim>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CountiesModule,
        StatesModule,
        TypeOrmModule.forFeature([County, CountyClaim, State]),
        TypeOrmModule.forRoot(config)
      ],
      providers: [CountiesService, StatesService]
    }).compile();

    service = module.get<CountiesService>(CountiesService);
    statesService = module.get<StatesService>(StatesService);
    stateRepo = module.get<Repository<State>>(getRepositoryToken(State));
    countyRepo = module.get<Repository<County>>(getRepositoryToken(County));
    countyClaimRepo = module.get<Repository<CountyClaim>>(getRepositoryToken(CountyClaim));
  });

  /**
   * after each test, delete everything from each table
   */

  afterEach(async () => {
    await countyRepo.query(`DELETE FROM counties`);
    await stateRepo.query(`DELETE FROM states`);
    await countyClaimRepo.query(`DELETE FROM county_claims`);
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
    await connection
      .createQueryBuilder()
      .delete()
      .from(County)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(CountyClaim)
      .execute();
    await connection.close();
  });

  describe('search', () => {
    it('should be able to get a County By search', async () => {
      await statesService.createOne(testState);
      await statesService.createOne(testStateTwo);
      await service.createOne(countiesTest);
      await service.createOne(countiesTestTwo);
      expect(await service.search('Foo')).toMatchObject([
        {
          countyFips: 1,
          name: 'Foo'
        }
      ]);
    });
  });

  describe('searchCountiesForState', () => {
    it('should be able to get a County By searchCountiesForState', async () => {
      await statesService.createOne(testState);
      await statesService.createOne(testStateTwo);
      await service.createOne(countiesTest);
      await service.createOne(countiesTestTwo);
      expect(await service.searchCountiesForState(1, 'Foo')).toMatchObject([
        {
          countyFips: 1,
          name: 'Foo'
        }
      ]);
    });
  });

  describe('getCountiesForState', () => {
    it('should be able to get a County By getCountiesForState', async () => {
      await statesService.createOne(testState);
      await statesService.createOne(testStateTwo);
      await service.createOne(countiesTest);
      await service.createOne(countiesTestTwo);
      expect(await service.getCountiesForState(1)).toMatchObject([
        {
          countyFips: 1,
          name: 'Foo'
        }
      ]);
    });
  });

  describe('getCountiesForState', () => {
    it('should be able to get a County By getCountiesForState', async () => {
      await statesService.createOne(testState);
      await statesService.createOne(testStateTwo);
      await service.createOne(countiesTest);
      await service.createOne(countiesTestTwo);
      expect(await service.getCountiesForState(1)).toMatchObject([
        {
          countyFips: 1,
          name: 'Foo'
        }
      ]);
    });
  });
});
