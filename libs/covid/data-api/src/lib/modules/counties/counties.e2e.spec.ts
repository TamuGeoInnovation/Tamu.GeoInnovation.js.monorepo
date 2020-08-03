import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getConnection, DeepPartial } from 'typeorm';
import { State, County, CountyClaim } from '@tamu-gisc/covid/common/entities';
import { CountiesService } from './counties.service';
import { CountiesModule } from './counties.module';
import { config } from '@tamu-gisc/covid/data-api';

describe('County Integration Tests', () => {
  let countiesService: CountiesService;

  let stateRepo: Repository<State>;
  let countyRepo: Repository<County>;
  let countyClaimRepo: Repository<CountyClaim>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CountiesModule, TypeOrmModule.forFeature([County, CountyClaim, State]), TypeOrmModule.forRoot(config)],
      providers: [CountiesService]
    }).compile();

    countiesService = module.get<CountiesService>(CountiesService);

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
      .from(CountyClaim)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(County)
      .execute();
    await connection.close();
  });

  const testState: DeepPartial<State> = {
    name: 'Foo',
    abbreviation: 'F',
    stateFips: 1
  };

  const testStateTwo: DeepPartial<State> = {
    name: 'Bar',
    abbreviation: 'B',
    stateFips: 2
  };

  const countiesTest: DeepPartial<County> = {
    countyFips: 1,
    stateFips: testState,
    name: 'Foo'
  };

  const countiesTestTwo: DeepPartial<County> = {
    countyFips: 2,
    stateFips: testStateTwo,
    name: 'Bar'
  };
  describe('search', () => {
    it('should be able to get a County By search', async () => {
      await stateRepo.save(testState);
      await stateRepo.save(testStateTwo);
      await countiesService.createOne(countiesTest);
      await countiesService.createOne(countiesTestTwo);
      expect(await countiesService.search('Foo')).toMatchObject([{ name: countiesTest.name }]);
      expect(await countiesService.search('Bar')).toMatchObject([{ name: countiesTestTwo.name }]);
    });
  });

  describe('searchCountiesForState', () => {
    it('should be able to get a County By searchCountiesForState', async () => {
      await stateRepo.save(testState);
      await stateRepo.save(testStateTwo);
      await countiesService.createOne(countiesTest);
      await countiesService.createOne(countiesTestTwo);
      expect(await countiesService.searchCountiesForState(1, 'Foo')).toMatchObject([
        {
          countyFips: countiesTest.countyFips,
          name: countiesTest.name
        }
      ]);

      expect(await countiesService.searchCountiesForState(2, 'Bar')).toMatchObject([
        {
          countyFips: countiesTestTwo.countyFips,
          name: countiesTestTwo.name
        }
      ]);
    });
  });

  describe('getCountiesForState', () => {
    it('should be able to get a County By getCountiesForState', async () => {
      await stateRepo.save(testState);
      await stateRepo.save(testStateTwo);
      await countiesService.createOne(countiesTest);
      await countiesService.createOne(countiesTestTwo);
      expect(await countiesService.getCountiesForState(1)).toMatchObject([
        {
          countyFips: countiesTest.countyFips,
          name: countiesTest.name
        }
      ]);

      expect(await countiesService.getCountiesForState(2)).toMatchObject([
        {
          countyFips: countiesTestTwo.countyFips,
          name: countiesTestTwo.name
        }
      ]);
    });
  });

  describe('getCountyStats', () => {
    it('should be able to get a County By getCountyStats', async () => {
      await stateRepo.save(testState);
      await stateRepo.save(testStateTwo);
      await countiesService.createOne(countiesTest);
      await countiesService.createOne(countiesTestTwo);
      expect(await countiesService.getCountyStats()).toMatchObject({
        '00001': { claims: 0, lockdownInfo: [], lockdowns: 0, sites: 0 },
        '00002': { claims: 0, lockdownInfo: [], lockdowns: 0, sites: 0 }
      });
    });
  });

  describe('getSummary', () => {
    it('should be able to get a County By getSummary', async () => {
      await stateRepo.save(testState);
      await stateRepo.save(testStateTwo);
      await countiesService.createOne(countiesTest);
      await countiesService.createOne(countiesTestTwo);
      expect(await countiesService.getSummary()).toMatchObject([]);
    });
  });
});
