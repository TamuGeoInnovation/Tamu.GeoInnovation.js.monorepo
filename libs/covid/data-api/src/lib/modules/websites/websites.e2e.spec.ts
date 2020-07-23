import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';
import {
  County,
  CountyClaim,
  CountyClaimInfo,
  CategoryValue,
  EntityToValue,
  EntityStatus,
  State,
  User
} from '@tamu-gisc/covid/common/entities';
import { config } from '@tamu-gisc/covid/data-api';
import { WebsitesService } from './websites.service';
import { WebsitesModule } from './websites.module';

describe('Websites Integration Tests', () => {
  let service: WebsitesService;
  let categoryValueRepo: Repository<CategoryValue>;
  let countyRepo: Repository<County>;
  let countyClaimRepo: Repository<CountyClaim>;
  let countyClaimInfoRepo: Repository<CountyClaimInfo>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        WebsitesModule,
        TypeOrmModule.forFeature([CategoryValue, County, CountyClaim, CountyClaimInfo]),
        TypeOrmModule.forRoot(config)
      ],
      providers: [WebsitesService]
    }).compile();

    service = module.get<WebsitesService>(WebsitesService);
    categoryValueRepo = module.get<Repository<CategoryValue>>(getRepositoryToken(CategoryValue));
    countyRepo = module.get<Repository<County>>(getRepositoryToken(County));
    countyClaimRepo = module.get<Repository<CountyClaim>>(getRepositoryToken(CountyClaim));
    countyClaimInfoRepo = module.get<Repository<CountyClaimInfo>>(getRepositoryToken(CountyClaimInfo));
  });

  /**
   * after each test, delete everything from each table
   */

  afterEach(async () => {
    await categoryValueRepo.query(`DELETE FROM category_values`);
    await countyRepo.query(`DELETE FROM counties`);
    await countyClaimRepo.query(`DELETE FROM county_claims`);
    await countyClaimInfoRepo.query(`DELETE FROM county_claim_infos`);
  });

  /**
   * after all tests are done, delete everything from each table
   */

  afterAll(async () => {
    const connection = getConnection();
    await connection
      .createQueryBuilder()
      .delete()
      .from(CategoryValue)
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
    await connection
      .createQueryBuilder()
      .delete()
      .from(CountyClaimInfo)
      .execute();
    await connection.close();
  });
  describe('Validation ', () => {
    it('Service should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('getWebsites ', () => {
    it('getWebsites', () => {
      countyClaimInfoRepo.create().save();
      expect(service).toBeDefined();
    });
  });
});
