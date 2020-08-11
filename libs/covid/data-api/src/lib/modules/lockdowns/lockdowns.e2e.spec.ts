import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, getConnection, DeepPartial } from 'typeorm';
import {
  County,
  CountyClaim,
  User,
  EntityStatus,
  EntityToValue,
  CountyClaimInfo,
  State,
  StatusType,
  FieldCategory,
  FieldType,
  CategoryValue,
  EntityValue,
  Lockdown,
  LockdownInfo
} from '@tamu-gisc/covid/common/entities';
import { config } from '@tamu-gisc/covid/data-api';
import { LockdownsService } from './lockdowns.service';
import { LockdownsModule } from './lockdowns.module';
import { CountyClaimsService } from '../county-claims/county-claims.service';
import { CountyClaimsModule } from '../county-claims/county-claims.module';
import { CATEGORY } from '@tamu-gisc/covid/common/enums';

describe('Lockdowns Setup', () => {
  let lockdownsService: LockdownsService;
  let countyClaimsService: CountyClaimsService;

  let lockdownsRepo: Repository<Lockdown>;
  let lockdownInfoRepo: Repository<LockdownInfo>;

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
        LockdownsModule,
        CountyClaimsModule,

        TypeOrmModule.forFeature([
          Lockdown,
          LockdownInfo,
          County,
          State,
          CountyClaim,
          CountyClaimInfo,
          EntityStatus,
          EntityToValue,
          User,
          FieldCategory,
          FieldType,
          CategoryValue,
          EntityValue,
          StatusType
        ]),
        TypeOrmModule.forRoot(config)
      ],
      providers: [CountyClaimsService, LockdownsService]
    }).compile();
    lockdownsService = module.get<LockdownsService>(LockdownsService);
    countyClaimsService = module.get<CountyClaimsService>(CountyClaimsService);

    lockdownsRepo = module.get<Repository<Lockdown>>(getRepositoryToken(Lockdown));
    lockdownInfoRepo = module.get<Repository<LockdownInfo>>(getRepositoryToken(LockdownInfo));
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
    await lockdownInfoRepo.query(`DELETE FROM lockdown_infos`);
    await lockdownsRepo.query(`DELETE FROM lockdowns`);
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
      .from(LockdownInfo)
      .execute();
    await connection
      .createQueryBuilder()
      .delete()
      .from(Lockdown)
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
  const userTest: DeepPartial<User> = { email: 'Foo@tamu.edu', guid: 'Bar' };
  const stateTest: DeepPartial<State> = { name: 'Foo', abbreviation: 'F', stateFips: 1 };
  const countyTest: DeepPartial<County> = { countyFips: 1, name: 'Foo', stateFips: stateTest };
  const countyClaimTest: DeepPartial<CountyClaim> = {
    user: userTest,
    county: countyTest
  };

  describe('Lockdowns Integration Tests', () => {
    it('getActiveLockDownForEmail', async () => {
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
      const lockDownTest = {
        claim: { user: userTest.email, county: countyTest.countyFips },
        guid: 'Foo',
        info: {
          phoneNumbers: [eVPn],
          websites: [eVW],
          isLockdown: true,
          startDate: null,
          endDate: null,
          protocol: 'Foo',
          notes: 'Foo'
        }
      };
      await lockdownsService.createOrUpdateLockdown(lockDownTest);
      const getActive = await lockdownsService.getActiveLockDownForEmail(userTest.email);
      expect(getActive).toMatchObject({
        claim: { county: { countyFips: 1 } },
        info: { isLockdown: true }
      });
    });
    it('getAllLockdownsForUser', async () => {
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
      const lockDownTest = {
        claim: { user: userTest.email, county: countyTest.countyFips },
        guid: 'Foo',
        info: {
          phoneNumbers: [eVPn],
          websites: [eVW],
          isLockdown: true,
          startDate: null,
          endDate: null,
          protocol: 'Foo',
          notes: 'Foo'
        }
      };
      await lockdownsService.createOrUpdateLockdown(lockDownTest);
      const getter = await lockdownsService.getAllLockdownsForUser(userTest.email);
      expect(getter).toMatchObject([
        { claim: { county: { countyFips: 1 }, user: { guid: 'Bar' } }, infos: [{ endDate: null, isLockdown: true }] }
      ]);
    });
    it('getLockdownForCounty', async () => {
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
      const lockDownTest = {
        claim: { user: userTest.email, county: countyTest.countyFips },
        guid: 'Foo',
        info: {
          phoneNumbers: [eVPn],
          websites: [eVW],
          isLockdown: true,
          startDate: null,
          endDate: null,
          protocol: 'Foo',
          notes: 'Foo'
        }
      };
      await lockdownsService.createOrUpdateLockdown(lockDownTest);
      const getter = await lockdownsService.getLockdownForCounty(countyTest.countyFips);
      expect(getter).toMatchObject({ claim: { county: { countyFips: 1 } }, info: { isLockdown: true } });
    });

    it('getLockdownsAdmin', async () => {
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
      const lockDownTest = {
        claim: { user: userTest.email, county: countyTest.countyFips },
        guid: 'Foo',
        info: {
          phoneNumbers: [eVPn],
          websites: [eVW],
          isLockdown: true,
          startDate: null,
          endDate: null,
          protocol: 'Foo',
          notes: 'Foo'
        }
      };
      await lockdownsService.createOrUpdateLockdown(lockDownTest);
      const getter = await lockdownsService.getLockdownsAdmin(stateTest.stateFips, countyTest.countyFips, userTest.email);
      expect(getter).toMatchObject([
        { claim: { county: { countyFips: 1, stateFips: { name: 'Foo' } }, user: { email: 'Foo@tamu.edu' } } }
      ]);
    });
    it('getInfosForLockdown', async () => {
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
      const lockDownTest = {
        claim: { user: userTest.email, county: countyTest.countyFips },
        guid: 'Foo',
        info: {
          phoneNumbers: [eVPn],
          websites: [eVW],
          isLockdown: true,
          startDate: null,
          endDate: null,
          protocol: 'Foo',
          notes: 'Foo'
        }
      };
      await lockdownsService.createOrUpdateLockdown(lockDownTest);
      const setterTest = await lockdownsService.getLockdownsAdmin(
        stateTest.stateFips,
        countyTest.countyFips,
        userTest.email
      );
      const getter = await lockdownsService.getInfosForLockdown(setterTest[0].guid);
      expect(getter).toMatchObject({ infos: [{ endDate: null, isLockdown: true }] });
    });

    it('getLockdownInfoForLockdown', async () => {
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
      const lockDownTest = {
        claim: { user: userTest.email, county: countyTest.countyFips },
        guid: 'Foo',
        info: {
          phoneNumbers: [eVPn],
          websites: [eVW],
          isLockdown: true,
          startDate: null,
          endDate: null,
          protocol: 'Foo',
          notes: 'Foo'
        }
      };
      await lockdownsService.createOrUpdateLockdown(lockDownTest);
      const setterTest = await lockdownsService.getLockdownsAdmin(
        stateTest.stateFips,
        countyTest.countyFips,
        userTest.email
      );
      const setterTestTwo = await lockdownsService.getInfosForLockdown(setterTest[0].guid);

      const getter = await lockdownsService.getLockdownInfoForLockdown(setterTestTwo.infos[0].guid);
      expect(getter).toMatchObject({ claim: { county: { countyFips: 1 } }, info: { endDate: null, isLockdown: true } });
    });
  });
});
