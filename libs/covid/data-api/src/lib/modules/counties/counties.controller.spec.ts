import { Test, TestingModule } from '@nestjs/testing';

import { CountiesController } from './counties.controller';
import { CountiesService } from './counties.service';

jest.mock('./counties.service');

describe('Counties Controller', () => {
  let countiesService: CountiesService;
  let countiesController: CountiesController;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CountiesService],
      controllers: [CountiesController]
    }).compile();
    countiesService = module.get<CountiesService>(CountiesService);
    countiesController = module.get<CountiesController>(CountiesController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Validation ', () => {
    it('controller should be defined', () => {
      expect(countiesController).toBeDefined();
    });
  });

  const mockParameters = 'foobar';

  describe('getCountyStats', () => {
    it('should return expectedResult', async () => {
      const expectedResult = {};
      jest.spyOn(countiesService, 'getCountyStats').mockResolvedValue(expectedResult);
      expect(await countiesController.getCountyStats()).toMatchObject(expectedResult);
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
      expect(await countiesController.getCountyStats()).toStrictEqual(expectedResult);
    });
  });

  describe('getCountySummary', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(countiesService, 'getSummary').mockResolvedValue(expectedResult);
      expect(await countiesController.getCountySummary()).toMatchObject(expectedResult);
    });

    it('should return expectedResult', async () => {
      jest.spyOn(countiesService, 'getSummary').mockImplementation(() => {
        throw new Error();
      });
      await expect(countiesController.getCountySummary()).rejects.toThrow();
    });
  });

  describe('searchCountiesForState', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(countiesService, 'searchCountiesForState').mockResolvedValue(expectedResult);
      expect(await countiesController.searchCountiesForState(mockParameters)).toMatchObject(expectedResult);
    });
  });
  describe('getCountiesForState', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(countiesService, 'getCountiesForState').mockResolvedValue(expectedResult);
      expect(await countiesController.getCountiesForState(mockParameters)).toMatchObject(expectedResult);
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
      expect(await countiesController.getCountiesForState(mockParameters)).toStrictEqual(expectedResult);
    });
  });

  describe('searchState', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(countiesService, 'search').mockResolvedValue(expectedResult);
      expect(await countiesController.searchState(mockParameters)).toMatchObject(expectedResult);
    });
  });

  describe('insertState', () => {
    it('should throw error', () => {
      expect(countiesController.insertState).toThrow();
    });
  });

  describe('updateState', () => {
    it('should throw error', () => {
      expect(countiesController.updateState).toThrow();
    });
  });

  describe('deleteState', () => {
    it('should throw error', () => {
      expect(countiesController.deleteState).toThrow();
    });
  });
});
