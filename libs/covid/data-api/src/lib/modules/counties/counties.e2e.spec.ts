import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';
import { State, County, CountyClaim } from '@tamu-gisc/covid/common/entities';
import { CountiesService } from './counties.service';
import { CountiesModule } from './counties.module';
import { config } from '@tamu-gisc/covid/data-api';

const stateTest: Partial<State> = {
  abbreviation: 'F',
  stateFips: 9,
  name: 'Foo'
};

const stateTestTwo: Partial<State> = {
  stateFips: 10
};

describe('State Integration Tests', () => {
  let service: CountiesService;
  let countyRepo: Repository<County>;
  let countyClaimRepo: Repository<CountyClaim>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CountiesModule, TypeOrmModule.forFeature([State]), TypeOrmModule.forRoot(config)],
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
    await countyClaimRepo.query(`DELETE FROM countyClaims`);
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
});
