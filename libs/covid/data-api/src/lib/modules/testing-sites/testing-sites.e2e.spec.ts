import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getConnection, DeepPartial } from 'typeorm';
import {
  TestingSite,
  TestingSiteInfo,
  County,
  CountyClaim,
  Location,
  User,
  EntityStatus,
  EntityToValue,
  CountyClaimInfo,
  State,
  StatusType,
  FieldCategory,
  FieldType,
  CategoryValue,
  EntityValue
} from '@tamu-gisc/covid/common/entities';
import { config } from '@tamu-gisc/covid/data-api';
import { TestingSitesService } from './testing-sites.service';
import { TestingSitesModule } from './testing-sites.module';
import { CountyClaimsService } from '../county-claims/county-claims.service';
import { CountyClaimsModule } from '../county-claims/county-claims.module';
import { CATEGORY } from '@tamu-gisc/covid/common/enums';

describe('Testing Site Setup', () => {
  let testingSitesService: TestingSitesService;
  let countyClaimsService: CountyClaimsService;

  let testingSitesRepo: Repository<TestingSite>;
  let testingSiteInfoRepo: Repository<TestingSiteInfo>;
  let countyClaimsRepo: Repository<CountyClaim>;
  let usersRepo: Repository<User>;
  let fieldCategoryRepo: Repository<FieldCategory>;
  let fieldTypeRepo: Repository<FieldType>;
  let categoryValueRepo: Repository<CategoryValue>;
  let entityValueRepo: Repository<EntityValue>;
  let countiesRepo: Repository<County>;
  let statesRepo: Repository<State>;
  let countyClaimInfoRepo: Repository<CountyClaimInfo>;
  let entityToValueRepo: Repository<EntityToValue>;
  let entityStatusRepo: Repository<EntityStatus>;
  let statusTypeRepo: Repository<StatusType>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestingSitesModule,
        CountyClaimsModule,
        TypeOrmModule.forFeature([
          TestingSite,
          TestingSiteInfo,
          County,
          State,
          CountyClaim,
          CountyClaimInfo,
          EntityStatus,
          EntityToValue,
          User,
          Location,
          FieldCategory,
          FieldType,
          CategoryValue,
          EntityValue,
          StatusType
        ]),
        TypeOrmModule.forRoot(config)
      ],
      providers: [TestingSitesService, CountyClaimsService]
    }).compile();

    testingSitesService = module.get<TestingSitesService>(TestingSitesService);

    countyClaimsService = module.get<CountyClaimsService>(CountyClaimsService);

    testingSitesRepo = module.get<Repository<TestingSite>>(getRepositoryToken(TestingSite));
    testingSiteInfoRepo = module.get<Repository<TestingSiteInfo>>(getRepositoryToken(TestingSiteInfo));
    statesRepo = module.get<Repository<State>>(getRepositoryToken(State));
    fieldCategoryRepo = module.get<Repository<FieldCategory>>(getRepositoryToken(FieldCategory));
    fieldTypeRepo = module.get<Repository<FieldType>>(getRepositoryToken(FieldType));
    categoryValueRepo = module.get<Repository<CategoryValue>>(getRepositoryToken(CategoryValue));
    entityValueRepo = module.get<Repository<EntityValue>>(getRepositoryToken(EntityValue));
    countyClaimsRepo = module.get<Repository<CountyClaim>>(getRepositoryToken(CountyClaim));
    usersRepo = module.get<Repository<User>>(getRepositoryToken(User));
    entityStatusRepo = module.get<Repository<EntityStatus>>(getRepositoryToken(EntityStatus));
    entityToValueRepo = module.get<Repository<EntityToValue>>(getRepositoryToken(EntityToValue));
    countyClaimInfoRepo = module.get<Repository<CountyClaimInfo>>(getRepositoryToken(CountyClaimInfo));
    countiesRepo = module.get<Repository<County>>(getRepositoryToken(County));
    statusTypeRepo = module.get<Repository<StatusType>>(getRepositoryToken(StatusType));
  });

  /**
   * after each test, delete everything from states table
   */

  afterEach(async () => {
    await entityToValueRepo.query(`DELETE FROM entity_to_values`);
    await entityStatusRepo.query(`DELETE FROM entity_statuses`);
    await testingSiteInfoRepo.query(`DELETE FROM testing_site_infos`);
    await testingSitesRepo.query(`DELETE FROM testing_sites`);
    await countyClaimInfoRepo.query(`DELETE FROM county_claim_infos`);
    await entityValueRepo.query(`DELETE FROM entity_values`);
    await categoryValueRepo.query(`DELETE FROM category_values`);
    await countyClaimsRepo.query(`DELETE FROM county_claims`);
    await countiesRepo.query(`DELETE FROM counties`);
    await statesRepo.query(`DELETE FROM states`);
    await usersRepo.query(`DELETE FROM users`);
  });

  /**
   * after all tests are done, delete everything from states table
   */

  afterAll(async () => {
    const connection = getConnection();
    await connection
      .createQueryBuilder()
      .delete()
      .from(EntityToValue)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(EntityValue)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(CategoryValue)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(EntityStatus)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(TestingSiteInfo)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(TestingSite)
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
    await connection
      .createQueryBuilder()
      .delete()
      .from(County)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(State)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(User)
      .execute();
    await connection.close();
  });

  const fieldCategoryW: DeepPartial<FieldCategory> = { name: 'Website', id: 1 };
  const fieldCategoryPN: DeepPartial<FieldCategory> = { name: 'PhoneNumber', id: 2 };
  const fieldCategorySO: DeepPartial<FieldCategory> = { name: 'SiteOwners', id: 3 };
  const fieldCategorySS: DeepPartial<FieldCategory> = { name: 'SiteServices', id: 4 };
  const fieldCategorySR: DeepPartial<FieldCategory> = { name: 'SiteRestrictions', id: 5 };
  const fieldCategorySOS: DeepPartial<FieldCategory> = { name: 'SiteOperationalStatus', id: 6 };

  const fieldTypeW: DeepPartial<FieldType> = { name: 'Web', guid: 'Foo1' };
  const fieldTypePN: DeepPartial<FieldType> = { name: 'Phone', guid: 'Foo2' };

  const statusTypeP: DeepPartial<StatusType> = { name: 'Processing', id: 1 };
  const statusTypeC: DeepPartial<StatusType> = { name: 'Closed', id: 2 };
  const statusTypeF: DeepPartial<StatusType> = { name: 'Flagged', id: 3 };
  const statusTypeCan: DeepPartial<StatusType> = { name: 'Cancelled', id: 4 };
  const statusTypeV: DeepPartial<StatusType> = { name: 'Validated', id: 5 };
  const statusTypeCSL: DeepPartial<StatusType> = { name: 'ClaimSiteLess', id: 6 };
  const userTest: DeepPartial<User> = { email: 'Foo@foorbar.com', guid: 'Bar' };
  const stateTest: DeepPartial<State> = { name: 'Foo', abbreviation: 'F', stateFips: 1 };
  const countyTest: DeepPartial<County> = { countyFips: 1, name: 'Foo', stateFips: stateTest };
  const countyClaimTest: DeepPartial<CountyClaim> = {
    user: userTest,
    county: countyTest
  };

  const locationTest: DeepPartial<Location> = {
    guid: 'Foo',
    address1: 'Foo',
    address2: 'Foo',
    city: 'Foo',
    zip: 'Foo',
    county: 'Foo',
    state: 'Foo',
    country: 'Foo',
    latitude: 1,
    longitude: 1
  };

  describe('Testing Site Integration Tests', () => {
    it('getSitesForCounty', async () => {
      await fieldCategoryRepo.save(fieldCategoryW);
      await fieldCategoryRepo.save(fieldCategoryPN);
      await fieldCategoryRepo.save(fieldCategorySO);
      await fieldCategoryRepo.save(fieldCategorySS);
      await fieldCategoryRepo.save(fieldCategorySR);
      await fieldCategoryRepo.save(fieldCategorySOS);
      await statusTypeRepo.save(statusTypeP);
      await statusTypeRepo.save(statusTypeC);
      await statusTypeRepo.save(statusTypeF);
      await statusTypeRepo.save(statusTypeCan);
      await statusTypeRepo.save(statusTypeV);
      await statusTypeRepo.save(statusTypeCSL);
      await fieldTypeRepo.save(fieldTypeW);
      await fieldTypeRepo.save(fieldTypePN);
      const categoryW = await fieldCategoryRepo.findOne({
        where: {
          id: CATEGORY.WEBSITES
        }
      });
      const categoryPN = await fieldCategoryRepo.findOne({
        where: {
          id: CATEGORY.PHONE_NUMBERS
        }
      });
      const typeW = await fieldTypeRepo.findOne({
        where: {
          name: 'Web'
        }
      });
      const typePn = await fieldTypeRepo.findOne({
        where: {
          name: 'Phone'
        }
      });
      const CvW = categoryValueRepo.create({
        value: 'WebS',
        type: typeW,
        category: categoryW
      });
      const CvPn = categoryValueRepo.create({
        value: 'PhoneN',
        type: typePn,
        category: categoryPN
      });
      await CvW.save();
      await CvPn.save();
      const eVW = entityValueRepo.create({ value: CvW, guid: 'FoooWebsites' });
      await eVW.save();
      const eVPn = entityValueRepo.create({ value: CvPn, guid: 'FoooPhone' });
      await eVPn.save();
      await usersRepo.save(userTest);
      await statesRepo.save(stateTest);
      await countiesRepo.save(countyTest);
      await countyClaimsService.createOrUpdateClaim(countyClaimTest, [eVPn], [eVW]);
      const testingSiteTest = {
        claim: countyClaimTest,
        guid: 'Foo',
        info: {
          phoneNumbers: [eVPn],
          websites: [eVW],
          services: '',
          owners: '',
          restrictions: '',
          status: '',
          undisclosed: true,
          sitesAvailable: true,
          locationName: 'Foobar',
          locationPhoneNumber: 'Foo',
          hoursOfOperation: '1-2',
          capacity: 1,
          driveThrough: true,
          driveThroughCapacity: 1,
          notes: 'Tru'
        },
        location: locationTest
      };
      await testingSitesService.createOrUpdateTestingSite(testingSiteTest);
      const gottenSite = await testingSitesService.getSitesForCounty(countyTest.countyFips);
      expect(gottenSite).toMatchObject([
        {
          claim: { county: { countyFips: 1, name: 'Foo' } },
          info: {
            capacity: 1,
            location: { address1: 'Foo' },
            phoneNumbers: [{ value: { category: { id: 2 } } }],
            websites: [{ value: { category: { id: 1 } } }]
          },
          location: {
            address1: 'Foo'
          }
        }
      ]);
    });

    it('getSitesForUser', async () => {
      await fieldCategoryRepo.save(fieldCategoryW);
      await fieldCategoryRepo.save(fieldCategoryPN);
      await fieldCategoryRepo.save(fieldCategorySO);
      await fieldCategoryRepo.save(fieldCategorySS);
      await fieldCategoryRepo.save(fieldCategorySR);
      await fieldCategoryRepo.save(fieldCategorySOS);
      await statusTypeRepo.save(statusTypeP);
      await statusTypeRepo.save(statusTypeC);
      await statusTypeRepo.save(statusTypeF);
      await statusTypeRepo.save(statusTypeCan);
      await statusTypeRepo.save(statusTypeV);
      await statusTypeRepo.save(statusTypeCSL);
      await fieldTypeRepo.save(fieldTypeW);
      await fieldTypeRepo.save(fieldTypePN);
      const categoryW = await fieldCategoryRepo.findOne({
        where: {
          id: CATEGORY.WEBSITES
        }
      });
      const categoryPN = await fieldCategoryRepo.findOne({
        where: {
          id: CATEGORY.PHONE_NUMBERS
        }
      });
      const typeW = await fieldTypeRepo.findOne({
        where: {
          name: 'Web'
        }
      });
      const typePn = await fieldTypeRepo.findOne({
        where: {
          name: 'Phone'
        }
      });
      const CvW = categoryValueRepo.create({
        value: 'WebS',
        type: typeW,
        category: categoryW
      });
      const CvPn = categoryValueRepo.create({
        value: 'PhoneN',
        type: typePn,
        category: categoryPN
      });
      await CvW.save();
      await CvPn.save();
      const eVW = entityValueRepo.create({ value: CvW, guid: 'FoooWebsites' });
      await eVW.save();
      const eVPn = entityValueRepo.create({ value: CvPn, guid: 'FoooPhone' });
      await eVPn.save();
      await usersRepo.save(userTest);
      await statesRepo.save(stateTest);
      await countiesRepo.save(countyTest);
      await countyClaimsService.createOrUpdateClaim(countyClaimTest, [eVPn], [eVW]);
      const testingSiteTest = {
        claim: countyClaimTest,
        guid: 'Foo',
        info: {
          phoneNumbers: [eVPn],
          websites: [eVW],
          services: '',
          owners: '',
          restrictions: '',
          status: '',
          undisclosed: true,
          sitesAvailable: true,
          locationName: 'Foobar',
          locationPhoneNumber: 'Foo',
          hoursOfOperation: '1-2',
          capacity: 1,
          driveThrough: true,
          driveThroughCapacity: 1,
          notes: 'Tru'
        },
        location: locationTest
      };
      await testingSitesService.createOrUpdateTestingSite(testingSiteTest);
      const gottenSite = await testingSitesService.getSitesForUser(userTest.email);
      expect(gottenSite).toMatchObject([
        {
          claim: { user: { guid: 'Bar' } },
          info: {
            capacity: 1,
            location: { address1: 'Foo' },
            phoneNumbers: [{ value: { category: { id: 2 } } }],
            websites: [{ value: { category: { id: 1 } } }]
          },
          location: {
            address1: 'Foo'
          }
        }
      ]);
    });

    it('getTestingSitesSortedByCounty', async () => {
      await fieldCategoryRepo.save(fieldCategoryW);
      await fieldCategoryRepo.save(fieldCategoryPN);
      await fieldCategoryRepo.save(fieldCategorySO);
      await fieldCategoryRepo.save(fieldCategorySS);
      await fieldCategoryRepo.save(fieldCategorySR);
      await fieldCategoryRepo.save(fieldCategorySOS);
      await statusTypeRepo.save(statusTypeP);
      await statusTypeRepo.save(statusTypeC);
      await statusTypeRepo.save(statusTypeF);
      await statusTypeRepo.save(statusTypeCan);
      await statusTypeRepo.save(statusTypeV);
      await statusTypeRepo.save(statusTypeCSL);
      await fieldTypeRepo.save(fieldTypeW);
      await fieldTypeRepo.save(fieldTypePN);
      const categoryW = await fieldCategoryRepo.findOne({
        where: {
          id: CATEGORY.WEBSITES
        }
      });
      const categoryPN = await fieldCategoryRepo.findOne({
        where: {
          id: CATEGORY.PHONE_NUMBERS
        }
      });
      const typeW = await fieldTypeRepo.findOne({
        where: {
          name: 'Web'
        }
      });
      const typePn = await fieldTypeRepo.findOne({
        where: {
          name: 'Phone'
        }
      });
      const CvW = categoryValueRepo.create({
        value: 'WebS',
        type: typeW,
        category: categoryW
      });
      const CvPn = categoryValueRepo.create({
        value: 'PhoneN',
        type: typePn,
        category: categoryPN
      });
      await CvW.save();
      await CvPn.save();
      const eVW = entityValueRepo.create({ value: CvW, guid: 'FoooWebsites' });
      await eVW.save();
      const eVPn = entityValueRepo.create({ value: CvPn, guid: 'FoooPhone' });
      await eVPn.save();
      await usersRepo.save(userTest);
      await statesRepo.save(stateTest);
      await countiesRepo.save(countyTest);
      await countyClaimsService.createOrUpdateClaim(countyClaimTest, [eVPn], [eVW]);
      const testingSiteTest = {
        claim: countyClaimTest,
        guid: 'Foo',
        info: {
          phoneNumbers: [eVPn],
          websites: [eVW],
          services: '',
          owners: '',
          restrictions: '',
          status: '',
          undisclosed: true,
          sitesAvailable: true,
          locationName: 'Foobar',
          locationPhoneNumber: 'Foo',
          hoursOfOperation: '1-2',
          capacity: 1,
          driveThrough: true,
          driveThroughCapacity: 1,
          notes: 'Tru'
        },
        location: locationTest
      };
      await testingSitesService.createOrUpdateTestingSite(testingSiteTest);
      const gottenSite = await testingSitesService.getTestingSitesSortedByCounty();
      expect(gottenSite).toMatchObject([
        {
          claim: { county: { countyFips: 1, name: 'Foo' } },
          info: {
            capacity: 1,
            location: { address1: 'Foo' },
            phoneNumbers: [{ value: { category: { id: 2 } } }],
            websites: [{ value: { category: { id: 1 } } }]
          },
          location: {
            address1: 'Foo'
          }
        }
      ]);
    });
    it('getInfosForSite', async () => {
      await fieldCategoryRepo.save(fieldCategoryW);
      await fieldCategoryRepo.save(fieldCategoryPN);
      await fieldCategoryRepo.save(fieldCategorySO);
      await fieldCategoryRepo.save(fieldCategorySS);
      await fieldCategoryRepo.save(fieldCategorySR);
      await fieldCategoryRepo.save(fieldCategorySOS);
      await statusTypeRepo.save(statusTypeP);
      await statusTypeRepo.save(statusTypeC);
      await statusTypeRepo.save(statusTypeF);
      await statusTypeRepo.save(statusTypeCan);
      await statusTypeRepo.save(statusTypeV);
      await statusTypeRepo.save(statusTypeCSL);
      await fieldTypeRepo.save(fieldTypeW);
      await fieldTypeRepo.save(fieldTypePN);
      const categoryW = await fieldCategoryRepo.findOne({
        where: {
          id: CATEGORY.WEBSITES
        }
      });
      const categoryPN = await fieldCategoryRepo.findOne({
        where: {
          id: CATEGORY.PHONE_NUMBERS
        }
      });
      const typeW = await fieldTypeRepo.findOne({
        where: {
          name: 'Web'
        }
      });
      const typePn = await fieldTypeRepo.findOne({
        where: {
          name: 'Phone'
        }
      });
      const CvW = categoryValueRepo.create({
        value: 'WebS',
        type: typeW,
        category: categoryW
      });
      const CvPn = categoryValueRepo.create({
        value: 'PhoneN',
        type: typePn,
        category: categoryPN
      });
      await CvW.save();
      await CvPn.save();
      const eVW = entityValueRepo.create({ value: CvW, guid: 'FoooWebsites' });
      await eVW.save();
      const eVPn = entityValueRepo.create({ value: CvPn, guid: 'FoooPhone' });
      await eVPn.save();
      await usersRepo.save(userTest);
      await statesRepo.save(stateTest);
      await countiesRepo.save(countyTest);
      await countyClaimsService.createOrUpdateClaim(countyClaimTest, [eVPn], [eVW]);
      const testingSiteTest = {
        claim: countyClaimTest,
        guid: 'Foo',
        info: {
          phoneNumbers: [eVPn],
          websites: [eVW],
          services: '',
          owners: '',
          restrictions: '',
          status: '',
          undisclosed: true,
          sitesAvailable: true,
          locationName: 'Foobar',
          locationPhoneNumber: 'Foo',
          hoursOfOperation: '1-2',
          capacity: 1,
          driveThrough: true,
          driveThroughCapacity: 1,
          notes: 'Tru'
        },
        location: locationTest
      };
      await testingSitesService.createOrUpdateTestingSite(testingSiteTest);
      const gottenSiteFor = await testingSitesService.getTestingSitesSortedByCounty();
      const gottenSite = await testingSitesService.getInfosForSite(gottenSiteFor[0].guid);
      expect(gottenSite).toMatchObject([{ infos: [{ driveThrough: true, driveThroughCapacity: 1 }] }]);
    });
    it('registerCountyAsSiteless', async () => {
      await fieldCategoryRepo.save(fieldCategoryW);
      await fieldCategoryRepo.save(fieldCategoryPN);
      await fieldCategoryRepo.save(fieldCategorySO);
      await fieldCategoryRepo.save(fieldCategorySS);
      await fieldCategoryRepo.save(fieldCategorySR);
      await fieldCategoryRepo.save(fieldCategorySOS);
      await statusTypeRepo.save(statusTypeP);
      await statusTypeRepo.save(statusTypeC);
      await statusTypeRepo.save(statusTypeF);
      await statusTypeRepo.save(statusTypeCan);
      await statusTypeRepo.save(statusTypeV);
      await statusTypeRepo.save(statusTypeCSL);
      await fieldTypeRepo.save(fieldTypeW);
      await fieldTypeRepo.save(fieldTypePN);
      const categoryW = await fieldCategoryRepo.findOne({
        where: {
          id: CATEGORY.WEBSITES
        }
      });
      const categoryPN = await fieldCategoryRepo.findOne({
        where: {
          id: CATEGORY.PHONE_NUMBERS
        }
      });
      const typeW = await fieldTypeRepo.findOne({
        where: {
          name: 'Web'
        }
      });
      const typePn = await fieldTypeRepo.findOne({
        where: {
          name: 'Phone'
        }
      });
      const CvW = categoryValueRepo.create({
        value: 'WebS',
        type: typeW,
        category: categoryW
      });
      const CvPn = categoryValueRepo.create({
        value: 'PhoneN',
        type: typePn,
        category: categoryPN
      });
      await CvW.save();
      await CvPn.save();
      const eVW = entityValueRepo.create({ value: CvW, guid: 'FoooWebsites' });
      await eVW.save();
      const eVPn = entityValueRepo.create({ value: CvPn, guid: 'FoooPhone' });
      await eVPn.save();
      await usersRepo.save(userTest);
      await statesRepo.save(stateTest);
      await countiesRepo.save(countyTest);
      await countyClaimsService.createOrUpdateClaim(countyClaimTest, [eVPn], [eVW]);
      await testingSitesService.registerCountyAsSiteless(countyTest.countyFips);
      const gottenSites = await testingSitesService.getTestingSitesSortedByCounty();
      expect(gottenSites).toMatchObject([]);
    });
    it('getSiteAndLatestInfo', async () => {
      await fieldCategoryRepo.save(fieldCategoryW);
      await fieldCategoryRepo.save(fieldCategoryPN);
      await fieldCategoryRepo.save(fieldCategorySO);
      await fieldCategoryRepo.save(fieldCategorySS);
      await fieldCategoryRepo.save(fieldCategorySR);
      await fieldCategoryRepo.save(fieldCategorySOS);
      await statusTypeRepo.save(statusTypeP);
      await statusTypeRepo.save(statusTypeC);
      await statusTypeRepo.save(statusTypeF);
      await statusTypeRepo.save(statusTypeCan);
      await statusTypeRepo.save(statusTypeV);
      await statusTypeRepo.save(statusTypeCSL);
      await fieldTypeRepo.save(fieldTypeW);
      await fieldTypeRepo.save(fieldTypePN);
      const categoryW = await fieldCategoryRepo.findOne({
        where: {
          id: CATEGORY.WEBSITES
        }
      });
      const categoryPN = await fieldCategoryRepo.findOne({
        where: {
          id: CATEGORY.PHONE_NUMBERS
        }
      });
      const typeW = await fieldTypeRepo.findOne({
        where: {
          name: 'Web'
        }
      });
      const typePn = await fieldTypeRepo.findOne({
        where: {
          name: 'Phone'
        }
      });
      const CvW = categoryValueRepo.create({
        value: 'WebS',
        type: typeW,
        category: categoryW
      });
      const CvPn = categoryValueRepo.create({
        value: 'PhoneN',
        type: typePn,
        category: categoryPN
      });
      await CvW.save();
      await CvPn.save();
      const eVW = entityValueRepo.create({ value: CvW, guid: 'FoooWebsites' });
      await eVW.save();
      const eVPn = entityValueRepo.create({ value: CvPn, guid: 'FoooPhone' });
      await eVPn.save();
      await usersRepo.save(userTest);
      await statesRepo.save(stateTest);
      await countiesRepo.save(countyTest);
      await countyClaimsService.createOrUpdateClaim(countyClaimTest, [eVPn], [eVW]);
      const testingSiteTest = {
        claim: countyClaimTest,
        guid: 'Foo',
        info: {
          phoneNumbers: [eVPn],
          websites: [eVW],
          services: '',
          owners: '',
          restrictions: '',
          status: '',
          undisclosed: true,
          sitesAvailable: true,
          locationName: 'Foobar',
          locationPhoneNumber: 'Foo',
          hoursOfOperation: '1-2',
          capacity: 1,
          driveThrough: true,
          driveThroughCapacity: 1,
          notes: 'Tru'
        },
        location: locationTest
      };
      await testingSitesService.createOrUpdateTestingSite(testingSiteTest);
      const gottenSites = await testingSitesService.getTestingSitesSortedByCounty();
      const gottenSite = await testingSitesService.getSiteAndLatestInfo(gottenSites[0].guid);
      expect(gottenSite).toMatchObject({
        claim: undefined,
        info: {
          capacity: 1,
          location: { address1: 'Foo' },
          phoneNumbers: [{ value: { category: { id: 2, name: 'PhoneNumber' } } }]
        }
      });
    });
    it('getTestingSitesAdmin', async () => {
      await fieldCategoryRepo.save(fieldCategoryW);
      await fieldCategoryRepo.save(fieldCategoryPN);
      await fieldCategoryRepo.save(fieldCategorySO);
      await fieldCategoryRepo.save(fieldCategorySS);
      await fieldCategoryRepo.save(fieldCategorySR);
      await fieldCategoryRepo.save(fieldCategorySOS);
      await statusTypeRepo.save(statusTypeP);
      await statusTypeRepo.save(statusTypeC);
      await statusTypeRepo.save(statusTypeF);
      await statusTypeRepo.save(statusTypeCan);
      await statusTypeRepo.save(statusTypeV);
      await statusTypeRepo.save(statusTypeCSL);
      await fieldTypeRepo.save(fieldTypeW);
      await fieldTypeRepo.save(fieldTypePN);
      const categoryW = await fieldCategoryRepo.findOne({
        where: {
          id: CATEGORY.WEBSITES
        }
      });
      const categoryPN = await fieldCategoryRepo.findOne({
        where: {
          id: CATEGORY.PHONE_NUMBERS
        }
      });
      const typeW = await fieldTypeRepo.findOne({
        where: {
          name: 'Web'
        }
      });
      const typePn = await fieldTypeRepo.findOne({
        where: {
          name: 'Phone'
        }
      });
      const CvW = categoryValueRepo.create({
        value: 'WebS',
        type: typeW,
        category: categoryW
      });
      const CvPn = categoryValueRepo.create({
        value: 'PhoneN',
        type: typePn,
        category: categoryPN
      });
      await CvW.save();
      await CvPn.save();
      const eVW = entityValueRepo.create({ value: CvW, guid: 'FoooWebsites' });
      await eVW.save();
      const eVPn = entityValueRepo.create({ value: CvPn, guid: 'FoooPhone' });
      await eVPn.save();
      await usersRepo.save(userTest);
      await statesRepo.save(stateTest);
      await countiesRepo.save(countyTest);
      await countyClaimsService.createOrUpdateClaim(countyClaimTest, [eVPn], [eVW]);
      const testingSiteTest = {
        claim: countyClaimTest,
        guid: 'Foo',
        info: {
          phoneNumbers: [eVPn],
          websites: [eVW],
          services: '',
          owners: '',
          restrictions: '',
          status: '',
          undisclosed: true,
          sitesAvailable: true,
          locationName: 'Foobar',
          locationPhoneNumber: 'Foo',
          hoursOfOperation: '1-2',
          capacity: 1,
          driveThrough: true,
          driveThroughCapacity: 1,
          notes: 'Tru'
        },
        location: locationTest
      };
      await testingSitesService.createOrUpdateTestingSite(testingSiteTest);
      const gottenSites = await testingSitesService.getTestingSitesAdmin(
        stateTest.stateFips,
        countyTest.countyFips,
        userTest.email
      );
      expect(gottenSites).toMatchObject([
        {
          claim: { county: { countyFips: 1, stateFips: { name: 'Foo' } }, user: { email: 'Foo@foorbar.com' } },
          info: {
            capacity: 1,
            location: { address1: 'Foo' },
            phoneNumbers: [{ value: { category: { id: 2 } } }],
            websites: [{ value: { category: { id: 1 } } }]
          },
          location: {
            address1: 'Foo'
          }
        }
      ]);
    });
  });
});
