import { Test, TestingModule } from '@nestjs/testing';

import { Lockdown } from '@tamu-gisc/covid/common/entities';

import { LockdownsController } from './lockdowns.controller';
import { LockdownsService } from './lockdowns.service';

jest.mock('./lockdowns.service');

describe('Lockdowns Controller', () => {
  let lockdownsService: LockdownsService;
  let lockdownsController: LockdownsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LockdownsService],
      controllers: [LockdownsController]
    }).compile();
    lockdownsService = module.get<LockdownsService>(LockdownsService);
    lockdownsController = module.get<LockdownsController>(LockdownsController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const mockParameters = 'foobar';

  describe('Validation ', () => {
    it('controller should be defined', () => {
      expect(lockdownsController).toBeDefined();
    });
  });

  describe('getActiveLockdownsForEmail', () => {
    it('should return expectedResult', async () => {
      const expectedResult = { claim: '', info: '' };
      jest.spyOn(lockdownsService, 'getActiveLockDownForEmail').mockResolvedValue(expectedResult);
      expect(await lockdownsController.getActiveLockdownsForEmail(mockParameters)).toMatchObject(expectedResult);
    });
  });
  describe('getLockdownForCounty', () => {
    it('should return expectedResult', async () => {
      const expectedResult = { claim: '', info: '' };
      jest.spyOn(lockdownsService, 'getLockdownForCounty').mockResolvedValue(expectedResult);
      expect(await lockdownsController.getLockdownForCounty(mockParameters)).toMatchObject(expectedResult);
    });

    it('should return expectedResult - Error', async () => {
      const expectedResult = {
        message: '',
        status: 500,
        success: false
      };
      jest.spyOn(lockdownsService, 'getLockdownForCounty').mockImplementation(() => {
        throw new Error();
      });
      expect(await lockdownsController.getLockdownForCounty(mockParameters)).toStrictEqual(expectedResult);
    });
  });

  describe('getLockdownsForUser', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(lockdownsService, 'getAllLockdownsForUser').mockResolvedValue(expectedResult);
      expect(await lockdownsController.getLockdownsForUser(mockParameters)).toMatchObject(expectedResult);
    });

    it('should return expectedResult - Error', async () => {
      const expectedResult = {
        message: '',
        status: 500,
        success: false
      };
      jest.spyOn(lockdownsService, 'getAllLockdownsForUser').mockImplementation(() => {
        throw new Error();
      });
      expect(await lockdownsController.getLockdownsForUser(mockParameters)).toStrictEqual(expectedResult);
    });
  });

  describe('getValidated', () => {
    it('should return expectedResult - Error', async () => {
      const expectedResult = {
        message: 'Not implemented.',
        status: 501,
        success: false
      };
      expect(await lockdownsController.getValidated()).toMatchObject(expectedResult);
    });
  });

  describe('getLockdownsAdmin', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(lockdownsService, 'getLockdownsAdmin').mockResolvedValue(expectedResult);
      expect(await lockdownsController.getLockdownsAdmin(mockParameters)).toMatchObject(expectedResult);
    });

    it('should return expectedResult - Error', async () => {
      const expectedResult = {
        message: '',
        status: 500,
        success: false
      };
      jest.spyOn(lockdownsService, 'getLockdownsAdmin').mockImplementation(() => {
        throw new Error();
      });
      expect(await lockdownsController.getLockdownsAdmin(mockParameters)).toStrictEqual(expectedResult);
    });
  });

  describe('getClaimDetails', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new Lockdown();
      jest.spyOn(lockdownsService, 'getInfosForLockdown').mockResolvedValue(expectedResult);
      expect(await lockdownsController.getClaimDetails(mockParameters)).toMatchObject(expectedResult);
    });

    it('should throw error', async () => {
      jest.spyOn(lockdownsService, 'getInfosForLockdown').mockImplementation(() => {
        throw new Error();
      });
      await expect(lockdownsController.getClaimDetails(mockParameters)).rejects.toThrow();
    });
  });

  describe('getLockDownInfo', () => {
    it('should return expectedResult', async () => {
      const expectedResult = { claim: '', info: '' };
      jest.spyOn(lockdownsService, 'getLockdownInfoForLockdown').mockResolvedValue(expectedResult);
      expect(await lockdownsController.getLockDownInfo(mockParameters)).toMatchObject(expectedResult);
    });

    it('should throw error', async () => {
      jest.spyOn(lockdownsService, 'getLockdownInfoForLockdown').mockImplementation(() => {
        throw new Error();
      });
      await expect(lockdownsController.getLockDownInfo(mockParameters)).rejects.toThrow();
    });
  });
  describe('addLockdown', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new Lockdown();
      jest.spyOn(lockdownsService, 'createOrUpdateLockdown').mockResolvedValue(expectedResult);
      expect(await lockdownsController.addLockdown(mockParameters)).toMatchObject(expectedResult);
    });
  });

  describe('validateLockdown', () => {
    it('should return expectedResult - Error', async () => {
      const expectedResult = {
        status: 501,
        success: false,
        message: 'Not implemented.'
      };
      expect(await lockdownsController.validateLockdown(mockParameters)).toEqual(expectedResult);
    });
  });

  describe('deleteValidatedLockdown', () => {
    it('should return expectedResult - Error', async () => {
      const expectedResult = {
        status: 501,
        success: false,
        message: 'Not implemented.'
      };
      expect(await lockdownsController.deleteValidatedLockdown(mockParameters)).toEqual(expectedResult);
    });
  });
});
