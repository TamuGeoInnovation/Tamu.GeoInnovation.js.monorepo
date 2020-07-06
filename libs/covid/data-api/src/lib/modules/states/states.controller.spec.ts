import { Test, TestingModule } from '@nestjs/testing';

import { State } from '@tamu-gisc/covid/common/entities';

import { StatesController } from './states.controller';
import { StatesService } from './states.service';

jest.mock('./states.service');

describe('States Controller', () => {
  let stateService: StatesService;
  let module: TestingModule;
  let controller: StatesController;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [StatesService],
      controllers: [StatesController]
    }).compile();
    stateService = module.get<StatesService>(StatesService);
    controller = module.get<StatesController>(StatesController);
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

  describe('searchState', () => {
    it('should return expectedResult', async () => {
      const expectedResult = [];
      jest.spyOn(stateService, 'search').mockResolvedValue(expectedResult);
      expect(await controller.searchState(mockParameters)).toBe(expectedResult);
    });
  });

  describe('getState', () => {
    it('should return expectedResult', async () => {
      const expectedResult = new State();
      expectedResult.stateFips = 0;
      jest.spyOn(stateService, 'getStateByFips').mockResolvedValue(expectedResult);
      expect(await controller.getState(mockParameters)).toEqual(expectedResult);
    });
  });

  describe('insertState', () => {
    it('should return expectedResult', async () => {
      const expectedResult = 'Not implemented.';
      expect(await controller.insertState()).toEqual(expectedResult);
    });
  });

  describe('updateState', () => {
    it('should return expectedResult', async () => {
      const expectedResult = 'Not implemented.';
      expect(await controller.updateState()).toEqual(expectedResult);
    });
  });
  describe('deleteState', () => {
    it('should return expectedResult', async () => {
      const expectedResult = 'Not implemented.';
      expect(await controller.deleteState()).toEqual(expectedResult);
    });
  });
});
