import { Test, TestingModule } from '@nestjs/testing';

import { CountyClaim } from '@tamu-gisc/covid/common/entities';

import { CountyClaimsService } from './county-claims.service';
import { CountyClaimsController } from './county-claims.controller';

jest.mock('./county-claims.service');

describe('CountyClaims Controller', () => {
  let service: CountyClaimsService;
  let controller: CountyClaimsController;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [CountyClaimsService],
      controllers: [CountyClaimsController]
    }).compile();
    service = module.get<CountyClaimsService>(CountyClaimsService);
    controller = module.get<CountyClaimsController>(CountyClaimsController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const mockParameters = 'foobar';

  describe('getActiveClaimsForCountyFips', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(service, 'getActiveClaimsForCountyFips').mockResolvedValue(expectedResult);
      expect(await controller.getActiveClaimsForCountyFips(mockParameters)).toMatchObject(expectedResult);
    });

    it('should return expectedResult - Error handling', async () => {
      const expectedResult = {
        message: '',
        status: 500,
        success: false
      };
      jest.spyOn(service, 'getActiveClaimsForCountyFips').mockImplementation(() => {
        throw new Error();
      });
      expect(await controller.getActiveClaimsForCountyFips(mockParameters)).toStrictEqual(expectedResult);
    });
  });
  describe('getAllUserCountyClaims', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(service, 'getAllUserCountyClaims').mockResolvedValue(expectedResult);
      expect(await controller.getAllUserCountyClaims(mockParameters)).toMatchObject(expectedResult);
    });

    it('should return expectedResult - Error handling', async () => {
      const expectedResult = {
        message: '',
        status: 500,
        success: false
      };
      jest.spyOn(service, 'getAllUserCountyClaims').mockImplementation(() => {
        throw new Error();
      });
      expect(await controller.getAllUserCountyClaims(mockParameters)).toStrictEqual(expectedResult);
    });
  });
  describe('getActiveClaimsForUser', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(service, 'getActiveClaimsForEmail').mockResolvedValue(expectedResult);
      expect(await controller.getActiveClaimsForUser(mockParameters)).toMatchObject(expectedResult);
    });

    it('should return expectedResult - Error handling', async () => {
      const expectedResult = {
        message: '',
        status: 500,
        success: false
      };
      jest.spyOn(service, 'getActiveClaimsForEmail').mockImplementation(() => {
        throw new Error();
      });
      expect(await controller.getActiveClaimsForUser(mockParameters)).toStrictEqual(expectedResult);
    });
  });
  describe('getPreviousClaimsForCounty', () => {
    it('should return expected Result', async () => {
      const expectedResult = [];
      jest.spyOn(service, 'getHistoricClaimsForCounty').mockResolvedValue(expectedResult);
      expect(await controller.getPreviousClaimsForCounty(mockParameters)).toMatchObject(expectedResult);
    });

    it('should return expectedResult - Error handling', async () => {
      const expectedResult = {
        message: '',
        status: 500,
        success: false
      };
      jest.spyOn(service, 'getHistoricClaimsForCounty').mockImplementation(() => {
        throw new Error();
      });
      expect(await controller.getPreviousClaimsForCounty(mockParameters)).toStrictEqual(expectedResult);
    });
  });
  describe('getSuggestedCountyClaims', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(service, 'getSuggestedClaims').mockResolvedValue(expectedResult);
      expect(await controller.getSuggestedCountyClaims(mockParameters)).toMatchObject(expectedResult);
    });

    it('should return expectedResult - Error handling', async () => {
      const expectedResult = {
        message: '',
        status: 500,
        success: false
      };
      jest.spyOn(service, 'getSuggestedClaims').mockImplementation(() => {
        throw new Error();
      });
      expect(await controller.getSuggestedCountyClaims(mockParameters)).toStrictEqual(expectedResult);
    });
  });
  describe('getClaimsAdmin', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(service, 'getClaimsAdmin').mockResolvedValue(expectedResult);
      expect(await controller.getClaimsAdmin(mockParameters)).toMatchObject(expectedResult);
    });

    it('should return expectedResult - Error handling', async () => {
      const expectedResult = { message: '', status: 500, success: false };
      jest.spyOn(service, 'getClaimsAdmin').mockImplementation(() => {
        throw new Error();
      });
      expect(await controller.getClaimsAdmin(mockParameters)).toStrictEqual(expectedResult);
    });
  });
  describe('getClaimDetails', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new CountyClaim();
      jest.spyOn(service, 'getInfosForClaim').mockResolvedValue(expectedResult);
      expect(controller.getClaimDetails(mockParameters)).toMatchObject(expectedResult);
    });

    it('should return expectedResult - Error handling', async (done) => {
      const expectedResult = 'Internal server error';
      jest.spyOn(service, 'getInfosForClaim').mockImplementation(() => {
        throw new Error();
      });
      await controller
        .getClaimDetails(mockParameters)
        .then(() => done.fail(''))
        .catch((error) => {
          expect(error.message).toBe(expectedResult);
          done();
        });
    });
  });
  describe('registerClaim', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new CountyClaim();
      jest.spyOn(service, 'createOrUpdateClaim').mockResolvedValue(expectedResult);
      expect(controller.registerClaim(mockParameters)).toMatchObject(expectedResult);
    });
  });
  describe('closeClaim', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new CountyClaim();
      jest.spyOn(service, 'closeClaim').mockResolvedValue(expectedResult);
      expect(controller.closeClaim(mockParameters)).toMatchObject(expectedResult);
    });
  });
  describe('postOverride', () => {
    it('should return expectedResult', async () => {
      const expectedResult = 'Not Implemented';
      expect(controller.postOverride()).toBe(expectedResult);
    });
  });

  describe('patchOverride', () => {
    it('should return expectedResult', async () => {
      const expectedResult = 'Not Implemented';
      expect(controller.patchOverride()).toBe(expectedResult);
    });
  });

  describe('deleteOverride', () => {
    it('should return expectedResult', async () => {
      const expectedResult = 'Not Implemented';
      expect(controller.deleteOverride()).toBe(expectedResult);
    });
  });
});
