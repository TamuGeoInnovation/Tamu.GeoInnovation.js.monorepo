import { Test, TestingModule } from '@nestjs/testing';

import { CountiesController } from './counties.controller';
import { CountiesService } from './counties.service';

jest.mock('./counties.service');

describe('Counties Controller', () => {
  let countiesService: CountiesService;
  let controller: CountiesController;
  let module: TestingModule;
  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [CountiesService],
      controllers: [CountiesController]
    }).compile();
    countiesService = module.get<CountiesService>(CountiesService);
    controller = module.get<CountiesController>(CountiesController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Validation ', () => {
    it('controller should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  const mockParameters = 'foobar';

  describe('getCountyStats', () => {
    it('should return expectedResult', async () => {
      const expectedResult = {};
      jest.spyOn(countiesService, 'getCountyStats').mockResolvedValue(expectedResult);
      expect(await controller.getCountyStats()).toMatchObject(expectedResult);
    });

    it('should return expectedResult - Error Handling', async () => {
      const expectedResult = {
        message: '',
        status: 500,
        success: false
      };
      jest.spyOn(countiesService, 'getCountyStats').mockImplementation(() => {
        throw new Error();
      });
      expect(await controller.getCountyStats()).toStrictEqual(expectedResult);
    });
  });

  describe('getCountySummary', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(countiesService, 'getSummary').mockResolvedValue(expectedResult);
      expect(await controller.getCountySummary()).toMatchObject(expectedResult);
    });

    it('should return expectedResult', async () => {
      jest.spyOn(countiesService, 'getSummary').mockImplementation(() => {
        throw new Error();
      });
      await expect(controller.getCountySummary()).rejects.toThrow();
    });
  });

  describe('searchCountiesForState', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(countiesService, 'searchCountiesForState').mockResolvedValue(expectedResult);
      expect(await controller.searchCountiesForState(mockParameters)).toMatchObject(expectedResult);
    });
  });
  describe('getCountiesForState', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(countiesService, 'getCountiesForState').mockResolvedValue(expectedResult);
      expect(await controller.getCountiesForState(mockParameters)).toMatchObject(expectedResult);
    });

    it('should return expectedResult - Error Handling', async () => {
      const expectedResult = {
        message: '',
        status: 500,
        success: false
      };
      jest.spyOn(countiesService, 'getCountiesForState').mockImplementation(() => {
        throw new Error();
      });
      expect(await controller.getCountiesForState(mockParameters)).toStrictEqual(expectedResult);
    });
  });

  describe('searchState', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(countiesService, 'search').mockResolvedValue(expectedResult);
      expect(await controller.searchState(mockParameters)).toMatchObject(expectedResult);
    });
  });

  describe('insertState', () => {
    it('should throw error', () => {
      expect(controller.insertState).toThrow();
    });
  });

  describe('updateState', () => {
    it('should throw error', () => {
      expect(controller.updateState).toThrow();
    });
  });

  describe('deleteState', () => {
    it('should throw error', () => {
      expect(controller.deleteState).toThrow();
    });
  });
});
