import { Test, TestingModule } from '@nestjs/testing';

import { LockdownsController } from './lockdowns.controller';
import { LockdownsService } from './lockdowns.service';
import { CountyClaimsService } from '../county-claims/county-claims.service';
import { Lockdown } from '@tamu-gisc/covid/common/entities';

jest.mock('../county-claims/county-claims.service');
jest.mock('./lockdowns.service');

describe('Lockdowns Controller', () => {
  let module: TestingModule;
  let lockDownService: LockdownsService;
  let countyClaimsService: CountyClaimsService;
  let controller: LockdownsController;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [LockdownsService, CountyClaimsService],
      controllers: [LockdownsController]
    }).compile();
    lockDownService = module.get<LockdownsService>(LockdownsService);
    countyClaimsService = module.get<CountyClaimsService>(CountyClaimsService);
    controller = module.get<LockdownsController>(LockdownsController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getActiveLockdownsForEmail', () => {
    it('should return expected Result', async () => {
      const expectedResult = { claim: '', info: '' };
      jest.spyOn(lockDownService, 'getActiveLockDownForEmail').mockResolvedValue(expectedResult);
      expect(await controller.getActiveLockdownsForEmail(expectedResult)).toMatchObject(expectedResult);
    });
  });
  describe('getLockdownForCounty', () => {
    it('should return expected Result', async () => {
      const expectedResult = { claim: '', info: '' };
      jest.spyOn(lockDownService, 'getLockdownForCounty').mockResolvedValue(expectedResult);
      expect(await controller.getLockdownForCounty(expectedResult)).toMatchObject(expectedResult);
    });

    it('should return expected Result', async () => {
      const expectedResult = [];
      jest.spyOn(lockDownService, 'getLockdownForCounty').mockImplementation(() => {
        throw new Error();
      });
      expect(await controller.getLockdownForCounty(expectedResult)).toStrictEqual({
        message: '',
        status: 500,
        success: false
      });
    });
  });

  describe('getLockdownsForUser', () => {
    it('should return expected Result', async () => {
      const expectedResult = [];
      jest.spyOn(lockDownService, 'getAllLockdownsForUser').mockResolvedValue(expectedResult);
      expect(await controller.getLockdownsForUser(expectedResult)).toMatchObject(expectedResult);
    });

    it('should return expected Result', async () => {
      const expectedResult = [];
      jest.spyOn(lockDownService, 'getAllLockdownsForUser').mockImplementation(() => {
        throw new Error();
      });
      expect(await controller.getLockdownsForUser(expectedResult)).toStrictEqual({
        message: '',
        status: 500,
        success: false
      });
    });
  });

  describe('getValidated', () => {
    it('should return expected Result', async () => {
      expect(await controller.getValidated()).toMatchObject({
        message: 'Not implemented.',
        status: 501,
        success: false
      });
    });
  });

  describe('getLockdownsAdmin', () => {
    it('should return expected Result', async () => {
      const expectedResult = [];
      jest.spyOn(lockDownService, 'getLockdownsAdmin').mockResolvedValue(expectedResult);
      expect(await controller.getLockdownsAdmin(expectedResult)).toMatchObject(expectedResult);
    });

    it('should return expected Result', async () => {
      const expectedResult = [];
      jest.spyOn(lockDownService, 'getLockdownsAdmin').mockImplementation(() => {
        throw new Error();
      });
      expect(await controller.getLockdownsAdmin(expectedResult)).toStrictEqual({
        message: '',
        status: 500,
        success: false
      });
    });
  });

  describe('getClaimDetails', () => {
    it('should return expected Result', async () => {
      const expectedResult = new Lockdown();
      jest.spyOn(lockDownService, 'getInfosForLockdown').mockResolvedValue(expectedResult);
      expect(await controller.getClaimDetails(expectedResult)).toMatchObject(expectedResult);
    });

    it('should return expected Result', async () => {
      const expectedResult = { claim: '', info: '' };
      jest.spyOn(lockDownService, 'getInfosForLockdown').mockImplementation(() => {
        throw new Error();
      });
      await expect(controller.getClaimDetails(expectedResult)).rejects.toThrow();
    });
  });

  describe('getLockDownInfo', () => {
    it('should return expected Result', async () => {
      const expectedResult = { claim: '', info: '' };
      jest.spyOn(lockDownService, 'getLockdownInfoForLockdown').mockResolvedValue(expectedResult);
      expect(await controller.getLockDownInfo(expectedResult)).toMatchObject(expectedResult);
    });

    it('should return expected Result', async () => {
      const expectedResult = { claim: '', info: '' };
      jest.spyOn(lockDownService, 'getLockdownInfoForLockdown').mockImplementation(() => {
        throw new Error();
      });
      await expect(controller.getLockDownInfo(expectedResult)).rejects.toThrow();
    });
  });
  describe('addLockdown', () => {
    it('should return expected Result', async () => {
      const expectedResult = new Lockdown();
      jest.spyOn(lockDownService, 'createOrUpdateLockdown').mockResolvedValue(expectedResult);
      expect(await controller.addLockdown(expectedResult)).toMatchObject(expectedResult);
    });
  });

  describe('validateLockdown', () => {
    it('should return expected Result', async () => {
      expect(await controller.validateLockdown([])).toEqual({
        status: 501,
        success: false,
        message: 'Not implemented.'
      });
    });
  });

  describe('deleteValidatedLockdown', () => {
    it('should return expected Result', async () => {
      expect(await controller.deleteValidatedLockdown([])).toEqual({
        status: 501,
        success: false,
        message: 'Not implemented.'
      });
    });
  });
});
