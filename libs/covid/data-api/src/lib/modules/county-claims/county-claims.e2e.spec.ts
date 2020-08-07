import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getConnection, DeepPartial } from 'typeorm';
import {
  CountyClaim,
  County,
  EntityStatus,
  EntityToValue,
  CountyClaimInfo,
  CategoryValue,
  State,
  User,
  FieldCategory,
  FieldType,
  EntityValue,
  TestingSite,
  StatusType
} from '@tamu-gisc/covid/common/entities';
import { config } from '@tamu-gisc/covid/data-api';
import { CountyClaimsService } from './county-claims.service';
import { CountyClaimsModule } from './county-claims.module';
import { CATEGORY } from '@tamu-gisc/covid/common/enums';

describe('County Claims Integration Tests', () => {
  let countyClaimsService: CountyClaimsService;

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
        CountyClaimsModule,
        TypeOrmModule.forFeature([
          CountyClaim,
          User,
          County,
          CountyClaimInfo,
          EntityToValue,
          EntityStatus,
          TestingSite,
          State,
          FieldCategory,
          CategoryValue,
          EntityValue,
          FieldType,
          StatusType
        ]),
        TypeOrmModule.forRoot(config)
      ],
      providers: [CountyClaimsService]
    }).compile();

    countyClaimsService = module.get<CountyClaimsService>(CountyClaimsService);

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
   * after each test, delete everything from each table
   */

  afterEach(async () => {
    await entityToValueRepo.query(`DELETE FROM entity_to_values`);
    await entityStatusRepo.query(`DELETE FROM entity_statuses`);
    await countyClaimInfoRepo.query(`DELETE FROM county_claim_infos`);
    await entityValueRepo.query(`DELETE FROM entity_values`);
    await categoryValueRepo.query(`DELETE FROM category_values`);
    await countyClaimsRepo.query(`DELETE FROM county_claims`);
    await countiesRepo.query(`DELETE FROM counties`);
    await statesRepo.query(`DELETE FROM states`);
    await usersRepo.query(`DELETE FROM users`);
  });

  /**
   * after all tests are done, delete everything from each table
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
  const fieldTypeW: DeepPartial<FieldType> = { name: 'Web', guid: 'Yeet' };
  const fieldTypePN: DeepPartial<FieldType> = { name: 'Phone', guid: 'Reee' };
  const statusTypeP: DeepPartial<StatusType> = { name: 'Processing', id: 1 };
  const statusTypeC: DeepPartial<StatusType> = { name: 'Closed', id: 2 };
  const statusTypeF: DeepPartial<StatusType> = { name: 'Flagged', id: 3 };
  const statusTypeCan: DeepPartial<StatusType> = { name: 'Cancelled', id: 4 };
  const statusTypeV: DeepPartial<StatusType> = { name: 'Validated', id: 5 };
  const statusTypeCSL: DeepPartial<StatusType> = { name: 'ClaimSiteLess', id: 6 };
  const userTest: DeepPartial<User> = { email: 'Foo', guid: 'Bar' };
  const stateTest: DeepPartial<State> = { name: 'Foo', abbreviation: 'F', stateFips: 1 };
  const countyTest: DeepPartial<County> = { countyFips: 1, name: 'Foo', stateFips: stateTest };
  const countyTestTwo: DeepPartial<County> = { countyFips: 2, name: 'Bar', stateFips: stateTest };
  const countyClaimTest: DeepPartial<CountyClaim> = {
    user: userTest,
    county: countyTest
  };

  describe('', () => {
    it('getActiveClaimsForEmail', async () => {
      await fieldCategoryRepo.save(fieldCategoryW);
      await fieldCategoryRepo.save(fieldCategoryPN);
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
      await statusTypeRepo.save(statusTypeP);
      await statusTypeRepo.save(statusTypeC);
      await statusTypeRepo.save(statusTypeF);
      await statusTypeRepo.save(statusTypeCan);
      await statusTypeRepo.save(statusTypeV);
      await statusTypeRepo.save(statusTypeCSL);
      await usersRepo.save(userTest);
      await statesRepo.save(stateTest);
      await countiesRepo.save(countyTest);
      await countyClaimsService.createOrUpdateClaim(countyClaimTest, [eVPn], [eVW]);
      const setClaim = await countyClaimsService.getActiveClaimsForEmail(userTest.email);
      expect(setClaim[0].county.name).toEqual(countyTest.name);
      await countyClaimsService.closeClaim(setClaim[0].guid);
      expect(await countyClaimsService.getActiveClaimsForEmail(userTest.email)).toEqual([]);
    });

    it('getAllUserCountyClaims', async () => {
      await fieldCategoryRepo.save(fieldCategoryW);
      await fieldCategoryRepo.save(fieldCategoryPN);
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
      await statusTypeRepo.save(statusTypeP);
      await statusTypeRepo.save(statusTypeC);
      await statusTypeRepo.save(statusTypeF);
      await statusTypeRepo.save(statusTypeCan);
      await statusTypeRepo.save(statusTypeV);
      await statusTypeRepo.save(statusTypeCSL);
      await usersRepo.save(userTest);
      await statesRepo.save(stateTest);
      await countiesRepo.save(countyTest);
      await countyClaimsService.createOrUpdateClaim(countyClaimTest, [eVPn], [eVW]);
      const numberOfState = await countyClaimsService.getAllUserCountyClaims(userTest.email);
      expect(numberOfState.length).toEqual(1);
    });

    it('getActiveClaimsForCountyFips', async () => {
      await fieldCategoryRepo.save(fieldCategoryW);
      await fieldCategoryRepo.save(fieldCategoryPN);
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
      await statusTypeRepo.save(statusTypeP);
      await statusTypeRepo.save(statusTypeC);
      await statusTypeRepo.save(statusTypeF);
      await statusTypeRepo.save(statusTypeCan);
      await statusTypeRepo.save(statusTypeV);
      await statusTypeRepo.save(statusTypeCSL);
      await usersRepo.save(userTest);
      await statesRepo.save(stateTest);
      await countiesRepo.save(countyTest);
      await countyClaimsService.createOrUpdateClaim(countyClaimTest, [eVPn], [eVW]);
      const setClaim = await countyClaimsService.getActiveClaimsForCountyFips(countyTest.countyFips);
      expect(setClaim[0].county.name).toEqual(countyTest.name);
      await countyClaimsService.closeClaim(setClaim[0].guid);
      expect(await countyClaimsService.getActiveClaimsForCountyFips(countyTest.countyFips)).toEqual([]);
    });

    it('closeClaim', async () => {
      await fieldCategoryRepo.save(fieldCategoryW);
      await fieldCategoryRepo.save(fieldCategoryPN);
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
      await statusTypeRepo.save(statusTypeP);
      await statusTypeRepo.save(statusTypeC);
      await statusTypeRepo.save(statusTypeF);
      await statusTypeRepo.save(statusTypeCan);
      await statusTypeRepo.save(statusTypeV);
      await statusTypeRepo.save(statusTypeCSL);
      await usersRepo.save(userTest);
      await statesRepo.save(stateTest);
      await countiesRepo.save(countyTest);
      await countyClaimsService.createOrUpdateClaim(countyClaimTest, [eVPn], [eVW]);
      const setClaim = await countyClaimsService.getActiveClaimsForCountyFips(countyTest.countyFips);
      await countyClaimsService.closeClaim(setClaim[0].guid);
      expect(await countyClaimsService.getActiveClaimsForCountyFips(countyTest.countyFips)).toEqual([]);
    });

    it('getHistoricClaimsForCounty', async () => {
      await fieldCategoryRepo.save(fieldCategoryW);
      await fieldCategoryRepo.save(fieldCategoryPN);
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
      await statusTypeRepo.save(statusTypeP);
      await statusTypeRepo.save(statusTypeC);
      await statusTypeRepo.save(statusTypeF);
      await statusTypeRepo.save(statusTypeCan);
      await statusTypeRepo.save(statusTypeV);
      await statusTypeRepo.save(statusTypeCSL);
      await usersRepo.save(userTest);
      await statesRepo.save(stateTest);
      await countiesRepo.save(countyTest);
      await countyClaimsService.createOrUpdateClaim(countyClaimTest, [eVPn], [eVW]);
      const setClaim = await countyClaimsService.getActiveClaimsForEmail(userTest.email);
      await countyClaimsService.closeClaim(setClaim[0].guid);
      const historicClaim = await countyClaimsService.getHistoricClaimsForCounty(countyTest.countyFips);
      expect(historicClaim[0].guid).toEqual(setClaim[0].guid);
    });

    it('getSuggestedClaims', async () => {
      await fieldCategoryRepo.save(fieldCategoryW);
      await fieldCategoryRepo.save(fieldCategoryPN);
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
      await statusTypeRepo.save(statusTypeP);
      await statusTypeRepo.save(statusTypeC);
      await statusTypeRepo.save(statusTypeF);
      await statusTypeRepo.save(statusTypeCan);
      await statusTypeRepo.save(statusTypeV);
      await statusTypeRepo.save(statusTypeCSL);
      await usersRepo.save(userTest);
      await statesRepo.save(stateTest);
      await countiesRepo.save(countyTest);
      await countiesRepo.save(countyTestTwo);
      await countyClaimsService.createOrUpdateClaim(countyClaimTest, [eVPn], [eVW]);

      const suggestedClaim = await countyClaimsService.getSuggestedClaims(countyTest.countyFips);
      expect(suggestedClaim[0].countyFips).toEqual(countyTestTwo.countyFips);
    });

    it('getClaimsAdmin', async () => {
      await fieldCategoryRepo.save(fieldCategoryW);
      await fieldCategoryRepo.save(fieldCategoryPN);
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
      await statusTypeRepo.save(statusTypeP);
      await statusTypeRepo.save(statusTypeC);
      await statusTypeRepo.save(statusTypeF);
      await statusTypeRepo.save(statusTypeCan);
      await statusTypeRepo.save(statusTypeV);
      await statusTypeRepo.save(statusTypeCSL);
      await usersRepo.save(userTest);
      await statesRepo.save(stateTest);
      await countiesRepo.save(countyTest);
      await countyClaimsService.createOrUpdateClaim(countyClaimTest, [eVPn], [eVW]);

      const suggestedClaim = await countyClaimsService.getClaimsAdmin({
        stateFips: countyClaimTest.county.stateFips.stateFips,
        countyFips: countyClaimTest.county.countyFips,
        email: countyClaimTest.user.email
      });
      expect(suggestedClaim[0].user.email).toEqual(countyClaimTest.user.email);
    });

    it('getInfosForClaim', async () => {
      await fieldCategoryRepo.save(fieldCategoryW);
      await fieldCategoryRepo.save(fieldCategoryPN);
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
      await statusTypeRepo.save(statusTypeP);
      await statusTypeRepo.save(statusTypeC);
      await statusTypeRepo.save(statusTypeF);
      await statusTypeRepo.save(statusTypeCan);
      await statusTypeRepo.save(statusTypeV);
      await statusTypeRepo.save(statusTypeCSL);
      await usersRepo.save(userTest);
      await statesRepo.save(stateTest);
      await countiesRepo.save(countyTest);
      await countyClaimsService.createOrUpdateClaim(countyClaimTest, [eVPn], [eVW]);
      const setClaim = await countyClaimsService.getActiveClaimsForEmail(userTest.email);
      const suggestedClaim = await countyClaimsService.getInfosForClaim(setClaim[0].guid);
      expect(suggestedClaim.infos.length).toEqual(1);
    });
  });
});
