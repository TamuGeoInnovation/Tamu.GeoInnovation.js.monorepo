import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';
import {
  State,
  County,
  CountyClaim,
  EntityStatus,
  TestingSite,
  Lockdown,
  User,
  CountyClaimInfo,
  EntityToValue,
  LockdownInfo,
  TestingSiteInfo,
  Location,
  EntityValue,
  CategoryValue,
  FieldCategory,
  FieldType,
  StatusType
} from '@tamu-gisc/covid/common/entities';
import { CountiesService } from './counties.service';
import { CountiesModule } from './counties.module';
import { config } from '@tamu-gisc/covid/data-api';

const countiesTest: Partial<County> = {
  countyFips: 1,
  name: 'Foo'
};

const countiesTestTwo: Partial<County> = {
  countyFips: 3,
  name: 'Bar'
};

describe('State Integration Tests', () => {
  let service: CountiesService;
  let countyRepo: Repository<County>;
  let countyClaimRepo: Repository<CountyClaim>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CountiesModule,
        TypeOrmModule.forFeature([County, CountyClaim]),
        TypeOrmModule.forRoot({
          type: 'mssql',
          host: 'localhost',
          port: 1433,
          username: 'testing',
          password: 'test',
          database: 'test',
          entities: [
            State,
            County,
            CountyClaim,
            EntityStatus,
            TestingSite,
            Lockdown,
            User,
            CountyClaimInfo,
            EntityToValue,
            LockdownInfo,
            TestingSiteInfo,
            Location,
            EntityValue,
            CategoryValue,
            FieldCategory,
            FieldType,
            StatusType
          ],
          synchronize: true
        })
      ],
      providers: [CountiesService]
    }).compile();

    service = module.get<CountiesService>(CountiesService);
    countyRepo = module.get<Repository<County>>(getRepositoryToken(County));
    countyClaimRepo = module.get<Repository<CountyClaim>>(getRepositoryToken(CountyClaim));
  });

  /**
   * after each test, delete everything from each table
   */

  afterEach(async () => {
    await countyRepo.query(`DELETE FROM counties`);
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
      await service.createOne(countiesTest);
      await service.createOne(countiesTestTwo);
      expect(await service.search('Foo')).toEqual([countiesTest]);
    });
  });

  describe('searchCountiesForState', () => {
    it('should be able to get a County By search', async () => {
      const testState = new State();
      testState.stateFips = 9;
      countiesTest.stateFips = testState;
      await service.createOne(countiesTest);
      await service.createOne(countiesTestTwo);
      expect(await service.searchCountiesForState(12, 'Foo')).toEqual([countiesTest]);
    });
  });
});
