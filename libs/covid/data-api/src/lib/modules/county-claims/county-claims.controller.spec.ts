import { Test, TestingModule } from '@nestjs/testing';

import { CountyClaim } from '@tamu-gisc/covid/common/entities';

import { CountyClaimsService } from './county-claims.service';
import { CountyClaimsController } from './county-claims.controller';

jest.mock('./county-claims.service');

describe('CountyClaims Controller', () => {
  let countyClaimsService: CountyClaimsService;
  let countyClaimsController: CountyClaimsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CountyClaimsService],
      controllers: [CountyClaimsController]
    }).compile();
    countyClaimsService = module.get<CountyClaimsService>(CountyClaimsService);
    countyClaimsController = module.get<CountyClaimsController>(CountyClaimsController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const mockParameters = 'foobar';

  describe('getActiveClaimsForCountyFips', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(countyClaimsService, 'getActiveClaimsForCountyFips').mockResolvedValue(expectedResult);
      expect(await countyClaimsController.getActiveClaimsForCountyFips(mockParameters)).toMatchObject(expectedResult);
    });

    it('should return expectedResult - Error handling', async () => {
      const expectedResult = {
        message: '',
        status: 500,
        success: false
      };
      jest.spyOn(countyClaimsService, 'getActiveClaimsForCountyFips').mockImplementation(() => {
        throw new Error();
      });
      expect(await countyClaimsController.getActiveClaimsForCountyFips(mockParameters)).toStrictEqual(expectedResult);
    });
  });
  describe('getAllUserCountyClaims', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(countyClaimsService, 'getAllUserCountyClaims').mockResolvedValue(expectedResult);
      expect(await countyClaimsController.getAllUserCountyClaims(mockParameters)).toMatchObject(expectedResult);
    });

    it('should return expectedResult - Error handling', async () => {
      const expectedResult = {
        message: '',
        status: 500,
        success: false
      };
      jest.spyOn(countyClaimsService, 'getAllUserCountyClaims').mockImplementation(() => {
        throw new Error();
      });
      expect(await countyClaimsController.getAllUserCountyClaims(mockParameters)).toStrictEqual(expectedResult);
    });
  });
  describe('getActiveClaimsForUser', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(countyClaimsService, 'getActiveClaimsForEmail').mockResolvedValue(expectedResult);
      expect(await countyClaimsController.getActiveClaimsForUser(mockParameters)).toMatchObject(expectedResult);
    });

    it('should return expectedResult - Error handling', async () => {
      const expectedResult = {
        message: '',
        status: 500,
        success: false
      };
      jest.spyOn(countyClaimsService, 'getActiveClaimsForEmail').mockImplementation(() => {
        throw new Error();
      });
      expect(await countyClaimsController.getActiveClaimsForUser(mockParameters)).toStrictEqual(expectedResult);
    });
  });
  describe('getPreviousClaimsForCounty', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(countyClaimsService, 'getHistoricClaimsForCounty').mockResolvedValue(expectedResult);
      expect(await countyClaimsController.getPreviousClaimsForCounty(mockParameters)).toMatchObject(expectedResult);
    });

    it('should return expectedResult - Error handling', async () => {
      const expectedResult = {
        message: '',
        status: 500,
        success: false
      };
      jest.spyOn(countyClaimsService, 'getHistoricClaimsForCounty').mockImplementation(() => {
        throw new Error();
      });
      expect(await countyClaimsController.getPreviousClaimsForCounty(mockParameters)).toStrictEqual(expectedResult);
    });
  });
  describe('getSuggestedCountyClaims', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(countyClaimsService, 'getSuggestedClaims').mockResolvedValue(expectedResult);
      expect(await countyClaimsController.getSuggestedCountyClaims(mockParameters)).toMatchObject(expectedResult);
    });

    it('should return expectedResult - Error handling', async () => {
      const expectedResult = {
        message: '',
        status: 500,
        success: false
      };
      jest.spyOn(countyClaimsService, 'getSuggestedClaims').mockImplementation(() => {
        throw new Error();
      });
      expect(await countyClaimsController.getSuggestedCountyClaims(mockParameters)).toStrictEqual(expectedResult);
    });
  });
  describe('getClaimsAdmin', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(countyClaimsService, 'getClaimsAdmin').mockResolvedValue(expectedResult);
      expect(await countyClaimsController.getClaimsAdmin(mockParameters)).toMatchObject(expectedResult);
    });

    it('should return expectedResult - Error handling', async () => {
      const expectedResult = { message: '', status: 500, success: false };
      jest.spyOn(countyClaimsService, 'getClaimsAdmin').mockImplementation(() => {
        throw new Error();
      });
      expect(await countyClaimsController.getClaimsAdmin(mockParameters)).toStrictEqual(expectedResult);
    });
  });
  describe('getClaimDetails', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new CountyClaim();
      jest.spyOn(countyClaimsService, 'getInfosForClaim').mockResolvedValue(expectedResult);
      expect(countyClaimsController.getClaimDetails(mockParameters)).toMatchObject(expectedResult);
    });

    it('should return expectedResult - Error handling', async (done) => {
      const expectedResult = 'Internal server error';
      jest.spyOn(countyClaimsService, 'getInfosForClaim').mockImplementation(() => {
        throw new Error();
      });
      await countyClaimsController
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
      jest.spyOn(countyClaimsService, 'createOrUpdateClaim').mockResolvedValue(expectedResult);
      expect(countyClaimsController.registerClaim(mockParameters)).toMatchObject(expectedResult);
    });
  });
  describe('closeClaim', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new CountyClaim();
      jest.spyOn(countyClaimsService, 'closeClaim').mockResolvedValue(expectedResult);
      expect(countyClaimsController.closeClaim(mockParameters)).toMatchObject(expectedResult);
    });
  });
  describe('postOverride', () => {
    it('should return expectedResult', async () => {
      const expectedResult = 'Not Implemented';
      expect(countyClaimsController.postOverride()).toBe(expectedResult);
    });
  });

  describe('patchOverride', () => {
    it('should return expectedResult', async () => {
      const expectedResult = 'Not Implemented';
      expect(countyClaimsController.patchOverride()).toBe(expectedResult);
    });
  });

  describe('deleteOverride', () => {
    it('should return expectedResult', async () => {
      const expectedResult = 'Not Implemented';
      expect(countyClaimsController.deleteOverride()).toBe(expectedResult);
    });
  });
});
