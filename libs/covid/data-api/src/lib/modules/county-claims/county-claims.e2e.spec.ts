import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getConnection, DeepPartial } from 'typeorm';

import { config } from '@tamu-gisc/covid/data-api';
import { CountyClaimsService } from './county-claims.service';
import {
  CountyClaim,
  County,
  EntityStatus,
  EntityToValue,
  CountyClaimInfo,
  User,
  TestingSite,
  StatusType
} from '@tamu-gisc/covid/common/entities';
import { CountyClaimsModule } from './county-claims.module';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';
import { StatusTypesService } from '../status-types/status-types.service';
import { StatusTypesModule } from '../status-types/status-types.module';

describe('CategoryValues Integration Tests', () => {
  let countyClaimsService: CountyClaimsService;
  let usersService: UsersService;
  let statusTypesService: StatusTypesService;

  let countyClaimsRepo: Repository<CountyClaim>;
  let usersRepo: Repository<User>;
  let countiesRepo: Repository<County>;
  let countyClaimInfoRepo: Repository<CountyClaimInfo>;
  let entityToValueRepo: Repository<EntityToValue>;
  let entityStatusRepo: Repository<EntityStatus>;
  let statusTypeRepo: Repository<StatusType>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CountyClaimsModule,
        UsersModule,
        StatusTypesModule,
        TypeOrmModule.forFeature([
          CountyClaim,
          User,
          County,
          CountyClaimInfo,
          EntityToValue,
          EntityStatus,
          TestingSite,
          StatusType
        ]),
        TypeOrmModule.forRoot(config)
      ],
      providers: [CountyClaimsService, UsersService, StatusTypesService]
    }).compile();

    countyClaimsService = module.get<CountyClaimsService>(CountyClaimsService);
    usersService = module.get<UsersService>(UsersService);
    statusTypesService = module.get<StatusTypesService>(StatusTypesService);

    countyClaimsRepo = module.get<Repository<CountyClaim>>(getRepositoryToken(CountyClaim));
    usersRepo = module.get<Repository<User>>(getRepositoryToken(User));
    entityStatusRepo = module.get<Repository<EntityStatus>>(getRepositoryToken(EntityStatus));
    entityToValueRepo = module.get<Repository<EntityToValue>>(getRepositoryToken(EntityToValue));
    countyClaimInfoRepo = module.get<Repository<CountyClaimInfo>>(getRepositoryToken(CountyClaimInfo));
    countiesRepo = module.get<Repository<County>>(getRepositoryToken(County));
    statusTypeRepo = module.get<Repository<StatusType>>(getRepositoryToken(StatusType));
  });

  /**
   * after each test, delete everything from each table
   */

  afterEach(async () => {
    await entityStatusRepo.query(`DELETE FROM entity_statuses`);
    await countyClaimInfoRepo.query(`DELETE FROM county_claim_infos`);
    await countyClaimsRepo.query(`DELETE FROM county_claims`);
  });

  /**
   * after all tests are done, delete everything from each table
   */

  afterAll(async () => {
    const connection = getConnection();
    await connection
      .createQueryBuilder()
      .delete()
      .from(EntityStatus)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(CountyClaimInfo)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(CountyClaim)
      .execute();

    await connection.close();
  });

  const userTest: DeepPartial<User> = { email: 'Foo', guid: 'Bar' };

  const countiesTest: DeepPartial<County> = {
    countyFips: 1,
    name: 'Foo'
  };

  const statusTypeTest: DeepPartial<StatusType> = {
    name: 'Foo'
  };

  const entityStatusTest: DeepPartial<EntityStatus> = {
    guid: 'Foo'
  };

  const countyClaimsTest: DeepPartial<CountyClaim> = {
    user: userTest,
    county: countiesTest,
    statuses: [entityStatusTest]
  };
  describe('validation', () => {
    it('service should be defined', async () => {
      await usersRepo.save(userTest);
      await statusTypeRepo.save(statusTypeTest);
      await entityStatusRepo.save(entityStatusTest);
      await countiesRepo.save(countiesTest);
      await countyClaimsService.createOne(countiesTest);
      await countyClaimsService.createOrUpdateClaim(countyClaimsTest, [], []);

      //const createClaim = await countyClaimsRepo.save(countyClaimTest);
      /*const createdClaim = await countyClaimsService.createOrUpdateClaim(
        { user: { email: 'Foo' } },
        [],
        []
      );*/
      await countyClaimsService.getActiveClaimsForEmail('Foo');
      await countyClaimsService.closeClaim(countyClaimsTest.guid);

      expect(countyClaimsTest.guid).toReturn();
    });
  });
});
