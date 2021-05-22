import { Test, TestingModule } from '@nestjs/testing';

import { State } from '@tamu-gisc/covid/common/entities';

import { StatesController } from './states.controller';
import { StatesService } from './states.service';

jest.mock('./states.service');

describe('States Controller', () => {
  let statesService: StatesService;
  let statesController: StatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatesService],
      controllers: [StatesController]
    }).compile();
    statesService = module.get<StatesService>(StatesService);
    statesController = module.get<StatesController>(StatesController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const mockParameters = 'foobar';

  describe('Validation ', () => {
    it('controller should be defined', () => {
      expect(statesController).toBeDefined();
    });
  });

  describe('searchState', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(statesService, 'search').mockResolvedValue(expectedResult);
      expect(await statesController.searchState(mockParameters)).toBe(expectedResult);
    });
  });

  describe('getState', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new State();
      expectedResult.stateFips = 0;
      jest.spyOn(statesService, 'getStateByFips').mockResolvedValue(expectedResult);
      expect(await statesController.getState(mockParameters)).toEqual(expectedResult);
    });
  });

  describe('insertState', () => {
    it('should return expectedResult', async () => {
      const expectedResult = 'Not implemented.';
      expect(await statesController.insertState()).toEqual(expectedResult);
    });
  });

  describe('updateState', () => {
    it('should return expectedResult', async () => {
      const expectedResult = 'Not implemented.';
      expect(await statesController.updateState()).toEqual(expectedResult);
    });
  });
  describe('deleteState', () => {
    it('should return expectedResult', async () => {
      const expectedResult = 'Not implemented.';
      expect(await statesController.deleteState()).toEqual(expectedResult);
    });
  });
});
