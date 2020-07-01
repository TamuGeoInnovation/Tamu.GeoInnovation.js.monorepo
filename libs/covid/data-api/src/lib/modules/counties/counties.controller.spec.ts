import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';

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

  describe('getCountyStats', () => {
    it('should return expected Result', async () => {
      const expectedResult = {};
      jest.spyOn(countiesService, 'getCountyStats').mockResolvedValue(expectedResult);
      expect(await controller.getCountyStats()).toMatchObject(expectedResult);
    });

    it('should return expected Result', async () => {
      jest.spyOn(countiesService, 'getCountyStats').mockImplementation(() => {
        throw new Error();
      });
      expect(await controller.getCountyStats()).toStrictEqual({
        message: '',
        status: 500,
        success: false
      });
    });
  });
  describe('getCountySummary', () => {
    it('should return expected Result', async () => {
      const expectedResult = [];
      jest.spyOn(countiesService, 'getSummary').mockResolvedValue(expectedResult);
      expect(await controller.getCountySummary()).toMatchObject(expectedResult);
    });

    it('should return expected Result', async () => {
      const expectedResult = { claim: '', info: '' };
      jest.spyOn(countiesService, 'getSummary').mockImplementation(() => {
        throw new Error();
      });
      await expect(controller.getCountySummary()).rejects.toThrow();
    });
  });
  describe('searchCountiesForState', () => {
    it('should return expected Result', async () => {
      const expectedResult = [];
      jest.spyOn(countiesService, 'searchCountiesForState').mockResolvedValue(expectedResult);
      expect(await controller.searchCountiesForState(expectedResult)).toMatchObject(expectedResult);
    });
  });
  describe('getCountiesForState', () => {
    const expectedResult = [];
    it('should return expected Result', async () => {
      jest.spyOn(countiesService, 'getCountiesForState').mockResolvedValue(expectedResult);
      expect(await controller.getCountiesForState(expectedResult)).toMatchObject(expectedResult);
    });

    it('should return expected Result', async () => {
      jest.spyOn(countiesService, 'getCountiesForState').mockImplementation(() => {
        throw new Error();
      });
      expect(await controller.getCountiesForState(expectedResult)).toStrictEqual({
        message: '',
        status: 500,
        success: false
      });
    });
  });

  describe('searchState', () => {
    it('should return expected Result', async () => {
      const expectedResult = [];
      jest.spyOn(countiesService, 'search').mockResolvedValue(expectedResult);
      expect(await controller.searchState(expectedResult)).toMatchObject(expectedResult);
    });
  });
  describe('insertState', () => {
    it('should return expected Result', () => {
      expect(controller.insertState).toThrow();
    });
  });
  describe('updateState', () => {
    it('should return expected Result', () => {
      expect(controller.updateState).toThrow();
    });
  });
  describe('deleteState', () => {
    it('should return expected Result', () => {
      expect(controller.deleteState).toThrow();
    });
  });
});
