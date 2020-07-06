import { Test, TestingModule } from '@nestjs/testing';

import { Lockdown } from '@tamu-gisc/covid/common/entities';

import { LockdownsController } from './lockdowns.controller';
import { LockdownsService } from './lockdowns.service';
import { CountyClaimsService } from '../county-claims/county-claims.service';

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

  const mockParameters = 'foobar';

  describe('Validation ', () => {
    it('controller should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('getActiveLockdownsForEmail', () => {
    it('should return expectedResult', async () => {
      const expectedResult = { claim: '', info: '' };
      jest.spyOn(lockDownService, 'getActiveLockDownForEmail').mockResolvedValue(expectedResult);
      expect(await controller.getActiveLockdownsForEmail(mockParameters)).toMatchObject(expectedResult);
    });
  });
  describe('getLockdownForCounty', () => {
    it('should return expectedResult', async () => {
      const expectedResult = { claim: '', info: '' };
      jest.spyOn(lockDownService, 'getLockdownForCounty').mockResolvedValue(expectedResult);
      expect(await controller.getLockdownForCounty(mockParameters)).toMatchObject(expectedResult);
    });

    it('should return expectedResult - Error', async () => {
      const expectedResult = {
        message: '',
        status: 500,
        success: false
      };
      jest.spyOn(lockDownService, 'getLockdownForCounty').mockImplementation(() => {
        throw new Error();
      });
      expect(await controller.getLockdownForCounty(mockParameters)).toStrictEqual(expectedResult);
    });
  });

  describe('getLockdownsForUser', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(lockDownService, 'getAllLockdownsForUser').mockResolvedValue(expectedResult);
      expect(await controller.getLockdownsForUser(mockParameters)).toMatchObject(expectedResult);
    });

    it('should return expectedResult - Error', async () => {
      const expectedResult = {
        message: '',
        status: 500,
        success: false
      };
      jest.spyOn(lockDownService, 'getAllLockdownsForUser').mockImplementation(() => {
        throw new Error();
      });
      expect(await controller.getLockdownsForUser(mockParameters)).toStrictEqual(expectedResult);
    });
  });

  describe('getValidated', () => {
    it('should return expectedResult - Error', async () => {
      const expectedResult = {
        message: 'Not implemented.',
        status: 501,
        success: false
      };
      expect(await controller.getValidated()).toMatchObject(expectedResult);
    });
  });

  describe('getLockdownsAdmin', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(lockDownService, 'getLockdownsAdmin').mockResolvedValue(expectedResult);
      expect(await controller.getLockdownsAdmin(mockParameters)).toMatchObject(expectedResult);
    });

    it('should return expectedResult - Error', async () => {
      const expectedResult = {
        message: '',
        status: 500,
        success: false
      };
      jest.spyOn(lockDownService, 'getLockdownsAdmin').mockImplementation(() => {
        throw new Error();
      });
      expect(await controller.getLockdownsAdmin(mockParameters)).toStrictEqual(expectedResult);
    });
  });

  describe('getClaimDetails', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new Lockdown();
      jest.spyOn(lockDownService, 'getInfosForLockdown').mockResolvedValue(expectedResult);
      expect(await controller.getClaimDetails(mockParameters)).toMatchObject(expectedResult);
    });

    it('should throw error', async () => {
      jest.spyOn(lockDownService, 'getInfosForLockdown').mockImplementation(() => {
        throw new Error();
      });
      await expect(controller.getClaimDetails(mockParameters)).rejects.toThrow();
    });
  });

  describe('getLockDownInfo', () => {
    it('should return expectedResult', async () => {
      const expectedResult = { claim: '', info: '' };
      jest.spyOn(lockDownService, 'getLockdownInfoForLockdown').mockResolvedValue(expectedResult);
      expect(await controller.getLockDownInfo(mockParameters)).toMatchObject(expectedResult);
    });

    it('should throw error', async () => {
      jest.spyOn(lockDownService, 'getLockdownInfoForLockdown').mockImplementation(() => {
        throw new Error();
      });
      await expect(controller.getLockDownInfo(mockParameters)).rejects.toThrow();
    });
  });
  describe('addLockdown', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new Lockdown();
      jest.spyOn(lockDownService, 'createOrUpdateLockdown').mockResolvedValue(expectedResult);
      expect(await controller.addLockdown(mockParameters)).toMatchObject(expectedResult);
    });
  });

  describe('validateLockdown', () => {
    it('should return expectedResult - Error', async () => {
      const expectedResult = {
        status: 501,
        success: false,
        message: 'Not implemented.'
      };
      expect(await controller.validateLockdown(mockParameters)).toEqual(expectedResult);
    });
  });

  describe('deleteValidatedLockdown', () => {
    it('should return expectedResult - Error', async () => {
      const expectedResult = {
        status: 501,
        success: false,
        message: 'Not implemented.'
      };
      expect(await controller.deleteValidatedLockdown(mockParameters)).toEqual(expectedResult);
    });
  });
});
