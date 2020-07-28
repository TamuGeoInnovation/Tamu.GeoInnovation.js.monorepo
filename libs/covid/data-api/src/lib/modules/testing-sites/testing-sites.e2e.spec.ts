import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';
import {
  TestingSite,
  TestingSiteInfo,
  County,
  CountyClaim,
  Location,
  User,
  EntityStatus,
  EntityToValue,
  CountyClaimInfo
} from '@tamu-gisc/covid/common/entities';
import { config } from '@tamu-gisc/covid/data-api';
import { TestingSitesService } from './testing-sites.service';
import { TestingSitesModule } from './testing-sites.module';

describe('Testing Site Integration Tests', () => {
  let testingSitesService: TestingSitesService;
  let testingSitesRepo: Repository<TestingSite>;
  let testingSiteInfoRepo: Repository<TestingSiteInfo>;
  let countiesRepo: Repository<County>;
  let countyClaimsRepo: Repository<CountyClaim>;
  let countyClaimInfoRepo: Repository<CountyClaimInfo>;
  let locationsRepo: Repository<Location>;
  let usersRepo: Repository<User>;
  let entityStatusRepo: Repository<EntityStatus>;
  let entityToValueRepo: Repository<EntityToValue>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestingSitesModule, TypeOrmModule.forFeature([TestingSite]), TypeOrmModule.forRoot(config)],
      providers: [TestingSite]
    }).compile();

    testingSitesService = module.get<TestingSitesService>(TestingSitesService);
    testingSitesRepo = module.get<Repository<TestingSite>>(getRepositoryToken(TestingSite));
    testingSiteInfoRepo = module.get<Repository<TestingSiteInfo>>(getRepositoryToken(TestingSiteInfo));
    countiesRepo = module.get<Repository<County>>(getRepositoryToken(County));
    countyClaimsRepo = module.get<Repository<CountyClaim>>(getRepositoryToken(CountyClaim));
    countyClaimInfoRepo = module.get<Repository<CountyClaimInfo>>(getRepositoryToken(CountyClaimInfo));
    locationsRepo = module.get<Repository<Location>>(getRepositoryToken(Location));
    usersRepo = module.get<Repository<User>>(getRepositoryToken(User));
    entityStatusRepo = module.get<Repository<EntityStatus>>(getRepositoryToken(EntityStatus));
    entityToValueRepo = module.get<Repository<EntityToValue>>(getRepositoryToken(EntityToValue));
  });

  /**
   * after each test, delete everything from states table
   */

  afterEach(async () => {
    await testingSitesRepo.query(`DELETE FROM testingSites`);
    await testingSiteInfoRepo.query(`DELETE FROM testingSiteInfo`);
    await countiesRepo.query(`DELETE FROM counties`);
    await countyClaimsRepo.query(`DELETE FROM countyClaims`);
    await countyClaimInfoRepo.query(`DELETE FROM countyClaimInfo`);
    await locationsRepo.query(`DELETE FROM locations`);
    await usersRepo.query(`DELETE FROM users`);
    await entityStatusRepo.query(`DELETE FROM entityStatus`);
    await entityToValueRepo.query(`DELETE FROM entityToValue`);
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
    await connection.close();
  });

  describe('validation', () => {
    it('service should be defined', async () => {
      expect(await TestingSite).toBeDefined();
    });
  });
});
