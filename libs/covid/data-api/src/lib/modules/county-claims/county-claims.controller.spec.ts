import { Test, TestingModule } from '@nestjs/testing';

import { CountyClaimsService } from './county-claims.service';
import { CountyClaimsController } from './county-claims.controller';
import { CountyClaim } from '@tamu-gisc/covid/common/entities';

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
  describe('getActiveClaimsForCountyFips', () => {
    it('should return expected Result', async () => {
      const expectedResult = [];
      jest.spyOn(service, 'getActiveClaimsForCountyFips').mockResolvedValue(expectedResult);
      expect(await controller.getActiveClaimsForCountyFips(expectedResult)).toMatchObject(expectedResult);
    });

    it('should return expected Result', async () => {
      const expectedResult = [];
      jest.spyOn(service, 'getActiveClaimsForCountyFips').mockImplementation(() => {
        throw new Error();
      });
      expect(await controller.getActiveClaimsForCountyFips(expectedResult)).toStrictEqual({
        message: '',
        status: 500,
        success: false
      });
    });
  });
  describe('getAllUserCountyClaims', () => {
    it('should return expected Result', async () => {
      const expectedResult = [];
      jest.spyOn(service, 'getAllUserCountyClaims').mockResolvedValue(expectedResult);
      expect(await controller.getAllUserCountyClaims(expectedResult)).toMatchObject(expectedResult);
    });

    it('should return expected Result', async () => {
      const expectedResult = [];
      jest.spyOn(service, 'getAllUserCountyClaims').mockImplementation(() => {
        throw new Error();
      });
      expect(await controller.getAllUserCountyClaims(expectedResult)).toStrictEqual({
        message: '',
        status: 500,
        success: false
      });
    });
  });
  describe('getActiveClaimsForUser', () => {
    it('should return expected Result', async () => {
      const expectedResult = [];
      jest.spyOn(service, 'getActiveClaimsForEmail').mockResolvedValue(expectedResult);
      expect(await controller.getActiveClaimsForUser(expectedResult)).toMatchObject(expectedResult);
    });

    it('should return expected Result', async () => {
      const expectedResult = [];
      jest.spyOn(service, 'getActiveClaimsForEmail').mockImplementation(() => {
        throw new Error();
      });
      expect(await controller.getActiveClaimsForUser(expectedResult)).toStrictEqual({
        message: '',
        status: 500,
        success: false
      });
    });
  });
  describe('getPreviousClaimsForCounty', () => {
    it('should return expected Result', async () => {
      const expectedResult = [];
      jest.spyOn(service, 'getHistoricClaimsForCounty').mockResolvedValue(expectedResult);
      expect(await controller.getPreviousClaimsForCounty(expectedResult)).toMatchObject(expectedResult);
    });

    it('should return expected Result', async () => {
      const expectedResult = [];
      jest.spyOn(service, 'getHistoricClaimsForCounty').mockImplementation(() => {
        throw new Error();
      });
      expect(await controller.getPreviousClaimsForCounty(expectedResult)).toStrictEqual({
        message: '',
        status: 500,
        success: false
      });
    });
  });
  describe('getSuggestedCountyClaims', () => {
    it('should return expected Result', async () => {
      const expectedResult = [];
      jest.spyOn(service, 'getSuggestedClaims').mockResolvedValue(expectedResult);
      expect(await controller.getSuggestedCountyClaims(expectedResult)).toMatchObject(expectedResult);
    });

    it('should return expected Result', async () => {
      const expectedResult = [];
      jest.spyOn(service, 'getSuggestedClaims').mockImplementation(() => {
        throw new Error();
      });
      expect(await controller.getSuggestedCountyClaims(expectedResult)).toStrictEqual({
        message: '',
        status: 500,
        success: false
      });
    });
  });
  describe('getClaimsAdmin', () => {
    it('should return expected Result', async () => {
      const expectedResult = [];
      jest.spyOn(service, 'getClaimsAdmin').mockResolvedValue(expectedResult);
      expect(await controller.getClaimsAdmin(expectedResult)).toMatchObject(expectedResult);
    });

    it('should return expected Result', async () => {
      const expectedResult = [];
      jest.spyOn(service, 'getClaimsAdmin').mockImplementation(() => {
        throw new Error();
      });
      expect(await controller.getClaimsAdmin(expectedResult)).toStrictEqual({ message: '', status: 500, success: false });
    });
  });
  describe('getClaimDetails', () => {
    it('should return expected Result', async () => {
      const expectedResult = new CountyClaim();
      jest.spyOn(service, 'getInfosForClaim').mockResolvedValue(expectedResult);
      expect(controller.getClaimDetails(expectedResult)).toMatchObject(expectedResult);
    });

    it('should return expected Result', async (done) => {
      const expectedResult = new CountyClaim();
      jest.spyOn(service, 'getInfosForClaim').mockImplementation(() => {
        throw new Error();
      });
      await controller
        .getClaimDetails(expectedResult)
        .then(() => done.fail(''))
        .catch((error) => {
          expect(error.message).toBe('Internal server error');
          done();
        });
    });
  });
  describe('registerClaim', () => {
    it('should return expected Result', async () => {
      const expectedResult = new CountyClaim();
      jest.spyOn(service, 'createOrUpdateClaim').mockResolvedValue(expectedResult);
      expect(controller.registerClaim(expectedResult)).toMatchObject(expectedResult);
    });
  });
  describe('closeClaim', () => {
    it('should return expected Result', async () => {
      const expectedResult = new CountyClaim();
      jest.spyOn(service, 'closeClaim').mockResolvedValue(expectedResult);
      expect(controller.closeClaim(expectedResult)).toMatchObject(expectedResult);
    });
  });
  describe('postOverride', () => {
    it('should return expected Result', async () => {
      expect(controller.postOverride()).toBe('Not Implemented');
    });
  });

  describe('patchOverride', () => {
    it('should return expected Result', async () => {
      expect(controller.patchOverride()).toBe('Not Implemented');
    });
  });

  describe('deleteOverride', () => {
    it('should return expected Result', async () => {
      expect(controller.deleteOverride()).toBe('Not Implemented');
    });
  });
});
